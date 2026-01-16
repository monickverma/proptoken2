package types

import "time"

// Asset submission from backend
type SubmissionData struct {
	ID         string        `json:"id"`
	Location   Location      `json:"location"`
	SPV        SPVData       `json:"spv"`
	Documents  DocumentData  `json:"documents"`
	Financials FinancialData `json:"financials"`
	IsMock     bool          `json:"is_mock"`
}

type Location struct {
	Address     string      `json:"address"`
	Coordinates Coordinates `json:"coordinates"`
	City        string      `json:"city"`
	State       string      `json:"state"`
}

type Coordinates struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type SPVData struct {
	RegID     string   `json:"reg_id"`
	Directors []string `json:"directors"`
}

type DocumentData struct {
	DeedHash string `json:"deed_hash"`
}

type FinancialData struct {
	Valuation float64 `json:"valuation"`
}

// Oracle results
type OracleResult struct {
	SubmissionID string          `json:"submission_id"`
	Existence    ExistenceResult `json:"existence"`
	Ownership    OwnershipResult `json:"ownership"`
	Activity     ActivityResult  `json:"activity"`
	Attestation  AttestationData `json:"attestation"`
	Timestamp    time.Time       `json:"timestamp"`
}

type ExistenceResult struct {
	Score      float64               `json:"score"`
	Confidence float64               `json:"confidence"`
	Signals    map[string]SignalData `json:"signals"`
	Passed     bool                  `json:"passed"`
}

type OwnershipResult struct {
	Score   float64               `json:"score"`
	Signals map[string]SignalData `json:"signals"`
	Passed  bool                  `json:"passed"`
}

type ActivityResult struct {
	Score   float64               `json:"score"`
	Signals map[string]SignalData `json:"signals"`
	Passed  bool                  `json:"passed"`
}

type SignalData struct {
	Source    string      `json:"source"`
	Score     float64     `json:"score"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

type AttestationData struct {
	MerkleRoot    string    `json:"merkle_root"`
	OracleAddress string    `json:"oracle_address"`
	Signature     string    `json:"signature"`
	Timestamp     time.Time `json:"timestamp"`
}
