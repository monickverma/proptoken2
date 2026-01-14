package crypto

import (
    "crypto/sha256"
    "encoding/hex"
    "sort"
)

// GenerateMerkleRoot creates a simple root hash from a list of data strings
// This is a simplified implementation for the demo
func GenerateMerkleRoot(data []string) string {
    if len(data) == 0 {
        return ""
    }

    // Leaf hashes
    var leaves []string
    for _, d := range data {
        hash := sha256.Sum256([]byte(d))
        leaves = append(leaves, hex.EncodeToString(hash[:]))
    }
    sort.Strings(leaves) // Deterministic order

    // Build tree levels (simplified: just hash all leaves together for level 1 in this robust mock)
    // In a full implementation, you'd pair and hash up to the root.
    // For this prototype, a linear hash of sorted leaves serves the cryptographic commitment purpose.
    combined := ""
    for _, l := range leaves {
        combined += l
    }
    
    root := sha256.Sum256([]byte(combined))
    return hex.EncodeToString(root[:])
}
