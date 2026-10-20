// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../tokens/RWASecurityToken.sol";

/**
 * @title PropTokenMarket
 * @dev Testnet primary market for RWASecurityTokens, paid in a stablecoin.
 *      buy:  pay `price` per whole token, the market mints to the buyer.
 *      sell: the market takes tokens back, burns them and pays the price
 *            minus `sellSpreadBps` from its stablecoin reserve.
 *      First-time buyers are whitelisted automatically (testnet stand-in for
 *      KYC), so the market needs MINTER_ROLE and COMPLIANCE_ROLE on each token
 *      and must itself be a verified investor to receive tokens on sell.
 */
contract PropTokenMarket is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant LISTER_ROLE = keccak256("LISTER_ROLE");

    uint256 public constant MAX_SPREAD_BPS = 2_000; // 20%

    IERC20 public immutable stablecoin;
    uint16 public sellSpreadBps;

    // Token => stablecoin price per whole token (1e18 token units); 0 = not listed
    mapping(address => uint256) public priceOf;
    address[] public listedTokens;

    event Listed(address indexed token, uint256 price);
    event Bought(address indexed buyer, address indexed token, uint256 amount, uint256 cost);
    event Sold(address indexed seller, address indexed token, uint256 amount, uint256 payout);
    event InvestorAutoVerified(address indexed token, address indexed investor);
    event SellSpreadUpdated(uint16 spreadBps);

    constructor(address _stablecoin, address admin, uint16 _sellSpreadBps) {
        require(_stablecoin != address(0) && admin != address(0), "Zero address");
        require(_sellSpreadBps <= MAX_SPREAD_BPS, "Spread too high");
        stablecoin = IERC20(_stablecoin);
        sellSpreadBps = _sellSpreadBps;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(LISTER_ROLE, admin);
    }

    /**
     * @dev List a token or change its price (price 0 delists)
     */
    function setPrice(address token, uint256 price) external onlyRole(LISTER_ROLE) {
        require(token != address(0), "Zero address");
        if (priceOf[token] == 0 && price > 0) {
            bool seen;
            for (uint256 i = 0; i < listedTokens.length; i++) {
                if (listedTokens[i] == token) { seen = true; break; }
            }
            if (!seen) listedTokens.push(token);
        }
        priceOf[token] = price;
        emit Listed(token, price);
    }

    function setSellSpread(uint16 spreadBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(spreadBps <= MAX_SPREAD_BPS, "Spread too high");
        sellSpreadBps = spreadBps;
        emit SellSpreadUpdated(spreadBps);
    }

    function quoteBuy(address token, uint256 amount) public view returns (uint256) {
        return (amount * priceOf[token]) / 1e18;
    }

    function quoteSell(address token, uint256 amount) public view returns (uint256) {
        return (quoteBuy(token, amount) * (10_000 - sellSpreadBps)) / 10_000;
    }

    /**
     * @dev Buy `amount` token units; caller must have approved the stablecoin cost
     */
    function buy(address token, uint256 amount) external nonReentrant returns (uint256 cost) {
        require(priceOf[token] > 0, "Not listed");
        cost = quoteBuy(token, amount);
        require(cost > 0, "Amount too small");

        stablecoin.safeTransferFrom(msg.sender, address(this), cost);

        RWASecurityToken t = RWASecurityToken(token);
        if (!t.verifiedInvestors(msg.sender)) {
            t.verifyInvestor(msg.sender, true);
            emit InvestorAutoVerified(token, msg.sender);
        }
        t.mint(msg.sender, amount);

        emit Bought(msg.sender, token, amount, cost);
    }

    /**
     * @dev Sell `amount` token units back; caller must have approved the token
     */
    function sell(address token, uint256 amount) external nonReentrant returns (uint256 payout) {
        require(priceOf[token] > 0, "Not listed");
        payout = quoteSell(token, amount);
        require(payout > 0, "Amount too small");
        require(stablecoin.balanceOf(address(this)) >= payout, "Reserve too low");

        RWASecurityToken t = RWASecurityToken(token);
        require(t.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        t.burn(amount);

        stablecoin.safeTransfer(msg.sender, payout);

        emit Sold(msg.sender, token, amount, payout);
    }

    function listedCount() external view returns (uint256) {
        return listedTokens.length;
    }

    function reserve() external view returns (uint256) {
        return stablecoin.balanceOf(address(this));
    }
}
