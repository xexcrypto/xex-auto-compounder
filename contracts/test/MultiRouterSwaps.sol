// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/***********************************************************
 * SlipInv2 has the newest multi-router swaps version!!
 ***********************************************************/

interface IRouter {
  
  struct route {
    address from;
    address to;
    bool stable;
  }

  function swapExactTokensForTokens(
      uint amountIn,
      uint amountOutMin,
      route[] calldata routes,
      address to,
      uint deadline
  ) external returns (uint[] memory amounts);
}

interface IRouterSimple {
  
  function swapExactTokensForTokens(
      uint amountIn,
      uint amountOutMin,
      address[] calldata routes,
      address to,
      uint deadline
  ) external returns (uint[] memory amounts);
}

contract MultiRouterSwaps {

  struct Path {
    address router;
    IRouter.route[] paths;
    address[] pathsSimple;
  }


  function swap(
    address from, 
    uint256 amount, 
    Path[] memory routes, 
    address recipient
  ) public {

    // receive from:
    require(IERC20(from).transferFrom(msg.sender, address(this), amount), "Failed to transfer from token");

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

        IRouter(routes[i].router).swapExactTokensForTokens(
          IERC20(routes[i].paths[0].from).balanceOf(address(this)), 
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

        IRouterSimple(routes[i].router).swapExactTokensForTokens(
          IERC20(routes[i].pathsSimple[0]).balanceOf(address(this)), 
          1, 
          routes[i].pathsSimple,
          swapTo,
          block.timestamp
        );

      }

    }

  }
}
