// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";
import "../src/AssetRegistry.sol";
import "../src/TokenFactory.sol";
import "../src/tokens/RWASecurityToken.sol";
import "../src/testnet/TestUSD.sol";
import "../src/testnet/PropTokenMarket.sol";

/// Testnet market: faucet, buy with auto-whitelisting, sell back from the reserve.
contract MarketTest is Test {
    AssetRegistry registry;
    TokenFactory factory;
    TestUSD usd;
    PropTokenMarket market;
    RWASecurityToken token;

    address admin = address(0xA11CE);
    address alice = address(0xA1);
    address bob = address(0xB0B);
    address mallory = address(0xBAD);

    uint256 constant PRICE = 60e6;       // 60 tUSD per whole token
    uint16 constant SPREAD = 200;        // 2%
    uint256 constant RESERVE = 100_000e6;

    event Bought(address indexed buyer, address indexed token, uint256 amount, uint256 cost);
    event Sold(address indexed seller, address indexed token, uint256 amount, uint256 payout);

    function setUp() public {
        vm.startPrank(admin);
        registry = new AssetRegistry(admin);
        factory = new TokenFactory(address(registry), admin);
        registry.grantRole(registry.DEFAULT_ADMIN_ROLE(), address(factory));
        registry.grantRole(registry.CONSENSUS_ROLE(), admin);

        bytes32 fp = keccak256("ASSET-GGM-001");
        registry.registerAsset(fp, admin, 0, 0, [uint256(1e18), 1e18, 0, 10], true, false);
        token = RWASecurityToken(factory.deployToken(fp, "DLF Cyber Hub", "PT-DLF", "Test asset", 1_000_000e18));

        usd = new TestUSD(admin);
        market = new PropTokenMarket(address(usd), admin, SPREAD);
        token.grantRole(token.MINTER_ROLE(), address(market));
        token.grantRole(token.COMPLIANCE_ROLE(), address(market));
        token.verifyInvestor(address(market), true);
        market.setPrice(address(token), PRICE);
        usd.mint(address(market), RESERVE);
        vm.stopPrank();
    }

    function _fundAndBuy(address who, uint256 amount) internal returns (uint256 cost) {
        vm.startPrank(who);
        if (usd.balanceOf(who) == 0) usd.faucet();
        usd.approve(address(market), type(uint256).max);
        cost = market.buy(address(token), amount);
        vm.stopPrank();
    }

    // ---------------------------------------------------------------- TestUSD

    function test_Faucet_GivesAmountOncePerDay() public {
        vm.startPrank(alice);
        usd.faucet();
        assertEq(usd.balanceOf(alice), usd.FAUCET_AMOUNT());
        assertEq(usd.decimals(), 6);

        vm.expectRevert("Faucet cooldown");
        usd.faucet();
        assertEq(usd.nextFaucetTime(alice), block.timestamp + 1 days);

        vm.warp(block.timestamp + 1 days);
        assertEq(usd.nextFaucetTime(alice), 0);
        usd.faucet();
        assertEq(usd.balanceOf(alice), 2 * usd.FAUCET_AMOUNT());
        vm.stopPrank();
    }

    function test_Faucet_AdminMintIsRestricted() public {
        vm.expectRevert(abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, mallory, usd.MINTER_ROLE()));
        vm.prank(mallory);
        usd.mint(mallory, 1e6);
    }

    // ---------------------------------------------------------------- buy

    function test_Buy_PaysPriceMintsAndAutoVerifies() public {
        assertFalse(token.verifiedInvestors(alice));

        vm.startPrank(alice);
        usd.faucet();
        usd.approve(address(market), 600e6);
        vm.expectEmit(address(market));
        emit Bought(alice, address(token), 10e18, 600e6);
        uint256 cost = market.buy(address(token), 10e18);
        vm.stopPrank();

        assertEq(cost, 600e6);
        assertEq(token.balanceOf(alice), 10e18);
        assertTrue(token.verifiedInvestors(alice));
        assertEq(usd.balanceOf(alice), usd.FAUCET_AMOUNT() - 600e6);
        assertEq(usd.balanceOf(address(market)), RESERVE + 600e6);
        assertEq(token.currentInvestorsCount(), 1);
    }

    function test_Buy_FractionalAmountsRoundCostDown() public {
        uint256 cost = _fundAndBuy(alice, 0.5e18);
        assertEq(cost, 30e6);
        assertEq(token.balanceOf(alice), 0.5e18);
    }

    function test_Buy_RevertsWhenUnlistedTinyOrUnapproved() public {
        vm.startPrank(alice);
        usd.faucet();

        vm.expectRevert("Not listed");
        market.buy(address(0x1234), 1e18);

        usd.approve(address(market), type(uint256).max);
        vm.expectRevert("Amount too small");
        market.buy(address(token), 1); // 1 wei of token costs 0

        usd.approve(address(market), 0);
        vm.expectRevert(); // ERC20InsufficientAllowance
        market.buy(address(token), 1e18);
        vm.stopPrank();
    }

    function test_Buy_RevertsWithoutFunds() public {
        vm.startPrank(bob);
        usd.approve(address(market), type(uint256).max);
        vm.expectRevert(); // ERC20InsufficientBalance
        market.buy(address(token), 1e18);
        vm.stopPrank();
    }

    function test_Buy_FrozenInvestorCannotBuy() public {
        _fundAndBuy(alice, 1e18);
        vm.prank(admin);
        token.freezeWallet(alice, true);

        vm.prank(alice);
        vm.expectRevert("Wallet is frozen");
        market.buy(address(token), 1e18);
    }

    // ---------------------------------------------------------------- sell

    function test_Sell_BurnsAndPaysPriceMinusSpread() public {
        _fundAndBuy(alice, 10e18);
        uint256 usdBefore = usd.balanceOf(alice);

        vm.startPrank(alice);
        token.approve(address(market), 4e18);
        vm.expectEmit(address(market));
        emit Sold(alice, address(token), 4e18, 235.2e6);
        uint256 payout = market.sell(address(token), 4e18);
        vm.stopPrank();

        assertEq(payout, 235.2e6); // 4 * 60 * 0.98
        assertEq(usd.balanceOf(alice), usdBefore + payout);
        assertEq(token.balanceOf(alice), 6e18);
        assertEq(token.totalSupply(), 6e18);
        assertEq(token.balanceOf(address(market)), 0);
    }

    function test_Sell_AllDropsInvestorCount() public {
        _fundAndBuy(alice, 3e18);
        vm.startPrank(alice);
        token.approve(address(market), 3e18);
        market.sell(address(token), 3e18);
        vm.stopPrank();
        assertEq(token.currentInvestorsCount(), 0);
        assertFalse(token.isInvestor(alice));
    }

    function test_Sell_RevertsWithoutApproval() public {
        _fundAndBuy(alice, 1e18);
        vm.prank(alice);
        vm.expectRevert(); // ERC20InsufficientAllowance
        market.sell(address(token), 1e18);
    }

    function test_Sell_RevertsWhenReserveTooLow() public {
        _fundAndBuy(alice, 1e18);
        vm.prank(admin);
        market.setPrice(address(token), 1_000_000e6); // reprice far above the reserve

        vm.startPrank(alice);
        token.approve(address(market), 1e18);
        vm.expectRevert("Reserve too low");
        market.sell(address(token), 1e18);
        vm.stopPrank();
    }

    function test_Sell_FrozenInvestorCannotSell() public {
        _fundAndBuy(alice, 1e18);
        vm.prank(admin);
        token.freezeWallet(alice, true);

        vm.startPrank(alice);
        token.approve(address(market), 1e18);
        vm.expectRevert("Transfer not compliant");
        market.sell(address(token), 1e18);
        vm.stopPrank();
    }

    // ---------------------------------------------------------------- admin

    function test_Admin_OnlyListerSetsPriceAndSpreadIsBounded() public {
        vm.expectRevert(abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, mallory, market.LISTER_ROLE()));
        vm.prank(mallory);
        market.setPrice(address(token), 1);

        vm.startPrank(admin);
        vm.expectRevert("Spread too high");
        market.setSellSpread(2_001);
        market.setSellSpread(500);
        assertEq(market.sellSpreadBps(), 500);

        market.setPrice(address(token), 0); // delist
        assertEq(market.listedCount(), 1);
        market.setPrice(address(token), PRICE); // relist does not duplicate
        assertEq(market.listedCount(), 1);
        vm.stopPrank();

        vm.expectRevert();
        new PropTokenMarket(address(usd), admin, 2_001);
    }

    // ---------------------------------------------------------------- invariants

    /// A buy followed by selling everything never leaves the trader with more stablecoin than before,
    /// and the market keeps at least its starting reserve.
    function testFuzz_RoundTripNeverCreatesMoney(uint256 amount) public {
        amount = bound(amount, 1e12, 150e18); // up to 150 tokens = 9,000 tUSD
        vm.prank(alice);
        usd.faucet();
        uint256 start = usd.balanceOf(alice);

        vm.startPrank(alice);
        usd.approve(address(market), type(uint256).max);
        market.buy(address(token), amount);
        token.approve(address(market), amount);
        market.sell(address(token), amount);
        vm.stopPrank();

        assertLe(usd.balanceOf(alice), start);
        assertGe(usd.balanceOf(address(market)), RESERVE);
        assertEq(token.totalSupply(), 0);
    }
}
