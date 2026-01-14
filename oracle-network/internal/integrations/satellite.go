package integrations

import (
    "fmt"
    "github.com/yourorg/proptoken-oracle/pkg/types"
)

type SatelliteClient struct {
    APIKey string
}

func NewSatelliteClient(apiKey string) *SatelliteClient {
    return &SatelliteClient{APIKey: apiKey}
}

// GetSatelliteImage - FREE TIER MOCK
// Returns a static OpenStreetMap URL or a placeholder based on location
func (s *SatelliteClient) GetSatelliteImage(coords types.Coordinates) (string, error) {
    // In a real free tier, we might use OSM or Mapbox Free
    // Here we simulate a successful fetch
    url := fmt.Sprintf("https://static-maps.yandex.ru/1.x/?lang=en_US&ll=%f,%f&z=17&l=sat&size=600,450", coords.Lng, coords.Lat)
    return url, nil
}
