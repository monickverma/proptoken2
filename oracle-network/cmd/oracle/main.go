package main

import (
    "encoding/json"
    "log"
    "net/http"
    "os"
    
    "github.com/gorilla/mux"
    "github.com/joho/godotenv"
    "github.com/yourorg/proptoken-oracle/internal/handlers"
    "github.com/yourorg/proptoken-oracle/internal/integrations"
    "github.com/yourorg/proptoken-oracle/internal/crypto"
    "github.com/yourorg/proptoken-oracle/internal/blockchain"
    "github.com/yourorg/proptoken-oracle/pkg/types"
)

var aggregator *handlers.OracleAggregator

func main() {
    // 1. Load Env
    if err := godotenv.Load(); err != nil {
        log.Println("Warning: .env file not found, using environment variables")
    }
    
    // 2. Init Clients (Mocked/Free Tier)
    satClient := integrations.NewSatelliteClient("MOCK_KEY")
    visClient := integrations.NewVisionClient()
    mcaClient := integrations.NewMCAClient("https://mockapi.com", "MOCK_KEY")
    
    // 3. Init Crypto Signer
    pk := os.Getenv("ORACLE_PRIVATE_KEY")
    if pk == "" {
        pk = "0x0000000000000000000000000000000000000000000000000000000000000001" // Dev fallback
    }
    signer, err := crypto.NewSigner(pk)
    if err != nil {
        log.Fatal("Failed to init signer:", err)
    }
    
    // 3b. Init Blockchain Client
    rpcURL := os.Getenv("BLOCKCHAIN_RPC_URL")
    contractAddr := os.Getenv("REGISTRY_CONTRACT_ADDRESS")
    var chainClient *blockchain.Client
    if rpcURL != "" && contractAddr != "" {
        client, err := blockchain.NewClient(rpcURL, pk, contractAddr)
        if err != nil {
            log.Printf("Warning: Failed to connect to blockchain: %v", err)
        } else {
            chainClient = client
            log.Println("Connected to Blockchain at", rpcURL)
        }
    }
    
    // 4. Init Handlers
    existVerifier := handlers.NewExistenceVerifier(satClient, visClient)
    ownVerifier := handlers.NewOwnershipVerifier(mcaClient)
    
    aggregator = handlers.NewOracleAggregator(existVerifier, ownVerifier, signer, chainClient)
    
    // 5. Router
    r := mux.NewRouter()
    r.HandleFunc("/health", handleHealth).Methods("GET")
    r.HandleFunc("/verify", handleVerify).Methods("POST")
    
    port := os.Getenv("ORACLE_PORT")
    if port == "" {
        port = "8080"
    }
    
    log.Printf("Oracle Node starting on port %s...", port)
    log.Fatal(http.ListenAndServe(":"+port, r))
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("Oracle Node Active"))
}

func handleVerify(w http.ResponseWriter, r *http.Request) {
    var sub types.SubmissionData
    if err := json.NewDecoder(r.Body).Decode(&sub); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    
    result, err := aggregator.VerifySubmission(&sub)
    if err != nil {
        http.Error(w, "Verification failed: "+err.Error(), http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(result)
}
