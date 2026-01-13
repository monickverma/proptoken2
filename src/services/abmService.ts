// STEP 1.4 - ABM Market & Cash-Flow Intelligence
// Agent-Based Modeling with Monte Carlo Simulations

import {
  AssetSubmission,
  ABMAnalysis,
  MarketComparable,
  NAVCalculation,
  YieldAnalysis,
  CashFlowSimulation,
  RiskSimulation
} from '../models/abmTypes';
import { OracleVerificationResult } from './oracleService';

// =====================
// MARKET DATA & BENCHMARKS
// =====================

interface MarketBenchmarks {
  avgPricePerSqFt: Record<string, number>;
  avgYield: Record<string, number>;
  vacancyRate: Record<string, number>;
  rentGrowthRate: number;
  inflationRate: number;
  riskFreeRate: number;
}

const MARKET_BENCHMARKS: MarketBenchmarks = {
  avgPricePerSqFt: {
    'Bengaluru': 8500,
    'Chennai': 7200,
    'Mumbai': 15000,
    'Delhi': 12000,
    'Hyderabad': 6500,
    'Pune': 7000,
    'default': 6000
  },
  avgYield: {
    'residential': 3.5,
    'commercial': 7.5,
    'industrial': 9.0,
    'agricultural': 4.0,
    'default': 5.0
  },
  vacancyRate: {
    'residential': 0.05,
    'commercial': 0.12,
    'industrial': 0.08,
    'agricultural': 0.02,
    'default': 0.08
  },
  rentGrowthRate: 0.05,    // 5% annual
  inflationRate: 0.06,     // 6% annual
  riskFreeRate: 0.065      // 6.5% (10-year G-Sec)
};

// =====================
// COMPARABLE GENERATION
// =====================

function generateComparables(submission: AssetSubmission): MarketComparable[] {
  const city = submission.location.city;
  const size = submission.specifications.size;
  const type = submission.specifications.type;
  
  const basePricePerSqFt = MARKET_BENCHMARKS.avgPricePerSqFt[city] || 
                           MARKET_BENCHMARKS.avgPricePerSqFt['default'];
  const baseYield = MARKET_BENCHMARKS.avgYield[type] || 
                    MARKET_BENCHMARKS.avgYield['default'];
  
  const comparables: MarketComparable[] = [];
  const numComparables = 15 + Math.floor(Math.random() * 20); // 15-35 comparables
  
  for (let i = 0; i < numComparables; i++) {
    const distance = Math.random() * 10; // 0-10 km
    const sizeVariation = 0.5 + Math.random(); // 50%-150% of subject size
    const compSize = size * sizeVariation;
    
    // Price varies by distance, size, and random market factors
    const distanceFactor = 1 - (distance / 50); // Closer = more similar price
    const sizeFactor = 1 - Math.abs(1 - sizeVariation) * 0.2; // Similar size = similar price
    const marketNoise = 0.8 + Math.random() * 0.4; // 80%-120%
    
    const pricePerSqFt = basePricePerSqFt * distanceFactor * sizeFactor * marketNoise;
    
    // Yield inversely related to price (higher price = lower yield)
    const yieldVariation = 0.85 + Math.random() * 0.3;
    const compYield = baseYield * yieldVariation;
    
    // Condition based on age and random factors
    const condition = 0.5 + Math.random() * 0.5;
    
    // Similarity score
    const similarity = 
      (1 - distance / 10) * 0.3 +
      sizeFactor * 0.3 +
      condition * 0.2 +
      (1 - Math.abs(compYield - baseYield) / baseYield) * 0.2;
    
    comparables.push({
      id: `comp-${i + 1}`,
      distance: Math.round(distance * 100) / 100,
      size: Math.round(compSize),
      pricePerSqFt: Math.round(pricePerSqFt),
      yield: Math.round(compYield * 100) / 100,
      condition,
      transactionDate: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      similarity: Math.min(1, Math.max(0, similarity))
    });
  }
  
  // Sort by similarity
  return comparables.sort((a, b) => b.similarity - a.similarity);
}

// =====================
// NAV CALCULATION ENGINE
// =====================

function calculateNAV(
  submission: AssetSubmission,
  comparables: MarketComparable[],
  oracleResults: OracleVerificationResult
): NAVCalculation {
  const size = submission.specifications.size;
  const claimedValue = submission.claimedValue;
  
  // Use top comparables (highest similarity)
  const topComps = comparables.slice(0, 10);
  
  // Calculate weighted average price per sq ft
  let totalWeight = 0;
  let weightedPrice = 0;
  
  topComps.forEach(comp => {
    const weight = comp.similarity;
    weightedPrice += comp.pricePerSqFt * weight;
    totalWeight += weight;
  });
  
  const avgPricePerSqFt = weightedPrice / totalWeight;
  
  // Adjust for condition (from oracle vision verification)
  const conditionMultiplier = oracleResults.existence.vision.conditionScore;
  const adjustedPricePerSqFt = avgPricePerSqFt * (0.8 + conditionMultiplier * 0.4);
  
  // Calculate NAV range
  const prices = topComps.map(c => c.pricePerSqFt);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  const minNAV = size * minPrice * 0.9; // 10% discount
  const maxNAV = size * maxPrice * 1.05; // 5% premium
  const meanNAV = size * adjustedPricePerSqFt;
  
  // Median calculation
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];
  const medianNAV = size * medianPrice;
  
  // Monte Carlo for downside/upside
  const navSimulations: number[] = [];
  for (let i = 0; i < 10000; i++) {
    // Random price from distribution
    const mean = adjustedPricePerSqFt;
    const std = (maxPrice - minPrice) / 4; // Approximate std dev
    const randomPrice = gaussianRandom(mean, std);
    navSimulations.push(size * randomPrice);
  }
  navSimulations.sort((a, b) => a - b);
  
  const downsideNAV = navSimulations[Math.floor(navSimulations.length * 0.05)];
  const upsideNAV = navSimulations[Math.floor(navSimulations.length * 0.95)];
  
  // Compare claimed vs calculated
  const claimedVsCalculated = claimedValue / meanNAV;
  
  // Confidence based on number of comparables and their similarity
  const avgSimilarity = topComps.reduce((sum, c) => sum + c.similarity, 0) / topComps.length;
  const confidence = Math.min(0.95, avgSimilarity * 0.7 + (topComps.length / 20) * 0.3);
  
  return {
    comparablesUsed: topComps.length,
    avgPricePerSqFt: Math.round(avgPricePerSqFt),
    adjustedPricePerSqFt: Math.round(adjustedPricePerSqFt),
    minNAV: Math.round(minNAV),
    maxNAV: Math.round(maxNAV),
    meanNAV: Math.round(meanNAV),
    medianNAV: Math.round(medianNAV),
    downsideNAV: Math.round(downsideNAV),
    upsideNAV: Math.round(upsideNAV),
    claimedVsCalculated: Math.round(claimedVsCalculated * 100) / 100,
    confidence
  };
}

// =====================
// YIELD ANALYSIS ENGINE
// =====================

function analyzeYield(
  submission: AssetSubmission,
  comparables: MarketComparable[],
  navCalculation: NAVCalculation
): YieldAnalysis {
  const type = submission.specifications.type;
  const subjectYield = submission.financials.expectedYield;
  
  // Market median yield from comparables
  const yields = comparables.slice(0, 10).map(c => c.yield);
  const sortedYields = [...yields].sort((a, b) => a - b);
  const marketMedianYield = sortedYields[Math.floor(sortedYields.length / 2)];
  
  // Yield spread
  const yieldSpread = subjectYield - marketMedianYield;
  
  // Calculate yield range
  const minYield = Math.min(...yields) * 0.9;
  const maxYield = Math.max(...yields) * 1.1;
  
  // Expected yield based on NAV and cash flow
  const annualRent = submission.financials.currentRent * 12;
  const netIncome = annualRent * (submission.financials.occupancyRate / 100) - 
                    submission.financials.annualExpenses;
  const impliedYield = (netIncome / navCalculation.meanNAV) * 100;
  const expectedYield = (impliedYield + marketMedianYield) / 2;
  
  // Sustainability score
  // High yield + low market yield = unsustainable
  // Yield close to market = sustainable
  let sustainabilityScore = 1 - Math.abs(yieldSpread) / marketMedianYield;
  
  // Penalize if claimed yield is much higher than implied
  if (subjectYield > impliedYield * 1.5) {
    sustainabilityScore *= 0.6;
  }
  
  sustainabilityScore = Math.max(0, Math.min(1, sustainabilityScore));
  
  // Confidence
  const confidence = Math.min(0.9, sustainabilityScore * 0.5 + 0.4);
  
  return {
    marketMedianYield: Math.round(marketMedianYield * 100) / 100,
    subjectYield,
    yieldSpread: Math.round(yieldSpread * 100) / 100,
    minYield: Math.round(minYield * 100) / 100,
    maxYield: Math.round(maxYield * 100) / 100,
    expectedYield: Math.round(expectedYield * 100) / 100,
    sustainabilityScore,
    confidence
  };
}

// =====================
// MONTE CARLO CASH FLOW SIMULATION
// =====================

function simulateCashFlows(
  submission: AssetSubmission,
  years: number = 10,
  simulations: number = 10000
): CashFlowSimulation {
  const baseRent = submission.financials.currentRent * 12; // Annual
  const baseExpenses = submission.financials.annualExpenses;
  const baseOccupancy = submission.financials.occupancyRate / 100;
  const type = submission.specifications.type;
  
  // Get market parameters
  const rentGrowthRate = MARKET_BENCHMARKS.rentGrowthRate;
  const inflationRate = MARKET_BENCHMARKS.inflationRate;
  const baseVacancyRate = MARKET_BENCHMARKS.vacancyRate[type] || 0.08;
  
  // Volatility parameters
  const rentGrowthStd = 0.03;    // 3% std dev
  const inflationStd = 0.02;     // 2% std dev
  const vacancyStd = 0.05;       // 5% std dev
  
  // Store all simulation results
  const allSimulations: number[][] = [];
  
  for (let sim = 0; sim < simulations; sim++) {
    const yearlyFlows: number[] = [];
    let currentRent = baseRent;
    let currentExpenses = baseExpenses;
    
    for (let year = 0; year < years; year++) {
      // Stochastic rent growth
      const rentGrowth = gaussianRandom(rentGrowthRate, rentGrowthStd);
      currentRent *= (1 + rentGrowth);
      
      // Stochastic expense growth (inflation)
      const expenseGrowth = gaussianRandom(inflationRate, inflationStd);
      currentExpenses *= (1 + expenseGrowth);
      
      // Stochastic vacancy
      const vacancyRate = Math.max(0, Math.min(1, 
        gaussianRandom(baseVacancyRate, vacancyStd)
      ));
      const effectiveOccupancy = 1 - vacancyRate;
      
      // Net cash flow
      const grossIncome = currentRent * effectiveOccupancy;
      const netCF = grossIncome - currentExpenses;
      
      yearlyFlows.push(netCF);
    }
    
    allSimulations.push(yearlyFlows);
  }
  
  // Calculate statistics for each year
  const meanAnnualCF: number[] = [];
  const medianAnnualCF: number[] = [];
  const percentile5CF: number[] = [];
  const percentile95CF: number[] = [];
  
  for (let year = 0; year < years; year++) {
    const yearValues = allSimulations.map(sim => sim[year]).sort((a, b) => a - b);
    
    meanAnnualCF.push(Math.round(
      yearValues.reduce((sum, v) => sum + v, 0) / simulations
    ));
    medianAnnualCF.push(Math.round(
      yearValues[Math.floor(simulations / 2)]
    ));
    percentile5CF.push(Math.round(
      yearValues[Math.floor(simulations * 0.05)]
    ));
    percentile95CF.push(Math.round(
      yearValues[Math.floor(simulations * 0.95)]
    ));
  }
  
  // Total CF distribution
  const totalCFs = allSimulations.map(sim => 
    sim.reduce((sum, cf) => sum + cf, 0)
  ).sort((a, b) => a - b);
  
  const meanTotalCF = totalCFs.reduce((sum, v) => sum + v, 0) / simulations;
  const variance = totalCFs.reduce((sum, v) => sum + Math.pow(v - meanTotalCF, 2), 0) / simulations;
  const stdTotalCF = Math.sqrt(variance);
  
  // Find break-even year
  let breakEvenYear: number | null = null;
  let cumulativeCF = 0;
  for (let year = 0; year < years; year++) {
    cumulativeCF += meanAnnualCF[year];
    if (cumulativeCF > 0 && breakEvenYear === null) {
      breakEvenYear = year + 1;
    }
  }
  
  // Probability of positive total CF
  const positiveCount = totalCFs.filter(cf => cf > 0).length;
  const probabilityPositiveCF = positiveCount / simulations;
  
  return {
    simulationRuns: simulations,
    yearsSimulated: years,
    meanAnnualCF,
    medianAnnualCF,
    percentile5CF,
    percentile95CF,
    totalCFDistribution: {
      mean: Math.round(meanTotalCF),
      std: Math.round(stdTotalCF),
      min: Math.round(totalCFs[0]),
      max: Math.round(totalCFs[totalCFs.length - 1]),
      percentile5: Math.round(totalCFs[Math.floor(simulations * 0.05)]),
      percentile95: Math.round(totalCFs[Math.floor(simulations * 0.95)])
    },
    probabilityPositiveCF,
    breakEvenYear
  };
}

// =====================
// RISK SIMULATION ENGINE
// =====================

function simulateRisks(
  submission: AssetSubmission,
  navCalculation: NAVCalculation,
  yieldAnalysis: YieldAnalysis,
  cashFlowSimulation: CashFlowSimulation
): RiskSimulation {
  const type = submission.specifications.type;
  const baseVacancy = MARKET_BENCHMARKS.vacancyRate[type] || 0.08;
  
  // =====================
  // VACANCY RISK
  // =====================
  const currentOccupancy = submission.financials.occupancyRate / 100;
  const vacancyRiskScore = Math.min(100, Math.max(0,
    (1 - currentOccupancy) * 50 + // Current vacancy impact
    baseVacancy * 100 +            // Market vacancy
    (submission.financials.tenantCount === 1 ? 20 : 0) // Single tenant risk
  ));
  
  const expectedVacancyRate = baseVacancy * 100;
  const worstCaseVacancy = Math.min(50, baseVacancy * 300);
  
  // =====================
  // MARKET RISK
  // =====================
  // Calculate based on NAV volatility
  const navRange = navCalculation.maxNAV - navCalculation.minNAV;
  const navVolatility = (navRange / navCalculation.meanNAV) * 100;
  const marketVolatility = Math.min(100, navVolatility * 2);
  
  // Correlation to market (simulated)
  const correlationToIndex = 0.4 + Math.random() * 0.4; // 0.4-0.8
  const betaCoefficient = correlationToIndex * (1 + Math.random() * 0.5);
  
  // =====================
  // INTEREST RATE RISK
  // =====================
  // Duration approximation based on lease terms
  const leaseYears = submission.financials.leaseTermsMonths / 12;
  const durationYears = Math.min(leaseYears, 10);
  
  // Sensitivity: 1% rate increase impact on value
  const interestRateSensitivity = durationYears * 0.8; // ~0.8% per year of duration
  
  // =====================
  // LIQUIDITY RISK
  // =====================
  // Based on asset type, size, and market depth
  const isLargeAsset = navCalculation.meanNAV > 10000000; // > 1 Cr
  const isNicheType = ['industrial', 'agricultural'].includes(type);
  
  let liquidityScore = 70; // Base
  if (isLargeAsset) liquidityScore -= 20;
  if (isNicheType) liquidityScore -= 15;
  liquidityScore += (currentOccupancy - 0.8) * 30; // Occupied = more liquid
  liquidityScore = Math.max(10, Math.min(100, liquidityScore));
  
  const estimatedTimeToSell = Math.round(
    90 + (100 - liquidityScore) * 3 // 90-390 days
  );
  
  const marketDepth = liquidityScore / 100;
  
  // =====================
  // STRESS TESTS
  // =====================
  const stressTests = [
    {
      scenario: 'Severe Recession (-30% Market)',
      navImpact: -25 - Math.random() * 10,
      cfImpact: -35 - Math.random() * 15,
      probability: 0.05
    },
    {
      scenario: 'Moderate Downturn (-15% Market)',
      navImpact: -12 - Math.random() * 5,
      cfImpact: -18 - Math.random() * 8,
      probability: 0.15
    },
    {
      scenario: 'Interest Rate Shock (+300bps)',
      navImpact: -durationYears * 2.5,
      cfImpact: -5 - Math.random() * 5,
      probability: 0.10
    },
    {
      scenario: 'Major Tenant Default',
      navImpact: -10 - Math.random() * 10,
      cfImpact: -40 - Math.random() * 20,
      probability: 0.08
    },
    {
      scenario: 'Hyperlocal Market Crash',
      navImpact: -35 - Math.random() * 15,
      cfImpact: -25 - Math.random() * 10,
      probability: 0.03
    }
  ];
  
  // =====================
  // VALUE AT RISK
  // =====================
  // Using NAV simulation results
  const currentNAV = navCalculation.meanNAV;
  const navStd = (navCalculation.maxNAV - navCalculation.minNAV) / 4;
  
  // VaR at 95% and 99% confidence
  const var95 = currentNAV - navCalculation.downsideNAV;
  const var99 = var95 * 1.4; // Approximate
  
  // Expected Shortfall (CVaR)
  const expectedShortfall = var95 * 1.25;
  
  // Tail risk score
  const tailRiskScore = Math.min(1, (var95 / currentNAV) * 2);
  
  return {
    vacancyRiskScore: Math.round(vacancyRiskScore),
    expectedVacancyRate: Math.round(expectedVacancyRate * 10) / 10,
    worstCaseVacancy: Math.round(worstCaseVacancy),
    marketVolatility: Math.round(marketVolatility),
    correlationToIndex: Math.round(correlationToIndex * 100) / 100,
    betaCoefficient: Math.round(betaCoefficient * 100) / 100,
    interestRateSensitivity: Math.round(interestRateSensitivity * 100) / 100,
    durationYears: Math.round(durationYears * 10) / 10,
    liquidityScore: Math.round(liquidityScore),
    estimatedTimeToSell,
    marketDepth: Math.round(marketDepth * 100) / 100,
    stressTests: stressTests.map(st => ({
      ...st,
      navImpact: Math.round(st.navImpact * 10) / 10,
      cfImpact: Math.round(st.cfImpact * 10) / 10
    })),
    var95: Math.round(var95),
    var99: Math.round(var99),
    expectedShortfall: Math.round(expectedShortfall),
    tailRiskScore: Math.round(tailRiskScore * 100) / 100
  };
}

// =====================
// HELPER: GAUSSIAN RANDOM
// =====================

function gaussianRandom(mean: number, std: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

// =====================
// MAIN ABM ANALYSIS
// =====================

export async function runABMAnalysis(
  submission: AssetSubmission,
  oracleResults: OracleVerificationResult
): Promise<ABMAnalysis> {
  // Generate market comparables
  const comparables = generateComparables(submission);
  
  // Calculate NAV
  const nav = calculateNAV(submission, comparables, oracleResults);
  
  // Analyze yield
  const yieldAnalysis = analyzeYield(submission, comparables, nav);
  
  // Run Monte Carlo cash flow simulation
  const cashFlowSimulation = simulateCashFlows(submission);
  
  // Run risk simulations
  const riskSimulation = simulateRisks(
    submission, nav, yieldAnalysis, cashFlowSimulation
  );
  
  // =====================
  // SUMMARY SCORES
  // =====================
  
  // Overall Risk Score (0-100, lower is better)
  const overallRiskScore = Math.round(
    riskSimulation.vacancyRiskScore * 0.2 +
    riskSimulation.marketVolatility * 0.25 +
    (100 - riskSimulation.liquidityScore) * 0.2 +
    riskSimulation.tailRiskScore * 100 * 0.2 +
    (100 - cashFlowSimulation.probabilityPositiveCF * 100) * 0.15
  );
  
  // Investability Score (0-100, higher is better)
  const investabilityScore = Math.round(
    yieldAnalysis.sustainabilityScore * 30 +
    nav.confidence * 20 +
    cashFlowSimulation.probabilityPositiveCF * 30 +
    (100 - overallRiskScore) * 0.2
  );
  
  // Market Fit Score (0-100)
  const claimedVsMarket = nav.claimedVsCalculated;
  let marketFitScore = 100;
  if (claimedVsMarket > 1.3 || claimedVsMarket < 0.7) {
    marketFitScore = 50; // Significantly off market
  } else if (claimedVsMarket > 1.15 || claimedVsMarket < 0.85) {
    marketFitScore = 75; // Somewhat off
  } else {
    marketFitScore = 90 + Math.random() * 10; // Well aligned
  }
  
  marketFitScore = Math.round(
    marketFitScore * 0.5 +
    (1 - Math.abs(yieldAnalysis.yieldSpread) / yieldAnalysis.marketMedianYield) * 50
  );
  
  // Confidence
  const confidence = Math.min(0.95, 
    (nav.confidence + yieldAnalysis.confidence) / 2 * 0.7 +
    (comparables.length / 30) * 0.3
  );
  
  // Pass criteria: risk <= 70, investability >= 50, market fit >= 60
  const passed = 
    overallRiskScore <= 70 && 
    investabilityScore >= 50 && 
    marketFitScore >= 60;
  
  return {
    comparables,
    nav,
    yield: yieldAnalysis,
    cashFlowSimulation,
    riskSimulation,
    overallRiskScore,
    investabilityScore,
    marketFitScore,
    confidence,
    passed,
    timestamp: new Date()
  };
}
