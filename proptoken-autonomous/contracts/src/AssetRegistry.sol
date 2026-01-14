// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AssetRegistry
 * @dev Immutable registry of verified RWA assets
 * @notice Only stores cryptographic proofs, not raw data
 */
contract AssetRegistry is AccessControl, ReentrancyGuard {
    
    bytes32 public constant CONSENSUS_ROLE = keccak256("CONSENSUS_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    struct Asset {
        bytes32 fingerprint;           // SHA-256 hash of asset data
        bytes32 oracleAttestation;     // Merkle root of oracle proofs
        bytes32 abmOutputHash;         // Hash of ABM analysis
        
        // Scores (scaled to 1e18 for precision)
        uint256 existenceScore;        // 0-1e18 (0-100%)
        uint256 ownershipScore;        // 0-1e18 (0-100%)
        uint256 fraudScore;            // 0-1e18 (0-100%)
        uint256 riskScore;             // 0-100 integer
        
        address owner;                 // Asset owner address
        uint256 timestamp;             // Registration timestamp
        bool eligible;                 // Eligibility flag
        bool tokenized;                // Has token been deployed?
        address tokenAddress;          // Address of deployed token (if any)
    }
    
    // Fingerprint => Asset
    mapping(bytes32 => Asset) public assets;
    
    // Owner => Array of fingerprints
    mapping(address => bytes32[]) public ownerAssets;
    
    // Fingerprint => exists
    mapping(bytes32 => bool) public registeredFingerprints;
    
    // Events
    event AssetRegistered(
        bytes32 indexed fingerprint,
        address indexed owner,
        bool eligible,
        uint256 timestamp
    );
    
    event AssetTokenized(
        bytes32 indexed fingerprint,
        address indexed tokenAddress,
        uint256 timestamp
    );
    
    event AssetUpdated(
        bytes32 indexed fingerprint,
        bytes32 newOracleAttestation,
        bytes32 newAbmHash
    );
    
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }
    
    /**
     * @dev Register a new asset (called by consensus engine)
     * @param fingerprint Unique asset identifier
     * @param owner Asset owner address
     * @param oracleAttestation Merkle root of oracle proofs
     * @param abmOutputHash Hash of ABM analysis
     * @param scores Array of [existence, ownership, fraud, risk]
     * @param eligible Eligibility decision
     */
    function registerAsset(
        bytes32 fingerprint,
        address owner,
        bytes32 oracleAttestation,
        bytes32 abmOutputHash,
        uint256[4] calldata scores, // [existence, ownership, fraud, risk]
        bool eligible
    ) external onlyRole(CONSENSUS_ROLE) nonReentrant {
        require(!registeredFingerprints[fingerprint], "Asset already registered");
        require(owner != address(0), "Invalid owner");
        require(scores[0] <= 1e18, "Invalid existence score");
        require(scores[1] <= 1e18, "Invalid ownership score");
        require(scores[2] <= 1e18, "Invalid fraud score");
        require(scores[3] <= 100, "Invalid risk score");
        
        Asset memory asset = Asset({
            fingerprint: fingerprint,
            oracleAttestation: oracleAttestation,
            abmOutputHash: abmOutputHash,
            existenceScore: scores[0],
            ownershipScore: scores[1],
            fraudScore: scores[2],
            riskScore: scores[3],
            owner: owner,
            timestamp: block.timestamp,
            eligible: eligible,
            tokenized: false,
            tokenAddress: address(0)
        });
        
        assets[fingerprint] = asset;
        ownerAssets[owner].push(fingerprint);
        registeredFingerprints[fingerprint] = true;
        
        emit AssetRegistered(fingerprint, owner, eligible, block.timestamp);
    }
    
    /**
     * @dev Update asset attestations (after re-verification)
     */
    function updateAsset(
        bytes32 fingerprint,
        bytes32 newOracleAttestation,
        bytes32 newAbmHash
    ) external onlyRole(CONSENSUS_ROLE) {
        require(registeredFingerprints[fingerprint], "Asset not registered");
        
        Asset storage asset = assets[fingerprint];
        asset.oracleAttestation = newOracleAttestation;
        asset.abmOutputHash = newAbmHash;
        
        emit AssetUpdated(fingerprint, newOracleAttestation, newAbmHash);
    }
    
    /**
     * @dev Mark asset as tokenized
     */
    function markAsTokenized(
        bytes32 fingerprint,
        address tokenAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(registeredFingerprints[fingerprint], "Asset not registered");
        require(assets[fingerprint].eligible, "Asset not eligible");
        require(!assets[fingerprint].tokenized, "Already tokenized");
        require(tokenAddress != address(0), "Invalid token address");
        
        Asset storage asset = assets[fingerprint];
        asset.tokenized = true;
        asset.tokenAddress = tokenAddress;
        
        emit AssetTokenized(fingerprint, tokenAddress, block.timestamp);
    }
    
    /**
     * @dev Get asset details
     */
    function getAsset(bytes32 fingerprint) external view returns (Asset memory) {
        require(registeredFingerprints[fingerprint], "Asset not registered");
        return assets[fingerprint];
    }
    
    /**
     * @dev Get all assets for an owner
     */
    function getOwnerAssets(address owner) external view returns (bytes32[] memory) {
        return ownerAssets[owner];
    }
    
    /**
     * @dev Check if asset is eligible
     */
    function isEligible(bytes32 fingerprint) external view returns (bool) {
        return registeredFingerprints[fingerprint] && assets[fingerprint].eligible;
    }
    
    /**
     * @dev Check if asset is tokenized
     */
    function isTokenized(bytes32 fingerprint) external view returns (bool) {
        return registeredFingerprints[fingerprint] && assets[fingerprint].tokenized;
    }
    
    /**
     * @dev Get token address for asset
     */
    function getTokenAddress(bytes32 fingerprint) external view returns (address) {
        require(registeredFingerprints[fingerprint], "Asset not registered");
        require(assets[fingerprint].tokenized, "Asset not tokenized");
        return assets[fingerprint].tokenAddress;
    }
}
