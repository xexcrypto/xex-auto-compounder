//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IGlacierRouter.sol";
import "./interfaces/IGlacierGauge.sol";
import "./_StratBase.sol";

contract StratXGlcr is _StratBase {
  using SafeERC20 for IERC20;

  IGlacierRouter.Routes[] public glcrToXPath;
  address public tokenX;
  
  constructor(
      address _want,
      address _gauge,
      address _router,
      address _feeToken,
      address _tokenX,
      IGlacierRouter.Routes[] memory _glcrToXPath,
      IGlacierRouter.Routes[] memory _feeTokenPath
  ) _StratBase (
    _want,
    _gauge,
    _router,
    _feeToken,
    _feeTokenPath
  ) {
    tokenX = _tokenX;

    for (uint i; i < _glcrToXPath.length; ++i) {
        glcrToXPath.push(_glcrToXPath[i]);
    }

    _addAllowance();
  }

  function addLiquidity() override internal {
    uint256 glcrHalf = IERC20(glcr).balanceOf(address(this)) / 2;

    IGlacierRouter(router).swapExactTokensForTokens(glcrHalf, 0, glcrToXPath, address(this), block.timestamp);

    uint256 t1Bal = IERC20(tokenX).balanceOf(address(this));
    uint256 t2Bal = IERC20(glcr).balanceOf(address(this));
    
    IGlacierRouter(router).addLiquidity(tokenX, glcr, stable, t1Bal, t2Bal, 1, 1, address(this), block.timestamp);
  }
  
  function _subAllowance() override internal {
    IERC20(want).safeApprove(gauge, 0);
    IERC20(glcr).safeApprove(router, 0);
    IERC20(wavax).safeApprove(router, 0);
    if (tokenX != wavax && tokenX != glcr)
      IERC20(tokenX).safeApprove(router, 0);
  }

  function _addAllowance() override internal {
    IERC20(want).safeApprove(gauge, type(uint).max);
    IERC20(glcr).safeApprove(router, type(uint).max);
    IERC20(wavax).safeApprove(router, type(uint).max);
    if (tokenX != wavax && tokenX != glcr)
      IERC20(tokenX).safeApprove(router, type(uint).max);
  }
}