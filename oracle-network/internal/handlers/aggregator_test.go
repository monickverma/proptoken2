package handlers

import (
	"math/big"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/yourorg/proptoken-oracle/internal/crypto"
	"github.com/yourorg/proptoken-oracle/pkg/types"
)

func TestBuildSignalTreeReturnsAProofPerSignal(t *testing.T) {
	root, proofs, err := buildSignalTree("sub-7", map[string]map[string]types.SignalData{
		"existence": {
			"satellite_image": {Source: "OpenStreetMap/Yandex", Score: 1},
			"vision_analysis": {Source: "ComputerVision", Score: 0.93},
		},
		"ownership": {
			"mca_registry":   {Source: "MCA_Mock", Score: 1},
			"deed_integrity": {Source: "HashRegistry", Score: 0},
		},
		"activity": {
			"foot_traffic": {Source: "MockGooglePlaces", Score: 0.9},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(proofs) != 5 {
		t.Fatalf("got %d proofs, want 5", len(proofs))
	}
	if proofs[0].Category != "activity" || proofs[4].Signal != "mca_registry" {
		t.Fatalf("proofs not sorted by category/name: %+v", proofs)
	}

	for _, p := range proofs {
		// Recompute the leaf from the returned fields, as the contract does.
		score, ok := new(big.Int).SetString(p.Score, 10)
		if !ok {
			t.Fatalf("bad score %q", p.Score)
		}
		leaf, err := crypto.LeafHash(crypto.Signal{SubmissionID: "sub-7", Category: p.Category, Name: p.Signal, Source: p.Source, Score: score})
		if err != nil {
			t.Fatal(err)
		}
		if leaf.Hex() != p.Leaf {
			t.Fatalf("%s/%s: leaf %s, recomputed %s", p.Category, p.Signal, p.Leaf, leaf.Hex())
		}
		path := make([]common.Hash, len(p.Proof))
		for i, h := range p.Proof {
			path[i] = common.HexToHash(h)
		}
		if !crypto.VerifyProof(path, common.HexToHash(root), leaf) {
			t.Fatalf("%s/%s: proof does not verify", p.Category, p.Signal)
		}
	}
}
