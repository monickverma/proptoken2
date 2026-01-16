// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title OracleAttestationVerifier
 * @dev Verifies oracle attestations using Merkle proofs
 */
contract OracleAttestationVerifier is AccessControl {
    
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    struct OracleData {
        string oracleType;      // "existence", "ownership", "activity"
        bytes32 dataHash;       // Hash of oracle result
        uint256 timestamp;
        address attestor;
    }
    
    // Merkle root => valid
    mapping(bytes32 => bool) public validAttestations;
    
    // Oracle address => authorized
    mapping(address => bool) public authorizedOracles;
    
    event AttestationStored(bytes32 indexed merkleRoot, uint256 timestamp);
    event OracleAuthorized(address indexed oracle, bool authorized);
    
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }
    
    /**
     * @dev Store oracle attestation Merkle root
     */
    function storeAttestation(bytes32 merkleRoot) external onlyRole(ORACLE_ROLE) {
        validAttestations[merkleRoot] = true;
        emit AttestationStored(merkleRoot, block.timestamp);
    }
    
    /**
     * @dev Verify a specific oracle result against stored Merkle root
     */
    function verifyOracleResult(
        bytes32 merkleRoot,
        bytes32 leaf,
        bytes32[] calldata proof
    ) external view returns (bool) {
        require(validAttestations[merkleRoot], "Invalid attestation root");
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
    
    /**
     * @dev Authorize oracle address
     */
    function authorizeOracle(address oracle, bool authorized) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        authorizedOracles[oracle] = authorized;
        _grantRole(ORACLE_ROLE, oracle);
        emit OracleAuthorized(oracle, authorized);
    }
}
