//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IStrategy.sol";

interface IVault {
  function strategy() view external returns (IStrategy);

  function deposit(uint _amount) external;
  function want() external view returns (IERC20);
  function withdrawAll() external;
  function withdraw(uint256 _shares) external;
}