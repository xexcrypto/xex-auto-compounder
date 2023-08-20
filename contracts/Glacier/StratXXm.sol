//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

// *** DEBUG ***
import "hardhat/console.sol";
// *************

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IGlacierRouter.sol";
import "./interfaces/IGlacierGauge.sol";
import "./_StratBase.sol";
// import "../interfaces/ISlipV2.sol";

interface ISlipV2 {
  struct route {
    address from;
    address to;
    bool stable;
  }

  struct Path {
    address router;
    route[] paths;
    address[] pathsSimple;
  }

  function swap(uint256 amount, uint256 minAmountOut, Path[] memory routes, address recipient) external returns (uint256 amountOut);
}

contract StratXXm is _StratBase {
  using SafeERC20 for IERC20;



  address public token0;
  address public token1;
  // IGlacierRouter.Routes[] public glcrToToken0Path;
  // IGlacierRouter.Routes[] public glcrToToken1Path;
  ISlipV2.Path[] public glcrToToken0Path;
  ISlipV2.Path[] public glcrToToken1Path;

  constructor(
      address _want,
      address _gauge,
      address _router,
      address _feeToken,
      address _token0,
      address _token1,
      address _swapper,
      ISlipV2.Path[] memory _glcrToToken0Path,
      ISlipV2.Path[] memory _glcrToToken1Path,
      // IGlacierRouter.Routes[] memory _glcrToToken0Path,
      // IGlacierRouter.Routes[] memory _glcrToToken1Path,
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
    swapper = _swapper;

    for (uint i; i < _glcrToToken0Path.length; ++i) {
      // ISlipV2.route[] storage p;
      // for (uint j; j < _glcrToToken0Path[i].paths.length; ++j) {
      //   p.push(ISlipV2.route(_glcrToToken0Path[i].paths[j].from, _glcrToToken0Path[i].paths[j].to, _glcrToToken0Path[i].paths[j].stable));
      // }

      // address[] storage ps;
      // for (uint j; j < _glcrToToken0Path[i].pathsSimple.length; ++j) {
      //   ps.push(_glcrToToken0Path[i].pathsSimple[j]);
      // }


      // ISlipV2.Path storage s;// = ISlipV2.Path(_glcrToToken0Path[i].router, new ISlipV2.route[](0), new address[](0));

      // s.router = _glcrToToken0Path[i].router;

      

      glcrToToken0Path.push(
        // ISlipV2.Path(_glcrToToken0Path[i].router, new ISlipV2.route[](0), new address[](0))
      );

      glcrToToken0Path[glcrToToken0Path.length-1].router = _glcrToToken0Path[i].router;
      
      for (uint j; j < _glcrToToken0Path[i].paths.length; ++j) {
        // ISlipV2.route storage r = ISlipV2.route(_glcrToToken0Path[i].paths[j].from, _glcrToToken0Path[i].paths[j].to, _glcrToToken0Path[i].paths[j].stable);
        
        // r.from = _glcrToToken0Path[i].paths[j].from;

        glcrToToken0Path[glcrToToken0Path.length-1].paths.push(
          ISlipV2.route(_glcrToToken0Path[i].paths[j].from, _glcrToToken0Path[i].paths[j].to, _glcrToToken0Path[i].paths[j].stable)
        );
      }
      for (uint j; j < _glcrToToken0Path[i].pathsSimple.length; ++j) {
        glcrToToken0Path[glcrToToken0Path.length-1].pathsSimple.push(
          _glcrToToken0Path[i].pathsSimple[j]
        );
      }




      // ISlipV2.Path storage x;

      // x.router = _glcrToToken0Path[i].router;
      
      // // Push paths:
      // for (uint j; j < _glcrToToken0Path[i].paths.length; ++j) {
      //   x.paths.push(ISlipV2.route(_glcrToToken0Path[i].paths[j].from, _glcrToToken0Path[i].paths[j].to, _glcrToToken0Path[i].paths[j].stable));
      // }
      // for (uint j; j < _glcrToToken0Path[i].pathsSimple.length; ++j) {
      //   x.pathsSimple.push(_glcrToToken0Path[i].pathsSimple[j]);
      // }

      // glcrToToken0Path.push(
      //   x
      // );



        // glcrToToken0Path.push(_glcrToToken0Path[i]);
    }

    for (uint i; i < _glcrToToken1Path.length; ++i) {
      glcrToToken1Path.push();
      glcrToToken1Path[glcrToToken1Path.length-1].router = _glcrToToken1Path[i].router;
      
      for (uint j; j < _glcrToToken1Path[i].paths.length; ++j) {
        glcrToToken1Path[glcrToToken1Path.length-1].paths.push(
          ISlipV2.route(_glcrToToken1Path[i].paths[j].from, _glcrToToken1Path[i].paths[j].to, _glcrToToken1Path[i].paths[j].stable)
        );
      }
      for (uint j; j < _glcrToToken1Path[i].pathsSimple.length; ++j) {
        glcrToToken1Path[glcrToToken1Path.length-1].pathsSimple.push(
          _glcrToToken1Path[i].pathsSimple[j]
        );
      }
    }
    
    // address router;
    // route[] paths;
    // address[] pathsSimple;

    // for (uint i; i < _glcrToToken1Path.length; ++i) {
    //     glcrToToken1Path.push(_glcrToToken1Path[i]);
    // }

    _addAllowance();
  }

  function addLiquidity() override internal {
    uint256 glcrHalf = IERC20(glcr).balanceOf(address(this)) / 2;

    console.log('GLACIER HALF TO SWAP:', glcrHalf);


    IGlacierRouter(router).addLiquidity(token0, token1, stable, 
      ISlipV2(swapper).swap(glcrHalf, 0, glcrToToken0Path, address(this)), 
      ISlipV2(swapper).swap(glcrHalf, 0, glcrToToken1Path, address(this)), 
      1, 1, address(this), block.timestamp
    );


    // ISlipV2(swapper).swap(glcrHalf, 0, glcrToToken0Path, address(this));
    // ISlipV2(swapper).swap(glcrHalf, 0, glcrToToken1Path, address(this));

    // IGlacierRouter(router).addLiquidity(token0, token1, stable, IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)), 1, 1, address(this), block.timestamp);




    // uint256 t1Bal = IERC20(token0).balanceOf(address(this));
    // uint256 t2Bal = IERC20(token1).balanceOf(address(this));

    // IGlacierRouter(router).addLiquidity(token0, token1, stable, t1Bal, t2Bal, 1, 1, address(this), block.timestamp);
  }

  // function addLiquidity() override internal {
  //   uint256 glcrHalf = IERC20(glcr).balanceOf(address(this)) / 2;

  //   IGlacierRouter(router).swapExactTokensForTokens(glcrHalf, 0, glcrToToken0Path, address(this), block.timestamp);
  //   IGlacierRouter(router).swapExactTokensForTokens(glcrHalf, 0, glcrToToken1Path, address(this), block.timestamp);

  //   uint256 t1Bal = IERC20(token0).balanceOf(address(this));
  //   uint256 t2Bal = IERC20(token1).balanceOf(address(this));

  //   IGlacierRouter(router).addLiquidity(token0, token1, stable, t1Bal, t2Bal, 1, 1, address(this), block.timestamp);
  // }
  
  function _subAllowance() override internal {
      IERC20(want).safeApprove(gauge, 0);
      IERC20(glcr).safeApprove(router, 0);
      IERC20(wavax).safeApprove(router, 0);
      IERC20(glcr).safeApprove(swapper, 0);
      IERC20(wavax).safeApprove(swapper, 0);
      if (token0 != wavax && token0 != glcr)
        IERC20(token0).safeApprove(router, 0);
      if (token1 != wavax && token0 != glcr)
        IERC20(token1).safeApprove(router, 0);
  }

  function _addAllowance() override internal {
      IERC20(want).safeApprove(gauge, type(uint).max);
      IERC20(glcr).safeApprove(router, type(uint).max);
      IERC20(wavax).safeApprove(router, type(uint).max);
      IERC20(glcr).safeApprove(swapper, type(uint).max);
      IERC20(wavax).safeApprove(swapper, type(uint).max);
      if (token0 != wavax && token0 != glcr)
        IERC20(token0).safeApprove(router, type(uint).max);
      if (token1 != wavax && token0 != glcr)
        IERC20(token1).safeApprove(router, type(uint).max);
  }

}