//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IStrategy.sol";

/**
Implementation of a vault to deposit funds for yield optimizing
This is the contract that receives funds & users interface with
The strategy itself is implemented in a separate Strategy contract
 */
contract Vault is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct StratCandidate {
        address implementation;
        uint proposedTime;
    }

    // The last proposed strategy to switch to.
    StratCandidate public stratCandidate;
    // The strategy currently in use by the vault.
    IStrategy public strategy;
    // The minimum time it has to pass before a strat candidate can be approved, set to 24 hours
    uint256 constant approvalDelay = 86400; // 24h

    address public strategist;

    event NewStratCandidate(address implementation);
    event UpgradeStrat(address implementation);
    event InCaseTokensGetStuck(address caller, uint256 amount, address token);
    event SetStrategist(address indexed newStrategist);

    /**
     Initializes the vault and it's own receipt token
     This token is minted when someone deposits. It's burned in order
     to withdraw the corresponding portion of the underlying assets.
     */
    constructor (
        IStrategy _strategy,
        string memory _name,
        string memory _symbol
    ) ERC20(
        _name,
        _symbol
    ) {
        strategy = _strategy;
        strategist = msg.sender;

    }

    function want() public view returns (IERC20) {
        return IERC20(strategy.want());
    }

    /**
     Calculates total underlying value of want held by the system.
     It takes into account vault contract balance, strategy contract balance
     & balance deployed in other contracts as part of the strategy.
     */
    function balance() public view returns (uint) {
        return want().balanceOf(address(this)) + IStrategy(strategy).balanceOf();
    }

    /**
     Logic for how much the vault allows to be borrowed.
     Returns 100% of tokens for now. Under certain conditions we might
     want to keep some of the system funds at hand in the vault, instead
     of putting them to work.
     */
    function available() public view returns (uint256) {
        return want().balanceOf(address(this));
    }


    //Function for various UIs to display the current value of one of our yield tokens.
    //Returns uint256 with 18 decimals of how much underlying asset one vault share represents.
    function getPricePerFullShare() public view returns (uint256) {
        return totalSupply() == 0 ? 1e18 : balance() * 1e18 / totalSupply();
    }


    function depositAll() external {
        deposit(want().balanceOf(msg.sender));
    }


    //Entrypoint of funds into the system. The vault then deposits funds into the strategy.
    function deposit(uint _amount) public nonReentrant {
        require(_amount > 0, "!Amt");
        strategy.beforeDeposit();
        uint256 _pool = balance();
        want().safeTransferFrom(msg.sender, address(this), _amount);
        _earn();
        uint256 _after = balance();
        _amount = _after - _pool; // Additional check for deflationary tokens
        uint256 shares = 0;
        if (totalSupply() == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalSupply()) / _pool;
        }
        _mint(msg.sender, shares);
    }


    //Function to send funds into the strategy and put them to work.
    //It's primarily called by the vault's deposit() function.
    function _earn() internal {
        uint _bal = available();
        want().safeTransfer(address(strategy), _bal);
        strategy.deposit();
    }

    /**
     * @dev A helper function to call withdraw() with all the sender's funds.
     */
    function withdrawAll() external {
        withdraw(balanceOf(msg.sender));
    }

    /**
     Exit the system. The vault will withdraw the required tokens
     from the strategy and send to the token holder. A proportional number of receipt
     tokens are burned in the process.
     */
    function withdraw(uint256 _shares) public {
        uint256 r = balance() * _shares / totalSupply();
        _burn(msg.sender, _shares);

        uint b = want().balanceOf(address(this));
        if (b < r) {
            uint _withdraw = r - b;
            strategy.withdraw(_withdraw);
            uint _after = want().balanceOf(address(this));
            uint _diff = _after - b;
            if (_diff < _withdraw) {
                r = b + _diff;
            }
        }

        want().safeTransfer(msg.sender, r);
    }

    /**
     * @dev Sets the candidate for the new strat to use with this vault.
     * @param _implementation The address of the candidate strategy.
     */
    function proposeStrat(address _implementation) public onlyAdmin {
        require(address(this) == IStrategy(_implementation).vault(), "!Valid proposal");
        stratCandidate = StratCandidate({
            implementation: _implementation,
            proposedTime: block.timestamp
         });

        emit NewStratCandidate(_implementation);
    }

    /**
     * @dev It switches the active strat for the strat candidate. After upgrading, the
     * candidate implementation is set to the 0x00 address, and proposedTime to a time
     * happening in +100 years for safety.
     */

    function upgradeStrat() public onlyAdmin {
        require(stratCandidate.implementation != address(0), "!Candidate");
        require(stratCandidate.proposedTime + approvalDelay < block.timestamp, "Delay !pass");

        emit UpgradeStrat(stratCandidate.implementation);

        strategy.retireStrat();
        strategy = IStrategy(stratCandidate.implementation);
        stratCandidate.implementation = address(0);
        stratCandidate.proposedTime = 5000000000;

        _earn();
    }

    /**
     * @dev Rescues random funds stuck that the strat can't handle.
     * @param _token address of the token to rescue.
     */
    function inCaseTokensGetStuck(address _token) external onlyAdmin {
        require(_token != address(want()), "!token");

        uint256 amount = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(msg.sender, amount);

        emit InCaseTokensGetStuck(msg.sender, amount, _token);
    }

    // Sets Strategist address
    function setStrategist(address _newStrategist) external {
        require(msg.sender == strategist, "!auth");
        strategist = _newStrategist;
        emit SetStrategist(strategist);
    }

     /*** @dev checks that caller is either owner or strategist */
    modifier onlyAdmin() {
        require(msg.sender == owner() || msg.sender == strategist, "!auth");
        _;
    }
}