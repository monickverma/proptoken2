// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package blockchain

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// AssetRegistryAsset is an auto generated low-level Go binding around an user-defined struct.
type AssetRegistryAsset struct {
	Fingerprint       [32]byte
	OracleAttestation [32]byte
	AbmOutputHash     [32]byte
	ExistenceScore    *big.Int
	OwnershipScore    *big.Int
	FraudScore        *big.Int
	RiskScore         *big.Int
	Owner             common.Address
	Timestamp         *big.Int
	Eligible          bool
	Tokenized         bool
	TokenAddress      common.Address
}

// AssetRegistryMetaData contains all meta data concerning the AssetRegistry contract.
var AssetRegistryMetaData = &bind.MetaData{
	ABI: "[{\"type\":\"constructor\",\"inputs\":[{\"name\":\"admin\",\"type\":\"address\",\"internalType\":\"address\"}],\"stateMutability\":\"nonpayable\"},{\"type\":\"function\",\"name\":\"CONSENSUS_ROLE\",\"inputs\":[],\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"DEFAULT_ADMIN_ROLE\",\"inputs\":[],\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"ORACLE_ROLE\",\"inputs\":[],\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"assets\",\"inputs\":[{\"name\":\"\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"outputs\":[{\"name\":\"fingerprint\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"oracleAttestation\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"abmOutputHash\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"existenceScore\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"ownershipScore\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"fraudScore\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"riskScore\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"owner\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"timestamp\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"eligible\",\"type\":\"bool\",\"internalType\":\"bool\"},{\"name\":\"tokenized\",\"type\":\"bool\",\"internalType\":\"bool\"},{\"name\":\"tokenAddress\",\"type\":\"address\",\"internalType\":\"address\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"getAsset\",\"inputs\":[{\"name\":\"fingerprint\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"outputs\":[{\"name\":\"\",\"type\":\"tuple\",\"internalType\":\"structAssetRegistry.Asset\",\"components\":[{\"name\":\"fingerprint\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"oracleAttestation\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"abmOutputHash\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"existenceScore\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"ownershipScore\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"fraudScore\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"riskScore\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"owner\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"timestamp\",\"type\":\"uint256\",\"internalType\":\"uint256\"},{\"name\":\"eligible\",\"type\":\"bool\",\"internalType\":\"bool\"},{\"name\":\"tokenized\",\"type\":\"bool\",\"internalType\":\"bool\"},{\"name\":\"tokenAddress\",\"type\":\"address\",\"internalType\":\"address\"}]}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"getOwnerAssets\",\"inputs\":[{\"name\":\"owner\",\"type\":\"address\",\"internalType\":\"address\"}],\"outputs\":[{\"name\":\"\",\"type\":\"bytes32[]\",\"internalType\":\"bytes32[]\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"getRoleAdmin\",\"inputs\":[{\"name\":\"role\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"getTokenAddress\",\"inputs\":[{\"name\":\"fingerprint\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"outputs\":[{\"name\":\"\",\"type\":\"address\",\"internalType\":\"address\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"grantRole\",\"inputs\":[{\"name\":\"role\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"account\",\"type\":\"address\",\"internalType\":\"address\"}],\"outputs\":[],\"stateMutability\":\"nonpayable\"},{\"type\":\"function\",\"name\":\"hasRole\",\"inputs\":[{\"name\":\"role\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"account\",\"type\":\"address\",\"internalType\":\"address\"}],\"outputs\":[{\"name\":\"\",\"type\":\"bool\",\"internalType\":\"bool\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"isEligible\",\"inputs\":[{\"name\":\"fingerprint\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"outputs\":[{\"name\":\"\",\"type\":\"bool\",\"internalType\":\"bool\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"isTokenized\",\"inputs\":[{\"name\":\"fingerprint\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"outputs\":[{\"name\":\"\",\"type\":\"bool\",\"internalType\":\"bool\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"markAsTokenized\",\"inputs\":[{\"name\":\"fingerprint\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"tokenAddress\",\"type\":\"address\",\"internalType\":\"address\"}],\"outputs\":[],\"stateMutability\":\"nonpayable\"},{\"type\":\"function\",\"name\":\"ownerAssets\",\"inputs\":[{\"name\":\"\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"\",\"type\":\"uint256\",\"internalType\":\"uint256\"}],\"outputs\":[{\"name\":\"\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"registerAsset\",\"inputs\":[{\"name\":\"fingerprint\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"owner\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"oracleAttestation\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"abmOutputHash\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"scores\",\"type\":\"uint256[4]\",\"internalType\":\"uint256[4]\"},{\"name\":\"eligible\",\"type\":\"bool\",\"internalType\":\"bool\"}],\"outputs\":[],\"stateMutability\":\"nonpayable\"},{\"type\":\"function\",\"name\":\"registeredFingerprints\",\"inputs\":[{\"name\":\"\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"outputs\":[{\"name\":\"\",\"type\":\"bool\",\"internalType\":\"bool\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"renounceRole\",\"inputs\":[{\"name\":\"role\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"callerConfirmation\",\"type\":\"address\",\"internalType\":\"address\"}],\"outputs\":[],\"stateMutability\":\"nonpayable\"},{\"type\":\"function\",\"name\":\"revokeRole\",\"inputs\":[{\"name\":\"role\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"account\",\"type\":\"address\",\"internalType\":\"address\"}],\"outputs\":[],\"stateMutability\":\"nonpayable\"},{\"type\":\"function\",\"name\":\"supportsInterface\",\"inputs\":[{\"name\":\"interfaceId\",\"type\":\"bytes4\",\"internalType\":\"bytes4\"}],\"outputs\":[{\"name\":\"\",\"type\":\"bool\",\"internalType\":\"bool\"}],\"stateMutability\":\"view\"},{\"type\":\"function\",\"name\":\"updateAsset\",\"inputs\":[{\"name\":\"fingerprint\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"newOracleAttestation\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"},{\"name\":\"newAbmHash\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}],\"outputs\":[],\"stateMutability\":\"nonpayable\"},{\"type\":\"event\",\"name\":\"AssetRegistered\",\"inputs\":[{\"name\":\"fingerprint\",\"type\":\"bytes32\",\"indexed\":true,\"internalType\":\"bytes32\"},{\"name\":\"owner\",\"type\":\"address\",\"indexed\":true,\"internalType\":\"address\"},{\"name\":\"eligible\",\"type\":\"bool\",\"indexed\":false,\"internalType\":\"bool\"},{\"name\":\"timestamp\",\"type\":\"uint256\",\"indexed\":false,\"internalType\":\"uint256\"}],\"anonymous\":false},{\"type\":\"event\",\"name\":\"AssetTokenized\",\"inputs\":[{\"name\":\"fingerprint\",\"type\":\"bytes32\",\"indexed\":true,\"internalType\":\"bytes32\"},{\"name\":\"tokenAddress\",\"type\":\"address\",\"indexed\":true,\"internalType\":\"address\"},{\"name\":\"timestamp\",\"type\":\"uint256\",\"indexed\":false,\"internalType\":\"uint256\"}],\"anonymous\":false},{\"type\":\"event\",\"name\":\"AssetUpdated\",\"inputs\":[{\"name\":\"fingerprint\",\"type\":\"bytes32\",\"indexed\":true,\"internalType\":\"bytes32\"},{\"name\":\"newOracleAttestation\",\"type\":\"bytes32\",\"indexed\":false,\"internalType\":\"bytes32\"},{\"name\":\"newAbmHash\",\"type\":\"bytes32\",\"indexed\":false,\"internalType\":\"bytes32\"}],\"anonymous\":false},{\"type\":\"event\",\"name\":\"RoleAdminChanged\",\"inputs\":[{\"name\":\"role\",\"type\":\"bytes32\",\"indexed\":true,\"internalType\":\"bytes32\"},{\"name\":\"previousAdminRole\",\"type\":\"bytes32\",\"indexed\":true,\"internalType\":\"bytes32\"},{\"name\":\"newAdminRole\",\"type\":\"bytes32\",\"indexed\":true,\"internalType\":\"bytes32\"}],\"anonymous\":false},{\"type\":\"event\",\"name\":\"RoleGranted\",\"inputs\":[{\"name\":\"role\",\"type\":\"bytes32\",\"indexed\":true,\"internalType\":\"bytes32\"},{\"name\":\"account\",\"type\":\"address\",\"indexed\":true,\"internalType\":\"address\"},{\"name\":\"sender\",\"type\":\"address\",\"indexed\":true,\"internalType\":\"address\"}],\"anonymous\":false},{\"type\":\"event\",\"name\":\"RoleRevoked\",\"inputs\":[{\"name\":\"role\",\"type\":\"bytes32\",\"indexed\":true,\"internalType\":\"bytes32\"},{\"name\":\"account\",\"type\":\"address\",\"indexed\":true,\"internalType\":\"address\"},{\"name\":\"sender\",\"type\":\"address\",\"indexed\":true,\"internalType\":\"address\"}],\"anonymous\":false},{\"type\":\"error\",\"name\":\"AccessControlBadConfirmation\",\"inputs\":[]},{\"type\":\"error\",\"name\":\"AccessControlUnauthorizedAccount\",\"inputs\":[{\"name\":\"account\",\"type\":\"address\",\"internalType\":\"address\"},{\"name\":\"neededRole\",\"type\":\"bytes32\",\"internalType\":\"bytes32\"}]},{\"type\":\"error\",\"name\":\"ReentrancyGuardReentrantCall\",\"inputs\":[]}]",
}

// AssetRegistryABI is the input ABI used to generate the binding from.
// Deprecated: Use AssetRegistryMetaData.ABI instead.
var AssetRegistryABI = AssetRegistryMetaData.ABI

// AssetRegistry is an auto generated Go binding around an Ethereum contract.
type AssetRegistry struct {
	AssetRegistryCaller     // Read-only binding to the contract
	AssetRegistryTransactor // Write-only binding to the contract
	AssetRegistryFilterer   // Log filterer for contract events
}

// AssetRegistryCaller is an auto generated read-only Go binding around an Ethereum contract.
type AssetRegistryCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// AssetRegistryTransactor is an auto generated write-only Go binding around an Ethereum contract.
type AssetRegistryTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// AssetRegistryFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type AssetRegistryFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// AssetRegistrySession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type AssetRegistrySession struct {
	Contract     *AssetRegistry    // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// AssetRegistryCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type AssetRegistryCallerSession struct {
	Contract *AssetRegistryCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts        // Call options to use throughout this session
}

// AssetRegistryTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type AssetRegistryTransactorSession struct {
	Contract     *AssetRegistryTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts        // Transaction auth options to use throughout this session
}

// AssetRegistryRaw is an auto generated low-level Go binding around an Ethereum contract.
type AssetRegistryRaw struct {
	Contract *AssetRegistry // Generic contract binding to access the raw methods on
}

// AssetRegistryCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type AssetRegistryCallerRaw struct {
	Contract *AssetRegistryCaller // Generic read-only contract binding to access the raw methods on
}

// AssetRegistryTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type AssetRegistryTransactorRaw struct {
	Contract *AssetRegistryTransactor // Generic write-only contract binding to access the raw methods on
}

// NewAssetRegistry creates a new instance of AssetRegistry, bound to a specific deployed contract.
func NewAssetRegistry(address common.Address, backend bind.ContractBackend) (*AssetRegistry, error) {
	contract, err := bindAssetRegistry(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &AssetRegistry{AssetRegistryCaller: AssetRegistryCaller{contract: contract}, AssetRegistryTransactor: AssetRegistryTransactor{contract: contract}, AssetRegistryFilterer: AssetRegistryFilterer{contract: contract}}, nil
}

// NewAssetRegistryCaller creates a new read-only instance of AssetRegistry, bound to a specific deployed contract.
func NewAssetRegistryCaller(address common.Address, caller bind.ContractCaller) (*AssetRegistryCaller, error) {
	contract, err := bindAssetRegistry(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &AssetRegistryCaller{contract: contract}, nil
}

// NewAssetRegistryTransactor creates a new write-only instance of AssetRegistry, bound to a specific deployed contract.
func NewAssetRegistryTransactor(address common.Address, transactor bind.ContractTransactor) (*AssetRegistryTransactor, error) {
	contract, err := bindAssetRegistry(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &AssetRegistryTransactor{contract: contract}, nil
}

// NewAssetRegistryFilterer creates a new log filterer instance of AssetRegistry, bound to a specific deployed contract.
func NewAssetRegistryFilterer(address common.Address, filterer bind.ContractFilterer) (*AssetRegistryFilterer, error) {
	contract, err := bindAssetRegistry(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &AssetRegistryFilterer{contract: contract}, nil
}

// bindAssetRegistry binds a generic wrapper to an already deployed contract.
func bindAssetRegistry(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := AssetRegistryMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_AssetRegistry *AssetRegistryRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _AssetRegistry.Contract.AssetRegistryCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_AssetRegistry *AssetRegistryRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _AssetRegistry.Contract.AssetRegistryTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_AssetRegistry *AssetRegistryRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _AssetRegistry.Contract.AssetRegistryTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_AssetRegistry *AssetRegistryCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _AssetRegistry.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_AssetRegistry *AssetRegistryTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _AssetRegistry.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_AssetRegistry *AssetRegistryTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _AssetRegistry.Contract.contract.Transact(opts, method, params...)
}

// CONSENSUSROLE is a free data retrieval call binding the contract method 0xfa2dabad.
//
// Solidity: function CONSENSUS_ROLE() view returns(bytes32)
func (_AssetRegistry *AssetRegistryCaller) CONSENSUSROLE(opts *bind.CallOpts) ([32]byte, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "CONSENSUS_ROLE")

	if err != nil {
		return *new([32]byte), err
	}

	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)

	return out0, err

}

// CONSENSUSROLE is a free data retrieval call binding the contract method 0xfa2dabad.
//
// Solidity: function CONSENSUS_ROLE() view returns(bytes32)
func (_AssetRegistry *AssetRegistrySession) CONSENSUSROLE() ([32]byte, error) {
	return _AssetRegistry.Contract.CONSENSUSROLE(&_AssetRegistry.CallOpts)
}

// CONSENSUSROLE is a free data retrieval call binding the contract method 0xfa2dabad.
//
// Solidity: function CONSENSUS_ROLE() view returns(bytes32)
func (_AssetRegistry *AssetRegistryCallerSession) CONSENSUSROLE() ([32]byte, error) {
	return _AssetRegistry.Contract.CONSENSUSROLE(&_AssetRegistry.CallOpts)
}

// DEFAULTADMINROLE is a free data retrieval call binding the contract method 0xa217fddf.
//
// Solidity: function DEFAULT_ADMIN_ROLE() view returns(bytes32)
func (_AssetRegistry *AssetRegistryCaller) DEFAULTADMINROLE(opts *bind.CallOpts) ([32]byte, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "DEFAULT_ADMIN_ROLE")

	if err != nil {
		return *new([32]byte), err
	}

	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)

	return out0, err

}

// DEFAULTADMINROLE is a free data retrieval call binding the contract method 0xa217fddf.
//
// Solidity: function DEFAULT_ADMIN_ROLE() view returns(bytes32)
func (_AssetRegistry *AssetRegistrySession) DEFAULTADMINROLE() ([32]byte, error) {
	return _AssetRegistry.Contract.DEFAULTADMINROLE(&_AssetRegistry.CallOpts)
}

// DEFAULTADMINROLE is a free data retrieval call binding the contract method 0xa217fddf.
//
// Solidity: function DEFAULT_ADMIN_ROLE() view returns(bytes32)
func (_AssetRegistry *AssetRegistryCallerSession) DEFAULTADMINROLE() ([32]byte, error) {
	return _AssetRegistry.Contract.DEFAULTADMINROLE(&_AssetRegistry.CallOpts)
}

// ORACLEROLE is a free data retrieval call binding the contract method 0x07e2cea5.
//
// Solidity: function ORACLE_ROLE() view returns(bytes32)
func (_AssetRegistry *AssetRegistryCaller) ORACLEROLE(opts *bind.CallOpts) ([32]byte, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "ORACLE_ROLE")

	if err != nil {
		return *new([32]byte), err
	}

	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)

	return out0, err

}

// ORACLEROLE is a free data retrieval call binding the contract method 0x07e2cea5.
//
// Solidity: function ORACLE_ROLE() view returns(bytes32)
func (_AssetRegistry *AssetRegistrySession) ORACLEROLE() ([32]byte, error) {
	return _AssetRegistry.Contract.ORACLEROLE(&_AssetRegistry.CallOpts)
}

// ORACLEROLE is a free data retrieval call binding the contract method 0x07e2cea5.
//
// Solidity: function ORACLE_ROLE() view returns(bytes32)
func (_AssetRegistry *AssetRegistryCallerSession) ORACLEROLE() ([32]byte, error) {
	return _AssetRegistry.Contract.ORACLEROLE(&_AssetRegistry.CallOpts)
}

// Assets is a free data retrieval call binding the contract method 0x9fda5b66.
//
// Solidity: function assets(bytes32 ) view returns(bytes32 fingerprint, bytes32 oracleAttestation, bytes32 abmOutputHash, uint256 existenceScore, uint256 ownershipScore, uint256 fraudScore, uint256 riskScore, address owner, uint256 timestamp, bool eligible, bool tokenized, address tokenAddress)
func (_AssetRegistry *AssetRegistryCaller) Assets(opts *bind.CallOpts, arg0 [32]byte) (struct {
	Fingerprint       [32]byte
	OracleAttestation [32]byte
	AbmOutputHash     [32]byte
	ExistenceScore    *big.Int
	OwnershipScore    *big.Int
	FraudScore        *big.Int
	RiskScore         *big.Int
	Owner             common.Address
	Timestamp         *big.Int
	Eligible          bool
	Tokenized         bool
	TokenAddress      common.Address
}, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "assets", arg0)

	outstruct := new(struct {
		Fingerprint       [32]byte
		OracleAttestation [32]byte
		AbmOutputHash     [32]byte
		ExistenceScore    *big.Int
		OwnershipScore    *big.Int
		FraudScore        *big.Int
		RiskScore         *big.Int
		Owner             common.Address
		Timestamp         *big.Int
		Eligible          bool
		Tokenized         bool
		TokenAddress      common.Address
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.Fingerprint = *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)
	outstruct.OracleAttestation = *abi.ConvertType(out[1], new([32]byte)).(*[32]byte)
	outstruct.AbmOutputHash = *abi.ConvertType(out[2], new([32]byte)).(*[32]byte)
	outstruct.ExistenceScore = *abi.ConvertType(out[3], new(*big.Int)).(**big.Int)
	outstruct.OwnershipScore = *abi.ConvertType(out[4], new(*big.Int)).(**big.Int)
	outstruct.FraudScore = *abi.ConvertType(out[5], new(*big.Int)).(**big.Int)
	outstruct.RiskScore = *abi.ConvertType(out[6], new(*big.Int)).(**big.Int)
	outstruct.Owner = *abi.ConvertType(out[7], new(common.Address)).(*common.Address)
	outstruct.Timestamp = *abi.ConvertType(out[8], new(*big.Int)).(**big.Int)
	outstruct.Eligible = *abi.ConvertType(out[9], new(bool)).(*bool)
	outstruct.Tokenized = *abi.ConvertType(out[10], new(bool)).(*bool)
	outstruct.TokenAddress = *abi.ConvertType(out[11], new(common.Address)).(*common.Address)

	return *outstruct, err

}

// Assets is a free data retrieval call binding the contract method 0x9fda5b66.
//
// Solidity: function assets(bytes32 ) view returns(bytes32 fingerprint, bytes32 oracleAttestation, bytes32 abmOutputHash, uint256 existenceScore, uint256 ownershipScore, uint256 fraudScore, uint256 riskScore, address owner, uint256 timestamp, bool eligible, bool tokenized, address tokenAddress)
func (_AssetRegistry *AssetRegistrySession) Assets(arg0 [32]byte) (struct {
	Fingerprint       [32]byte
	OracleAttestation [32]byte
	AbmOutputHash     [32]byte
	ExistenceScore    *big.Int
	OwnershipScore    *big.Int
	FraudScore        *big.Int
	RiskScore         *big.Int
	Owner             common.Address
	Timestamp         *big.Int
	Eligible          bool
	Tokenized         bool
	TokenAddress      common.Address
}, error) {
	return _AssetRegistry.Contract.Assets(&_AssetRegistry.CallOpts, arg0)
}

// Assets is a free data retrieval call binding the contract method 0x9fda5b66.
//
// Solidity: function assets(bytes32 ) view returns(bytes32 fingerprint, bytes32 oracleAttestation, bytes32 abmOutputHash, uint256 existenceScore, uint256 ownershipScore, uint256 fraudScore, uint256 riskScore, address owner, uint256 timestamp, bool eligible, bool tokenized, address tokenAddress)
func (_AssetRegistry *AssetRegistryCallerSession) Assets(arg0 [32]byte) (struct {
	Fingerprint       [32]byte
	OracleAttestation [32]byte
	AbmOutputHash     [32]byte
	ExistenceScore    *big.Int
	OwnershipScore    *big.Int
	FraudScore        *big.Int
	RiskScore         *big.Int
	Owner             common.Address
	Timestamp         *big.Int
	Eligible          bool
	Tokenized         bool
	TokenAddress      common.Address
}, error) {
	return _AssetRegistry.Contract.Assets(&_AssetRegistry.CallOpts, arg0)
}

// GetAsset is a free data retrieval call binding the contract method 0x2cc3ce80.
//
// Solidity: function getAsset(bytes32 fingerprint) view returns((bytes32,bytes32,bytes32,uint256,uint256,uint256,uint256,address,uint256,bool,bool,address))
func (_AssetRegistry *AssetRegistryCaller) GetAsset(opts *bind.CallOpts, fingerprint [32]byte) (AssetRegistryAsset, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "getAsset", fingerprint)

	if err != nil {
		return *new(AssetRegistryAsset), err
	}

	out0 := *abi.ConvertType(out[0], new(AssetRegistryAsset)).(*AssetRegistryAsset)

	return out0, err

}

// GetAsset is a free data retrieval call binding the contract method 0x2cc3ce80.
//
// Solidity: function getAsset(bytes32 fingerprint) view returns((bytes32,bytes32,bytes32,uint256,uint256,uint256,uint256,address,uint256,bool,bool,address))
func (_AssetRegistry *AssetRegistrySession) GetAsset(fingerprint [32]byte) (AssetRegistryAsset, error) {
	return _AssetRegistry.Contract.GetAsset(&_AssetRegistry.CallOpts, fingerprint)
}

// GetAsset is a free data retrieval call binding the contract method 0x2cc3ce80.
//
// Solidity: function getAsset(bytes32 fingerprint) view returns((bytes32,bytes32,bytes32,uint256,uint256,uint256,uint256,address,uint256,bool,bool,address))
func (_AssetRegistry *AssetRegistryCallerSession) GetAsset(fingerprint [32]byte) (AssetRegistryAsset, error) {
	return _AssetRegistry.Contract.GetAsset(&_AssetRegistry.CallOpts, fingerprint)
}

// GetOwnerAssets is a free data retrieval call binding the contract method 0x2d38f89b.
//
// Solidity: function getOwnerAssets(address owner) view returns(bytes32[])
func (_AssetRegistry *AssetRegistryCaller) GetOwnerAssets(opts *bind.CallOpts, owner common.Address) ([][32]byte, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "getOwnerAssets", owner)

	if err != nil {
		return *new([][32]byte), err
	}

	out0 := *abi.ConvertType(out[0], new([][32]byte)).(*[][32]byte)

	return out0, err

}

// GetOwnerAssets is a free data retrieval call binding the contract method 0x2d38f89b.
//
// Solidity: function getOwnerAssets(address owner) view returns(bytes32[])
func (_AssetRegistry *AssetRegistrySession) GetOwnerAssets(owner common.Address) ([][32]byte, error) {
	return _AssetRegistry.Contract.GetOwnerAssets(&_AssetRegistry.CallOpts, owner)
}

// GetOwnerAssets is a free data retrieval call binding the contract method 0x2d38f89b.
//
// Solidity: function getOwnerAssets(address owner) view returns(bytes32[])
func (_AssetRegistry *AssetRegistryCallerSession) GetOwnerAssets(owner common.Address) ([][32]byte, error) {
	return _AssetRegistry.Contract.GetOwnerAssets(&_AssetRegistry.CallOpts, owner)
}

// GetRoleAdmin is a free data retrieval call binding the contract method 0x248a9ca3.
//
// Solidity: function getRoleAdmin(bytes32 role) view returns(bytes32)
func (_AssetRegistry *AssetRegistryCaller) GetRoleAdmin(opts *bind.CallOpts, role [32]byte) ([32]byte, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "getRoleAdmin", role)

	if err != nil {
		return *new([32]byte), err
	}

	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)

	return out0, err

}

// GetRoleAdmin is a free data retrieval call binding the contract method 0x248a9ca3.
//
// Solidity: function getRoleAdmin(bytes32 role) view returns(bytes32)
func (_AssetRegistry *AssetRegistrySession) GetRoleAdmin(role [32]byte) ([32]byte, error) {
	return _AssetRegistry.Contract.GetRoleAdmin(&_AssetRegistry.CallOpts, role)
}

// GetRoleAdmin is a free data retrieval call binding the contract method 0x248a9ca3.
//
// Solidity: function getRoleAdmin(bytes32 role) view returns(bytes32)
func (_AssetRegistry *AssetRegistryCallerSession) GetRoleAdmin(role [32]byte) ([32]byte, error) {
	return _AssetRegistry.Contract.GetRoleAdmin(&_AssetRegistry.CallOpts, role)
}

// GetTokenAddress is a free data retrieval call binding the contract method 0xb12e4410.
//
// Solidity: function getTokenAddress(bytes32 fingerprint) view returns(address)
func (_AssetRegistry *AssetRegistryCaller) GetTokenAddress(opts *bind.CallOpts, fingerprint [32]byte) (common.Address, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "getTokenAddress", fingerprint)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// GetTokenAddress is a free data retrieval call binding the contract method 0xb12e4410.
//
// Solidity: function getTokenAddress(bytes32 fingerprint) view returns(address)
func (_AssetRegistry *AssetRegistrySession) GetTokenAddress(fingerprint [32]byte) (common.Address, error) {
	return _AssetRegistry.Contract.GetTokenAddress(&_AssetRegistry.CallOpts, fingerprint)
}

// GetTokenAddress is a free data retrieval call binding the contract method 0xb12e4410.
//
// Solidity: function getTokenAddress(bytes32 fingerprint) view returns(address)
func (_AssetRegistry *AssetRegistryCallerSession) GetTokenAddress(fingerprint [32]byte) (common.Address, error) {
	return _AssetRegistry.Contract.GetTokenAddress(&_AssetRegistry.CallOpts, fingerprint)
}

// HasRole is a free data retrieval call binding the contract method 0x91d14854.
//
// Solidity: function hasRole(bytes32 role, address account) view returns(bool)
func (_AssetRegistry *AssetRegistryCaller) HasRole(opts *bind.CallOpts, role [32]byte, account common.Address) (bool, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "hasRole", role, account)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// HasRole is a free data retrieval call binding the contract method 0x91d14854.
//
// Solidity: function hasRole(bytes32 role, address account) view returns(bool)
func (_AssetRegistry *AssetRegistrySession) HasRole(role [32]byte, account common.Address) (bool, error) {
	return _AssetRegistry.Contract.HasRole(&_AssetRegistry.CallOpts, role, account)
}

// HasRole is a free data retrieval call binding the contract method 0x91d14854.
//
// Solidity: function hasRole(bytes32 role, address account) view returns(bool)
func (_AssetRegistry *AssetRegistryCallerSession) HasRole(role [32]byte, account common.Address) (bool, error) {
	return _AssetRegistry.Contract.HasRole(&_AssetRegistry.CallOpts, role, account)
}

// IsEligible is a free data retrieval call binding the contract method 0x3c74e0d9.
//
// Solidity: function isEligible(bytes32 fingerprint) view returns(bool)
func (_AssetRegistry *AssetRegistryCaller) IsEligible(opts *bind.CallOpts, fingerprint [32]byte) (bool, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "isEligible", fingerprint)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsEligible is a free data retrieval call binding the contract method 0x3c74e0d9.
//
// Solidity: function isEligible(bytes32 fingerprint) view returns(bool)
func (_AssetRegistry *AssetRegistrySession) IsEligible(fingerprint [32]byte) (bool, error) {
	return _AssetRegistry.Contract.IsEligible(&_AssetRegistry.CallOpts, fingerprint)
}

// IsEligible is a free data retrieval call binding the contract method 0x3c74e0d9.
//
// Solidity: function isEligible(bytes32 fingerprint) view returns(bool)
func (_AssetRegistry *AssetRegistryCallerSession) IsEligible(fingerprint [32]byte) (bool, error) {
	return _AssetRegistry.Contract.IsEligible(&_AssetRegistry.CallOpts, fingerprint)
}

// IsTokenized is a free data retrieval call binding the contract method 0x610e4575.
//
// Solidity: function isTokenized(bytes32 fingerprint) view returns(bool)
func (_AssetRegistry *AssetRegistryCaller) IsTokenized(opts *bind.CallOpts, fingerprint [32]byte) (bool, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "isTokenized", fingerprint)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsTokenized is a free data retrieval call binding the contract method 0x610e4575.
//
// Solidity: function isTokenized(bytes32 fingerprint) view returns(bool)
func (_AssetRegistry *AssetRegistrySession) IsTokenized(fingerprint [32]byte) (bool, error) {
	return _AssetRegistry.Contract.IsTokenized(&_AssetRegistry.CallOpts, fingerprint)
}

// IsTokenized is a free data retrieval call binding the contract method 0x610e4575.
//
// Solidity: function isTokenized(bytes32 fingerprint) view returns(bool)
func (_AssetRegistry *AssetRegistryCallerSession) IsTokenized(fingerprint [32]byte) (bool, error) {
	return _AssetRegistry.Contract.IsTokenized(&_AssetRegistry.CallOpts, fingerprint)
}

// OwnerAssets is a free data retrieval call binding the contract method 0x455bd951.
//
// Solidity: function ownerAssets(address , uint256 ) view returns(bytes32)
func (_AssetRegistry *AssetRegistryCaller) OwnerAssets(opts *bind.CallOpts, arg0 common.Address, arg1 *big.Int) ([32]byte, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "ownerAssets", arg0, arg1)

	if err != nil {
		return *new([32]byte), err
	}

	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)

	return out0, err

}

// OwnerAssets is a free data retrieval call binding the contract method 0x455bd951.
//
// Solidity: function ownerAssets(address , uint256 ) view returns(bytes32)
func (_AssetRegistry *AssetRegistrySession) OwnerAssets(arg0 common.Address, arg1 *big.Int) ([32]byte, error) {
	return _AssetRegistry.Contract.OwnerAssets(&_AssetRegistry.CallOpts, arg0, arg1)
}

// OwnerAssets is a free data retrieval call binding the contract method 0x455bd951.
//
// Solidity: function ownerAssets(address , uint256 ) view returns(bytes32)
func (_AssetRegistry *AssetRegistryCallerSession) OwnerAssets(arg0 common.Address, arg1 *big.Int) ([32]byte, error) {
	return _AssetRegistry.Contract.OwnerAssets(&_AssetRegistry.CallOpts, arg0, arg1)
}

// RegisteredFingerprints is a free data retrieval call binding the contract method 0x98ca362d.
//
// Solidity: function registeredFingerprints(bytes32 ) view returns(bool)
func (_AssetRegistry *AssetRegistryCaller) RegisteredFingerprints(opts *bind.CallOpts, arg0 [32]byte) (bool, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "registeredFingerprints", arg0)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// RegisteredFingerprints is a free data retrieval call binding the contract method 0x98ca362d.
//
// Solidity: function registeredFingerprints(bytes32 ) view returns(bool)
func (_AssetRegistry *AssetRegistrySession) RegisteredFingerprints(arg0 [32]byte) (bool, error) {
	return _AssetRegistry.Contract.RegisteredFingerprints(&_AssetRegistry.CallOpts, arg0)
}

// RegisteredFingerprints is a free data retrieval call binding the contract method 0x98ca362d.
//
// Solidity: function registeredFingerprints(bytes32 ) view returns(bool)
func (_AssetRegistry *AssetRegistryCallerSession) RegisteredFingerprints(arg0 [32]byte) (bool, error) {
	return _AssetRegistry.Contract.RegisteredFingerprints(&_AssetRegistry.CallOpts, arg0)
}

// SupportsInterface is a free data retrieval call binding the contract method 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (_AssetRegistry *AssetRegistryCaller) SupportsInterface(opts *bind.CallOpts, interfaceId [4]byte) (bool, error) {
	var out []interface{}
	err := _AssetRegistry.contract.Call(opts, &out, "supportsInterface", interfaceId)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// SupportsInterface is a free data retrieval call binding the contract method 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (_AssetRegistry *AssetRegistrySession) SupportsInterface(interfaceId [4]byte) (bool, error) {
	return _AssetRegistry.Contract.SupportsInterface(&_AssetRegistry.CallOpts, interfaceId)
}

// SupportsInterface is a free data retrieval call binding the contract method 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (_AssetRegistry *AssetRegistryCallerSession) SupportsInterface(interfaceId [4]byte) (bool, error) {
	return _AssetRegistry.Contract.SupportsInterface(&_AssetRegistry.CallOpts, interfaceId)
}

// GrantRole is a paid mutator transaction binding the contract method 0x2f2ff15d.
//
// Solidity: function grantRole(bytes32 role, address account) returns()
func (_AssetRegistry *AssetRegistryTransactor) GrantRole(opts *bind.TransactOpts, role [32]byte, account common.Address) (*types.Transaction, error) {
	return _AssetRegistry.contract.Transact(opts, "grantRole", role, account)
}

// GrantRole is a paid mutator transaction binding the contract method 0x2f2ff15d.
//
// Solidity: function grantRole(bytes32 role, address account) returns()
func (_AssetRegistry *AssetRegistrySession) GrantRole(role [32]byte, account common.Address) (*types.Transaction, error) {
	return _AssetRegistry.Contract.GrantRole(&_AssetRegistry.TransactOpts, role, account)
}

// GrantRole is a paid mutator transaction binding the contract method 0x2f2ff15d.
//
// Solidity: function grantRole(bytes32 role, address account) returns()
func (_AssetRegistry *AssetRegistryTransactorSession) GrantRole(role [32]byte, account common.Address) (*types.Transaction, error) {
	return _AssetRegistry.Contract.GrantRole(&_AssetRegistry.TransactOpts, role, account)
}

// MarkAsTokenized is a paid mutator transaction binding the contract method 0x7813f3f2.
//
// Solidity: function markAsTokenized(bytes32 fingerprint, address tokenAddress) returns()
func (_AssetRegistry *AssetRegistryTransactor) MarkAsTokenized(opts *bind.TransactOpts, fingerprint [32]byte, tokenAddress common.Address) (*types.Transaction, error) {
	return _AssetRegistry.contract.Transact(opts, "markAsTokenized", fingerprint, tokenAddress)
}

// MarkAsTokenized is a paid mutator transaction binding the contract method 0x7813f3f2.
//
// Solidity: function markAsTokenized(bytes32 fingerprint, address tokenAddress) returns()
func (_AssetRegistry *AssetRegistrySession) MarkAsTokenized(fingerprint [32]byte, tokenAddress common.Address) (*types.Transaction, error) {
	return _AssetRegistry.Contract.MarkAsTokenized(&_AssetRegistry.TransactOpts, fingerprint, tokenAddress)
}

// MarkAsTokenized is a paid mutator transaction binding the contract method 0x7813f3f2.
//
// Solidity: function markAsTokenized(bytes32 fingerprint, address tokenAddress) returns()
func (_AssetRegistry *AssetRegistryTransactorSession) MarkAsTokenized(fingerprint [32]byte, tokenAddress common.Address) (*types.Transaction, error) {
	return _AssetRegistry.Contract.MarkAsTokenized(&_AssetRegistry.TransactOpts, fingerprint, tokenAddress)
}

// RegisterAsset is a paid mutator transaction binding the contract method 0x71aa80fd.
//
// Solidity: function registerAsset(bytes32 fingerprint, address owner, bytes32 oracleAttestation, bytes32 abmOutputHash, uint256[4] scores, bool eligible) returns()
func (_AssetRegistry *AssetRegistryTransactor) RegisterAsset(opts *bind.TransactOpts, fingerprint [32]byte, owner common.Address, oracleAttestation [32]byte, abmOutputHash [32]byte, scores [4]*big.Int, eligible bool) (*types.Transaction, error) {
	return _AssetRegistry.contract.Transact(opts, "registerAsset", fingerprint, owner, oracleAttestation, abmOutputHash, scores, eligible)
}

// RegisterAsset is a paid mutator transaction binding the contract method 0x71aa80fd.
//
// Solidity: function registerAsset(bytes32 fingerprint, address owner, bytes32 oracleAttestation, bytes32 abmOutputHash, uint256[4] scores, bool eligible) returns()
func (_AssetRegistry *AssetRegistrySession) RegisterAsset(fingerprint [32]byte, owner common.Address, oracleAttestation [32]byte, abmOutputHash [32]byte, scores [4]*big.Int, eligible bool) (*types.Transaction, error) {
	return _AssetRegistry.Contract.RegisterAsset(&_AssetRegistry.TransactOpts, fingerprint, owner, oracleAttestation, abmOutputHash, scores, eligible)
}

// RegisterAsset is a paid mutator transaction binding the contract method 0x71aa80fd.
//
// Solidity: function registerAsset(bytes32 fingerprint, address owner, bytes32 oracleAttestation, bytes32 abmOutputHash, uint256[4] scores, bool eligible) returns()
func (_AssetRegistry *AssetRegistryTransactorSession) RegisterAsset(fingerprint [32]byte, owner common.Address, oracleAttestation [32]byte, abmOutputHash [32]byte, scores [4]*big.Int, eligible bool) (*types.Transaction, error) {
	return _AssetRegistry.Contract.RegisterAsset(&_AssetRegistry.TransactOpts, fingerprint, owner, oracleAttestation, abmOutputHash, scores, eligible)
}

// RenounceRole is a paid mutator transaction binding the contract method 0x36568abe.
//
// Solidity: function renounceRole(bytes32 role, address callerConfirmation) returns()
func (_AssetRegistry *AssetRegistryTransactor) RenounceRole(opts *bind.TransactOpts, role [32]byte, callerConfirmation common.Address) (*types.Transaction, error) {
	return _AssetRegistry.contract.Transact(opts, "renounceRole", role, callerConfirmation)
}

// RenounceRole is a paid mutator transaction binding the contract method 0x36568abe.
//
// Solidity: function renounceRole(bytes32 role, address callerConfirmation) returns()
func (_AssetRegistry *AssetRegistrySession) RenounceRole(role [32]byte, callerConfirmation common.Address) (*types.Transaction, error) {
	return _AssetRegistry.Contract.RenounceRole(&_AssetRegistry.TransactOpts, role, callerConfirmation)
}

// RenounceRole is a paid mutator transaction binding the contract method 0x36568abe.
//
// Solidity: function renounceRole(bytes32 role, address callerConfirmation) returns()
func (_AssetRegistry *AssetRegistryTransactorSession) RenounceRole(role [32]byte, callerConfirmation common.Address) (*types.Transaction, error) {
	return _AssetRegistry.Contract.RenounceRole(&_AssetRegistry.TransactOpts, role, callerConfirmation)
}

// RevokeRole is a paid mutator transaction binding the contract method 0xd547741f.
//
// Solidity: function revokeRole(bytes32 role, address account) returns()
func (_AssetRegistry *AssetRegistryTransactor) RevokeRole(opts *bind.TransactOpts, role [32]byte, account common.Address) (*types.Transaction, error) {
	return _AssetRegistry.contract.Transact(opts, "revokeRole", role, account)
}

// RevokeRole is a paid mutator transaction binding the contract method 0xd547741f.
//
// Solidity: function revokeRole(bytes32 role, address account) returns()
func (_AssetRegistry *AssetRegistrySession) RevokeRole(role [32]byte, account common.Address) (*types.Transaction, error) {
	return _AssetRegistry.Contract.RevokeRole(&_AssetRegistry.TransactOpts, role, account)
}

// RevokeRole is a paid mutator transaction binding the contract method 0xd547741f.
//
// Solidity: function revokeRole(bytes32 role, address account) returns()
func (_AssetRegistry *AssetRegistryTransactorSession) RevokeRole(role [32]byte, account common.Address) (*types.Transaction, error) {
	return _AssetRegistry.Contract.RevokeRole(&_AssetRegistry.TransactOpts, role, account)
}

// UpdateAsset is a paid mutator transaction binding the contract method 0x320cc597.
//
// Solidity: function updateAsset(bytes32 fingerprint, bytes32 newOracleAttestation, bytes32 newAbmHash) returns()
func (_AssetRegistry *AssetRegistryTransactor) UpdateAsset(opts *bind.TransactOpts, fingerprint [32]byte, newOracleAttestation [32]byte, newAbmHash [32]byte) (*types.Transaction, error) {
	return _AssetRegistry.contract.Transact(opts, "updateAsset", fingerprint, newOracleAttestation, newAbmHash)
}

// UpdateAsset is a paid mutator transaction binding the contract method 0x320cc597.
//
// Solidity: function updateAsset(bytes32 fingerprint, bytes32 newOracleAttestation, bytes32 newAbmHash) returns()
func (_AssetRegistry *AssetRegistrySession) UpdateAsset(fingerprint [32]byte, newOracleAttestation [32]byte, newAbmHash [32]byte) (*types.Transaction, error) {
	return _AssetRegistry.Contract.UpdateAsset(&_AssetRegistry.TransactOpts, fingerprint, newOracleAttestation, newAbmHash)
}

// UpdateAsset is a paid mutator transaction binding the contract method 0x320cc597.
//
// Solidity: function updateAsset(bytes32 fingerprint, bytes32 newOracleAttestation, bytes32 newAbmHash) returns()
func (_AssetRegistry *AssetRegistryTransactorSession) UpdateAsset(fingerprint [32]byte, newOracleAttestation [32]byte, newAbmHash [32]byte) (*types.Transaction, error) {
	return _AssetRegistry.Contract.UpdateAsset(&_AssetRegistry.TransactOpts, fingerprint, newOracleAttestation, newAbmHash)
}

// AssetRegistryAssetRegisteredIterator is returned from FilterAssetRegistered and is used to iterate over the raw logs and unpacked data for AssetRegistered events raised by the AssetRegistry contract.
type AssetRegistryAssetRegisteredIterator struct {
	Event *AssetRegistryAssetRegistered // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *AssetRegistryAssetRegisteredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(AssetRegistryAssetRegistered)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(AssetRegistryAssetRegistered)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *AssetRegistryAssetRegisteredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *AssetRegistryAssetRegisteredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// AssetRegistryAssetRegistered represents a AssetRegistered event raised by the AssetRegistry contract.
type AssetRegistryAssetRegistered struct {
	Fingerprint [32]byte
	Owner       common.Address
	Eligible    bool
	Timestamp   *big.Int
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterAssetRegistered is a free log retrieval operation binding the contract event 0xbe76624284ab25f91f68e1254899d8730ad25a4fdcab3069a1d02bc4513638ff.
//
// Solidity: event AssetRegistered(bytes32 indexed fingerprint, address indexed owner, bool eligible, uint256 timestamp)
func (_AssetRegistry *AssetRegistryFilterer) FilterAssetRegistered(opts *bind.FilterOpts, fingerprint [][32]byte, owner []common.Address) (*AssetRegistryAssetRegisteredIterator, error) {

	var fingerprintRule []interface{}
	for _, fingerprintItem := range fingerprint {
		fingerprintRule = append(fingerprintRule, fingerprintItem)
	}
	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}

	logs, sub, err := _AssetRegistry.contract.FilterLogs(opts, "AssetRegistered", fingerprintRule, ownerRule)
	if err != nil {
		return nil, err
	}
	return &AssetRegistryAssetRegisteredIterator{contract: _AssetRegistry.contract, event: "AssetRegistered", logs: logs, sub: sub}, nil
}

// WatchAssetRegistered is a free log subscription operation binding the contract event 0xbe76624284ab25f91f68e1254899d8730ad25a4fdcab3069a1d02bc4513638ff.
//
// Solidity: event AssetRegistered(bytes32 indexed fingerprint, address indexed owner, bool eligible, uint256 timestamp)
func (_AssetRegistry *AssetRegistryFilterer) WatchAssetRegistered(opts *bind.WatchOpts, sink chan<- *AssetRegistryAssetRegistered, fingerprint [][32]byte, owner []common.Address) (event.Subscription, error) {

	var fingerprintRule []interface{}
	for _, fingerprintItem := range fingerprint {
		fingerprintRule = append(fingerprintRule, fingerprintItem)
	}
	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}

	logs, sub, err := _AssetRegistry.contract.WatchLogs(opts, "AssetRegistered", fingerprintRule, ownerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(AssetRegistryAssetRegistered)
				if err := _AssetRegistry.contract.UnpackLog(event, "AssetRegistered", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseAssetRegistered is a log parse operation binding the contract event 0xbe76624284ab25f91f68e1254899d8730ad25a4fdcab3069a1d02bc4513638ff.
//
// Solidity: event AssetRegistered(bytes32 indexed fingerprint, address indexed owner, bool eligible, uint256 timestamp)
func (_AssetRegistry *AssetRegistryFilterer) ParseAssetRegistered(log types.Log) (*AssetRegistryAssetRegistered, error) {
	event := new(AssetRegistryAssetRegistered)
	if err := _AssetRegistry.contract.UnpackLog(event, "AssetRegistered", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// AssetRegistryAssetTokenizedIterator is returned from FilterAssetTokenized and is used to iterate over the raw logs and unpacked data for AssetTokenized events raised by the AssetRegistry contract.
type AssetRegistryAssetTokenizedIterator struct {
	Event *AssetRegistryAssetTokenized // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *AssetRegistryAssetTokenizedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(AssetRegistryAssetTokenized)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(AssetRegistryAssetTokenized)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *AssetRegistryAssetTokenizedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *AssetRegistryAssetTokenizedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// AssetRegistryAssetTokenized represents a AssetTokenized event raised by the AssetRegistry contract.
type AssetRegistryAssetTokenized struct {
	Fingerprint  [32]byte
	TokenAddress common.Address
	Timestamp    *big.Int
	Raw          types.Log // Blockchain specific contextual infos
}

// FilterAssetTokenized is a free log retrieval operation binding the contract event 0x02d603cbbfc6aa2a956790965e2d8cd960ef8a40a9a6f5fe59a7ec403d0712e4.
//
// Solidity: event AssetTokenized(bytes32 indexed fingerprint, address indexed tokenAddress, uint256 timestamp)
func (_AssetRegistry *AssetRegistryFilterer) FilterAssetTokenized(opts *bind.FilterOpts, fingerprint [][32]byte, tokenAddress []common.Address) (*AssetRegistryAssetTokenizedIterator, error) {

	var fingerprintRule []interface{}
	for _, fingerprintItem := range fingerprint {
		fingerprintRule = append(fingerprintRule, fingerprintItem)
	}
	var tokenAddressRule []interface{}
	for _, tokenAddressItem := range tokenAddress {
		tokenAddressRule = append(tokenAddressRule, tokenAddressItem)
	}

	logs, sub, err := _AssetRegistry.contract.FilterLogs(opts, "AssetTokenized", fingerprintRule, tokenAddressRule)
	if err != nil {
		return nil, err
	}
	return &AssetRegistryAssetTokenizedIterator{contract: _AssetRegistry.contract, event: "AssetTokenized", logs: logs, sub: sub}, nil
}

// WatchAssetTokenized is a free log subscription operation binding the contract event 0x02d603cbbfc6aa2a956790965e2d8cd960ef8a40a9a6f5fe59a7ec403d0712e4.
//
// Solidity: event AssetTokenized(bytes32 indexed fingerprint, address indexed tokenAddress, uint256 timestamp)
func (_AssetRegistry *AssetRegistryFilterer) WatchAssetTokenized(opts *bind.WatchOpts, sink chan<- *AssetRegistryAssetTokenized, fingerprint [][32]byte, tokenAddress []common.Address) (event.Subscription, error) {

	var fingerprintRule []interface{}
	for _, fingerprintItem := range fingerprint {
		fingerprintRule = append(fingerprintRule, fingerprintItem)
	}
	var tokenAddressRule []interface{}
	for _, tokenAddressItem := range tokenAddress {
		tokenAddressRule = append(tokenAddressRule, tokenAddressItem)
	}

	logs, sub, err := _AssetRegistry.contract.WatchLogs(opts, "AssetTokenized", fingerprintRule, tokenAddressRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(AssetRegistryAssetTokenized)
				if err := _AssetRegistry.contract.UnpackLog(event, "AssetTokenized", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseAssetTokenized is a log parse operation binding the contract event 0x02d603cbbfc6aa2a956790965e2d8cd960ef8a40a9a6f5fe59a7ec403d0712e4.
//
// Solidity: event AssetTokenized(bytes32 indexed fingerprint, address indexed tokenAddress, uint256 timestamp)
func (_AssetRegistry *AssetRegistryFilterer) ParseAssetTokenized(log types.Log) (*AssetRegistryAssetTokenized, error) {
	event := new(AssetRegistryAssetTokenized)
	if err := _AssetRegistry.contract.UnpackLog(event, "AssetTokenized", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// AssetRegistryAssetUpdatedIterator is returned from FilterAssetUpdated and is used to iterate over the raw logs and unpacked data for AssetUpdated events raised by the AssetRegistry contract.
type AssetRegistryAssetUpdatedIterator struct {
	Event *AssetRegistryAssetUpdated // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *AssetRegistryAssetUpdatedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(AssetRegistryAssetUpdated)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(AssetRegistryAssetUpdated)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *AssetRegistryAssetUpdatedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *AssetRegistryAssetUpdatedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// AssetRegistryAssetUpdated represents a AssetUpdated event raised by the AssetRegistry contract.
type AssetRegistryAssetUpdated struct {
	Fingerprint          [32]byte
	NewOracleAttestation [32]byte
	NewAbmHash           [32]byte
	Raw                  types.Log // Blockchain specific contextual infos
}

// FilterAssetUpdated is a free log retrieval operation binding the contract event 0x6ca74a30ba77ecd060c87cd569ca54a67fcd0a5bf5ce59a83faa3a06663ede8e.
//
// Solidity: event AssetUpdated(bytes32 indexed fingerprint, bytes32 newOracleAttestation, bytes32 newAbmHash)
func (_AssetRegistry *AssetRegistryFilterer) FilterAssetUpdated(opts *bind.FilterOpts, fingerprint [][32]byte) (*AssetRegistryAssetUpdatedIterator, error) {

	var fingerprintRule []interface{}
	for _, fingerprintItem := range fingerprint {
		fingerprintRule = append(fingerprintRule, fingerprintItem)
	}

	logs, sub, err := _AssetRegistry.contract.FilterLogs(opts, "AssetUpdated", fingerprintRule)
	if err != nil {
		return nil, err
	}
	return &AssetRegistryAssetUpdatedIterator{contract: _AssetRegistry.contract, event: "AssetUpdated", logs: logs, sub: sub}, nil
}

// WatchAssetUpdated is a free log subscription operation binding the contract event 0x6ca74a30ba77ecd060c87cd569ca54a67fcd0a5bf5ce59a83faa3a06663ede8e.
//
// Solidity: event AssetUpdated(bytes32 indexed fingerprint, bytes32 newOracleAttestation, bytes32 newAbmHash)
func (_AssetRegistry *AssetRegistryFilterer) WatchAssetUpdated(opts *bind.WatchOpts, sink chan<- *AssetRegistryAssetUpdated, fingerprint [][32]byte) (event.Subscription, error) {

	var fingerprintRule []interface{}
	for _, fingerprintItem := range fingerprint {
		fingerprintRule = append(fingerprintRule, fingerprintItem)
	}

	logs, sub, err := _AssetRegistry.contract.WatchLogs(opts, "AssetUpdated", fingerprintRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(AssetRegistryAssetUpdated)
				if err := _AssetRegistry.contract.UnpackLog(event, "AssetUpdated", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseAssetUpdated is a log parse operation binding the contract event 0x6ca74a30ba77ecd060c87cd569ca54a67fcd0a5bf5ce59a83faa3a06663ede8e.
//
// Solidity: event AssetUpdated(bytes32 indexed fingerprint, bytes32 newOracleAttestation, bytes32 newAbmHash)
func (_AssetRegistry *AssetRegistryFilterer) ParseAssetUpdated(log types.Log) (*AssetRegistryAssetUpdated, error) {
	event := new(AssetRegistryAssetUpdated)
	if err := _AssetRegistry.contract.UnpackLog(event, "AssetUpdated", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// AssetRegistryRoleAdminChangedIterator is returned from FilterRoleAdminChanged and is used to iterate over the raw logs and unpacked data for RoleAdminChanged events raised by the AssetRegistry contract.
type AssetRegistryRoleAdminChangedIterator struct {
	Event *AssetRegistryRoleAdminChanged // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *AssetRegistryRoleAdminChangedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(AssetRegistryRoleAdminChanged)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(AssetRegistryRoleAdminChanged)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *AssetRegistryRoleAdminChangedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *AssetRegistryRoleAdminChangedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// AssetRegistryRoleAdminChanged represents a RoleAdminChanged event raised by the AssetRegistry contract.
type AssetRegistryRoleAdminChanged struct {
	Role              [32]byte
	PreviousAdminRole [32]byte
	NewAdminRole      [32]byte
	Raw               types.Log // Blockchain specific contextual infos
}

// FilterRoleAdminChanged is a free log retrieval operation binding the contract event 0xbd79b86ffe0ab8e8776151514217cd7cacd52c909f66475c3af44e129f0b00ff.
//
// Solidity: event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
func (_AssetRegistry *AssetRegistryFilterer) FilterRoleAdminChanged(opts *bind.FilterOpts, role [][32]byte, previousAdminRole [][32]byte, newAdminRole [][32]byte) (*AssetRegistryRoleAdminChangedIterator, error) {

	var roleRule []interface{}
	for _, roleItem := range role {
		roleRule = append(roleRule, roleItem)
	}
	var previousAdminRoleRule []interface{}
	for _, previousAdminRoleItem := range previousAdminRole {
		previousAdminRoleRule = append(previousAdminRoleRule, previousAdminRoleItem)
	}
	var newAdminRoleRule []interface{}
	for _, newAdminRoleItem := range newAdminRole {
		newAdminRoleRule = append(newAdminRoleRule, newAdminRoleItem)
	}

	logs, sub, err := _AssetRegistry.contract.FilterLogs(opts, "RoleAdminChanged", roleRule, previousAdminRoleRule, newAdminRoleRule)
	if err != nil {
		return nil, err
	}
	return &AssetRegistryRoleAdminChangedIterator{contract: _AssetRegistry.contract, event: "RoleAdminChanged", logs: logs, sub: sub}, nil
}

// WatchRoleAdminChanged is a free log subscription operation binding the contract event 0xbd79b86ffe0ab8e8776151514217cd7cacd52c909f66475c3af44e129f0b00ff.
//
// Solidity: event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
func (_AssetRegistry *AssetRegistryFilterer) WatchRoleAdminChanged(opts *bind.WatchOpts, sink chan<- *AssetRegistryRoleAdminChanged, role [][32]byte, previousAdminRole [][32]byte, newAdminRole [][32]byte) (event.Subscription, error) {

	var roleRule []interface{}
	for _, roleItem := range role {
		roleRule = append(roleRule, roleItem)
	}
	var previousAdminRoleRule []interface{}
	for _, previousAdminRoleItem := range previousAdminRole {
		previousAdminRoleRule = append(previousAdminRoleRule, previousAdminRoleItem)
	}
	var newAdminRoleRule []interface{}
	for _, newAdminRoleItem := range newAdminRole {
		newAdminRoleRule = append(newAdminRoleRule, newAdminRoleItem)
	}

	logs, sub, err := _AssetRegistry.contract.WatchLogs(opts, "RoleAdminChanged", roleRule, previousAdminRoleRule, newAdminRoleRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(AssetRegistryRoleAdminChanged)
				if err := _AssetRegistry.contract.UnpackLog(event, "RoleAdminChanged", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseRoleAdminChanged is a log parse operation binding the contract event 0xbd79b86ffe0ab8e8776151514217cd7cacd52c909f66475c3af44e129f0b00ff.
//
// Solidity: event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
func (_AssetRegistry *AssetRegistryFilterer) ParseRoleAdminChanged(log types.Log) (*AssetRegistryRoleAdminChanged, error) {
	event := new(AssetRegistryRoleAdminChanged)
	if err := _AssetRegistry.contract.UnpackLog(event, "RoleAdminChanged", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// AssetRegistryRoleGrantedIterator is returned from FilterRoleGranted and is used to iterate over the raw logs and unpacked data for RoleGranted events raised by the AssetRegistry contract.
type AssetRegistryRoleGrantedIterator struct {
	Event *AssetRegistryRoleGranted // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *AssetRegistryRoleGrantedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(AssetRegistryRoleGranted)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(AssetRegistryRoleGranted)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *AssetRegistryRoleGrantedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *AssetRegistryRoleGrantedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// AssetRegistryRoleGranted represents a RoleGranted event raised by the AssetRegistry contract.
type AssetRegistryRoleGranted struct {
	Role    [32]byte
	Account common.Address
	Sender  common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterRoleGranted is a free log retrieval operation binding the contract event 0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d.
//
// Solidity: event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
func (_AssetRegistry *AssetRegistryFilterer) FilterRoleGranted(opts *bind.FilterOpts, role [][32]byte, account []common.Address, sender []common.Address) (*AssetRegistryRoleGrantedIterator, error) {

	var roleRule []interface{}
	for _, roleItem := range role {
		roleRule = append(roleRule, roleItem)
	}
	var accountRule []interface{}
	for _, accountItem := range account {
		accountRule = append(accountRule, accountItem)
	}
	var senderRule []interface{}
	for _, senderItem := range sender {
		senderRule = append(senderRule, senderItem)
	}

	logs, sub, err := _AssetRegistry.contract.FilterLogs(opts, "RoleGranted", roleRule, accountRule, senderRule)
	if err != nil {
		return nil, err
	}
	return &AssetRegistryRoleGrantedIterator{contract: _AssetRegistry.contract, event: "RoleGranted", logs: logs, sub: sub}, nil
}

// WatchRoleGranted is a free log subscription operation binding the contract event 0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d.
//
// Solidity: event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
func (_AssetRegistry *AssetRegistryFilterer) WatchRoleGranted(opts *bind.WatchOpts, sink chan<- *AssetRegistryRoleGranted, role [][32]byte, account []common.Address, sender []common.Address) (event.Subscription, error) {

	var roleRule []interface{}
	for _, roleItem := range role {
		roleRule = append(roleRule, roleItem)
	}
	var accountRule []interface{}
	for _, accountItem := range account {
		accountRule = append(accountRule, accountItem)
	}
	var senderRule []interface{}
	for _, senderItem := range sender {
		senderRule = append(senderRule, senderItem)
	}

	logs, sub, err := _AssetRegistry.contract.WatchLogs(opts, "RoleGranted", roleRule, accountRule, senderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(AssetRegistryRoleGranted)
				if err := _AssetRegistry.contract.UnpackLog(event, "RoleGranted", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseRoleGranted is a log parse operation binding the contract event 0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d.
//
// Solidity: event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
func (_AssetRegistry *AssetRegistryFilterer) ParseRoleGranted(log types.Log) (*AssetRegistryRoleGranted, error) {
	event := new(AssetRegistryRoleGranted)
	if err := _AssetRegistry.contract.UnpackLog(event, "RoleGranted", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// AssetRegistryRoleRevokedIterator is returned from FilterRoleRevoked and is used to iterate over the raw logs and unpacked data for RoleRevoked events raised by the AssetRegistry contract.
type AssetRegistryRoleRevokedIterator struct {
	Event *AssetRegistryRoleRevoked // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *AssetRegistryRoleRevokedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(AssetRegistryRoleRevoked)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(AssetRegistryRoleRevoked)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *AssetRegistryRoleRevokedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *AssetRegistryRoleRevokedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// AssetRegistryRoleRevoked represents a RoleRevoked event raised by the AssetRegistry contract.
type AssetRegistryRoleRevoked struct {
	Role    [32]byte
	Account common.Address
	Sender  common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterRoleRevoked is a free log retrieval operation binding the contract event 0xf6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b.
//
// Solidity: event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
func (_AssetRegistry *AssetRegistryFilterer) FilterRoleRevoked(opts *bind.FilterOpts, role [][32]byte, account []common.Address, sender []common.Address) (*AssetRegistryRoleRevokedIterator, error) {

	var roleRule []interface{}
	for _, roleItem := range role {
		roleRule = append(roleRule, roleItem)
	}
	var accountRule []interface{}
	for _, accountItem := range account {
		accountRule = append(accountRule, accountItem)
	}
	var senderRule []interface{}
	for _, senderItem := range sender {
		senderRule = append(senderRule, senderItem)
	}

	logs, sub, err := _AssetRegistry.contract.FilterLogs(opts, "RoleRevoked", roleRule, accountRule, senderRule)
	if err != nil {
		return nil, err
	}
	return &AssetRegistryRoleRevokedIterator{contract: _AssetRegistry.contract, event: "RoleRevoked", logs: logs, sub: sub}, nil
}

// WatchRoleRevoked is a free log subscription operation binding the contract event 0xf6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b.
//
// Solidity: event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
func (_AssetRegistry *AssetRegistryFilterer) WatchRoleRevoked(opts *bind.WatchOpts, sink chan<- *AssetRegistryRoleRevoked, role [][32]byte, account []common.Address, sender []common.Address) (event.Subscription, error) {

	var roleRule []interface{}
	for _, roleItem := range role {
		roleRule = append(roleRule, roleItem)
	}
	var accountRule []interface{}
	for _, accountItem := range account {
		accountRule = append(accountRule, accountItem)
	}
	var senderRule []interface{}
	for _, senderItem := range sender {
		senderRule = append(senderRule, senderItem)
	}

	logs, sub, err := _AssetRegistry.contract.WatchLogs(opts, "RoleRevoked", roleRule, accountRule, senderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(AssetRegistryRoleRevoked)
				if err := _AssetRegistry.contract.UnpackLog(event, "RoleRevoked", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseRoleRevoked is a log parse operation binding the contract event 0xf6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b.
//
// Solidity: event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
func (_AssetRegistry *AssetRegistryFilterer) ParseRoleRevoked(log types.Log) (*AssetRegistryRoleRevoked, error) {
	event := new(AssetRegistryRoleRevoked)
	if err := _AssetRegistry.contract.UnpackLog(event, "RoleRevoked", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
