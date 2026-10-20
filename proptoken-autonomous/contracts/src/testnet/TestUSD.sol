// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TestUSD
 * @dev Valueless testnet stablecoin (6 decimals, like USDC) with a public,
 *      rate-limited faucet so anyone can try the market on Base Sepolia.
 */
contract TestUSD is ERC20, AccessControl {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant FAUCET_AMOUNT = 10_000 * 1e6;
    uint256 public constant FAUCET_COOLDOWN = 1 days;

    mapping(address => uint256) public lastFaucetClaim;

    event FaucetClaimed(address indexed account, uint256 amount);

    constructor(address admin) ERC20("PropToken Test USD", "tUSD") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @dev Mint FAUCET_AMOUNT to the caller, at most once per FAUCET_COOLDOWN
     */
    function faucet() external {
        uint256 last = lastFaucetClaim[msg.sender];
        require(last == 0 || block.timestamp >= last + FAUCET_COOLDOWN, "Faucet cooldown");
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }

    /**
     * @dev Next time `account` can use the faucet (0 = now)
     */
    function nextFaucetTime(address account) external view returns (uint256) {
        uint256 last = lastFaucetClaim[account];
        if (last == 0 || block.timestamp >= last + FAUCET_COOLDOWN) return 0;
        return last + FAUCET_COOLDOWN;
    }

    /**
     * @dev Admin mint, used to fund the market's buyback reserve
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
