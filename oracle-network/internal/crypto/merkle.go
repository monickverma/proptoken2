package crypto

import (
	"bytes"
	"errors"
	"fmt"
	"math"
	"math/big"
	"sort"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

// Signal is one oracle check committed to the attestation Merkle tree.
//
// Each signal becomes a leaf
//
//	keccak256(bytes.concat(keccak256(abi.encode(submissionId, category, name, source, score))))
//
// with types (string, string, string, string, uint256). That is the leaf
// encoding of OpenZeppelin's StandardMerkleTree and the one
// OracleAttestationVerifier.verifyOracleResult recomputes on-chain.
type Signal struct {
	SubmissionID string
	Category     string   // "existence", "ownership", "activity"
	Name         string   // e.g. "vision_analysis"
	Source       string   // e.g. "ComputerVision"
	Score        *big.Int // 1e18 fixed point
}

var leafArgs = func() abi.Arguments {
	str, _ := abi.NewType("string", "", nil)
	u256, _ := abi.NewType("uint256", "", nil)
	return abi.Arguments{{Type: str}, {Type: str}, {Type: str}, {Type: str}, {Type: u256}}
}()

// ScoreToUint converts a score in [0, 1] to the 1e18 fixed-point value used on-chain.
// Scores are rounded to 6 decimals first so float noise (0.9 -> 0.899999...) never
// reaches the commitment.
func ScoreToUint(score float64) *big.Int {
	micro := big.NewInt(int64(math.Round(score * 1e6)))
	return micro.Mul(micro, big.NewInt(1e12))
}

// LeafHash returns the double-hashed leaf for a signal.
func LeafHash(s Signal) (common.Hash, error) {
	if s.Score == nil || s.Score.Sign() < 0 {
		return common.Hash{}, fmt.Errorf("signal %s/%s: score must be a non-negative integer", s.Category, s.Name)
	}
	enc, err := leafArgs.Pack(s.SubmissionID, s.Category, s.Name, s.Source, s.Score)
	if err != nil {
		return common.Hash{}, err
	}
	return crypto.Keccak256Hash(crypto.Keccak256(enc)), nil
}

// hashPair is OpenZeppelin's Hashes.commutativeKeccak256: keccak256 of the two
// nodes in ascending order.
func hashPair(a, b common.Hash) common.Hash {
	if bytes.Compare(a[:], b[:]) > 0 {
		a, b = b, a
	}
	return crypto.Keccak256Hash(a[:], b[:])
}

// MerkleTree has the same layout as OpenZeppelin's StandardMerkleTree with
// sortLeaves: leaves are sorted by hash and stored at the end of a flat array,
// node i has children 2i+1 and 2i+2, and nodes[0] is the root.
type MerkleTree struct {
	nodes  []common.Hash
	leaves []common.Hash // sorted
}

// NewMerkleTree builds a tree from leaf hashes (order does not matter).
func NewMerkleTree(leaves []common.Hash) (*MerkleTree, error) {
	if len(leaves) == 0 {
		return nil, errors.New("merkle: no leaves")
	}
	sorted := append([]common.Hash(nil), leaves...)
	sort.Slice(sorted, func(i, j int) bool { return bytes.Compare(sorted[i][:], sorted[j][:]) < 0 })

	nodes := make([]common.Hash, 2*len(sorted)-1)
	for i, leaf := range sorted {
		nodes[len(nodes)-1-i] = leaf
	}
	for i := len(nodes) - 1 - len(sorted); i >= 0; i-- {
		nodes[i] = hashPair(nodes[2*i+1], nodes[2*i+2])
	}
	return &MerkleTree{nodes: nodes, leaves: sorted}, nil
}

// Root returns the Merkle root.
func (t *MerkleTree) Root() common.Hash {
	return t.nodes[0]
}

// Proof returns the sibling hashes from the leaf up to the root, in the order
// MerkleProof.verify consumes them.
func (t *MerkleTree) Proof(leaf common.Hash) ([]common.Hash, error) {
	i := sort.Search(len(t.leaves), func(i int) bool { return bytes.Compare(t.leaves[i][:], leaf[:]) >= 0 })
	if i == len(t.leaves) || t.leaves[i] != leaf {
		return nil, fmt.Errorf("merkle: leaf %s not in tree", leaf.Hex())
	}
	var proof []common.Hash
	for idx := len(t.nodes) - 1 - i; idx > 0; idx = (idx - 1) / 2 {
		sibling := idx + 1
		if idx%2 == 0 {
			sibling = idx - 1
		}
		proof = append(proof, t.nodes[sibling])
	}
	return proof, nil
}

// VerifyProof mirrors OpenZeppelin MerkleProof.verify.
func VerifyProof(proof []common.Hash, root, leaf common.Hash) bool {
	computed := leaf
	for _, p := range proof {
		computed = hashPair(computed, p)
	}
	return computed == root
}
