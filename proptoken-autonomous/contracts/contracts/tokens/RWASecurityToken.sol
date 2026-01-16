// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RWASecurityToken
 * @dev ERC-3643 compliant security token for RWA
 * @notice Implements identity-based transfers with compliance checks
 */
contract RWASecurityToken is ERC20, AccessControl, ReentrancyGuard {
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    
    // Asset registry reference
    address public assetRegistry;
    bytes32 public assetFingerprint;
    
    // Identity registry (simplified - use full T-REX in production)
    mapping(address => bool) public verifiedInvestors;
    mapping(address => bool) public frozenWallets;
    
    // Compliance rules
    uint256 public maxInvestorsCount;
    uint256 public currentInvestorsCount;
    mapping(address => bool) public isInvestor;
    
    // Token-specific data
    struct TokenInfo {
        string assetDescription;
        uint256 totalAssetValue;  // NAV in base currency
        uint256 creationDate;
        bool paused;
    }
    
    TokenInfo public tokenInfo;
    
    // Events
    event InvestorVerified(address indexed investor, bool verified);
    event WalletFrozen(address indexed wallet, bool frozen);
    event ComplianceRuleUpdated(string rule, uint256 value);
    event ForcedTransfer(address indexed from, address indexed to, uint256 amount, address indexed agent);
    
    constructor(
        string memory name,
        string memory symbol,
        address _assetRegistry,
        bytes32 _assetFingerprint,
        string memory _assetDescription,
        uint256 _totalAssetValue
    ) ERC20(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        assetRegistry = _assetRegistry;
        assetFingerprint = _assetFingerprint;
        
        tokenInfo = TokenInfo({
            assetDescription: _assetDescription,
            totalAssetValue: _totalAssetValue,
            creationDate: block.timestamp,
            paused: false
        });
        
        maxInvestorsCount = 2000; // Default limit
    }
    
    /**
     * @dev Mint tokens (NAV-based issuance)
     */
    function mint(address to, uint256 amount) 
        external 
        onlyRole(MINTER_ROLE) 
        nonReentrant 
    {
        require(!tokenInfo.paused, "Token is paused");
        require(verifiedInvestors[to], "Investor not verified");
        require(!frozenWallets[to], "Wallet is frozen");
        
        if (!isInvestor[to] && amount > 0) {
            require(currentInvestorsCount < maxInvestorsCount, "Max investors reached");
            isInvestor[to] = true;
            currentInvestorsCount++;
        }
        
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens (redemption)
     */
    function burn(uint256 amount) external {
        require(!tokenInfo.paused, "Token is paused");
        _burn(msg.sender, amount);
        
        if (balanceOf(msg.sender) == 0 && isInvestor[msg.sender]) {
            isInvestor[msg.sender] = false;
            currentInvestorsCount--;
        }
    }
    
    /**
     * @dev Override transfer to include compliance checks
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        returns (bool) 
    {
        require(_canTransfer(msg.sender, to, amount), "Transfer not compliant");
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to include compliance checks
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        override 
        returns (bool) 
    {
        require(_canTransfer(from, to, amount), "Transfer not compliant");
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Forced transfer (legal recovery, court order)
     */
    function forcedTransfer(
        address from,
        address to,
        uint256 amount,
        string calldata reason
    ) external onlyRole(AGENT_ROLE) {
        require(bytes(reason).length > 0, "Reason required");
        _transfer(from, to, amount);
        emit ForcedTransfer(from, to, amount, msg.sender);
    }
    
    /**
     * @dev Verify investor
     */
    function verifyInvestor(address investor, bool verified) 
        external 
        onlyRole(COMPLIANCE_ROLE) 
    {
        verifiedInvestors[investor] = verified;
        emit InvestorVerified(investor, verified);
    }
    
    /**
     * @dev Freeze wallet
     */
    function freezeWallet(address wallet, bool frozen) 
        external 
        onlyRole(COMPLIANCE_ROLE) 
    {
        frozenWallets[wallet] = frozen;
        emit WalletFrozen(wallet, frozen);
    }
    
    /**
     * @dev Pause token
     */
    function pause(bool paused) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenInfo.paused = paused;
    }
    
    /**
     * @dev Update NAV
     */
    function updateNAV(uint256 newNAV) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenInfo.totalAssetValue = newNAV;
    }
    
    /**
     * @dev Internal compliance check
     */
    function _canTransfer(address from, address to, uint256 amount) 
        internal 
        view 
        returns (bool) 
    {
        if (tokenInfo.paused) return false;
        if (frozenWallets[from] || frozenWallets[to]) return false;
        if (!verifiedInvestors[from] || !verifiedInvestors[to]) return false;
        if (!isInvestor[to] && currentInvestorsCount >= maxInvestorsCount) return false;
        
        return true;
    }
    
    /**
     * @dev Get current NAV per token
     */
    function navPerToken() external view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 0;
        return (tokenInfo.totalAssetValue * 1e18) / supply;
    }
}
