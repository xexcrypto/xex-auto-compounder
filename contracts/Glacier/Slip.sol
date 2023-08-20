//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IGlacierRouter.sol";
import "./interfaces/IWAVAX.sol";
import "../interfaces/IVault.sol";

contract Slip is ReentrancyGuard {
  using SafeERC20 for IERC20;

  address public owner;
  address constant router = address(0xC5B8Ce3C8C171d506DEb069a6136a351Ee1629DC);  // Glacier
  // address public router = address(0xfE7Ce93ac0F78826CD81D506B07Fe9f459c00214);  // Odos
  address constant wavax = address(0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7);
  address constant feerecip = address(0x3e91EF5Ae6D6a55CE8414952bCb202953Bc6a43e);

  event Deposit(uint256 amount);
  event SwapsBals(uint256 amount0, uint256 amount1);
  event LiqRcvd(uint256 amount);
  event VaultRcvd(uint256 amount);
  event FeeSent(uint256 amount);

  constructor() {
    owner = msg.sender;
  }

  /*************************************************
   * SLIP IN
   */

  /// Take Avax, create LP and deposit into pool
  function slipInAvax(
    address token0,
    address token1,
    bool stable,
    IGlacierRouter.Routes[] memory pathToToken0,
    IGlacierRouter.Routes[] memory pathToToken1,
    address vault,
    uint256 slippage
  ) public payable {
    // swap AVAX for WAVAX:
    IWAVAX(wavax).deposit{value: msg.value}();
    assert(IERC20(wavax).transfer(address(this), msg.value));

    emit Deposit(IERC20(wavax).balanceOf(address(this)));

    // now do the slipin:
    _doSlipIn(token0, token1, stable, slippage, pathToToken0, pathToToken1, vault);
  }

  /// Takes WAVAX and creates LP
  function slipIn(
    uint256 amount,
    address token0,
    address token1,
    bool stable,
    IGlacierRouter.Routes[] memory pathToToken0,
    IGlacierRouter.Routes[] memory pathToToken1,
    address vault,
    uint256 slippage
  ) public nonReentrant {
    // transfer wavax into contract:
    IERC20(wavax).safeTransferFrom(msg.sender, address(this), amount);
    
    // now do the slipin:
    _doSlipIn(token0, token1, stable, slippage, pathToToken0, pathToToken1, vault);
  }

  function _doSlipIn(
    address token0,
    address token1,
    bool stable,
    uint256 slippage,
    IGlacierRouter.Routes[] memory _pathToToken0,
    IGlacierRouter.Routes[] memory _pathToToken1,
    address vault
  ) internal {

    // send fee to feee recipient:
    uint256 fee = IERC20(wavax).balanceOf(address(this)) * 5 / 1000;
    IERC20(wavax).safeTransfer(feerecip, fee);
    emit FeeSent(fee);

    // Convert remainder:
    uint256 wavaxHalf = (IERC20(wavax).balanceOf(address(this))) / 2;
    // uint256 wavaxHalf = (amount - fee) / 2;
    // uint256 wavaxHalf = (((amount) * 1001) / 1000) / 2;

    // emit LiqRcvd(wavaxHalf);
    // return;

    // IERC20 want = IVault(vault).want();
    // want.safeApprove(router, type(uint).max);
    // want.safeApprove(vault, type(uint).max);

    uint256 token0Allowance = IERC20(token0).allowance(address(this), router);
    uint256 token1Allowance = IERC20(token1).allowance(address(this), router);

    // increase allowance if needed:
    if (token0Allowance < wavaxHalf)
      IERC20(token0).safeIncreaseAllowance(router, type(uint).max - token0Allowance);
    if (token1Allowance < wavaxHalf)
      IERC20(token1).safeIncreaseAllowance(router, type(uint).max - token1Allowance);

    // Swap if needed:
    if (token0 != wavax){
      uint256 token0Min = wavaxHalf * slippage / 100;
      IGlacierRouter(router).swapExactTokensForTokens(wavaxHalf, token0Min, _pathToToken0, address(this), block.timestamp);
    }
    if (token1 != wavax){
      uint256 token1Min = wavaxHalf * slippage / 100;
      IGlacierRouter(router).swapExactTokensForTokens(wavaxHalf, token1Min, _pathToToken1, address(this), block.timestamp);
    }

    uint256 t1Bal = IERC20(token0).balanceOf(address(this));
    uint256 t2Bal = IERC20(token1).balanceOf(address(this));

    emit SwapsBals(t1Bal, t2Bal);

    (,, uint liquidity) = IGlacierRouter(router).addLiquidity(token0, token1, stable, t1Bal, t2Bal, 1, 1, address(this), block.timestamp);

    emit LiqRcvd(liquidity);

    // Approve to spend want:
    IERC20 want = IVault(vault).want();
    // want.safeApprove(router, liquidity);
    want.safeApprove(vault, liquidity);
    
    // Contract now has LP. Deposit into vault:
    IVault(vault).deposit(liquidity);

    emit VaultRcvd(IERC20(vault).balanceOf(address(this)));

    // Get and send Vault tokens to sender:
    uint256 balVault = IERC20(vault).balanceOf(address(this));
    IERC20(vault).safeTransfer(msg.sender, balVault);
    
  }



  
  /*************************************************
   * SLIP OUT
   */

  /// Unstake, deconstruct LP, swaps then return avax
  function slipOutAvax(
    uint256 amount,
    address token0,
    address token1,
    bool stable,
    IGlacierRouter.Routes[] memory pathToToken0,
    IGlacierRouter.Routes[] memory pathToToken1,
    address vault,
    address lpToken
  ) public {
    // swap AVAX for WAVAX:
    // IWAVAX(wavax).deposit{value: msg.value}();
    // assert(IERC20(wavax).transfer(address(this), msg.value));

    // emit Deposit(IERC20(wavax).balanceOf(address(this)));

    // Do the slip out:
    uint256 returnAmount = _doSlipOut(amount, token0, token1, stable, pathToToken0, pathToToken1, vault, lpToken);

    // swap back to avax:
    IWAVAX(wavax).withdraw(returnAmount);

    // send avax to caller:
    payable(msg.sender).transfer(returnAmount);
  }

  /// Takes WAVAX and creates LP
  function slipOut(
    uint256 amount,
    address token0,
    address token1,
    bool stable,
    IGlacierRouter.Routes[] memory pathToToken0,
    IGlacierRouter.Routes[] memory pathToToken1,
    address vault,
    address lpToken
  ) public nonReentrant {
    // Do the slip out:
    uint256 returnAmount = _doSlipOut(amount, token0, token1, stable, pathToToken0, pathToToken1, vault, lpToken);

    // Send it back to caller:
    assert(IERC20(wavax).transfer(msg.sender, returnAmount));
  }

  function _doSlipOut(
    uint256 amount,
    address token0,
    address token1,
    bool stable,
    IGlacierRouter.Routes[] memory _pathFromToken0,
    IGlacierRouter.Routes[] memory _pathFromToken1,
    address vault,
    address lpToken
  ) internal returns (uint256 returnAmount) {
    require(amount > 0, "No amount specified");

    // grab the vault tokens:
    IERC20(vault).safeApprove(address(this), amount);
    IERC20(vault).safeTransferFrom(msg.sender, address(this), amount);

    // remove from vault:
    IVault(vault).withdraw(amount);

    // Now to remove from pool:
    (uint amountA, uint amountB) = IGlacierRouter(router).removeLiquidity(token0, token1, stable, IERC20(lpToken).balanceOf(address(this)), 1, 1, address(this), block.timestamp);

    // uint256 returnAmount = 0;

    // Swap back to wavax:
    if (token0 != wavax){
      uint256[] memory amounts = IGlacierRouter(router).swapExactTokensForTokens(amountA, 0, _pathFromToken0, address(this), block.timestamp);
      returnAmount += amounts[1];
    }
    if (token1 != wavax){
      uint256[] memory amounts = IGlacierRouter(router).swapExactTokensForTokens(amountB, 0, _pathFromToken1, address(this), block.timestamp);
      returnAmount += amounts[1];
    }
  }


  /**
   * @dev Rescues any random funds stuck.
   * @param _token address of the token to rescue.
   */
  function inCaseTokensGetStuck(address _token) external {
    require(msg.sender == owner);

    uint256 amount = IERC20(_token).balanceOf(address(this));
    IERC20(_token).safeTransfer(msg.sender, amount);
  }

}