//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

interface IoFVM {
    
  function exercise(uint256 _amount, uint256 _maxPaymentAmount, address _recipient) external returns (uint256);
  function getDiscountedPrice(uint256 _amount) external view returns (uint256);

}

