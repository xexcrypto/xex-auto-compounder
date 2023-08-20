// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

interface IFvmRouter {
  
  struct route {
    address from;
    address to;
    bool stable;
  }
  
  function sortTokens(address tokenA, address tokenB) external pure returns (address token0, address token1);

  // calculates the CREATE2 address for a pair without making any external calls
  function pairFor(address tokenA, address tokenB, bool stable) external view returns (address pair);

  // fetches and sorts the reserves for a pair
  function getReserves(address tokenA, address tokenB, bool stable) external view returns (uint reserveA, uint reserveB);

  function addLiquidity(
    address tokenA,
    address tokenB,
    bool stable,
    uint amountADesired,
    uint amountBDesired,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
  ) external returns (uint, uint, uint);

  function removeLiquidity(
    address tokenA,
    address tokenB,
    bool stable,
    uint liquidity,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
  ) external returns (uint amountA, uint amountB);


  // performs chained getAmountOut calculations on any number of pairs
  function getAmountOut(uint amountIn, address tokenIn, address tokenOut) external view returns (uint amount, bool stable);

  //@override
  //getAmountOut	:	bool stable
  //Gets exact output for specific pair-type(S|V)
  function getAmountOut(uint amountIn, address tokenIn, address tokenOut, bool stable) external view returns (uint amount);

  // performs chained getAmountOut calculations on any number of pairs
  function getAmountsOut(uint amountIn, route[] memory routes) external view returns (uint[] memory amounts);

  function isPair(address pair) external view returns (bool);

  function quoteAddLiquidity(
      address tokenA,
      address tokenB,
      bool stable,
      uint amountADesired,
      uint amountBDesired
  ) external view returns (uint amountA, uint amountB, uint liquidity);

  function quoteRemoveLiquidity(
      address tokenA,
      address tokenB,
      bool stable,
      uint liquidity
  ) external view returns (uint amountA, uint amountB);
  function swapExactTokensForTokensSimple(
      uint amountIn,
      uint amountOutMin,
      address tokenFrom,
      address tokenTo,
      bool stable,
      address to,
      uint deadline
  ) external returns (uint[] memory amounts);

  function swapExactTokensForTokens(
      uint amountIn,
      uint amountOutMin,
      route[] calldata routes,
      address to,
      uint deadline
  ) external returns (uint[] memory amounts);

  function swapExactETHForTokens(uint amountOutMin, route[] calldata routes, address to, uint deadline)
  external
  payable
  returns (uint[] memory amounts);

  function swapExactTokensForETH(uint amountIn, uint amountOutMin, route[] calldata routes, address to, uint deadline)
  external
  returns (uint[] memory amounts);
}
