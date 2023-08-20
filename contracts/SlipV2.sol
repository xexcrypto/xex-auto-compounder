//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

// *** DEBUG ***
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "./interfaces/IGlacierRouter.sol";
import "./interfaces/IWrapped.sol";
import "./interfaces/IVault.sol";
import "./interfaces/IStrategy.sol";
import "./interfaces/IRouter.sol";
import "./interfaces/ILP.sol";

// interface IRouter {
//   struct route {
//     address from;
//     address to;
//     bool stable;
//   }

//   function swapExactTokensForTokens(
//       uint amountIn,
//       uint amountOutMin,
//       route[] calldata routes,
//       address to,
//       uint deadline
//   ) external returns (uint[] memory amounts);

//   function removeLiquidity(
//     address tokenA,
//     address tokenB,
//     bool stable,
//     uint liquidity,
//     uint amountAMin,
//     uint amountBMin,
//     address to,
//     uint deadline
//   ) external returns (uint amountA, uint amountB)
// }

interface IRouterSimple {
  function swapExactTokensForTokens(
      uint amountIn,
      uint amountOutMin,
      address[] calldata routes,
      address to,
      uint deadline
  ) external returns (uint[] memory amounts);

  function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);
}


contract SlipV2 is ReentrancyGuard {
  using SafeERC20 for IERC20;

  struct Path {
    address router;
    IRouter.route[] paths;
    address[] pathsSimple;
  }

  struct TokenInfo {
    address token;
    Path[] pathToToken;
    uint256 minAmountOut;
  }

  address public owner;
  // address constant router = address(0xC5B8Ce3C8C171d506DEb069a6136a351Ee1629DC);  // Glacier
  // address constant wavax = address(0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7);
  address constant feerecip = address(0x3e91EF5Ae6D6a55CE8414952bCb202953Bc6a43e);

  address public wrappedToken;

  event Deposit(uint256 amount);
  event SwapsBals(uint256 amount0, uint256 amount1);
  event LiqRcvd(uint256 amount);
  event VaultRcvd(uint256 amount);
  event FeeSent(uint256 amount);
  event Test(string msg);
  event Addy(address addr);

  constructor(address _wrappedToken) {
    owner = msg.sender;
    wrappedToken = _wrappedToken; // Wrapped version of the native coin
  }

  receive() external payable {}
  fallback() external payable {}

  /*************************************************
   * SLIP IN
   */

  /// Take Avax, create LP and deposit into pool
  function slipInNative(
    address token0,
    address token1,
    bool stable,
    Path[] memory pathToToken0,
    Path[] memory pathToToken1,
    uint256 minAmountOut0,
    uint256 minAmountOut1,
    address vault
  ) public payable nonReentrant {
    // swap NATIVE for WRAPPED:
    IWrapped(wrappedToken).deposit{value: msg.value}();
    // assert(IERC20(wrappedToken).transfer(address(this), msg.value));

    emit Deposit(IERC20(wrappedToken).balanceOf(address(this)));

    // data structs:
    TokenInfo memory tok0 = TokenInfo(token0, pathToToken0, minAmountOut0);
    TokenInfo memory tok1 = TokenInfo(token1, pathToToken1, minAmountOut1);

    // now do the slipin:
    _doSlipIn(tok0, tok1, stable, vault);
    // _doSlipIn(token0, token1, stable, slippage, pathToToken0, pathToToken1, minAmountOut0, minAmountOut1, vault);
  }

  /// Takes WRAPPED and creates LP
  function slipIn(
    uint256 amount,
    address token0,
    address token1,
    bool stable,
    Path[] memory pathToToken0,
    Path[] memory pathToToken1,
    uint256 minAmountOut0,
    uint256 minAmountOut1,
    address vault
  ) public {
    console.log('ALLOWANCE:', IERC20(wrappedToken).allowance(msg.sender, address(this)));
    // transfer wavax into contract:
    // IERC20(wrappedToken).safeTransferFrom(msg.sender, address(this), amount);
    IERC20(wrappedToken).transferFrom(msg.sender, address(this), amount);
    
    // data structs:
    TokenInfo memory tok0 = TokenInfo(token0, pathToToken0, minAmountOut0);
    TokenInfo memory tok1 = TokenInfo(token1, pathToToken1, minAmountOut1);

    // now do the slipin:
    _doSlipIn(tok0, tok1, stable, vault);
    // _doSlipIn(token0, token1, stable, slippage, pathToToken0, pathToToken1, minAmountOut0, minAmountOut1, vault);
  }

  function _doSlipIn(
    TokenInfo memory token0,
    TokenInfo memory token1,
    bool stable,
    address vault

    // address token0,
    // address token1,
    // bool stable,
    // uint256 slippage,
    // Path[] memory _pathToToken0,
    // Path[] memory _pathToToken1,
    // uint256 minAmountOut0,
    // uint256 minAmountOut1,
    // address vault
  ) internal {

    // send fee to feee recipient:
    uint256 fee = IERC20(wrappedToken).balanceOf(address(this)) * 5 / 1000;
    IERC20(wrappedToken).safeTransfer(feerecip, fee);
    emit FeeSent(fee);

    // Convert remainder:
    uint256 half = (IERC20(wrappedToken).balanceOf(address(this))) / 2;
    // uint256 wavaxHalf = (amount - fee) / 2;
    // uint256 wavaxHalf = (((amount) * 1001) / 1000) / 2;

    emit LiqRcvd(half);
    // return;

    // IERC20 want = IVault(vault).want();
    // want.safeApprove(router, type(uint).max);
    // want.safeApprove(vault, type(uint).max);

    uint256 token0Allowance;
    uint256 token1Allowance;

    if (token0.pathToToken.length > 0)
      token0Allowance = IERC20(token0.token).allowance(address(this), token0.pathToToken[0].router);
    if (token1.pathToToken.length > 0)
      token1Allowance = IERC20(token1.token).allowance(address(this), token1.pathToToken[1].router);

    // increase allowance if needed:
    // if (token0Allowance < half)
    //   IERC20(token0).safeIncreaseAllowance(router, type(uint).max - token0Allowance);
    // if (token1Allowance < half)
    //   IERC20(token1).safeIncreaseAllowance(router, type(uint).max - token1Allowance);

    console.log('WAVAX B4:', IERC20(token1.token).balanceOf(address(this)));

    // Swap if needed:
    if (token0.token != wrappedToken){
      // uint256 token0Min = half * slippage / 100;
      // IGlacierRouter(router).swapExactTokensForTokens(half, token0Min, _pathToToken0, address(this), block.timestamp);
      _swapLocal(half, token0.minAmountOut, token0.pathToToken, address(this));
    }
    
    console.log('WAVAX A swap 0:', IERC20(token1.token).balanceOf(address(this)));


    if (token1.token != wrappedToken){
      // uint256 token1Min = half * slippage / 100;
      // IGlacierRouter(router).swapExactTokensForTokens(half, token1Min, _pathToToken1, address(this), block.timestamp);
      _swapLocal(half, token1.minAmountOut, token1.pathToToken, address(this));
    }

    emit Addy(token0.token);
    emit Addy(token1.token);

    uint256 t1Bal = IERC20(token0.token).balanceOf(address(this));
    uint256 t2Bal = IERC20(token1.token).balanceOf(address(this));

    emit SwapsBals(t1Bal, t2Bal);

    address router = _getLiquidityRouter(vault);

    // Allow router to spend my tokens:
    IERC20(token0.token).approve(router, t1Bal);
    IERC20(token1.token).approve(router, t2Bal);


    (,, uint liquidity) = IRouter(router).addLiquidity(token0.token, token1.token, stable, t1Bal, t2Bal, 1, 1, address(this), block.timestamp);

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
  function slipOutNative(
    uint256 amount,
    Path[] memory pathToToken0,
    Path[] memory pathToToken1,
    uint256 minAmountOut0,
    uint256 minAmountOut1,
    address vault
  ) public nonReentrant {
    // Do the slip out:
    uint256 returnAmount = _doSlipOut(amount, pathToToken0, pathToToken1, minAmountOut0, minAmountOut1, vault);

    // swap back to avax:
    IWrapped(wrappedToken).withdraw(returnAmount);

    // send avax to caller:
    payable(msg.sender).transfer(returnAmount);
  }

  /// Takes WAVAX and creates LP
  function slipOut(
    uint256 amount,
    Path[] memory pathToToken0,
    Path[] memory pathToToken1,
    uint256 minAmountOut0,
    uint256 minAmountOut1,
    address vault
  ) public nonReentrant {
    // Do the slip out:
    uint256 returnAmount = _doSlipOut(amount, pathToToken0, pathToToken1, minAmountOut0, minAmountOut1, vault);

    // Send it back to caller:
    assert(IERC20(wrappedToken).transfer(msg.sender, returnAmount));
  }

  function _doSlipOut(
    uint256 amount,
    Path[] memory _pathFromToken0,
    Path[] memory _pathFromToken1,
    uint256 minAmountOut0,
    uint256 minAmountOut1,
    address vault
  ) internal returns (uint256 returnAmount) {
    require(amount > 0, "No amount specified");

    console.log('Slipping out');

    // grab the vault tokens:
    // IERC20(vault).safeApprove(address(this), amount);
    IERC20(vault).safeTransferFrom(msg.sender, address(this), amount);

    // remove from vault:
    IVault(vault).withdraw(amount);

    // Get vault token pair:
    address lpToken = address(IVault(vault).want());
    address token0 = ILP(lpToken).token0();
    address token1 = ILP(lpToken).token1();
    bool stable = ILP(lpToken).stable();

    /// Now to remove from pool \\\
    // Approve router spend:
    IERC20(lpToken).approve(_getLiquidityRouter(vault), IERC20(lpToken).balanceOf(address(this)));
    (uint amountA, uint amountB) = IRouter(_getLiquidityRouter(vault)).removeLiquidity(token0, token1, stable, IERC20(lpToken).balanceOf(address(this)), 1, 1, address(this), block.timestamp);

    // Swap back to wavax:
    if (token0 != wrappedToken){
      // uint256[] memory amounts = IGlacierRouter(router).swapExactTokensForTokens(amountA, 0, _pathFromToken0, address(this), block.timestamp);
      // returnAmount += amounts[1];

      uint256 amounts = _swapLocal(amountA, minAmountOut0, _pathFromToken0, address(this));
      returnAmount += amounts;

    } else {
      returnAmount += amountA;
    }

    if (token1 != wrappedToken){
      // uint256[] memory amounts = IGlacierRouter(router).swapExactTokensForTokens(amountB, 0, _pathFromToken1, address(this), block.timestamp);
      // returnAmount += amounts[1];

      uint256 amounts = _swapLocal(amountB, minAmountOut1, _pathFromToken1, address(this));
      returnAmount += amounts;

    } else {
      returnAmount += amountB;
    }


  }


  /// Unstake, deconstruct LP, swaps then return avax
  // function slipOutNativeX(
  //   uint256 amount,
  //   address token0,
  //   address token1,
  //   bool stable,
  //   Path[] memory pathToToken0,
  //   Path[] memory pathToToken1,
  //   uint256 minAmountOut0,
  //   uint256 minAmountOut1,
  //   address vault,
  //   address lpToken
  // ) public {
  //   // swap AVAX for WAVAX:
  //   // IWrapped(wavax).deposit{value: msg.value}();
  //   // assert(IERC20(wavax).transfer(address(this), msg.value));

  //   // emit Deposit(IERC20(wavax).balanceOf(address(this)));

  //   // Do the slip out:
  //   uint256 returnAmount = _doSlipOut(amount, token0, token1, stable, pathToToken0, pathToToken1, minAmountOut0, minAmountOut1, vault, lpToken);

  //   // swap back to avax:
  //   IWrapped(wrappedToken).withdraw(returnAmount);

  //   // send avax to caller:
  //   payable(msg.sender).transfer(returnAmount);
  // }

  // /// Takes WAVAX and creates LP
  // function slipOutX(
  //   uint256 amount,
  //   address token0,
  //   address token1,
  //   bool stable,
  //   Path[] memory pathToToken0,
  //   Path[] memory pathToToken1,
  //   uint256 minAmountOut0,
  //   uint256 minAmountOut1,
  //   address vault,
  //   address lpToken
  // ) public nonReentrant {
  //   // Do the slip out:
  //   uint256 returnAmount = _doSlipOut(amount, token0, token1, stable, pathToToken0, pathToToken1, minAmountOut0, minAmountOut1, vault, lpToken);

  //   // Send it back to caller:
  //   assert(IERC20(wrappedToken).transfer(msg.sender, returnAmount));
  // }

  // function _doSlipOutX(
  //   uint256 amount,
  //   address token0,
  //   address token1,
  //   bool stable,
  //   Path[] memory _pathFromToken0,
  //   Path[] memory _pathFromToken1,
  //   uint256 minAmountOut0,
  //   uint256 minAmountOut1,
  //   address vault,
  //   address lpToken
  // ) internal returns (uint256 returnAmount) {
  //   require(amount > 0, "No amount specified");

  //   // grab the vault tokens:
  //   IERC20(vault).safeApprove(address(this), amount);
  //   IERC20(vault).safeTransferFrom(msg.sender, address(this), amount);

  //   // remove from vault:
  //   IVault(vault).withdraw(amount);

  //   // Now to remove from pool:
  //   (uint amountA, uint amountB) = IRouter(_getLiquidityRouter(vault)).removeLiquidity(token0, token1, stable, IERC20(lpToken).balanceOf(address(this)), 1, 1, address(this), block.timestamp);

  //   // uint256 returnAmount = 0;

  //   // Swap back to wavax:
  //   if (token0 != wrappedToken){
  //     // uint256[] memory amounts = IGlacierRouter(router).swapExactTokensForTokens(amountA, 0, _pathFromToken0, address(this), block.timestamp);
  //     // returnAmount += amounts[1];

  //     uint256 amounts = swap(amountA, minAmountOut0, _pathFromToken0, address(this));
  //     returnAmount += amounts;
  //   }
  //   if (token1 != wrappedToken){
  //     // uint256[] memory amounts = IGlacierRouter(router).swapExactTokensForTokens(amountB, 0, _pathFromToken1, address(this), block.timestamp);
  //     // returnAmount += amounts[1];

  //     uint256 amounts = swap(amountB, minAmountOut1, _pathFromToken1, address(this));
  //     returnAmount += amounts;
  //   }
  // }

  function _getLiquidityRouter(address vault) internal view returns (address router) {
    // address strat = address(IVault(vault).strategy);
    IStrategy strat = IVault(vault).strategy();
    router = strat.router();
  }


  /*************************************************
   * swaps
   */

  function quoteSwap(
    uint256 amountIn, 
    Path[] memory routes
  ) public view returns (uint256 amount) {
    uint256[] memory amountsOut;

    uint256 _amountIn = amountIn;

    // Check routes:
    for (uint i; i < routes.length; ++i) {

      if (routes[i].paths.length > 0) {
        // use path structure:
        amountsOut = IRouter(routes[i].router).getAmountsOut(
          _amountIn, 
          routes[i].paths
        );

      } else if (routes[i].pathsSimple.length > 0) {
        // use simple array path:
        amountsOut = IRouterSimple(routes[i].router).getAmountsOut(
          _amountIn, 
          routes[i].pathsSimple
        );
      }

      // DEBUG:
      // for(uint j; j < amountsOut.length; j++)
      //   console.log(j, ":", amountsOut[j]);
      
      // Next amount in is the last amount out:
      _amountIn = amountsOut[amountsOut.length-1];

      // if (i == routes.length-1)
      //   amount
      //   // amount = amountsOut[1];

    }
    amount = _amountIn;
  }

  function swap(
    uint256 amount, 
    uint256 minAmountOut,
    Path[] memory routes, 
    address recipient
  ) public returns (uint256 amountOut) {

    // receive from:
    address from = routes[0].paths.length > 0 
      ? routes[0].paths[0].from
      : routes[0].pathsSimple[0];
// emit Test('here');
// emit Addy(msg.sender);

    // if (IERC20(from).balanceOf(msg.sender) != amount)
    require(IERC20(from).transferFrom(msg.sender, address(this), amount), "Failed to transfer from token");

    return _swapLocal(amount, minAmountOut, routes, recipient);
  }

  function _swapLocal(
    uint256 amount, 
    uint256 minAmountOut,
    Path[] memory routes, 
    address recipient
  ) internal returns (uint256 amountOut) {

    uint256[] memory amountSwapped;
    uint256 _amountIn = amount;


    // Check routes:
    for (uint i; i < routes.length; ++i) {

      address swapTo = i == routes.length-1 
        ? recipient //msg.sender
        : address(this);

      if (routes[i].paths.length > 0) {
        // use path structure:

        // Make sure router can spend my tokens:
        IERC20(routes[i].paths[0].from).approve(
          routes[i].router, 
          IERC20(routes[i].paths[0].from).balanceOf(address(this))
        );

        amountSwapped = IRouter(routes[i].router).swapExactTokensForTokens(
          // IERC20(routes[i].paths[0].from).balanceOf(address(this)), 
          _amountIn,
          1,
          routes[i].paths,
          swapTo,
          block.timestamp
        );

      } else if (routes[i].pathsSimple.length > 0) {
        // use simple array path:

        // Make sure router can spend my tokens:
        IERC20(routes[i].pathsSimple[0]).approve(
          routes[i].router, 
          IERC20(routes[i].pathsSimple[0]).balanceOf(address(this))
        );

        amountSwapped = IRouterSimple(routes[i].router).swapExactTokensForTokens(
          // IERC20(routes[i].pathsSimple[0]).balanceOf(address(this)), 
          _amountIn,
          1, 
          routes[i].pathsSimple,
          swapTo,
          block.timestamp
        );

      }
      
      // Next amount in is the last amount out:
      _amountIn = amountSwapped[amountSwapped.length-1];

      // if (i == routes.length-1)
      //   amountOut = amountSwapped[1];

    }

    console.log('Amounts:', amount, _amountIn, minAmountOut);

    require(_amountIn >= minAmountOut, "Slippage too high");
    amountOut = _amountIn;
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