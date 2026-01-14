// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./tokens/RWASecurityToken.sol";
import "./AssetRegistry.sol";

/**
 * @title TokenFactory
 * @dev Factory for deploying security tokens linked to registered assets
 */
contract TokenFactory is AccessControl {
    
    bytes32 public constant FACTORY_ROLE = keccak256("FACTORY_ROLE");
    
    AssetRegistry public assetRegistry;
    
    // Fingerprint => Token address
    mapping(bytes32 => address) public assetTokens;
    
    // All deployed tokens
    address[] public deployedTokens;
    
    event TokenDeployed(
        bytes32 indexed fingerprint,
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 timestamp
    );
    
    constructor(address _assetRegistry, address admin) {
        assetRegistry = AssetRegistry(_assetRegistry);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(FACTORY_ROLE, admin);
    }
    
    /**
     * @dev Deploy new security token for a registered asset
     */
    function deployToken(
        bytes32 fingerprint,
        string memory name,
        string memory symbol,
        string memory description,
        uint256 totalAssetValue
    ) external onlyRole(FACTORY_ROLE) returns (address) {
        require(assetRegistry.isEligible(fingerprint), "Asset not eligible");
        require(assetTokens[fingerprint] == address(0), "Token already exists");
        
        RWASecurityToken token = new RWASecurityToken(
            name,
            symbol,
            address(assetRegistry),
            fingerprint,
            description,
            totalAssetValue
        );
        
        assetTokens[fingerprint] = address(token);
        deployedTokens.push(address(token));
        
        // Mark asset as tokenized in registry
        // Note: TokenFactory must have DEFAULT_ADMIN_ROLE on AssetRegistry for this to work
        assetRegistry.markAsTokenized(fingerprint, address(token));
        
        // Grant admin rights to the deployer (so they can manage compliance/minting)
        token.grantRole(token.DEFAULT_ADMIN_ROLE(), msg.sender);
        token.grantRole(token.MINTER_ROLE(), msg.sender);
        token.grantRole(token.COMPLIANCE_ROLE(), msg.sender);
        
        emit TokenDeployed(fingerprint, address(token), name, symbol, block.timestamp);
        
        return address(token);
    }
    
    /**
     * @dev Get total deployed tokens
     */
    function totalTokens() external view returns (uint256) {
        return deployedTokens.length;
    }
}
