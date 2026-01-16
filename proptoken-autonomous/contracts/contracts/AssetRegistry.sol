// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AssetRegistry is AccessControl, ReentrancyGuard {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    struct Asset {
        bytes32 fingerprint;
        bytes32 oracleAttestation;
        bytes32 abmOutputHash;
        address owner;
        uint256 timestamp;
        uint256 existenceScore;
        uint256 ownershipScore;
        uint256 fraudScore;
        uint256 riskScore;
        bool verified;
        bool eligible;
        bool tokenized;
    }
    
    mapping(bytes32 => Asset) private assets;
    mapping(bytes32 => address) private tokenAddresses;
    
    event AssetRegistered(
        bytes32 indexed fingerprint,
        address indexed owner,
        uint256 timestamp
    );
    
    event AssetVerified(bytes32 indexed fingerprint);
    event AssetTokenized(bytes32 indexed fingerprint, address tokenAddress);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new asset with all verification data
     * @param _asset The complete asset struct with all data
     */
    function registerAsset(Asset calldata _asset) 
        external 
        onlyRole(ORACLE_ROLE) 
        nonReentrant 
    {
        require(_asset.fingerprint != bytes32(0), "Invalid fingerprint");
        require(assets[_asset.fingerprint].fingerprint == bytes32(0), "Asset already exists");
        
        assets[_asset.fingerprint] = _asset;
        
        emit AssetRegistered(_asset.fingerprint, _asset.owner, _asset.timestamp);
        
        if (_asset.verified) {
            emit AssetVerified(_asset.fingerprint);
        }
    }
    
    /**
     * @dev Check if asset is eligible for tokenization
     */
    function isEligible(bytes32 fingerprint) external view returns (bool) {
        Asset storage asset = assets[fingerprint];
        return asset.verified && asset.eligible && !asset.tokenized;
    }
    
    /**
     * @dev Mark asset as tokenized
     */
    function markAsTokenized(bytes32 fingerprint, address tokenAddress) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(assets[fingerprint].fingerprint != bytes32(0), "Asset not found");
        require(!assets[fingerprint].tokenized, "Already tokenized");
        
        assets[fingerprint].tokenized = true;
        tokenAddresses[fingerprint] = tokenAddress;
        
        emit AssetTokenized(fingerprint, tokenAddress);
    }
    
    /**
     * @dev Get complete asset details
     */
    function getAsset(bytes32 fingerprint) external view returns (Asset memory) {
        require(assets[fingerprint].fingerprint != bytes32(0), "Asset not found");
        return assets[fingerprint];
    }
    
    /**
     * @dev Get token address for an asset
     */
    function getTokenAddress(bytes32 fingerprint) external view returns (address) {
        return tokenAddresses[fingerprint];
    }
    
    /**
     * @dev Verify an asset (Oracle only)
     */
    function verifyAsset(bytes32 fingerprint) external onlyRole(ORACLE_ROLE) {
        require(assets[fingerprint].fingerprint != bytes32(0), "Asset not found");
        assets[fingerprint].verified = true;
        emit AssetVerified(fingerprint);
    }
}
