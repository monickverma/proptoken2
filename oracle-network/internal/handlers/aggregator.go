package handlers

import (
	"fmt"
	"sort"
	"time"

	"github.com/ethereum/go-ethereum/common"

	"github.com/yourorg/proptoken-oracle/internal/blockchain"
	"github.com/yourorg/proptoken-oracle/internal/crypto"
	"github.com/yourorg/proptoken-oracle/pkg/types"
)

type OracleAggregator struct {
	Existence *ExistenceVerifier
	Ownership *OwnershipVerifier
	Signer    *crypto.Signer
	Chain     *blockchain.Client
}

func NewOracleAggregator(exist *ExistenceVerifier, own *OwnershipVerifier, signer *crypto.Signer, chain *blockchain.Client) *OracleAggregator {
	return &OracleAggregator{
		Existence: exist,
		Ownership: own,
		Signer:    signer,
		Chain:     chain,
	}
}

func (a *OracleAggregator) VerifySubmission(sub *types.SubmissionData) (*types.OracleResult, error) {
	// 1. Run Verifications
	existenceRes := a.Existence.Verify(sub)
	ownershipRes := a.Ownership.Verify(sub)

	// Activity mocked as pass for now
	activityRes := types.ActivityResult{
		Score:  0.9,
		Passed: true,
		Signals: map[string]types.SignalData{
			"foot_traffic": {Source: "MockGooglePlaces", Score: 0.9, Timestamp: time.Now()},
		},
	}

	// 2. Commit to every signal in a Merkle tree (one leaf per signal)
	merkleRoot, proofs, err := buildSignalTree(sub.ID, map[string]map[string]types.SignalData{
		"existence": existenceRes.Signals,
		"ownership": ownershipRes.Signals,
		"activity":  activityRes.Signals,
	})
	if err != nil {
		return nil, err
	}

	// 3. Sign Attestation
	signature, err := a.Signer.SignAttestation(merkleRoot, sub.ID)
	if err != nil {
		return nil, err
	}

	// 4. Push to Blockchain (Fire & Forget for demo, or blocking)
	txHash := ""
	if a.Chain != nil {
		hash, err := a.Chain.PushAttestation(sub.ID, types.AttestationData{MerkleRoot: merkleRoot}, sub.IsMock)
		if err == nil {
			txHash = hash
			fmt.Printf("Bitcoined Attestation: %s\n", txHash)
		} else {
			fmt.Printf("Blockchain Push Failed: %v\n", err)
		}
	}

	return &types.OracleResult{
		SubmissionID: sub.ID,
		Existence:    existenceRes,
		Ownership:    ownershipRes,
		Activity:     activityRes,
		Attestation: types.AttestationData{
			MerkleRoot:    merkleRoot,
			OracleAddress: "0xMockOracleAddress",
			Signature:     signature,
			Timestamp:     time.Now(),
			Proofs:        proofs,
		},
		Timestamp: time.Now(),
	}, nil
}

// buildSignalTree hashes each signal into a leaf, builds the attestation tree and
// returns its root with an inclusion proof per signal, sorted by category and name.
func buildSignalTree(subID string, byCategory map[string]map[string]types.SignalData) (string, []types.SignalProof, error) {
	var signals []crypto.Signal
	for category, sigs := range byCategory {
		for name, sig := range sigs {
			signals = append(signals, crypto.Signal{
				SubmissionID: subID,
				Category:     category,
				Name:         name,
				Source:       sig.Source,
				Score:        crypto.ScoreToUint(sig.Score),
			})
		}
	}
	sort.Slice(signals, func(i, j int) bool {
		if signals[i].Category != signals[j].Category {
			return signals[i].Category < signals[j].Category
		}
		return signals[i].Name < signals[j].Name
	})

	leaves := make([]common.Hash, len(signals))
	for i, s := range signals {
		leaf, err := crypto.LeafHash(s)
		if err != nil {
			return "", nil, err
		}
		leaves[i] = leaf
	}
	tree, err := crypto.NewMerkleTree(leaves)
	if err != nil {
		return "", nil, err
	}

	proofs := make([]types.SignalProof, len(signals))
	for i, s := range signals {
		path, err := tree.Proof(leaves[i])
		if err != nil {
			return "", nil, err
		}
		hexPath := make([]string, len(path))
		for j, h := range path {
			hexPath[j] = h.Hex()
		}
		proofs[i] = types.SignalProof{
			Category: s.Category,
			Signal:   s.Name,
			Source:   s.Source,
			Score:    s.Score.String(),
			Leaf:     leaves[i].Hex(),
			Proof:    hexPath,
		}
	}
	return tree.Root().Hex(), proofs, nil
}
