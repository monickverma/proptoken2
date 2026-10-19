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
     * @dev Verify one oracle signal against a stored Merkle root. The leaf is
     * computed here from the signal's fields, so a caller cannot pass an inner
     * node of the tree off as a leaf. Matches the Go oracle (oracle-network,
     * internal/crypto/merkle.go), which returns these fields and the proof from /verify.
     * @param score Signal score in 1e18 fixed point
     */
    function verifyOracleResult(
        bytes32 merkleRoot,
        string calldata submissionId,
        string calldata category,
        string calldata signal,
        string calldata source,
        uint256 score,
        bytes32[] calldata proof
    ) external view returns (bool) {
        require(validAttestations[merkleRoot], "Invalid attestation root");
        bytes32 leaf = signalLeaf(submissionId, category, signal, source, score);
        return MerkleProof.verifyCalldata(proof, merkleRoot, leaf);
    }

    /**
     * @dev OpenZeppelin StandardMerkleTree leaf for (string, string, string, string, uint256):
     * keccak256(bytes.concat(keccak256(abi.encode(...)))). The double hash keeps a
     * 64-byte inner node from ever hashing to a valid leaf.
     */
    function signalLeaf(
        string calldata submissionId,
        string calldata category,
        string calldata signal,
        string calldata source,
        uint256 score
    ) public pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(submissionId, category, signal, source, score))));
    }
    
    /**
     * @dev Authorize oracle address
     */
    function authorizeOracle(address oracle, bool authorized) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        authorizedOracles[oracle] = authorized;
        if (authorized) {
            _grantRole(ORACLE_ROLE, oracle);
        } else {
            _revokeRole(ORACLE_ROLE, oracle);
        }
        emit OracleAuthorized(oracle, authorized);
    }
}
