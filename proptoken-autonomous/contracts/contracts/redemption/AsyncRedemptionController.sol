// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../tokens/RWASecurityToken.sol";

/**
 * @title AsyncRedemptionController
 * @dev ERC-7540 async redemption for illiquid RWA
 * @notice Handles multi-step redemption process
 */
contract AsyncRedemptionController is AccessControl, ReentrancyGuard {
    
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    enum RedemptionStatus {
        None,
        Requested,
        Processing,
        Approved,
        Settled,
        Cancelled
    }
    
    struct RedemptionRequest {
        address investor;
        address token;
        uint256 tokenAmount;
        uint256 estimatedValue;  // In base currency
        uint256 requestTime;
        uint256 settlementTime;
        RedemptionStatus status;
        bytes32 proofHash;       // Hash of liquidation proof
    }
    
    // Request ID => Request
    mapping(bytes32 => RedemptionRequest) public redemptionRequests;
    
    // Token => Total pending redemptions
    mapping(address => uint256) public pendingRedemptions;
    
    // Investor => Array of request IDs
    mapping(address => bytes32[]) public investorRequests;
    
    uint256 public constant SETTLEMENT_PERIOD = 90 days; // Max wait time
    
    // Events
    event RedemptionRequested(
        bytes32 indexed requestId,
        address indexed investor,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );
    
    event RedemptionApproved(bytes32 indexed requestId, uint256 settlementValue);
    event RedemptionSettled(bytes32 indexed requestId, uint256 actualValue);
    event RedemptionCancelled(bytes32 indexed requestId, string reason);
    
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }
    
    /**
     * @dev Request redemption
     */
    function requestRedemption(
        address token,
        uint256 amount
    ) external nonReentrant returns (bytes32) {
        require(amount > 0, "Invalid amount");
        
        RWASecurityToken securityToken = RWASecurityToken(token);
        require(securityToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Generate request ID
        bytes32 requestId = keccak256(
            abi.encodePacked(msg.sender, token, amount, block.timestamp)
        );
        
        // Calculate estimated value (NAV per token * amount)
        uint256 navPerToken = securityToken.navPerToken();
        uint256 estimatedValue = (navPerToken * amount) / 1e18;
        
        // Lock tokens
        securityToken.transferFrom(msg.sender, address(this), amount);
        
        // Create request
        redemptionRequests[requestId] = RedemptionRequest({
            investor: msg.sender,
            token: token,
            tokenAmount: amount,
            estimatedValue: estimatedValue,
            requestTime: block.timestamp,
            settlementTime: 0,
            status: RedemptionStatus.Requested,
            proofHash: bytes32(0)
        });
        
        pendingRedemptions[token] += amount;
        investorRequests[msg.sender].push(requestId);
        
        emit RedemptionRequested(requestId, msg.sender, token, amount, block.timestamp);
        
        return requestId;
    }
    
    /**
     * @dev Approve redemption (after off-chain liquidation)
     */
    function approveRedemption(
        bytes32 requestId,
        uint256 settlementValue,
        bytes32 proofHash
    ) external onlyRole(OPERATOR_ROLE) {
        RedemptionRequest storage request = redemptionRequests[requestId];
        require(request.status == RedemptionStatus.Requested, "Invalid status");
        
        request.status = RedemptionStatus.Approved;
        request.estimatedValue = settlementValue;
        request.proofHash = proofHash;
        
        emit RedemptionApproved(requestId, settlementValue);
    }
    
    /**
     * @dev Settle redemption (transfer funds to investor)
     */
    function settleRedemption(bytes32 requestId) 
        external 
        onlyRole(OPERATOR_ROLE) 
        nonReentrant 
    {
        RedemptionRequest storage request = redemptionRequests[requestId];
        require(request.status == RedemptionStatus.Approved, "Not approved");
        
        // Burn tokens
        RWASecurityToken token = RWASecurityToken(request.token);
        token.burn(request.tokenAmount);
        
        // Mark as settled
        request.status = RedemptionStatus.Settled;
        request.settlementTime = block.timestamp;
        
        pendingRedemptions[request.token] -= request.tokenAmount;
        
        emit RedemptionSettled(requestId, request.estimatedValue);
        
        // Note: Actual fund transfer happens off-chain (bank transfer, etc.)
    }
    
    /**
     * @dev Cancel redemption
     */
    function cancelRedemption(bytes32 requestId, string calldata reason) 
        external 
        onlyRole(OPERATOR_ROLE) 
    {
        RedemptionRequest storage request = redemptionRequests[requestId];
        require(
            request.status == RedemptionStatus.Requested || 
            request.status == RedemptionStatus.Approved,
            "Cannot cancel"
        );
        
        // Return tokens to investor
        RWASecurityToken token = RWASecurityToken(request.token);
        token.transfer(request.investor, request.tokenAmount);
        
        request.status = RedemptionStatus.Cancelled;
        pendingRedemptions[request.token] -= request.tokenAmount;
        
        emit RedemptionCancelled(requestId, reason);
    }
    
    /**
     * @dev Get redemption request
     */
    function getRedemptionRequest(bytes32 requestId) 
        external 
        view 
        returns (RedemptionRequest memory) 
    {
        return redemptionRequests[requestId];
    }
    
    /**
     * @dev Get investor requests
     */
    function getInvestorRequests(address investor) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return investorRequests[investor];
    }
}
