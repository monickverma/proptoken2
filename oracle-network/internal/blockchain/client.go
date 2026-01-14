package blockchain

import (
    "context"
    "crypto/ecdsa"
    "fmt"
    "math/big"

    "github.com/ethereum/go-ethereum/accounts/abi/bind"
    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/crypto"
    "github.com/ethereum/go-ethereum/ethclient"
    "github.com/yourorg/proptoken-oracle/pkg/types"
)

type Client struct {
    EthClient  *ethclient.Client
    PrivateKey *ecdsa.PrivateKey
    ChainID    *big.Int
    Registry   *AssetRegistry
}

func NewClient(rpcURL, privateKeyHex, contractAddr string) (*Client, error) {
    client, err := ethclient.Dial(rpcURL)
    if err != nil {
        return nil, fmt.Errorf("failed to connect to eth client: %v", err)
    }

    chainID, err := client.ChainID(context.Background())
    if err != nil {
        return nil, fmt.Errorf("failed to get chain id: %v", err)
    }

    pk, err := crypto.HexToECDSA(privateKeyHex[2:]) // Remove 0x
    if err != nil {
        return nil, fmt.Errorf("invalid private key: %v", err)
    }

    registry, err := NewAssetRegistry(common.HexToAddress(contractAddr), client)
    if err != nil {
        return nil, fmt.Errorf("failed to bind to contract: %v", err)
    }

    return &Client{
        EthClient:  client,
        PrivateKey: pk,
        ChainID:    chainID,
        Registry:   registry,
    }, nil
}

func (c *Client) PushAttestation(subID string, att types.AttestationData) (string, error) {
    auth, err := bind.NewKeyedTransactorWithChainID(c.PrivateKey, c.ChainID)
    if err != nil {
        return "", fmt.Errorf("failed to create transactor: %v", err)
    }

    // Convert hex string inputs to byte arrays
    var merkleRoot [32]byte
    copy(merkleRoot[:], common.FromHex(att.MerkleRoot))
    
    // We also need the Asset Owner address and ABM hash, which are part of registerAsset params.
    // For this prototype, we'll use a dummy/derived owner or pass it in.
    // Ideally, the submission data should contain the owner address.
    // We'll trust the caller to have validated this.
    
    // Simplification for demo: Use the Oracle's address as "owner" for now, 
    // or derive from submission if we had it.
    // Let's assume the contract allows us to register.
    
    mockOwner := crypto.PubkeyToAddress(c.PrivateKey.PublicKey)
    mockAbmHash := [32]byte{}
    mockScores := [4]*big.Int{big.NewInt(100), big.NewInt(100), big.NewInt(0), big.NewInt(0)} // Pass everything
    
    // We need to parse the hex signature to bytes
    // invalid signature length usually comes from generic string handling so handle with care
    // Contract signature param? Ah, AssetRegistry.registerAsset doesn't take the signature explicitly in our v1?
    // Let's check the generated binding...
    
    // Wait, looking at our solidity earlier:
    // function registerAsset(..., bytes32 oracleAttestation, ...)
    // It takes the merkle ROOT as the oracleAttestation. The signature is usually verified off-chain 
    // OR we submit the signature to a verify function. 
    // In our simplified AssetRegistry.registerAsset, it takes `bitcoin oracleAttestation`.
    // It is `onlyRole(CONSENSUS_ROLE)`. So the ORACLE (us) calls this directly.
    // We don't need to pass the signature, WE are signing the transaction!
    
    tx, err := c.Registry.RegisterAsset(
        auth,
        [32]byte(common.FromHex(subID)), // Fingerprint (using ID as hash for demo)
        mockOwner, // Owner
        merkleRoot, // Oracle Attestation (Root)
        mockAbmHash, // ABM Hash
        mockScores, // Scores
        true, // Eligible
    )
    if err != nil {
        return "", fmt.Errorf("failed to send transaction: %v", err)
    }

    return tx.Hash().Hex(), nil
}
