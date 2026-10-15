/**
 * AFTERWORLD — Causal Tracing & Lineage Analyzer
 * Traces exact rule attribution, upstream entity links, and causal chains.
 */

import { CausalRecord, RegionMetrics, SimulationSnapshot } from '../types/simulation';

export interface CausalNode {
  id: string;
  label: string;
  variable: string;
  value: number;
  delta: number;
  ruleName: string;
  explanation: string;
  upstreamCauses: {
    name: string;
    value: number;
    description: string;
  }[];
  step: number;
}

export interface CausalLineage {
  entityId: string;
  variable: keyof RegionMetrics;
  historyTimeline: {
    step: number;
    value: number;
    delta: number;
    ruleName: string;
    explanation: string;
    inputs: Record<string, number>;
  }[];
  primaryRootCauses: string[];
  maxDeltaEvent: {
    step: number;
    delta: number;
    explanation: string;
  } | null;
}

export function traceVariableLineage(
  history: SimulationSnapshot[],
  entityId: string,
  targetVariable: keyof RegionMetrics
): CausalLineage {
  const timeline: CausalLineage['historyTimeline'] = [];
  let maxDeltaRecord: CausalRecord | null = null;
  let maxAbsDelta = 0;
  const rootCausesSet = new Set<string>();

  for (const snapshot of history) {
    const matchingRecords = snapshot.causalRecords.filter(
      r => r.entityId === entityId && r.targetVariable === targetVariable
    );

    for (const record of matchingRecords) {
      timeline.push({
        step: record.step,
        value: record.nextValue,
        delta: record.delta,
        ruleName: record.ruleName,
        explanation: record.explanation,
        inputs: record.inputs
      });

      if (Math.abs(record.delta) > maxAbsDelta) {
        maxAbsDelta = Math.abs(record.delta);
        maxDeltaRecord = record;
      }

      // Identify major input drivers
      for (const [key, val] of Object.entries(record.inputs)) {
        if (key.toLowerCase().includes('deficit') && val > 0) {
          rootCausesSet.add(`Resource Deficit (${key}: ${val})`);
        } else if (key.toLowerCase().includes('yield') && val < 0.6) {
          rootCausesSet.add(`Suppressed Yield Multiplier (${key}: ${val}x)`);
        } else if (key.toLowerCase().includes('outage') && val > 0) {
          rootCausesSet.add(`Grid Transmission Bottleneck (${key}: ${val})`);
        }
      }

      if (record.upstreamEntityIds && record.upstreamEntityIds.length > 0) {
        for (const upstreamId of record.upstreamEntityIds) {
          rootCausesSet.add(`Cross-Regional Dependency on [${upstreamId.toUpperCase()}]`);
        }
      }
    }
  }

  // Fallback root causes if none explicitly flagged
  if (rootCausesSet.size === 0 && timeline.length > 0) {
    rootCausesSet.add('Standard consumption draw & demographic baseline dynamics');
  }

  return {
    entityId,
    variable: targetVariable,
    historyTimeline: timeline,
    primaryRootCauses: Array.from(rootCausesSet),
    maxDeltaEvent: maxDeltaRecord
      ? {
          step: maxDeltaRecord.step,
          delta: maxDeltaRecord.delta,
          explanation: maxDeltaRecord.explanation
        }
      : null
  };
}
