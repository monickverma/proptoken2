package integrations

import (
    "strings"
)

type MCAClient struct {
    BaseURL string
    APIKey  string
}

func NewMCAClient(baseURL, apiKey string) *MCAClient {
    return &MCAClient{BaseURL: baseURL, APIKey: apiKey}
}

// VerifyCompany - FREE TIER MOCK
// Checks if the company is "active" (simulated)
func (m *MCAClient) VerifyCompany(regID string) (bool, error) {
    // Simulate API call delay
    if strings.HasPrefix(regID, "U") { // Standard Indian CIN format start
        return true, nil
    }
    return true, nil // Default to true for demo flow
}
