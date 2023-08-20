//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IGlacierRouter.sol";
import "./interfaces/IGlacierGauge.sol";
import "./_StratBase.sol";

contract StratXX is _StratBase {
  using SafeERC20 for IERC20;

  address public token0;
  address public token1;
  IGlacierRouter.Routes[] public glcrToToken0Path;
  IGlacierRouter.Routes[] public glcrToToken1Path;

  constructor(
      address _want,
      address _gauge,
      address _router,
      address _feeToken,
      address _token0,
      address _token1,
      IGlacierRouter.Routes[] memory _glcrToToken0Path,
      IGlacierRouter.Routes[] memory _glcrToToken1Path,
      IGlacierRouter.Routes[] memory _feeTokenPath
  ) _StratBase (
    _want,
    _gauge,
    _router,
    _feeToken,
    _feeTokenPath
  ) {
    token0 = _token0;
    token1 = _token1;
    
    for (uint i; i < _glcrToToken0Path.length; ++i) {
        glcrToToken0Path.push(_glcrToToken0Path[i]);
    }

    for (uint i; i < _glcrToToken1Path.length; ++i) {
        glcrToToken1Path.push(_glcrToToken1Path[i]);
    }

    _addAllowance();
  }

  function addLiquidity() override internal {
    uint256 glcrHalf = IERC20(glcr).balanceOf(address(this)) / 2;

    IGlacierRouter(router).swapExactTokensForTokens(glcrHalf, 0, glcrToToken0Path, address(this), block.timestamp);
    IGlacierRouter(router).swapExactTokensForTokens(glcrHalf, 0, glcrToToken1Path, address(this), block.timestamp);

    uint256 t1Bal = IERC20(token0).balanceOf(address(this));
    uint256 t2Bal = IERC20(token1).balanceOf(address(this));

    IGlacierRouter(router).addLiquidity(token0, token1, stable, t1Bal, t2Bal, 1, 1, address(this), block.timestamp);
  }
  
  function _subAllowance() override internal {
      IERC20(want).safeApprove(gauge, 0);
      IERC20(glcr).safeApprove(router, 0);
      IERC20(wavax).safeApprove(router, 0);
      if (token0 != wavax && token0 != glcr)
        IERC20(token0).safeApprove(router, 0);
      if (token1 != wavax && token0 != glcr)
        IERC20(token1).safeApprove(router, 0);
  }

  function _addAllowance() override internal {
      IERC20(want).safeApprove(gauge, type(uint).max);
      IERC20(glcr).safeApprove(router, type(uint).max);
      IERC20(wavax).safeApprove(router, type(uint).max);
      if (token0 != wavax && token0 != glcr)
        IERC20(token0).safeApprove(router, type(uint).max);
      if (token1 != wavax && token0 != glcr)
        IERC20(token1).safeApprove(router, type(uint).max);
  }

}