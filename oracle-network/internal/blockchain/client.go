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

func (c *Client) PushAttestation(subID string, att types.AttestationData, isMock bool) (string, error) {
	auth, err := bind.NewKeyedTransactorWithChainID(c.PrivateKey, c.ChainID)
	if err != nil {
		return "", fmt.Errorf("failed to create transactor: %v", err)
	}

	// Convert hex string inputs to byte arrays
	var merkleRoot [32]byte
	copy(merkleRoot[:], common.FromHex(att.MerkleRoot))

	// Ensure subID is a 32-byte fingerprint.
	// If it's a hex string, use it; otherwise hash it.
	var fingerprint [32]byte
	if len(subID) == 66 && subID[:2] == "0x" {
		copy(fingerprint[:], common.FromHex(subID))
	} else {
		// Fallback: hash the string subID
		copy(fingerprint[:], crypto.Keccak256([]byte(subID)))
	}

	// Simplification for demo: Use the Oracle's address as "owner" for now
	mockOwner := crypto.PubkeyToAddress(c.PrivateKey.PublicKey)
	mockAbmHash := [32]byte{}
	mockScores := [4]*big.Int{big.NewInt(1e18), big.NewInt(1e18), big.NewInt(0), big.NewInt(0)} // scores[0] and scores[1] are existence/ownership

	tx, err := c.Registry.RegisterAsset(
		auth,
		fingerprint,
		mockOwner,
		merkleRoot,
		mockAbmHash,
		mockScores,
		true, // Eligible
		isMock,
	)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %v", err)
	}

	return tx.Hash().Hex(), nil
}
