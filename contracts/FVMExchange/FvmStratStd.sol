//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./_FvmStratBase.sol";
import "./interfaces/IoFVM.sol";

contract FvmStratStd is _FvmStratBase {
  using SafeERC20 for IERC20;

  address public token0;
  address public token1;
  IFvmRouter.route[] public wftmToToken0Path;
  IFvmRouter.route[] public wftmToToken1Path;

  constructor(
      address _want,
      address _gauge,
      address _router,
      address _feeToken,
      address _token0,
      address _token1,
      address _purse,
      IFvmRouter.route[] memory _wftmToToken0Path,
      IFvmRouter.route[] memory _wftmToToken1Path,
      IFvmRouter.route[] memory _feeTokenPath
  ) _FvmStratBase (
    _want,
    _gauge,
    _router,
    _feeToken,
    _feeTokenPath,
    _purse
  ) {
    token0 = _token0;
    token1 = _token1;
    
    for (uint i; i < _wftmToToken0Path.length; ++i) {
        wftmToToken0Path.push(_wftmToToken0Path[i]);
    }

    for (uint i; i < _wftmToToken1Path.length; ++i) {
        wftmToToken1Path.push(_wftmToToken1Path[i]);
    }

    _addAllowance();
  }

  function addLiquidity() override internal {
    // Token to use is always WFTM (converted from oFVM->FVM->WFTM)!
    uint256 rewardBal = IERC20(wftm).balanceOf(address(this));

    // Usual distribution process:
    uint256 half = rewardBal / 2;

    IFvmRouter(router).swapExactTokensForTokens(half, 0, wftmToToken0Path, address(this), block.timestamp);
    IFvmRouter(router).swapExactTokensForTokens(half, 0, wftmToToken1Path, address(this), block.timestamp);

    uint256 t1Bal = IERC20(token0).balanceOf(address(this));
    uint256 t2Bal = IERC20(token1).balanceOf(address(this));

    IFvmRouter(router).addLiquidity(token0, token1, stable, t1Bal, t2Bal, 1, 1, address(this), block.timestamp);
  }
  
  function _subAllowance() override internal {
      IERC20(want).safeApprove(gauge, 0);
      IERC20(ofvm).safeApprove(router, 0);
      IERC20(wftm).safeApprove(router, 0);
      if (token0 != wftm && token0 != ofvm)
        IERC20(token0).safeApprove(router, 0);
      if (token1 != wftm && token0 != ofvm)
        IERC20(token1).safeApprove(router, 0);
  }

  function _addAllowance() override internal {
      IERC20(want).safeApprove(gauge, type(uint).max);
      IERC20(ofvm).safeApprove(router, type(uint).max);
      IERC20(wftm).safeApprove(router, type(uint).max);
      if (token0 != wftm && token0 != ofvm)
        IERC20(token0).safeApprove(router, type(uint).max);
      if (token1 != wftm && token0 != ofvm)
        IERC20(token1).safeApprove(router, type(uint).max);
  }

}