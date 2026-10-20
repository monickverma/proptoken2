package crypto

import (
	"fmt"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

func hashes(n int) []common.Hash {
	out := make([]common.Hash, n)
	for i := range out {
		out[i] = crypto.Keccak256Hash([]byte(fmt.Sprintf("leaf-%d", i)))
	}
	return out
}

func TestEveryLeafProvesForAllTreeSizes(t *testing.T) {
	for n := 1; n <= 17; n++ {
		leaves := hashes(n)
		tree, err := NewMerkleTree(leaves)
		if err != nil {
			t.Fatal(err)
		}
		for _, leaf := range leaves {
			proof, err := tree.Proof(leaf)
			if err != nil {
				t.Fatalf("n=%d: %v", n, err)
			}
			if !VerifyProof(proof, tree.Root(), leaf) {
				t.Fatalf("n=%d: proof for %s does not verify", n, leaf.Hex())
			}
		}
	}
}

func TestSingleLeafRootIsLeaf(t *testing.T) {
	leaf := hashes(1)[0]
	tree, _ := NewMerkleTree([]common.Hash{leaf})
	proof, _ := tree.Proof(leaf)
	if tree.Root() != leaf || len(proof) != 0 {
		t.Fatalf("root %s proof len %d", tree.Root().Hex(), len(proof))
	}
}

func TestRootIndependentOfInputOrder(t *testing.T) {
	leaves := hashes(5)
	a, _ := NewMerkleTree(leaves)
	reversed := []common.Hash{leaves[4], leaves[3], leaves[2], leaves[1], leaves[0]}
	b, _ := NewMerkleTree(reversed)
	if a.Root() != b.Root() {
		t.Fatal("root depends on input order")
	}
}

func TestRejectsWrongLeafAndTamperedProof(t *testing.T) {
	leaves := hashes(4)
	tree, _ := NewMerkleTree(leaves)
	proof, _ := tree.Proof(leaves[2])

	if VerifyProof(proof, tree.Root(), leaves[1]) {
		t.Fatal("proof verified for the wrong leaf")
	}
	proof[0][0] ^= 1
	if VerifyProof(proof, tree.Root(), leaves[2]) {
		t.Fatal("tampered proof verified")
	}
	if _, err := tree.Proof(crypto.Keccak256Hash([]byte("missing"))); err == nil {
		t.Fatal("expected error for a leaf that is not in the tree")
	}
	if _, err := NewMerkleTree(nil); err == nil {
		t.Fatal("expected error for an empty tree")
	}
}

func TestLeafHashIsDoubleHashedABIEncoding(t *testing.T) {
	s := Signal{SubmissionID: "sub-1", Category: "existence", Name: "vision_analysis", Source: "ComputerVision", Score: ScoreToUint(0.9)}
	got, err := LeafHash(s)
	if err != nil {
		t.Fatal(err)
	}
	enc, _ := leafArgs.Pack(s.SubmissionID, s.Category, s.Name, s.Source, s.Score)
	inner := crypto.Keccak256(enc)
	if got != crypto.Keccak256Hash(inner) {
		t.Fatal("leaf is not keccak256(keccak256(abi.encode(...)))")
	}
	if got == common.BytesToHash(inner) {
		t.Fatal("leaf must not equal the single hash")
	}
	if _, err := LeafHash(Signal{Category: "x", Name: "y"}); err == nil {
		t.Fatal("expected error for nil score")
	}
}

func TestScoreToUint(t *testing.T) {
	cases := map[float64]string{
		0:        "0",
		0.9:      "900000000000000000",
		0.97:     "970000000000000000",
		1:        "1000000000000000000",
		0.123456: "123456000000000000",
	}
	for in, want := range cases {
		if got := ScoreToUint(in); got.String() != want {
			t.Errorf("ScoreToUint(%v) = %s, want %s", in, got, want)
		}
	}
}

// crossLanguageSignals is the fixed vector that test_Verifier_GoOracleVector in
// proptoken-autonomous/contracts/test/Contracts.t.sol checks on-chain. If this
// test fails after an intentional change, regenerate the constants with
// `go test ./internal/crypto -run CrossLanguage -v` and update both files.
var crossLanguageSignals = []Signal{
	{"sub-42", "existence", "satellite_image", "OpenStreetMap/Yandex", ScoreToUint(1.0)},
	{"sub-42", "existence", "vision_analysis", "ComputerVision", ScoreToUint(0.9)},
	{"sub-42", "ownership", "mca_registry", "MCA_Mock", ScoreToUint(1.0)},
	{"sub-42", "ownership", "deed_integrity", "HashRegistry", ScoreToUint(1.0)},
	{"sub-42", "activity", "foot_traffic", "MockGooglePlaces", ScoreToUint(0.9)},
}

const crossLanguageRoot = "0x40ea529ae6e9ca78b662d67e1c79a3d137ec0b7c35a237dffbf0b30504b4789a"

func TestCrossLanguageVector(t *testing.T) {
	leaves := make([]common.Hash, len(crossLanguageSignals))
	for i, s := range crossLanguageSignals {
		leaves[i], _ = LeafHash(s)
	}
	tree, err := NewMerkleTree(leaves)
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("root %s", tree.Root().Hex())
	for i, s := range crossLanguageSignals {
		proof, _ := tree.Proof(leaves[i])
		t.Logf("%s/%s leaf %s proof %v", s.Category, s.Name, leaves[i].Hex(), proof)
	}
	if tree.Root().Hex() != crossLanguageRoot {
		t.Fatalf("root %s, want %s", tree.Root().Hex(), crossLanguageRoot)
	}
}
