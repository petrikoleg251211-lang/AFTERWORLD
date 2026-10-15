/**
 * AFTERWORLD — Deterministic Discrete-Time Simulation Core
 * Executes phase-separated updates, tracks causal lineages, and preserves conservation invariants.
 */

import {
  CausalRecord,
  EmergencePattern,
  RegionEntity,
  RegionMetrics,
  ScenarioBranch,
  SimulationRule,
  SimulationSnapshot,
  TransitLink,
  WorldState
} from '../types/simulation';

// Deterministic Mulberry32 PRNG
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTH_NAMES = [
  'Jan, Year 1', 'Feb, Year 1', 'Mar, Year 1', 'Apr, Year 1', 'May, Year 1', 'Jun, Year 1',
  'Jul, Year 1', 'Aug, Year 1', 'Sep, Year 1', 'Oct, Year 1', 'Nov, Year 1', 'Dec, Year 1',
  'Jan, Year 2', 'Feb, Year 2', 'Mar, Year 2', 'Apr, Year 2', 'May, Year 2', 'Jun, Year 2',
  'Jul, Year 2', 'Aug, Year 2', 'Sep, Year 2', 'Oct, Year 2', 'Nov, Year 2', 'Dec, Year 2',
  'Jan, Year 3', 'Feb, Year 3', 'Mar, Year 3', 'Apr, Year 3', 'May, Year 3', 'Jun, Year 3'
];

export function getMonthLabel(step: number): string {
  if (step < MONTH_NAMES.length) {
    return MONTH_NAMES[step];
  }
  const year = Math.floor(step / 12) + 1;
  const monthIdx = step % 12;
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${shortMonths[monthIdx]}, Year ${year}`;
}

export function createDefaultWorld(seed: number = 42): WorldState {
  const regions: Record<string, RegionEntity> = {
    capital: {
      id: 'capital',
      name: 'Capital Metro',
      role: 'Commercial, Financial & Governance Core',
      color: '#38BDF8', // Cyan/Sky
      coords: { x: 52, y: 40 },
      stats: {
        population: 1450,         // 1.45M citizens
        foodStock: 280,           // 280 kt in reserves (needs ~360/mo)
        foodProductionYield: 0.15,// Local urban farming is limited
        energyGeneration: 220,    // GWh (severe local deficit)
        energyDemand: 780,        // GWh (high domestic & commercial load)
        energyStorage: 180,       // Battery & backup reserve
        minerals: 60,             // Consumer tech & infrastructure needs
        waterReserve: 72,         // Reservoir levels %
        environmentalStress: 38,  // Moderate urban emissions
        socialStability: 85,      // High initial stability
        jobsAvailable: 1520,      // Surplus job market
        migrationNet: 4.2         // Positive influx
      }
    },
    agro: {
      id: 'agro',
      name: 'Agro Plains',
      role: 'Arable Agriculture & Aquifer Breadbasket',
      color: '#4ADE80', // Emerald Green
      coords: { x: 24, y: 68 },
      stats: {
        population: 410,          // 410k rural population
        foodStock: 520,           // Massive grain & food stores
        foodProductionYield: 1.0, // Baseline normal harvest yield
        energyGeneration: 160,    // Biomass & local solar
        energyDemand: 130,        // Low industrial demand
        energyStorage: 50,
        minerals: 20,
        waterReserve: 88,         // Aquifer capacity %
        environmentalStress: 18,  // Clean soil, low pollutants
        socialStability: 90,      // Resilient agricultural community
        jobsAvailable: 430,
        migrationNet: -1.0        // Slight rural outflow
      }
    },
    mineral: {
      id: 'mineral',
      name: 'Mineral Basin',
      role: 'Heavy Metallurgy, Mining & Manufacturing',
      color: '#FB923C', // Warm Amber / Orange
      coords: { x: 80, y: 65 },
      stats: {
        population: 320,          // 320k industrial workforce
        foodStock: 90,            // Relies on food imports
        foodProductionYield: 0.05,
        energyGeneration: 450,    // Coal & gas plants (dirty)
        energyDemand: 620,        // Heavy smelting & factory draw
        energyStorage: 90,
        minerals: 380,            // Abundant ore stocks
        waterReserve: 54,         // Industrial water consumption
        environmentalStress: 68,  // High smog & runoff
        socialStability: 74,      // Worker tensions if prices spike
        jobsAvailable: 340,
        migrationNet: 0.5
      }
    },
    coastal: {
      id: 'coastal',
      name: 'Coastal Haven',
      role: 'Offshore Wind, Hydro & Maritime Logistics',
      color: '#818CF8', // Indigo / Ocean Blue
      coords: { x: 30, y: 18 },
      stats: {
        population: 280,          // 280k coastal inhabitants
        foodStock: 140,           // Fisheries & aquaculture
        foodProductionYield: 0.45,
        energyGeneration: 920,    // Major clean energy exporter
        energyDemand: 190,        // Low local demand
        energyStorage: 320,       // Large pumped hydro reserve
        minerals: 40,
        waterReserve: 95,         // Abundant freshwater inflows
        environmentalStress: 12,  // Pristine marine zone
        socialStability: 94,      // High quality of life
        jobsAvailable: 300,
        migrationNet: 1.8
      }
    }
  };

  const links: TransitLink[] = [
    {
      id: 'link-agro-capital-food',
      sourceRegionId: 'agro',
      targetRegionId: 'capital',
      resource: 'FOOD',
      capacity: 340,
      actualThroughput: 310,
      transmissionLoss: 0.05,
      status: 'OPTIMAL'
    },
    {
      id: 'link-coastal-capital-energy',
      sourceRegionId: 'coastal',
      targetRegionId: 'capital',
      resource: 'ENERGY',
      capacity: 650,
      actualThroughput: 540,
      transmissionLoss: 0.08,
      status: 'OPTIMAL'
    },
    {
      id: 'link-mineral-capital-materials',
      sourceRegionId: 'mineral',
      targetRegionId: 'capital',
      resource: 'MINERALS',
      capacity: 220,
      actualThroughput: 160,
      transmissionLoss: 0.04,
      status: 'OPTIMAL'
    },
    {
      id: 'link-agro-mineral-food',
      sourceRegionId: 'agro',
      targetRegionId: 'mineral',
      resource: 'FOOD',
      capacity: 120,
      actualThroughput: 85,
      transmissionLoss: 0.06,
      status: 'OPTIMAL'
    },
    {
      id: 'link-coastal-mineral-energy',
      sourceRegionId: 'coastal',
      targetRegionId: 'mineral',
      resource: 'ENERGY',
      capacity: 260,
      actualThroughput: 190,
      transmissionLoss: 0.10,
      status: 'OPTIMAL'
    }
  ];

  return {
    step: 0,
    monthName: MONTH_NAMES[0],
    regions,
    links,
    globalCarbon: 34.0,
    globalAverageStability: 85.7,
    seed
  };
}

export function getDefaultRules(): SimulationRule[] {
  return [
    {
      id: 'rule-food-consumption',
      name: 'Per-Capita Food Consumption',
      category: 'AGRICULTURE',
      description: 'Population requires 0.24 kt food per thousand residents per month.',
      enabled: true,
      priority: 10,
      parameters: { perCapitaDemand: 0.24 }
    },
    {
      id: 'rule-crop-harvest',
      name: 'Regional Crop & Aquaculture Yield',
      category: 'AGRICULTURE',
      description: 'Food production depends on regional yield multiplier, water reserve, and arable workforce.',
      enabled: true,
      priority: 15,
      parameters: { baseAgroYield: 480, waterSensitivity: 0.5 }
    },
    {
      id: 'rule-energy-balance',
      name: 'Grid Distribution & Storage Buffering',
      category: 'ENERGY_GRID',
      description: 'Calculates energy deficits, draws from battery reserves, or triggers blackouts.',
      enabled: true,
      priority: 20,
      parameters: { reserveDischargeRate: 0.85, outagePenalty: 1.4 }
    },
    {
      id: 'rule-industrial-emissions',
      name: 'Industrial Carbon & Ecological Degradation',
      category: 'ECOLOGY',
      description: 'Mineral processing and fossil energy generate environmental stress and carbon load.',
      enabled: true,
      priority: 30,
      parameters: { mineralPollutionFactor: 0.12, naturalAbsorptionRate: 0.04 }
    },
    {
      id: 'rule-social-stability',
      name: 'Social Cohesion & Stability Dynamics',
      category: 'DEMOGRAPHICS',
      description: 'Stability decreases with food shortages, energy blackouts, and pollution, but recovers with job abundance.',
      enabled: true,
      priority: 40,
      parameters: { famineImpact: 3.5, blackoutImpact: 2.2, jobBonus: 0.8 }
    },
    {
      id: 'rule-migration-flux',
      name: 'Interregional Economic Migration',
      category: 'DEMOGRAPHICS',
      description: 'Populations relocate toward regions with higher social stability and job availability.',
      enabled: true,
      priority: 50,
      parameters: { migrationSensitivity: 0.03 }
    }
  ];
}

/**
 * Execute one deterministic discrete-time simulation step.
 */
export function stepSimulation(
  currentState: WorldState,
  rules: SimulationRule[],
  overrides: Record<string, number> = {},
  seedModifier: number = 0
): {
  nextState: WorldState;
  causalRecords: CausalRecord[];
  emergenceAlerts: EmergencePattern[];
} {
  const prng = createPRNG(currentState.seed + currentState.step * 1000 + seedModifier);
  const nextStep = currentState.step + 1;
  const causalRecords: CausalRecord[] = [];
  const emergenceAlerts: EmergencePattern[] = [];

  // Deep clone state for safe phase separation
  const prevRegions = currentState.regions;
  const nextRegions: Record<string, RegionEntity> = JSON.parse(JSON.stringify(prevRegions));
  const nextLinks: TransitLink[] = JSON.parse(JSON.stringify(currentState.links));

  // Apply active parameter overrides to next state (e.g. drought or tax shocks)
  for (const [key, value] of Object.entries(overrides)) {
    const [regionId, prop] = key.split('.');
    if (nextRegions[regionId] && prop in nextRegions[regionId].stats) {
      (nextRegions[regionId].stats as unknown as Record<string, number>)[prop] = value;
    }
  }

  // -------------------------------------------------------------
  // PHASE 1: Resource Trade & Distribution Pipeline
  // -------------------------------------------------------------
  const transferredInflow: Record<string, { food: number; energy: number; minerals: number }> = {
    capital: { food: 0, energy: 0, minerals: 0 },
    agro: { food: 0, energy: 0, minerals: 0 },
    mineral: { food: 0, energy: 0, minerals: 0 },
    coastal: { food: 0, energy: 0, minerals: 0 }
  };

  for (const link of nextLinks) {
    const source = nextRegions[link.sourceRegionId];
    const target = nextRegions[link.targetRegionId];
    if (!source || !target) continue;

    let available = 0;
    if (link.resource === 'FOOD') available = source.stats.foodStock * 0.6;
    if (link.resource === 'ENERGY') available = Math.max(0, source.stats.energyGeneration - source.stats.energyDemand);
    if (link.resource === 'MINERALS') available = source.stats.minerals * 0.5;

    // Constrain by link capacity
    const desiredTransfer = Math.min(link.capacity, available);
    const netDelivered = desiredTransfer * (1 - link.transmissionLoss);
    link.actualThroughput = Number(desiredTransfer.toFixed(1));

    if (link.actualThroughput > link.capacity * 0.95) {
      link.status = 'CONGESTED';
    } else if (link.actualThroughput < 5) {
      link.status = 'DISRUPTED';
    } else {
      link.status = 'OPTIMAL';
    }

    if (link.resource === 'FOOD') {
      source.stats.foodStock -= desiredTransfer;
      transferredInflow[target.id].food += netDelivered;
    } else if (link.resource === 'ENERGY') {
      transferredInflow[target.id].energy += netDelivered;
    } else if (link.resource === 'MINERALS') {
      source.stats.minerals -= desiredTransfer;
      transferredInflow[target.id].minerals += netDelivered;
    }
  }

  // -------------------------------------------------------------
  // PHASE 2 & 3: Regional Stock & Flow Computation + Conservation Clamping
  // -------------------------------------------------------------
  for (const regionId of Object.keys(nextRegions)) {
    const prev = prevRegions[regionId].stats;
    const current = nextRegions[regionId].stats;
    const inflows = transferredInflow[regionId];

    // --- 1. FOOD BALANCE ---
    // Production calculation
    const waterFactor = Math.max(0.2, current.waterReserve / 100);
    const rawYield = current.foodProductionYield * waterFactor;
    let newHarvest = 0;

    if (regionId === 'agro') {
      newHarvest = 520 * rawYield;
    } else if (regionId === 'coastal') {
      newHarvest = 130 * rawYield;
    } else if (regionId === 'capital') {
      newHarvest = 45 * rawYield;
    } else {
      newHarvest = 15 * rawYield;
    }

    const totalFoodBeforeConsumption = current.foodStock + newHarvest + inflows.food;
    const foodDemand = current.population * 0.24; // 0.24 kt per 1,000 citizens
    const foodDeficit = Math.max(0, foodDemand - totalFoodBeforeConsumption);
    const endFoodStock = Math.max(0, totalFoodBeforeConsumption - foodDemand);

    causalRecords.push({
      id: `causal-food-${regionId}-${nextStep}`,
      step: nextStep,
      entityId: regionId,
      targetVariable: 'foodStock',
      previousValue: Number(prev.foodStock.toFixed(1)),
      nextValue: Number(endFoodStock.toFixed(1)),
      delta: Number((endFoodStock - prev.foodStock).toFixed(1)),
      ruleId: 'rule-crop-harvest',
      ruleName: 'Crop Yield & Food Demand',
      inputs: {
        yieldMultiplier: current.foodProductionYield,
        waterReserve: current.waterReserve,
        newHarvest: Number(newHarvest.toFixed(1)),
        inflowDelivered: Number(inflows.food.toFixed(1)),
        monthlyDemand: Number(foodDemand.toFixed(1))
      },
      explanation: `${nextRegions[regionId].name} harvested ${newHarvest.toFixed(1)} kt food and imported ${inflows.food.toFixed(1)} kt. Consumption draw was ${foodDemand.toFixed(1)} kt (${foodDeficit > 0 ? `DEFICIT of ${foodDeficit.toFixed(1)} kt!` : 'satisfied'}).`,
      upstreamEntityIds: inflows.food > 0 ? ['agro'] : []
    });

    current.foodStock = Number(endFoodStock.toFixed(1));

    // --- 2. ENERGY BALANCE ---
    const totalEnergySupply = current.energyGeneration + inflows.energy;
    const energyDelta = totalEnergySupply - current.energyDemand;
    let endStorage = current.energyStorage;
    let blackoutDeficit = 0;

    if (energyDelta >= 0) {
      endStorage = Math.min(500, current.energyStorage + energyDelta * 0.4);
    } else {
      const unmetDemand = Math.abs(energyDelta);
      if (endStorage >= unmetDemand) {
        endStorage -= unmetDemand;
      } else {
        blackoutDeficit = unmetDemand - endStorage;
        endStorage = 0;
      }
    }

    causalRecords.push({
      id: `causal-energy-${regionId}-${nextStep}`,
      step: nextStep,
      entityId: regionId,
      targetVariable: 'energyStorage',
      previousValue: Number(prev.energyStorage.toFixed(1)),
      nextValue: Number(endStorage.toFixed(1)),
      delta: Number((endStorage - prev.energyStorage).toFixed(1)),
      ruleId: 'rule-energy-balance',
      ruleName: 'Energy Balance & Storage Buffer',
      inputs: {
        localGeneration: current.energyGeneration,
        inflowEnergy: Number(inflows.energy.toFixed(1)),
        demand: current.energyDemand,
        blackoutDeficit: Number(blackoutDeficit.toFixed(1))
      },
      explanation: `${nextRegions[regionId].name} total supply ${totalEnergySupply.toFixed(1)} GWh vs demand ${current.energyDemand.toFixed(1)} GWh. ${blackoutDeficit > 0 ? `Unbuffered outage of ${blackoutDeficit.toFixed(1)} GWh recorded.` : 'Storage reserves replenished.'}`,
      upstreamEntityIds: inflows.energy > 0 ? ['coastal'] : []
    });

    current.energyStorage = Number(endStorage.toFixed(1));

    // --- 3. ENVIRONMENTAL STRESS & WATER ---
    let stressDelta = 0;
    if (regionId === 'mineral') {
      stressDelta = (current.energyGeneration * 0.05 + current.minerals * 0.04) - 4.5;
    } else if (regionId === 'capital') {
      stressDelta = (current.population * 0.015) - 3.2;
    } else if (regionId === 'agro') {
      stressDelta = (current.foodProductionYield > 0.8 ? 1.5 : -1.0) - 2.0;
    } else {
      stressDelta = -2.5; // Natural cleansing in coastal haven
    }

    const endStress = Math.min(100, Math.max(0, current.environmentalStress + stressDelta));
    current.environmentalStress = Number(endStress.toFixed(1));

    // Water depletion/regeneration
    let waterDelta = 0;
    if (regionId === 'agro') {
      waterDelta = current.foodProductionYield > 0.7 ? -2.2 : +1.5;
    } else {
      waterDelta = (prng() * 2 - 1.0);
    }
    current.waterReserve = Math.min(100, Math.max(5, Number((current.waterReserve + waterDelta).toFixed(1))));

    // --- 4. SOCIAL STABILITY ---
    let stabilityImpact = 0;
    if (foodDeficit > 5) {
      stabilityImpact -= (foodDeficit / (foodDemand || 1)) * 35;
    } else if (endFoodStock < foodDemand * 0.5) {
      stabilityImpact -= 4.0;
    }

    if (blackoutDeficit > 10) {
      stabilityImpact -= (blackoutDeficit / (current.energyDemand || 1)) * 25;
    }

    if (endStress > 60) {
      stabilityImpact -= (endStress - 60) * 0.25;
    }

    // Natural resilience pull toward 80%
    const recoveryPull = (82 - current.socialStability) * 0.12;
    const endStability = Math.min(100, Math.max(0, current.socialStability + stabilityImpact + recoveryPull));

    causalRecords.push({
      id: `causal-stability-${regionId}-${nextStep}`,
      step: nextStep,
      entityId: regionId,
      targetVariable: 'socialStability',
      previousValue: Number(prev.socialStability.toFixed(1)),
      nextValue: Number(endStability.toFixed(1)),
      delta: Number((endStability - prev.socialStability).toFixed(1)),
      ruleId: 'rule-social-stability',
      ruleName: 'Social Stability Multi-Factor',
      inputs: {
        foodDeficit: Number(foodDeficit.toFixed(1)),
        blackoutDeficit: Number(blackoutDeficit.toFixed(1)),
        stressImpact: Number(endStress.toFixed(1))
      },
      explanation: `${nextRegions[regionId].name} stability changed by ${(endStability - prev.socialStability).toFixed(1)}%. Primary factors: food adequacy (${foodDeficit > 0 ? `-${foodDeficit.toFixed(0)}kt deficit` : 'secure'}), energy grid status, and environmental conditions.`
    });

    current.socialStability = Number(endStability.toFixed(1));

    // --- 5. DEMOGRAPHICS & MIGRATION ---
    const naturalRate = 0.003; // 0.3% natural growth
    const famineMortality = foodDeficit > 0 ? (foodDeficit / (foodDemand || 1)) * 0.02 : 0;
    
    // Migration: people leave unstable regions (<60) and move toward stable ones (>85)
    let netMigration = 0;
    if (current.socialStability < 50) {
      netMigration = -(current.population * 0.015);
    } else if (current.socialStability > 85 && current.jobsAvailable > current.population) {
      netMigration = +(current.population * 0.008);
    }

    const popDelta = current.population * naturalRate - current.population * famineMortality + netMigration;
    const endPopulation = Math.max(10, current.population + popDelta);
    current.population = Number(endPopulation.toFixed(1));
    current.migrationNet = Number(netMigration.toFixed(1));

    // Jobs track stability and population
    current.jobsAvailable = Number(Math.max(10, current.population * (0.95 + (current.socialStability / 100) * 0.15)).toFixed(1));
  }

  // Calculate global aggregate statistics
  let totalStability = 0;
  let totalCarbon = 0;
  const regionList = Object.values(nextRegions);
  for (const r of regionList) {
    totalStability += r.stats.socialStability;
    totalCarbon += r.stats.environmentalStress;
  }
  const globalAverageStability = Number((totalStability / regionList.length).toFixed(1));
  const globalCarbon = Number((totalCarbon / regionList.length).toFixed(1));

  // -------------------------------------------------------------
  // PHASE 4: Emergence Detection Heuristics
  // -------------------------------------------------------------
  for (const r of regionList) {
    // 1. Food security threshold crossing
    if (r.stats.foodStock <= 15 && prevRegions[r.id].stats.foodStock > 15) {
      emergenceAlerts.push({
        id: `emergence-food-depletion-${r.id}-${nextStep}`,
        type: 'RESOURCE_DEPLETION',
        severity: 'critical',
        title: `Food Reserves Depleted: ${r.name}`,
        description: `${r.name} food reserves plunged to ${r.stats.foodStock} kt. Famine risk and civil unrest imminent without immediate emergency transit.`,
        detectedAtStep: nextStep,
        entityId: r.id,
        metric: 'foodStock',
        evidence: [
          { step: nextStep - 1, value: prevRegions[r.id].stats.foodStock },
          { step: nextStep, value: r.stats.foodStock }
        ],
        mitigationRecommendation: 'Boost Agro Plains water yield, subsidize interregional food links, or release national emergency grain stocks.'
      });
    }

    // 2. Social collapse cascade
    if (r.stats.socialStability < 40 && prevRegions[r.id].stats.socialStability >= 40) {
      emergenceAlerts.push({
        id: `emergence-stability-breach-${r.id}-${nextStep}`,
        type: 'SYSTEMIC_CASCADE',
        severity: 'critical',
        title: `Social Instability Crisis in ${r.name}`,
        description: `Social stability breached critical floor at ${r.stats.socialStability}%. Massive outward migration and labor withdrawal detected.`,
        detectedAtStep: nextStep,
        entityId: r.id,
        metric: 'socialStability',
        evidence: [
          { step: nextStep - 1, value: prevRegions[r.id].stats.socialStability },
          { step: nextStep, value: r.stats.socialStability }
        ],
        mitigationRecommendation: 'Guarantee basic food supplies and stabilize regional power grids to halt civic degradation.'
      });
    }

    // 3. Environmental threshold
    if (r.stats.environmentalStress >= 75 && prevRegions[r.id].stats.environmentalStress < 75) {
      emergenceAlerts.push({
        id: `emergence-eco-hazard-${r.id}-${nextStep}`,
        type: 'THRESHOLD_CROSSING',
        severity: 'warning',
        title: `Severe Ecological Stress in ${r.name}`,
        description: `Pollution index reached hazardous level (${r.stats.environmentalStress}/100), increasing health costs and dampening regional agricultural output.`,
        detectedAtStep: nextStep,
        entityId: r.id,
        metric: 'environmentalStress',
        evidence: [
          { step: nextStep - 1, value: prevRegions[r.id].stats.environmentalStress },
          { step: nextStep, value: r.stats.environmentalStress }
        ]
      });
    }
  }

  // 4. Stable equilibrium detection
  if (
    Math.abs(globalAverageStability - currentState.globalAverageStability) < 0.2 &&
    currentState.step >= 12
  ) {
    emergenceAlerts.push({
      id: `emergence-equilibrium-${nextStep}`,
      type: 'STABLE_EQUILIBRIUM',
      severity: 'info',
      title: 'Persistent Systemic Dynamic Equilibrium',
      description: `Cross-regional stocks and consumption rates have aligned into a self-stabilizing cycle at ~${globalAverageStability}% stability.`,
      detectedAtStep: nextStep,
      metric: 'globalAverageStability',
      evidence: [
        { step: currentState.step, value: currentState.globalAverageStability },
        { step: nextStep, value: globalAverageStability }
      ]
    });
  }

  const nextState: WorldState = {
    step: nextStep,
    monthName: getMonthLabel(nextStep),
    regions: nextRegions,
    links: nextLinks,
    globalCarbon,
    globalAverageStability,
    seed: currentState.seed
  };

  return { nextState, causalRecords, emergenceAlerts };
}

/**
 * Creates the default initial Scenario with step 0 baseline.
 */
export function createDefaultBaselineScenario(): ScenarioBranch {
  const initialWorld = createDefaultWorld(42);
  const initialSnapshot: SimulationSnapshot = {
    step: 0,
    timestamp: Date.now(),
    state: initialWorld,
    causalRecords: [],
    emergenceAlerts: []
  };

  return {
    id: 'scenario-baseline',
    name: 'Scenario A: Baseline Regional Trajectory',
    description: 'Initial balanced conditions across Capital, Agro, Mineral, and Coastal regions with standard seasonal harvest yields.',
    color: '#06B6D4', // Cyan
    parentScenarioId: null,
    forkStep: 0,
    createdAt: Date.now(),
    checkpoints: [
      {
        id: 'checkpoint-genesis',
        step: 0,
        name: 'Genesis Baseline',
        note: 'Starting calibrated state of all 4 regions.',
        createdAt: Date.now(),
        snapshot: initialSnapshot
      }
    ],
    parameterOverrides: {},
    history: [initialSnapshot]
  };
}
