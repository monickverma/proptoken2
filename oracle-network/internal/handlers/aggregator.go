package handlers

import (
    "fmt"
    "time"
    "github.com/yourorg/proptoken-oracle/pkg/types"
    "github.com/yourorg/proptoken-oracle/internal/crypto"
    "github.com/yourorg/proptoken-oracle/internal/blockchain"
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
        Score: 0.9, 
        Passed: true,
        Signals: map[string]types.SignalData{
            "foot_traffic": {Source: "MockGooglePlaces", Score: 0.9, Timestamp: time.Now()},
        },
    }
    
    // 2. Generate Merkle Proof
    // Collect all signal hashes
    var leaves []string
    
    // Existence Signals
    for k, v := range existenceRes.Signals {
        leaves = append(leaves, fmt.Sprintf("existence:%s:%v", k, v.Score))
    }
    // Ownership Signals
    for k, v := range ownershipRes.Signals {
        leaves = append(leaves, fmt.Sprintf("ownership:%s:%v", k, v.Score))
    }
    
    merkleRoot := crypto.GenerateMerkleRoot(leaves)
    
    // 3. Sign Attestation
    signature, err := a.Signer.SignAttestation(merkleRoot, sub.ID)
    if err != nil {
        return nil, err
    }
    
    // 4. Push to Blockchain (Fire & Forget for demo, or blocking)
    txHash := ""
    if a.Chain != nil {
        hash, err := a.Chain.PushAttestation(sub.ID, types.AttestationData{MerkleRoot: merkleRoot})
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
        },
        Timestamp: time.Now(),
    }, nil
}
