//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

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

  struct TokenInfo {
    address token;
    Path[] pathToToken;
    uint256 minAmountOut;
  }

  // Functions
  function slipInNative(
    address token0, address token1, bool stable, Path[] memory pathToToken0, Path[] memory pathToToken1, uint256 minAmountOut0, uint256 minAmountOut1, address vault
  ) external payable;

  function slipIn(
    uint256 amount, address token0, address token1, bool stable, Path[] memory pathToToken0, Path[] memory pathToToken1, uint256 minAmountOut0, uint256 minAmountOut1, address vault
  ) external;

  function slipOutNative(
    uint256 amount, Path[] memory pathToToken0, Path[] memory pathToToken1, uint256 minAmountOut0, uint256 minAmountOut1, address vault
  ) external;

  function slipOut(
    uint256 amount, Path[] memory pathToToken0, Path[] memory pathToToken1, uint256 minAmountOut0, uint256 minAmountOut1, address vault
  ) external;

  // Swaps
  function quoteSwap(uint256 amountIn, Path[] memory routes) external view returns (uint256 amount);
  function swap(uint256 amount, uint256 minAmountOut, Path[] memory routes, address recipient) external returns (uint256 amountOut);
}