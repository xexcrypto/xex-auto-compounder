//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IGlacierRouter.sol";
import "./interfaces/IWAVAX.sol";
import "./interfaces/IVault.sol";

contract SlipIn is ReentrancyGuard {
  using SafeERC20 for IERC20;

  address public router = address(0xC5B8Ce3C8C171d506DEb069a6136a351Ee1629DC);
  address public wavax = address(0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7);

  event Deposit(uint256 amount);
  event SwapsBals(uint256 amount0, uint256 amount1);

  /// Take Avax, create LP and deposit into pool
  function doSlipAvax(
    address _token0,
    address _token1,
    bool _stable,
    IGlacierRouter.Routes[] memory _pathToToken0,
    IGlacierRouter.Routes[] memory _pathToToken1,
    address _vault
  ) public payable {
    // swap AVAX for WAVAX:
    IWAVAX(wavax).deposit{value: msg.value}();
    assert(IERC20(wavax).transfer(address(this), msg.value));

    emit Deposit(IERC20(wavax).balanceOf(address(this)));

    // now do the slipin:
    _doSlip(msg.value, _token0, _token1, _stable, _pathToToken0, _pathToToken1, _vault);

  }

  /// Takes WAVAX and creates LP
  function doSlip(
    uint256 _amount,
    address _token0,
    address _token1,
    bool _stable,
    IGlacierRouter.Routes[] memory _pathToToken0,
    IGlacierRouter.Routes[] memory _pathToToken1,
    address _vault
  ) public nonReentrant {
    // transfer wavax into contract:
    IERC20(wavax).safeTransferFrom(msg.sender, address(this), _amount);
    
    // now do the slipin:
    _doSlip(_amount, _token0, _token1, _stable, _pathToToken0, _pathToToken1, _vault);
  }

  function _doSlip(
    uint256 amount,
    address token0,
    address token1,
    bool stable,
    IGlacierRouter.Routes[] memory _pathToToken0,
    IGlacierRouter.Routes[] memory _pathToToken1,
    address vault
  ) internal {

    uint256 wavaxHalf = amount / 2;

    IERC20(wavax).safeApprove(router, 0);

    if (token0 != wavax)
      IGlacierRouter(router).swapExactTokensForTokens(wavaxHalf, 0, _pathToToken0, address(this), block.timestamp);
    // if (token1 != wavax)
    //   IGlacierRouter(router).swapExactTokensForTokens(wavaxHalf, 0, _pathToToken1, address(this), block.timestamp);

    uint256 t1Bal = IERC20(token0).balanceOf(address(this));
    uint256 t2Bal = IERC20(token1).balanceOf(address(this));

    emit SwapsBals(t1Bal, t2Bal);

    // (,, uint liquidity) = IGlacierRouter(router).addLiquidity(token0, token1, stable, t1Bal, t2Bal, 1, 1, address(this), block.timestamp);

    // // Contract now has LP. Deposit into vault:
    // IVault(vault).deposit(liquidity);

    // // Get and send Vault tokens to sender:
    // uint256 balVault = IERC20(vault).balanceOf(address(this));
    // IERC20(vault).safeTransfer(msg.sender, balVault);
    
  }

}