//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IFvmRouter.sol";
import "./interfaces/IFvmGauge.sol";
import "./interfaces/IoFVM.sol";
import "../interfaces/IPurse.sol";

import "hardhat/console.sol";

contract _FvmStratBase is Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Tokens
    address public constant wftm = address(0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83);
    address public constant ofvm = address(0xF9EDdca6B1e548B0EC8cDDEc131464F462b8310D);
    address public constant fvm  = address(0x07BB65fAaC502d4996532F834A1B7ba5dC32Ff96);
    address public want;
    address public feeToken;
    address[] public rewardTokens;

    // Third party contracts
    address public gauge;
    address public router;

    // Strategy addresses
    address public xexadons     = address(0x8eD98Eeb0c360d1b7C8ab5e85Dc792A1e4B18D8c);
    address public team         = address(0x04345e22cd5781C8264A611c056DDFA8bbCddfA4);
    address public sentinel     = address(0xb494596247E9068be1b042dB2f6E74E7fc85BE32);
    address public strategist;
    address public vault;
    address public purse;

    //Routes
    IFvmRouter.route[] public feeTokenPath;
    IFvmRouter.route[] public customPath;

    // Controllers
    bool public stable = false;
    bool public harvestOnDeposit;

    // Fee structure
    uint256 public constant FEE_DIVISOR = 1000;
    uint256 public PLATFORM_FEE = 100;               // 10% Platform fee
    uint256 public WITHDRAW_FEE = 1;                 // 0.1% of withdrawal amount
    uint256 public XEXADON_FEE = 350;   // 3.5%  // Fee to xexadons
    uint256 public STRAT_FEE = 200;     // 2.0%  // Fee to Strategist
    uint256 public TEAM_FEE = 350;      // 3.5%  // Fee to team
    uint256 public CALL_FEE = 100;      // 1.0%  // Fee to caller for calling harvest

    // Events
    event Harvest(address indexed harvester);
    event SetVault(address indexed newVault);
    event SetStrategist(address indexed newStrategist);
    event SetTeam(address indexed newRecipient);
    event SetXexadon(address indexed newRecipient);
    event SetFeeToken(address indexed newFeeToken);
    event RetireStrat(address indexed caller);
    event Panic(address indexed caller);
    event MakeCustomTxn(address indexed from, address indexed to, uint256 indexed amount);
    event SetFees(uint256 indexed withdrawFee, uint256 indexed totalFees);
    
    constructor(
        address _want,
        address _gauge,
        address _router,
        address _feeToken,
        IFvmRouter.route[] memory _feeTokenPath,
        address _purse
    ) {
        strategist = msg.sender;
        want = _want;
        gauge = _gauge;
        router = _router;
        feeToken = _feeToken;
        purse = _purse;

        for (uint i; i < _feeTokenPath.length; ++i) {
            feeTokenPath.push(_feeTokenPath[i]);
        }

        rewardTokens.push(fvm);
        harvestOnDeposit = false;

        IERC20(wftm).safeApprove(ofvm, type(uint).max);
        IERC20(fvm).approve(router, type(uint).max);
    }

    /** @dev Function to synchronize balances before new user deposit. Can be overridden in the strategy. */
    function beforeDeposit() external whenNotPaused {
        require(msg.sender == vault, "!vault");
        if (harvestOnDeposit) {
            _harvest(tx.origin);
        }
    }

    /** @dev Deposits funds into the masterchef */
    function deposit() public whenNotPaused {
        require(msg.sender == vault, "!vault");

        if (balanceOfPool() == 0 || !harvestOnDeposit) {
            _deposit();
        } else {
            _deposit();
            _harvest(msg.sender);
        }
    }

    function _deposit() internal whenNotPaused {
        uint256 wantBal = IERC20(want).balanceOf(address(this));
        if (wantBal > 0)
            IFvmGauge(gauge).deposit(wantBal, 0);
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == vault, "!vault");

        uint256 wantBal = IERC20(want).balanceOf(address(this));

        if (wantBal < _amount) {
            IFvmGauge(gauge).withdraw(_amount - wantBal);
            wantBal = IERC20(want).balanceOf(address(this));
        }

        if (wantBal > _amount) {
            wantBal = _amount;
        }

        uint256 withdrawalFeeAmount = wantBal * WITHDRAW_FEE / FEE_DIVISOR;
        IERC20(want).safeTransfer(vault, wantBal - withdrawalFeeAmount);
    }

    function harvest() external {
        require(msg.sender == tx.origin, "!EOA");
        _harvest(msg.sender);
    }

    /** @dev Compounds the strategy's earnings and charges fees */
    function _harvest(address caller) internal whenNotPaused {
        if (caller != vault){
            require(!Address.isContract(msg.sender), "!EOA");
        }

        IFvmGauge(gauge).getReward(address(this), rewardTokens);
        uint256 outputBal = IERC20(ofvm).balanceOf(address(this));

        console.log("* Reward received:", outputBal);

        if (outputBal > 0 ) {
            swapOFVMforWFTM();
            chargeFees(caller);
            addLiquidity();
        }
        _deposit();

        emit Harvest(caller);
    }

    /** @dev This function converts charges fees in selected feeToken and sends to respective accounts */
    /** FEE TOKEN IS WFTM ON FANTOM */
    function chargeFees(address caller) internal {
        uint256 toFee = IERC20(wftm).balanceOf(address(this)) * PLATFORM_FEE / FEE_DIVISOR;
        
        console.log("* Fee amount:", toFee);

        distroFee(toFee, caller);

        // if(feeToken != ofvm){
        //     IFvmRouter(router).swapExactTokensForTokens(toFee, 0, feeTokenPath, address(this), block.timestamp);
        // }

        // uint256 feeBal = IERC20(feeToken).balanceOf(address(this));

        // if(feeToken == ofvm){
        //     distroRewardFee(feeBal, caller);
        // }else{ 
        //    distroFee(feeBal, caller); 
        // }
    }

    function swapOFVMforWFTM() internal {
        // 1. Calculate WFTM needed to exchange oFVM to FVM,
        // 2. Withdraw WFTM from purse,
        // 3. Exchange oFVM for FVM,
        // 4. Swap FVM for WFTM,
        // 5. Return borrowed WFTM,
        uint256 rewardBal = IERC20(ofvm).balanceOf(address(this));

        console.log("* rewardBal", rewardBal);

        // 1. Calculate WFTM needed to exchange oFVM to FVM (allow for slippage):
        uint256 wftmNeeded = (IoFVM(ofvm).getDiscountedPrice(rewardBal) * 1001) / 1000;
        
        console.log("* wftmNeeded", wftmNeeded);
        console.log("* Strat wftm balance", IERC20(wftm).balanceOf(address(this)));

        // 2. Withdraw WFTM from purse:
        IPurse(purse).withdraw(wftm, wftmNeeded);
        require(IERC20(wftm).balanceOf(address(this)) >= wftmNeeded, "Not enough from purse");

        console.log("* Purse remaining balance:", IERC20(wftm).balanceOf(purse));
        console.log("* Strat bal of wftm:", IERC20(wftm).balanceOf(address(this)));

        // 3. Exchange oFVM for FVM:
        IoFVM(ofvm).exercise(rewardBal, (wftmNeeded * 110) / 100, address(this));

        // 4. Swap FVM for WFTM:
        IFvmRouter(router).swapExactTokensForTokens(
            IERC20(fvm).balanceOf(address(this)), 
            0, feeTokenPath, address(this), block.timestamp);
        
        // 5. Return borrowed WFTM (with interest):
        IERC20(wftm).safeTransfer(purse, (wftmNeeded * 1001) / 1000);
    }

    /** @dev Converts reward to both sides of the LP token and builds the liquidity pair */
    function addLiquidity() virtual internal {}

    /** @dev Determines the amount of reward in WFTM upon calling the harvest function */
    function callReward() public view returns (uint256) {
        uint256 outputBal = rewardBalance();
        uint256 wrappedOut;
        if (outputBal > 0) {
            (wrappedOut,) = IFvmRouter(router).getAmountOut(outputBal, ofvm, wftm);
        }
        return wrappedOut * PLATFORM_FEE / FEE_DIVISOR * CALL_FEE / FEE_DIVISOR;
    }

    // returns rewards unharvested
    function rewardBalance() public view returns (uint256) {
        return IFvmGauge(gauge).earned(ofvm, address(this));
    }

    /** @dev calculate the total underlying 'want' held by the strat */
    function balanceOf() public view returns (uint256) {
        return balanceOfWant() + (balanceOfPool());
    }

    /** @dev it calculates how much 'want' this contract holds */
    function balanceOfWant() public view returns (uint256) {
        return IERC20(want).balanceOf(address(this));
    }

    /** @dev it calculates how much 'want' the strategy has working in the farm */
    function balanceOfPool() public view returns (uint256) {
        return IFvmGauge(gauge).derivedBalance(address(this));
    }

    /** @dev called as part of strat migration. Sends all the available funds back to the vault */
    function retireStrat() external {
        require(msg.sender == vault, "!vault");
        _harvest(msg.sender);
        IFvmGauge(gauge).withdraw(balanceOfPool());
        IERC20(want).transfer(vault, balanceOfWant());

        emit RetireStrat(msg.sender);
    }

    /** @dev Pauses the strategy contract and executes the emergency withdraw function */
    function panic() external {
        require(msg.sender == strategist || msg.sender == owner() || msg.sender == sentinel, "!auth");
        pause();
        IFvmGauge(gauge).withdraw(balanceOfPool());
        emit Panic(msg.sender);
    }

    /** @dev Pauses the strategy contract */
    function pause() public {
        require(msg.sender == strategist || msg.sender == owner() || msg.sender == sentinel, "!auth");
        _pause();
        _subAllowance();
    }

    /** @dev Unpauses the strategy contract */
    function unpause() external {
        require(msg.sender == strategist || msg.sender == owner() || msg.sender == sentinel, "!auth");
        _unpause();
        _addAllowance();
        _deposit();
    }

    /** @dev Removes allowances to spenders */
    function _subAllowance() virtual internal {}

    function _addAllowance() virtual internal {}

    /** @dev This function exists incase tokens that do not match the {want} of this strategy accrue.  For example: an amount of
    tokens sent to this address in the form of an airdrop of a different token type. This will allow Grim to convert
    said token to the {output} token of the strategy, allowing the amount to be paid out to stakers in the next harvest. */
    function makeCustomTxn(address [][] memory _tokens, bool[] calldata _stable) external onlyAdmin {
        for (uint i; i < _tokens.length; ++i) {
            customPath.push(IFvmRouter.route({
                from: _tokens[i][0],
                to: _tokens[i][1],
                stable: _stable[i]
            }));
        }
        uint256 bal = IERC20(_tokens[0][0]).balanceOf(address(this));

        IERC20(_tokens[0][0]).safeApprove(router, 0);
        IERC20(_tokens[0][0]).safeApprove(router, type(uint).max);
        IFvmRouter(router).swapExactTokensForTokens(bal, 0, customPath, address(this), block.timestamp + 600);

        emit MakeCustomTxn(_tokens[0][0], _tokens[0][_tokens.length - 1], bal);
    }

    function distroFee(uint256 feeBal, address caller) internal {
        uint256 callFee = feeBal * CALL_FEE / FEE_DIVISOR;
        IERC20(feeToken).safeTransfer(caller, callFee);

        uint256 teamFee = feeBal * TEAM_FEE / FEE_DIVISOR;
        IERC20(feeToken).safeTransfer(team, teamFee);

        uint256 xexadonsFee = feeBal * XEXADON_FEE / FEE_DIVISOR;
        IERC20(feeToken).safeTransfer(xexadons, xexadonsFee);

        uint256 stratFee = feeBal * STRAT_FEE / FEE_DIVISOR;
        IERC20(feeToken).safeTransfer(strategist, stratFee);
    }

    // function distroRewardFee(uint256 feeBal, address caller) internal {
    //     uint256 rewardFee = feeBal * PLATFORM_FEE / FEE_DIVISOR;

    //     uint256 callFee = rewardFee * CALL_FEE / FEE_DIVISOR;
    //     IERC20(feeToken).safeTransfer(caller, callFee);

    //     uint256 teamFee = rewardFee * TEAM_FEE / FEE_DIVISOR;
    //     IERC20(feeToken).safeTransfer(team, teamFee);

    //     uint256 xexadonsFee = rewardFee * XEXADON_FEE / FEE_DIVISOR;
    //     IERC20(feeToken).safeTransfer(xexadons, xexadonsFee);

    //     uint256 stratFee = rewardFee * STRAT_FEE / FEE_DIVISOR;
    //     IERC20(feeToken).safeTransfer(strategist, stratFee);
    // }


    // Sets the fee amounts
    function setFees(uint256 newPlatformFee, uint256 newCallFee, uint256 newStratFee, uint256 newWithdrawFee, uint256 newXexadonsFee, uint256 newTeamFee) external onlyAdmin {
        require(newWithdrawFee <= 10, "> Max Fee");
        uint256 sum = newCallFee + newStratFee + newXexadonsFee + newTeamFee;
        require(sum <= FEE_DIVISOR, "> Fee Div");

        PLATFORM_FEE = newPlatformFee;
        CALL_FEE = newCallFee;
        STRAT_FEE = newStratFee;
        WITHDRAW_FEE = newWithdrawFee;
        XEXADON_FEE = newXexadonsFee;
        TEAM_FEE = newTeamFee;

        emit SetFees(newWithdrawFee, sum);
    }

    function setAddress(uint256 which, address newAddress) external onlyAdmin {
        if (which == 1) {
            vault = newAddress;
            emit SetVault(newAddress);

        } else if (which == 2) {
            team = newAddress;
            emit SetTeam(newAddress);

        } else if (which == 3) {
            xexadons = newAddress;
            emit SetXexadon(newAddress);

        } else if (which == 4) {
            require(msg.sender == strategist, "!auth");
            strategist = newAddress;
            emit SetStrategist(newAddress);
        }
    }

    // Sets harvestOnDeposit
    function setHarvestOnDeposit(bool _harvestOnDeposit) external onlyAdmin {
        harvestOnDeposit = _harvestOnDeposit;
    }

    // Checks that caller is either owner or strategist
    modifier onlyAdmin() {
        require(msg.sender == owner() || msg.sender == strategist, "!auth");
        _;
    }
}