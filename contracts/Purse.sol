// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Purse is AccessControl, ReentrancyGuard {
  using SafeERC20 for IERC20;

  address owner;

  bytes32 public constant BORROW_ROLE = keccak256("BORROWER");

  event Withdrawal(uint amount);

  constructor(address[] memory borrowers)
  {
    owner = msg.sender;
    _grantRole(DEFAULT_ADMIN_ROLE, owner);
    _grantRole(BORROW_ROLE, owner);

    for (uint256 i = 0; i < borrowers.length; ++i) {
      grantRole(BORROW_ROLE, borrowers[i]);
    }
  }

  function withdraw(address tokenAddr, uint256 amount) public nonReentrant onlyRole(BORROW_ROLE) {
    // Send amount to borrower:
    require(IERC20(tokenAddr).balanceOf(address(this)) >= amount, "Not enough in the kitty");
    IERC20(tokenAddr).safeTransfer(msg.sender, amount);

    emit Withdrawal(amount);
  }

  /// --------------------------------------------------------------
  /// Borrower management functions
  /// --------------------------------------------------------------
  function addBorrower(address borrower) public onlyOwner {
    require(!hasRole(BORROW_ROLE, borrower), "Borrower already allowed to borrow");

    // Add borrower:
    grantRole(BORROW_ROLE, borrower);
  }

  function removeBorrower(address borrower) public onlyOwner {
    require(hasRole(BORROW_ROLE, borrower), "Borrower does not exist");

    // Remove borrower:
    revokeRole(BORROW_ROLE, borrower);
  }

  /// --------------------------------------------------------------
  /// Ownership
  /// --------------------------------------------------------------
  modifier onlyOwner() {
    require(owner == msg.sender, "Caller is not the owner");
    _;
  }

}
