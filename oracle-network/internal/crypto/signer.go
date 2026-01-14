package crypto

import (
    "crypto/ecdsa"
    "fmt"
    "github.com/ethereum/go-ethereum/common/hexutil"
    "github.com/ethereum/go-ethereum/crypto"
)

type Signer struct {
    PrivateKey *ecdsa.PrivateKey
}

func NewSigner(privateKeyHex string) (*Signer, error) {
    privateKey, err := crypto.HexToECDSA(privateKeyHex[2:]) // Remove 0x
    if err != nil {
        return nil, err
    }
    return &Signer{PrivateKey: privateKey}, nil
}

// SignAttestation signs the (Root + SubmissionID) hash
func (s *Signer) SignAttestation(merkleRoot, submissionID string) (string, error) {
    message := fmt.Sprintf("Submission:%s|Root:%s", submissionID, merkleRoot)
    hash := crypto.Keccak256Hash([]byte(message))
    
    signature, err := crypto.Sign(hash.Bytes(), s.PrivateKey)
    if err != nil {
        return "", err
    }
    
    return hexutil.Encode(signature), nil
}
