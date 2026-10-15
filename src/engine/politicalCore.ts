/**
 * AFTERWORLD — Political, Economic & Societal Simulation Engine
 * Phase-separated deterministic updates, legislative dynamics, crisis escalation, and persistence.
 */

import {
  ActiveCrisis,
  BuildingEntity,
  CabinetMinistry,
  CrisisDecisionOption,
  District,
  LawBill,
  PoliticalParty,
  PopulationStrata,
  SimulationState
} from '../types/politicalSimulation';

export function createInitialPoliticalState(): SimulationState {
  const districts: Record<string, District> = {
    civic: {
      id: 'civic',
      name: 'Independence Plaza & Civic Core',
      description: 'The monumental heart of the Republic. Houses the Parliament, Supreme Court, and National Bank around a grand stone plaza.',
      color: '#38BDF8',
      cameraFocus: [0, 5, 0],
      unrestLevel: 22,
      economicOutput: 85,
      pollution: 15
    },
    industrial: {
      id: 'industrial',
      name: 'Ironworks Foundry Belt',
      description: 'The industrial backbone of Veridia. Heavy metallurgy, smelting furnaces, and rail freight yards.',
      color: '#FB923C',
      cameraFocus: [-35, 4, -10],
      unrestLevel: 68,
      economicOutput: 140,
      pollution: 74
    },
    residential: {
      id: 'residential',
      name: "Workers' Quarter & Old Town",
      description: 'High-density brick tenements, apartment blocks, corner clinics, and bustling street markets.',
      color: '#4ADE80',
      cameraFocus: [30, 4, 25],
      unrestLevel: 45,
      economicOutput: 45,
      pollution: 32
    },
    harbor: {
      id: 'harbor',
      name: 'Financial Harbor & Maritime Docks',
      description: 'Commercial skyscrapers, banking towers, maritime container docks, and ocean freight logistics.',
      color: '#818CF8',
      cameraFocus: [25, 4, -30],
      unrestLevel: 18,
      economicOutput: 195,
      pollution: 28
    }
  };

  const buildings: Record<string, BuildingEntity> = {
    // Civic Core
    parliament: {
      id: 'parliament',
      name: 'National Parliament of Veridia',
      type: 'PARLIAMENT',
      districtId: 'civic',
      position: [0, 0, -8],
      dimensions: [14, 10, 10],
      jobs: 450,
      occupancy: 200,
      operatingStatus: 'NORMAL',
      monthlyOutput: 10,
      workerDissatisfaction: 15,
      description: 'The sovereign legislative assembly where 200 deputies debate national laws and hold the cabinet accountable.'
    },
    plaza: {
      id: 'plaza',
      name: 'Independence Assembly Plaza',
      type: 'PLAZA',
      districtId: 'civic',
      position: [0, 0, 8],
      dimensions: [20, 1, 16],
      jobs: 20,
      occupancy: 1200,
      operatingStatus: 'NORMAL',
      monthlyOutput: 0,
      workerDissatisfaction: 55,
      description: 'Grand public square facing Parliament. Epicenter for national rallies, public celebrations, and political strikes.'
    },
    ministry_finance: {
      id: 'ministry_finance',
      name: 'Ministry of Finance & Treasury',
      type: 'MINISTRY',
      districtId: 'civic',
      position: [-16, 0, -5],
      dimensions: [8, 8, 8],
      jobs: 800,
      occupancy: 650,
      operatingStatus: 'NORMAL',
      monthlyOutput: 25,
      workerDissatisfaction: 20,
      description: 'Oversees tax collections, national budget disbursements, and macroeconomic stability.'
    },
    ministry_interior: {
      id: 'ministry_interior',
      name: 'Ministry of Interior & Police Command',
      type: 'MINISTRY',
      districtId: 'civic',
      position: [16, 0, -5],
      dimensions: [8, 8, 8],
      jobs: 1200,
      occupancy: 950,
      operatingStatus: 'NORMAL',
      monthlyOutput: 15,
      workerDissatisfaction: 25,
      description: 'Directs the civil police, emergency management, and public order units.'
    },

    // Industrial Foundry Belt
    foundry_alpha: {
      id: 'foundry_alpha',
      name: 'Veridia Heavy Foundry No. 1',
      type: 'FOUNDRY',
      districtId: 'industrial',
      position: [-35, 0, -12],
      dimensions: [16, 12, 14],
      jobs: 4200,
      occupancy: 1800,
      operatingStatus: 'ON_STRIKE',
      monthlyOutput: 45,
      workerDissatisfaction: 82,
      description: 'Massive blast furnace and rolling mill. Currently halted by worker pickets demanding wage guarantees against inflation.'
    },
    foundry_beta: {
      id: 'foundry_beta',
      name: 'Vulcan Steel & Rail Yard',
      type: 'FOUNDRY',
      districtId: 'industrial',
      position: [-48, 0, 5],
      dimensions: [18, 9, 12],
      jobs: 3100,
      occupancy: 2900,
      operatingStatus: 'NORMAL',
      monthlyOutput: 65,
      workerDissatisfaction: 64,
      description: 'Produces high-grade rail steel and machinery. Operating under tense labor conditions.'
    },
    industrial_warehouse: {
      id: 'industrial_warehouse',
      name: 'State Strategic Reserves Depot',
      type: 'WAREHOUSE',
      districtId: 'industrial',
      position: [-28, 0, 10],
      dimensions: [12, 6, 10],
      jobs: 350,
      occupancy: 300,
      operatingStatus: 'NORMAL',
      monthlyOutput: 20,
      workerDissatisfaction: 35,
      description: 'Stores emergency grain supplies, machine components, and fuel reserves.'
    },

    // Residential & Tenements
    tenement_block_a: {
      id: 'tenement_block_a',
      name: 'Brickworks Tenements Complex',
      type: 'TENEMENT',
      districtId: 'residential',
      position: [28, 0, 18],
      dimensions: [14, 11, 10],
      jobs: 120,
      occupancy: 4500,
      operatingStatus: 'NORMAL',
      monthlyOutput: 12,
      workerDissatisfaction: 52,
      description: 'Densely populated residential neighborhood for foundry workers and transport laborers.'
    },
    tenement_block_b: {
      id: 'tenement_block_b',
      name: 'Old Town Heritage Apartments',
      type: 'TENEMENT',
      districtId: 'residential',
      position: [42, 0, 26],
      dimensions: [12, 8, 12],
      jobs: 80,
      occupancy: 3200,
      operatingStatus: 'NORMAL',
      monthlyOutput: 8,
      workerDissatisfaction: 38,
      description: 'Historic district housing artisans, teachers, and small shopkeepers.'
    },
    city_hospital: {
      id: 'city_hospital',
      name: 'Central General Hospital',
      type: 'HOSPITAL',
      districtId: 'residential',
      position: [22, 0, 34],
      dimensions: [12, 9, 10],
      jobs: 1400,
      occupancy: 800,
      operatingStatus: 'OVERLOADED',
      monthlyOutput: 18,
      workerDissatisfaction: 48,
      description: 'Public health facility strained by industrial smog casualties and winter respiratory cases.'
    },

    // Financial Harbor
    commercial_bank: {
      id: 'commercial_bank',
      name: 'Republic Commercial Bank Tower',
      type: 'BANK',
      districtId: 'harbor',
      position: [22, 0, -25],
      dimensions: [10, 20, 10],
      jobs: 2200,
      occupancy: 1900,
      operatingStatus: 'NORMAL',
      monthlyOutput: 95,
      workerDissatisfaction: 18,
      description: 'Financial skyscraper managing commercial credit, corporate investments, and international bonds.'
    },
    maritime_docks: {
      id: 'maritime_docks',
      name: 'Deepwater Container Terminal',
      type: 'DOCKS',
      districtId: 'harbor',
      position: [38, 0, -32],
      dimensions: [20, 7, 16],
      jobs: 1800,
      occupancy: 1600,
      operatingStatus: 'NORMAL',
      monthlyOutput: 80,
      workerDissatisfaction: 34,
      description: 'Primary sea freight gate exporting processed steel and importing agricultural grain.'
    }
  };

  const strata: Record<string, PopulationStrata> = {
    labor: {
      id: 'labor',
      name: 'Industrial & Trade Laborers',
      headcount: 380,
      unemploymentRate: 11.4,
      monthlyIncome: 1450,
      approval: 42,
      strikePropensity: 76,
      keyDemand: 'Halt foundry layoffs & guarantee purchasing power against inflation.',
      preferredPartyId: 'sdu'
    },
    middle: {
      id: 'middle',
      name: 'Public Servants & Professionals',
      headcount: 240,
      unemploymentRate: 4.8,
      monthlyIncome: 2400,
      approval: 56,
      strikePropensity: 28,
      keyDemand: 'Stable healthcare funding and currency integrity.',
      preferredPartyId: 'fmc'
    },
    business: {
      id: 'business',
      name: 'Commercial Merchants & Capitalists',
      headcount: 85,
      unemploymentRate: 1.8,
      monthlyIncome: 5800,
      approval: 64,
      strikePropensity: 8,
      keyDemand: 'Corporate tax relief and protection of private contract rights.',
      preferredPartyId: 'fmc'
    },
    youth: {
      id: 'youth',
      name: 'Youth, Students & Jobseekers',
      headcount: 145,
      unemploymentRate: 18.2,
      monthlyIncome: 950,
      approval: 36,
      strikePropensity: 65,
      keyDemand: 'Green transition jobs, affordable housing, and democratic reform.',
      preferredPartyId: 'grn'
    }
  };

  const parties: Record<string, PoliticalParty> = {
    sdu: {
      id: 'sdu',
      name: 'Social Democratic Union',
      acronym: 'SDU',
      ideology: 'Democratic Socialism / Trade Unionism',
      color: '#EF4444', // Red
      seats: 68,
      inCoalition: true,
      loyalty: 65,
      stances: {
        welfare: 0.85,
        businessTaxes: 0.75,
        securityPolice: -0.4,
        ecologicalTransition: 0.45
      }
    },
    fmc: {
      id: 'fmc',
      name: 'Free Market Coalition',
      acronym: 'FMC',
      ideology: 'Fiscal Conservatism / Liberal Commerce',
      color: '#3B82F6', // Blue
      seats: 64,
      inCoalition: true,
      loyalty: 72,
      stances: {
        welfare: -0.65,
        businessTaxes: -0.80,
        securityPolice: 0.60,
        ecologicalTransition: -0.30
      }
    },
    sov: {
      id: 'sov',
      name: 'Sovereign National Front',
      acronym: 'SOV',
      ideology: 'National Conservatism / Protectionism',
      color: '#F59E0B', // Amber
      seats: 44,
      inCoalition: false,
      loyalty: 25,
      stances: {
        welfare: 0.20,
        businessTaxes: 0.10,
        securityPolice: 0.90,
        ecologicalTransition: -0.75
      }
    },
    grn: {
      id: 'grn',
      name: 'Green Ecology Alliance',
      acronym: 'GRN',
      ideology: 'Ecological Progressivism',
      color: '#10B981', // Green
      seats: 24,
      inCoalition: false,
      loyalty: 35,
      stances: {
        welfare: 0.60,
        businessTaxes: 0.50,
        securityPolice: -0.60,
        ecologicalTransition: 0.95
      }
    }
  };

  const cabinet: Record<string, CabinetMinistry> = {
    economy: {
      id: 'economy',
      title: 'Minister of Finance & Treasury',
      ministerName: 'Helena Vane',
      partyId: 'fmc',
      competence: 82,
      loyalty: 78
    },
    labor: {
      id: 'labor',
      title: 'Minister of Labor & Social Cohesion',
      ministerName: 'Viktor Kroll',
      partyId: 'sdu',
      competence: 76,
      loyalty: 68
    },
    interior: {
      id: 'interior',
      title: 'Minister of the Interior & Order',
      ministerName: 'General Marcus Thorne',
      partyId: 'fmc',
      competence: 84,
      loyalty: 74
    },
    environment: {
      id: 'environment',
      title: 'Minister of Energy & Environment',
      ministerName: 'Elena Rostova',
      partyId: 'sdu',
      competence: 71,
      loyalty: 62
    }
  };

  const laws: LawBill[] = [
    {
      id: 'law-min-wage',
      name: 'Fair Wage & Cost-of-Living Indexing Act',
      category: 'LABOR',
      description: 'Increases minimum industrial wages by 12% and pegs baseline compensation to food inflation.',
      enacted: false,
      proposed: false,
      supportEstimate: 112, // Needs 101 to pass
      costPerMonth: 6,
      revenueEffect: 0,
      laborApprovalDelta: +14,
      businessApprovalDelta: -12,
      inflationDelta: +0.6
    },
    {
      id: 'law-corp-tax-relief',
      name: 'Industrial Competitiveness Tax Credit',
      category: 'FISCAL',
      description: 'Reduces corporate tax from 24% to 18% for manufacturing facilities that reinvest in domestic machinery.',
      enacted: false,
      proposed: false,
      supportEstimate: 104,
      costPerMonth: 8,
      revenueEffect: -8,
      laborApprovalDelta: -8,
      businessApprovalDelta: +18,
      inflationDelta: -0.3
    },
    {
      id: 'law-emergency-police',
      name: 'Critical Infrastructure Protection Decree',
      category: 'SECURITY',
      description: 'Authorizes riot police to clear sit-ins on rail lines and ports without prior judicial injunction.',
      enacted: false,
      proposed: false,
      supportEstimate: 98,
      costPerMonth: 3,
      revenueEffect: 0,
      laborApprovalDelta: -16,
      businessApprovalDelta: +10,
      inflationDelta: 0
    },
    {
      id: 'law-clean-transition',
      name: 'Smokestack Scrubbing & Clean Air Mandate',
      category: 'ECOLOGY',
      description: 'Mandates catalytic scrubbers on foundry furnaces within 18 months, subsidizing 40% of conversion costs.',
      enacted: false,
      proposed: false,
      supportEstimate: 108,
      costPerMonth: 5,
      revenueEffect: 0,
      laborApprovalDelta: +4,
      businessApprovalDelta: -6,
      inflationDelta: +0.2
    }
  ];

  const initialCrisis: ActiveCrisis = {
    id: 'crisis-foundry-strike',
    title: 'The Great Foundry Layoff Crisis',
    severity: 'EMERGENCY',
    districtId: 'industrial',
    buildingId: 'foundry_alpha',
    description: 'Veridia Heavy Foundry No. 1 has locked out 4,200 steelworkers and announced massive layoffs. Striking workers have seized the gates and are mobilizing a protest march toward Independence Plaza. Cabinet is deadlocked.',
    crowdSize: 3800,
    occurredAtDay: 1,
    resolved: false,
    options: [
      {
        id: 'opt-state-bailout',
        label: 'Approve Emergency State Bridge Loan ($15M)',
        description: 'Underwrite foundry payroll directly from national reserves to prevent layoffs and resume steel production immediately.',
        cost: 15,
        effects: {
          strikeResolves: true,
          approvalDelta: +8,
          laborSatisfactionDelta: +16,
          businessSatisfactionDelta: -4,
          coalitionLoyaltyDelta: +5,
          unrestDelta: -25
        },
        narrativeOutcome: 'The Treasury disburses $15M in bridge loans. Workers cheer the announcement, dismantle picket barricades, and blast furnaces reignite.'
      },
      {
        id: 'opt-tripartite-compromise',
        label: 'Broker Tripartite Wage & Severance Accord',
        description: 'Convene union bosses and plant executives. Guarantee 60% severance with state retraining vouchers, averting general strike.',
        cost: 6,
        effects: {
          strikeResolves: true,
          approvalDelta: +3,
          laborSatisfactionDelta: +4,
          businessSatisfactionDelta: +2,
          coalitionLoyaltyDelta: +2,
          unrestDelta: -12
        },
        narrativeOutcome: 'After 18 hours of tense negotiations, union leaders accept the retraining accord. Work resumes at partial capacity.'
      },
      {
        id: 'opt-police-clear',
        label: 'Deploy Gendarmerie to Disperse Picketers',
        description: 'Send riot squads to break the illegal gate blockade and enforce contract law. Protect company property with batons and water cannons.',
        cost: 2,
        effects: {
          strikeResolves: false,
          approvalDelta: -14,
          laborSatisfactionDelta: -28,
          businessSatisfactionDelta: +12,
          coalitionLoyaltyDelta: -18,
          unrestDelta: +35
        },
        narrativeOutcome: 'Violent clashes erupt at the foundry gates. Tear gas wafts into nearby tenements. The SDU threatens to exit the governing coalition in protest.'
      }
    ]
  };

  return {
    version: 2,
    day: 1,
    month: 1,
    year: 1,
    treasury: 142, // $142 Million initial reserves
    gdp: 2450,
    inflationRate: 5.4, // %
    taxRates: {
      corporate: 24,
      income: 22,
      vat: 15
    },
    spending: {
      welfare: 22,
      policing: 14,
      healthcare: 18,
      subsidies: 12
    },
    overallApproval: 48,
    districts,
    buildings,
    strata,
    parties,
    cabinet,
    laws,
    crises: [initialCrisis],
    causalRecords: [
      {
        id: 'causal-init-1',
        day: 1,
        domain: 'CRISIS',
        variable: 'operatingStatus',
        previousValue: 1,
        nextValue: 0,
        delta: -1,
        cause: 'Global scrap steel price drop',
        explanation: 'Veridia Heavy Foundry No. 1 locked out 4,200 steelworkers, triggering wildcat strike.',
        affectedDistrictId: 'industrial'
      }
    ],
    historyLog: [
      {
        day: 1,
        message: 'Cabinet assumed executive power in Independence Plaza. Veridia Republic enters the fiscal year with rising industrial tensions.',
        type: 'POLICY'
      },
      {
        day: 1,
        message: 'Crisis Declared: Veridia Foundry No. 1 halted by wildcat strike over pending mass layoffs.',
        type: 'CRISIS'
      }
    ],
    isGameOver: false
  };
}

/**
 * Deterministic Simulation Advance Step
 * Runs political, fiscal, societal, and crisis escalation mechanics.
 */
export function advancePoliticalSimulation(prev: SimulationState): SimulationState {
  if (prev.isGameOver) return prev;

  const next: SimulationState = JSON.parse(JSON.stringify(prev));
  next.day += 1;

  if (next.day > 30) {
    next.day = 1;
    next.month += 1;
    if (next.month > 12) {
      next.month = 1;
      next.year += 1;
    }
  }

  // -------------------------------------------------------------
  // 1. MACRO ECONOMIC ENGINE
  // -------------------------------------------------------------
  // Enacted laws budget effects
  let lawMonthlyCosts = 0;
  let lawMonthlyRevenue = 0;
  for (const law of next.laws) {
    if (law.enacted) {
      lawMonthlyCosts += law.costPerMonth;
      lawMonthlyRevenue += law.revenueEffect;
    }
  }

  // Calculate total monthly revenues
  const totalTaxRevenueMonthly =
    (next.gdp * 0.08 * (next.taxRates.income / 20)) +
    (next.gdp * 0.05 * (next.taxRates.corporate / 20)) +
    (next.gdp * 0.04 * (next.taxRates.vat / 15)) +
    lawMonthlyRevenue;

  // Daily budget flow
  const dailyRevenue = totalTaxRevenueMonthly / 30;
  const totalMonthlySpending =
    next.spending.welfare +
    next.spending.policing +
    next.spending.healthcare +
    next.spending.subsidies +
    lawMonthlyCosts;
  const dailySpending = totalMonthlySpending / 30;

  next.treasury = Number((next.treasury + dailyRevenue - dailySpending).toFixed(2));

  // Economic shocks from strikes
  let strikeLoss = 0;
  for (const b of Object.values(next.buildings)) {
    if (b.operatingStatus === 'ON_STRIKE') {
      strikeLoss += 1.2;
    }
  }
  next.gdp = Math.max(800, Number((next.gdp - strikeLoss * 0.1).toFixed(1)));

  // Inflation response to spending vs revenue
  const fiscalDeficitRatio = (dailySpending - dailyRevenue) / (dailyRevenue || 1);
  if (fiscalDeficitRatio > 0.2) {
    next.inflationRate = Math.min(25, Number((next.inflationRate + 0.04).toFixed(2)));
  } else if (fiscalDeficitRatio < -0.1) {
    next.inflationRate = Math.max(1.5, Number((next.inflationRate - 0.02).toFixed(2)));
  }

  // -------------------------------------------------------------
  // 2. SOCIETAL STRATA & PUBLIC OPINION
  // -------------------------------------------------------------
  // Laborers react to inflation, foundry status, and welfare
  const labor = next.strata.labor;
  let laborDelta = 0;
  if (next.inflationRate > 7) laborDelta -= 0.3;
  if (next.spending.welfare >= 25) laborDelta += 0.2;
  if (next.buildings.foundry_alpha.operatingStatus === 'ON_STRIKE') laborDelta -= 0.2;
  labor.approval = Math.min(100, Math.max(5, Number((labor.approval + laborDelta).toFixed(1))));

  // Business owners react to corporate taxes & police order
  const business = next.strata.business;
  let bizDelta = 0;
  if (next.taxRates.corporate > 25) bizDelta -= 0.3;
  if (next.spending.policing >= 16) bizDelta += 0.2;
  business.approval = Math.min(100, Math.max(5, Number((business.approval + bizDelta).toFixed(1))));

  // Middle class & Youth
  const middle = next.strata.middle;
  middle.approval = Math.min(100, Math.max(5, Number((middle.approval + (next.inflationRate > 6 ? -0.15 : 0.1)).toFixed(1))));

  const youth = next.strata.youth;
  youth.approval = Math.min(100, Math.max(5, Number((youth.approval + (next.districts.industrial.pollution > 60 ? -0.2 : 0.05)).toFixed(1))));

  // Calculate Weighted National Approval
  const totalPop = labor.headcount + middle.headcount + business.headcount + youth.headcount;
  const weightedApproval =
    (labor.approval * labor.headcount +
      middle.approval * middle.headcount +
      business.approval * business.headcount +
      youth.approval * youth.headcount) / totalPop;

  next.overallApproval = Number(weightedApproval.toFixed(1));

  // -------------------------------------------------------------
  // 3. PARLIAMENTARY COALITION STABILITY
  // -------------------------------------------------------------
  // SDU loyalty tracks labor approval
  next.parties.sdu.loyalty = Math.min(100, Math.max(0, Number((labor.approval * 1.1).toFixed(0))));
  // FMC loyalty tracks business & treasury health
  next.parties.fmc.loyalty = Math.min(100, Math.max(0, Number((business.approval * 0.8 + (next.treasury > 50 ? 20 : 0)).toFixed(0))));

  // Check Coalition Collapse condition
  if (next.parties.sdu.loyalty < 25 && next.parties.sdu.inCoalition) {
    next.parties.sdu.inCoalition = false;
    next.historyLog.push({
      day: next.day,
      message: 'POLITICAL EARTHQUAKE: The Social Democratic Union (SDU) withdraws from cabinet! The government has lost its parliamentary majority (down to 64/200 seats).',
      type: 'POLICY'
    });
    next.causalRecords = next.causalRecords || [];
    next.causalRecords.push({
      id: `causal-sdu-exit-${Date.now()}`,
      day: next.day,
      domain: 'POLITICAL',
      variable: 'coalitionSeats',
      previousValue: 132,
      nextValue: 64,
      delta: -68,
      cause: 'SDU Parliamentary Exit',
      explanation: 'Labor satisfaction fell below 25%, causing SDU deputies to walk out of the governing coalition.'
    });
  }

  // -------------------------------------------------------------
  // 4. DISTRICT UNREST & CROWD ESCALATION
  // -------------------------------------------------------------
  // Industrial unrest
  const activeStrikes = Object.values(next.buildings).filter(b => b.operatingStatus === 'ON_STRIKE').length;
  next.districts.industrial.unrestLevel = Math.min(100, Math.max(5,
    Math.round(100 - labor.approval + (activeStrikes * 15))
  ));

  // Civic plaza unrest
  next.districts.civic.unrestLevel = Math.min(100, Math.max(5,
    Math.round((100 - next.overallApproval) * 0.7)
  ));

  // -------------------------------------------------------------
  // 5. EMERGENT CRISIS GENERATION
  // -------------------------------------------------------------
  // Crisis: Bread & Food Inflation Riots
  const hasBreadCrisis = next.crises.some(c => c.id === 'crisis-bread-inflation');
  if (!hasBreadCrisis && next.inflationRate >= 7.5 && next.day % 10 === 0) {
    next.crises.push({
      id: 'crisis-bread-inflation',
      title: 'Food Price Spike & Tenement Food Riots',
      severity: 'HIGH',
      districtId: 'residential',
      buildingId: 'tenement_block_a',
      description: 'Grain prices surged by 28% this month due to freight bottlenecks at the maritime docks. Families in the Workers’ Tenements are ransacking bakery wagons and forming protest blockades.',
      crowdSize: 2200,
      occurredAtDay: next.day,
      resolved: false,
      options: [
        {
          id: 'opt-bread-subsidies',
          label: 'Release National Grain Reserves & Subsidize Bakeries',
          description: 'Empty strategic warehouses and cap bread prices at 2.50 credits/loaf.',
          cost: 8,
          effects: {
            approvalDelta: +6,
            laborSatisfactionDelta: +12,
            inflationDelta: -0.8,
            unrestDelta: -20
          },
          narrativeOutcome: 'Grain wagons guarded by civil service staff distribute subsidized flour. Tension in the tenement courtyards subsides.'
        },
        {
          id: 'opt-price-controls',
          label: 'Impose Mandatory Retail Price Ceilings',
          description: 'Enact emergency price caps by executive decree without subsidies.',
          cost: 1,
          effects: {
            approvalDelta: -2,
            businessSatisfactionDelta: -16,
            inflationDelta: +0.4,
            unrestDelta: -5
          },
          narrativeOutcome: 'Shopkeepers hoard stock under the counter, creating long queues and black-market bread trading.'
        }
      ]
    });

    next.historyLog.push({
      day: next.day,
      message: 'CRISIS ALERT: Food price inflation has triggered street demonstrations in the Workers’ Quarter!',
      type: 'CRISIS'
    });
  }

  // Crisis: Environmental Chemical Leak in Harbor
  const hasHarborCrisis = next.crises.some(c => c.id === 'crisis-harbor-spill');
  if (!hasHarborCrisis && next.day === 18) {
    next.crises.push({
      id: 'crisis-harbor-spill',
      title: 'Industrial Runoff Contamination in Marina',
      severity: 'MEDIUM',
      districtId: 'harbor',
      buildingId: 'maritime_docks',
      description: 'An aging holding tank near the Deepwater Terminal fractured, dumping chemical sludge into coastal fishing waters. Green Alliance deputies demand an immediate cleanup and factory sanctions.',
      crowdSize: 1100,
      occurredAtDay: next.day,
      resolved: false,
      options: [
        {
          id: 'opt-cleanup-fund',
          label: 'Fund Comprehensive Emergency Ecological Cleanup ($10M)',
          description: 'Dispatch marine booms and compensate local coastal fishermen.',
          cost: 10,
          effects: {
            approvalDelta: +4,
            coalitionLoyaltyDelta: +8,
            unrestDelta: -10
          },
          narrativeOutcome: 'Containment teams neutralize the plume. Green Alliance commends the rapid government intervention.'
        },
        {
          id: 'opt-fine-industry',
          label: 'Levy Heavy Fine on Shippers & Defer State Spending',
          description: 'Make the private transport conglomerate pay 100% of remediation costs.',
          cost: 0,
          effects: {
            approvalDelta: +1,
            businessSatisfactionDelta: -10,
            unrestDelta: 0
          },
          narrativeOutcome: 'Shippers threaten a port slowdown, delaying grain imports for two weeks.'
        }
      ]
    });

    next.historyLog.push({
      day: next.day,
      message: 'CRISIS ALERT: Maritime chemical leak reported near Deepwater Docks!',
      type: 'CRISIS'
    });
  }

  // -------------------------------------------------------------
  // 6. GAME OVER CHECK
  // -------------------------------------------------------------
  if (next.treasury <= -40) {
    next.isGameOver = true;
    next.gameOverReason = 'NATIONAL SOVEREIGN BANKRUPTCY: The Treasury has exhausted all emergency credit lines. The Central Bank has halted bond trading and international receivership is declared.';
    next.historyLog.push({
      day: next.day,
      message: next.gameOverReason,
      type: 'POLICY'
    });
  } else if (next.overallApproval <= 15 && next.districts.civic.unrestLevel >= 90) {
    next.isGameOver = true;
    next.gameOverReason = 'GOVERNMENT RESIGNATION & GENERAL STRIKE: Over 100,000 citizens stormed Independence Plaza, paralyzing Parliament. The President dissolved the cabinet and scheduled emergency general elections.';
    next.historyLog.push({
      day: next.day,
      message: next.gameOverReason,
      type: 'CRISIS'
    });
  }

  return next;
}

/**
 * Execute player crisis decision
 */
export function resolveCrisisDecision(
  state: SimulationState,
  crisisId: string,
  optionId: string
): SimulationState {
  const next: SimulationState = JSON.parse(JSON.stringify(state));
  const crisis = next.crises.find(c => c.id === crisisId);
  if (!crisis || crisis.resolved) return state;

  const option = crisis.options.find(o => o.id === optionId);
  if (!option) return state;

  // Deduct cost
  next.treasury = Number((next.treasury - option.cost).toFixed(2));

  // Apply narrative effects
  if (option.effects.approvalDelta) {
    next.overallApproval = Math.min(100, Math.max(5, next.overallApproval + option.effects.approvalDelta));
  }
  if (option.effects.laborSatisfactionDelta) {
    next.strata.labor.approval = Math.min(100, Math.max(5, next.strata.labor.approval + option.effects.laborSatisfactionDelta));
  }
  if (option.effects.businessSatisfactionDelta) {
    next.strata.business.approval = Math.min(100, Math.max(5, next.strata.business.approval + option.effects.businessSatisfactionDelta));
  }
  if (option.effects.inflationDelta) {
    next.inflationRate = Math.max(1, next.inflationRate + option.effects.inflationDelta);
  }

  // If strike resolves, resume factory operation
  if (option.effects.strikeResolves && crisis.buildingId && next.buildings[crisis.buildingId]) {
    next.buildings[crisis.buildingId].operatingStatus = 'NORMAL';
    next.buildings[crisis.buildingId].workerDissatisfaction = Math.max(20, next.buildings[crisis.buildingId].workerDissatisfaction - 40);
  }

  // Reduce district unrest
  if (option.effects.unrestDelta) {
    const dist = next.districts[crisis.districtId];
    if (dist) {
      dist.unrestLevel = Math.min(100, Math.max(5, dist.unrestLevel + option.effects.unrestDelta));
    }
  }

  // Mark resolved
  crisis.resolved = true;
  crisis.resolutionNote = `${option.label}: ${option.narrativeOutcome}`;

  next.historyLog.push({
    day: next.day,
    message: `DECISION EXECUTED [${crisis.title}]: ${option.label}. ${option.narrativeOutcome}`,
    type: 'CRISIS'
  });

  // Log causal record
  next.causalRecords = next.causalRecords || [];
  next.causalRecords.push({
    id: `causal-crisis-${Date.now()}`,
    day: next.day,
    domain: 'CRISIS',
    variable: 'unrestLevel',
    previousValue: state.districts[crisis.districtId]?.unrestLevel ?? 50,
    nextValue: next.districts[crisis.districtId]?.unrestLevel ?? 50,
    delta: option.effects.unrestDelta ?? 0,
    cause: `Executive Crisis Resolution: ${option.label}`,
    explanation: option.narrativeOutcome,
    affectedDistrictId: crisis.districtId
  });

  return next;
}

/**
 * Toggle enactment of legislative law bill in Parliament
 */
export function toggleLawBill(state: SimulationState, billId: string): SimulationState {
  const next: SimulationState = JSON.parse(JSON.stringify(state));
  const bill = next.laws.find(l => l.id === billId);
  if (!bill) return state;

  next.causalRecords = next.causalRecords || [];

  // Calculate current coalition vote support
  let votingSeats = 0;
  for (const party of Object.values(next.parties)) {
    let score = 0;
    if (bill.category === 'LABOR') score = party.stances.welfare;
    if (bill.category === 'FISCAL') score = -party.stances.businessTaxes;
    if (bill.category === 'SECURITY') score = party.stances.securityPolice;
    if (bill.category === 'ECOLOGY') score = party.stances.ecologicalTransition;

    if (score > 0.1 || (party.inCoalition && party.loyalty > 50)) {
      votingSeats += party.seats;
    }
  }

  if (!bill.enacted) {
    // Attempt to pass
    if (votingSeats >= 101) {
      bill.enacted = true;
      next.strata.labor.approval = Math.min(100, Math.max(0, next.strata.labor.approval + bill.laborApprovalDelta));
      next.strata.business.approval = Math.min(100, Math.max(0, next.strata.business.approval + bill.businessApprovalDelta));
      next.inflationRate = Math.max(1, Number((next.inflationRate + bill.inflationDelta).toFixed(2)));

      next.causalRecords.push({
        id: `causal-bill-${bill.id}-${Date.now()}`,
        day: next.day,
        domain: 'POLITICAL',
        variable: 'laborApproval',
        previousValue: state.strata.labor.approval,
        nextValue: next.strata.labor.approval,
        delta: bill.laborApprovalDelta,
        cause: `Enactment of [${bill.name}]`,
        explanation: `Bill passed with ${votingSeats}/200 parliamentary votes. Labor sentiment shifted by ${bill.laborApprovalDelta}%.`
      });

      next.historyLog.push({
        day: next.day,
        message: `PARLIAMENTARY ACT PASSED: "${bill.name}" passed with ${votingSeats}/200 deputy votes.`,
        type: 'POLICY'
      });
    } else {
      next.historyLog.push({
        day: next.day,
        message: `BILL DEFEATED: "${bill.name}" failed to achieve majority (received only ${votingSeats}/200 votes).`,
        type: 'POLICY'
      });
    }
  } else {
    // Repeal
    bill.enacted = false;
    next.strata.labor.approval = Math.min(100, Math.max(0, next.strata.labor.approval - bill.laborApprovalDelta));
    next.strata.business.approval = Math.min(100, Math.max(0, next.strata.business.approval - bill.businessApprovalDelta));
    next.inflationRate = Math.max(1, Number((next.inflationRate - bill.inflationDelta).toFixed(2)));

    next.causalRecords.push({
      id: `causal-repeal-${bill.id}-${Date.now()}`,
      day: next.day,
      domain: 'POLITICAL',
      variable: 'laborApproval',
      previousValue: state.strata.labor.approval,
      nextValue: next.strata.labor.approval,
      delta: -bill.laborApprovalDelta,
      cause: `Repeal of [${bill.name}]`,
      explanation: `Law repealed by parliamentary vote. Labor sentiment reverted by ${-bill.laborApprovalDelta}%.`
    });

    next.historyLog.push({
      day: next.day,
      message: `LAW REPEALED: "${bill.name}" has been revoked by parliamentary vote.`,
      type: 'POLICY'
    });
  }

  return next;
}

/**
 * Mutate tax rates with causal record tracing
 */
export function updateTaxRate(
  state: SimulationState,
  taxKey: 'corporate' | 'income' | 'vat',
  value: number
): SimulationState {
  const next: SimulationState = JSON.parse(JSON.stringify(state));
  const prevVal = next.taxRates[taxKey];
  next.taxRates[taxKey] = value;
  next.causalRecords = next.causalRecords || [];

  next.causalRecords.push({
    id: `causal-tax-${taxKey}-${Date.now()}`,
    day: next.day,
    domain: 'FISCAL',
    variable: `tax_${taxKey}`,
    previousValue: prevVal,
    nextValue: value,
    delta: value - prevVal,
    cause: `Cabinet Decree on ${taxKey.toUpperCase()} Tax`,
    explanation: `${taxKey.toUpperCase()} tax adjusted from ${prevVal}% to ${value}%, changing daily revenue baseline.`
  });

  return next;
}

/**
 * Mutate discretionary public spending with causal record tracing
 */
export function updateSpending(
  state: SimulationState,
  spendKey: 'welfare' | 'policing' | 'healthcare' | 'subsidies',
  value: number
): SimulationState {
  const next: SimulationState = JSON.parse(JSON.stringify(state));
  const prevVal = next.spending[spendKey];
  next.spending[spendKey] = value;
  next.causalRecords = next.causalRecords || [];

  next.causalRecords.push({
    id: `causal-spend-${spendKey}-${Date.now()}`,
    day: next.day,
    domain: 'FISCAL',
    variable: `spend_${spendKey}`,
    previousValue: prevVal,
    nextValue: value,
    delta: value - prevVal,
    cause: `Budget Allocation: ${spendKey.toUpperCase()}`,
    explanation: `${spendKey.toUpperCase()} monthly spending adjusted from $${prevVal}M to $${value}M.`
  });

  return next;
}
