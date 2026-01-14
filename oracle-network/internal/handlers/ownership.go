package handlers

import (
    "time"
    "github.com/yourorg/proptoken-oracle/internal/integrations"
    "github.com/yourorg/proptoken-oracle/pkg/types"
)

type OwnershipVerifier struct {
    MCA *integrations.MCAClient
}

func NewOwnershipVerifier(mca *integrations.MCAClient) *OwnershipVerifier {
    return &OwnershipVerifier{MCA: mca}
}

func (o *OwnershipVerifier) Verify(sub *types.SubmissionData) types.OwnershipResult {
    signals := make(map[string]types.SignalData)
    
    // 1. MCA Check
    active, _ := o.MCA.VerifyCompany(sub.SPV.RegID)
    mcaScore := 0.0
    if active {
        mcaScore = 1.0
    }
    
    signals["mca_registry"] = types.SignalData{
        Source: "MCA_Mock",
        Score: mcaScore,
        Data: map[string]bool{"active": active},
        Timestamp: time.Now(),
    }
    
    // 2. Deed Check (Mocked - assumes hash presence implies validity for now)
    deedScore := 0.0
    if sub.Documents.DeedHash != "" {
        deedScore = 1.0
    }
    signals["deed_integrity"] = types.SignalData{
        Source: "HashRegistry",
        Score: deedScore,
        Data: sub.Documents.DeedHash,
        Timestamp: time.Now(),
    }
    
    finalScore := (mcaScore * 0.6) + (deedScore * 0.4)
    
    return types.OwnershipResult{
        Score: finalScore,
        Signals: signals,
        Passed: finalScore > 0.8,
    }
}
