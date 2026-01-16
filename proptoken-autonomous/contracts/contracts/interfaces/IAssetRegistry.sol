// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAssetRegistry {
    event AssetRegistered(
        bytes32 indexed fingerprint,
        address indexed owner,
        bool eligible
    );

    function registerAsset(
        bytes32 fingerprint,
        address owner,
        bytes32 oracleAttestation,
        bytes32 abmOutputHash,
        uint256[4] memory scores,
        bool eligible
    ) external;

    function getAsset(bytes32 fingerprint) external view returns (bool, uint256, uint256);
}
