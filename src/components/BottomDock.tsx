/**
 * AFTERWORLD — Collapsible Bottom Management Dock
 * Pinned to bottom with zero viewport occlusion and full governance tabs.
 */

import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  DollarSign, 
  Users, 
  AlertOctagon, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Sliders, 
  Camera, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { 
  BuildingEntity, 
  District, 
  LawBill, 
  SimulationState 
} from '../types/politicalSimulation';

export type DockTab = 'OVERVIEW' | 'CABINET_LAWS' | 'ECONOMY' | 'PARLIAMENT' | 'CRISES' | 'INSPECTOR';

interface BottomDockProps {
  state: SimulationState;
  selectedBuilding: BuildingEntity | null;
  onSelectBuilding: (id: string | null) => void;
  onFlyToCoord: (coord: [number, number, number]) => void;
  onToggleLaw: (billId: string) => void;
  onResolveCrisis: (crisisId: string, optionId: string) => void;
  onUpdateTaxRate: (taxKey: 'corporate' | 'income' | 'vat', value: number) => void;
  onUpdateSpending: (spendKey: 'welfare' | 'policing' | 'healthcare' | 'subsidies', value: number) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  state,
  selectedBuilding,
  onSelectBuilding,
  onFlyToCoord,
  onToggleLaw,
  onResolveCrisis,
  onUpdateTaxRate,
  onUpdateSpending
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<DockTab>('OVERVIEW');

  const unresolvedCrises = state.crises.filter(c => !c.resolved);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none select-none">
      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(c => !c)}
        className="pointer-events-auto mb-1 px-4 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-t-lg text-xs font-mono flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
      >
        {isCollapsed ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
        <span>{isCollapsed ? 'Show Management Console' : 'Hide Console (Zen 3D View)'}</span>
      </button>

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="pointer-events-auto w-full max-w-6xl mx-auto bg-[#0A0E17]/95 backdrop-blur-md border-t border-x border-slate-800 rounded-t-2xl shadow-2xl flex flex-col max-h-[380px] overflow-hidden">
          {/* Dock Navigation Strip */}
          <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2 bg-slate-950/80 text-xs font-mono">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { key: 'OVERVIEW', label: 'City & Districts', icon: <Building2 className="w-4 h-4" /> },
                { key: 'CABINET_LAWS', label: 'Cabinet & Laws', icon: <FileText className="w-4 h-4" /> },
                { key: 'ECONOMY', label: 'Budget & Taxes', icon: <DollarSign className="w-4 h-4" /> },
                { key: 'PARLIAMENT', label: 'Parliament & Strata', icon: <Users className="w-4 h-4" /> },
                { 
                  key: 'CRISES', 
                  label: `Crises (${unresolvedCrises.length})`, 
                  icon: <AlertOctagon className="w-4 h-4 text-rose-400" /> 
                },
                { 
                  key: 'INSPECTOR', 
                  label: selectedBuilding ? `Inspector [${selectedBuilding.name.slice(0, 14)}...]` : 'Inspector', 
                  icon: <Eye className="w-4 h-4 text-cyan-400" /> 
                }
              ].map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as DockTab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Camera Jump Toolbar */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>FLY TO:</span>
              <button
                onClick={() => onFlyToCoord(state.districts.civic.cameraFocus)}
                className="hover:text-cyan-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800"
              >
                Civic Plaza
              </button>
              <button
                onClick={() => onFlyToCoord(state.districts.industrial.cameraFocus)}
                className="hover:text-amber-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800"
              >
                Foundry Belt
              </button>
              <button
                onClick={() => onFlyToCoord(state.districts.residential.cameraFocus)}
                className="hover:text-emerald-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800"
              >
                Tenements
              </button>
              <button
                onClick={() => onFlyToCoord(state.districts.harbor.cameraFocus)}
                className="hover:text-indigo-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800"
              >
                Harbor
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 overflow-y-auto max-h-[310px] text-xs font-mono text-slate-300">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {Object.values(state.districts).map(dist => (
                    <div
                      key={dist.id}
                      className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg flex flex-col justify-between space-y-2"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-100 block text-xs">{dist.name}</strong>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: dist.color }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                          {dist.description}
                        </p>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-slate-800/80">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Unrest Level:</span>
                          <span className={`font-bold tabular-nums ${dist.unrestLevel > 60 ? 'text-rose-400' : 'text-slate-200'}`}>
                            {dist.unrestLevel}%
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Monthly Output:</span>
                          <span className="text-cyan-300 font-bold tabular-nums">
                            ${dist.economicOutput}M
                          </span>
                        </div>
                        <button
                          onClick={() => onFlyToCoord(dist.cameraFocus)}
                          className="w-full mt-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] flex items-center justify-center gap-1 transition-colors"
                        >
                          <Camera className="w-3 h-3 text-cyan-400" />
                          <span>View District</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* History Ticker */}
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Recent Political & Executive Log
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {state.historyLog.slice(-4).reverse().map((log, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <span className="text-cyan-400 font-bold shrink-0">Day {log.day}:</span>
                        <span className="text-slate-300">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. CABINET & LAWS TAB */}
            {activeTab === 'CABINET_LAWS' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Legislative Reform Bills */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Parliamentary Reform Bills
                    </span>
                    <div className="space-y-2">
                      {state.laws.map(bill => (
                        <div
                          key={bill.id}
                          className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1 max-w-[70%]">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.2 bg-slate-800 text-[10px] text-cyan-300 rounded font-bold">
                                {bill.category}
                              </span>
                              <strong className="text-slate-100 text-xs block">{bill.name}</strong>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              {bill.description}
                            </p>
                            <span className="text-[10px] text-slate-500 block">
                              Support: ~{bill.supportEstimate}/200 seats · Cost: ${bill.costPerMonth}M/mo
                            </span>
                          </div>

                          <button
                            onClick={() => onToggleLaw(bill.id)}
                            className={`px-3 py-1.5 rounded font-bold text-xs transition-colors shrink-0 ${
                              bill.enacted
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {bill.enacted ? 'Law Enacted (Repeal)' : 'Enact Bill'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Cabinet Ministries */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Cabinet Executive Council
                    </span>
                    <div className="space-y-2">
                      {Object.values(state.cabinet).map(min => {
                        const party = state.parties[min.partyId];
                        return (
                          <div
                            key={min.id}
                            className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg flex items-center justify-between"
                          >
                            <div>
                              <strong className="text-slate-100 text-xs block">{min.title}</strong>
                              <span className="text-[11px] text-slate-300">{min.ministerName}</span>
                              <span
                                className="text-[10px] font-bold ml-2 px-1 rounded"
                                style={{ color: party?.color, backgroundColor: `${party?.color}20` }}
                              >
                                {party?.acronym}
                              </span>
                            </div>

                            <div className="text-right text-[11px] space-y-0.5">
                              <div>Competence: <strong className="text-cyan-300">{min.competence}%</strong></div>
                              <div>Loyalty: <strong className="text-slate-200">{min.loyalty}%</strong></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ECONOMY & BUDGET TAB */}
            {activeTab === 'ECONOMY' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tax Rates */}
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg space-y-4">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 block flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      National Tax Rates (%)
                    </span>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Corporate Tax (Manufacturing & Services):</span>
                          <span className="text-cyan-300 font-bold">{state.taxRates.corporate}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="40"
                          value={state.taxRates.corporate}
                          onChange={(e) => onUpdateTaxRate('corporate', parseInt(e.target.value, 10))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Personal Income Tax:</span>
                          <span className="text-cyan-300 font-bold">{state.taxRates.income}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="40"
                          value={state.taxRates.income}
                          onChange={(e) => onUpdateTaxRate('income', parseInt(e.target.value, 10))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Value Added Consumption Tax (VAT):</span>
                          <span className="text-cyan-300 font-bold">{state.taxRates.vat}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="25"
                          value={state.taxRates.vat}
                          onChange={(e) => onUpdateTaxRate('vat', parseInt(e.target.value, 10))}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Public Spending Discretion */}
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg space-y-4">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      Monthly Budget Allocations ($M/mo)
                    </span>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Welfare & Unemployment Relief:</span>
                          <span className="text-amber-300 font-bold">${state.spending.welfare}M</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={state.spending.welfare}
                          onChange={(e) => onUpdateSpending('welfare', parseInt(e.target.value, 10))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Civil Police & Public Order:</span>
                          <span className="text-amber-300 font-bold">${state.spending.policing}M</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="35"
                          value={state.spending.policing}
                          onChange={(e) => onUpdateSpending('policing', parseInt(e.target.value, 10))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>General Healthcare & Hospitals:</span>
                          <span className="text-amber-300 font-bold">${state.spending.healthcare}M</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="40"
                          value={state.spending.healthcare}
                          onChange={(e) => onUpdateSpending('healthcare', parseInt(e.target.value, 10))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PARLIAMENT & STRATA TAB */}
            {activeTab === 'PARLIAMENT' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Parties */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Parliamentary Factions (200 Seats Total)
                    </span>
                    <div className="space-y-2">
                      {Object.values(state.parties).map(party => (
                        <div
                          key={party.id}
                          className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: party.color }} />
                            <div>
                              <strong className="text-slate-100 text-xs block">
                                {party.name} [{party.acronym}]
                              </strong>
                              <span className="text-[10px] text-slate-400">{party.ideology}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-slate-200 block text-xs tabular-nums">
                              {party.seats} seats ({((party.seats / 200) * 100).toFixed(0)}%)
                            </span>
                            <span className={`text-[10px] font-bold ${party.inCoalition ? 'text-cyan-300' : 'text-slate-500'}`}>
                              {party.inCoalition ? `In Coalition · ${party.loyalty}% Loyalty` : 'Opposition'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Population Strata */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Societal Classes & Sentiment
                    </span>
                    <div className="space-y-2">
                      {Object.values(state.strata).map(st => (
                        <div
                          key={st.id}
                          className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <strong className="text-slate-100 text-xs block">{st.name}</strong>
                            <span className="text-[10px] text-slate-400 block">
                              Pop: {st.headcount}k · Unemp: {st.unemploymentRate}%
                            </span>
                            <span className="text-[10px] text-amber-300/80 block mt-0.5">
                              Demand: {st.keyDemand}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className={`text-sm font-bold block tabular-nums ${
                              st.approval < 40 ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                              {st.approval}% Approval
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Strike Risk: <strong className="text-rose-300">{st.strikePropensity}%</strong>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. CRISES TAB */}
            {activeTab === 'CRISES' && (
              <div className="space-y-4">
                {state.crises.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No active societal crises. The Republic is peaceful.
                  </div>
                ) : (
                  state.crises.map(crisis => (
                    <div
                      key={crisis.id}
                      className={`border p-4 rounded-xl space-y-3 ${
                        crisis.resolved
                          ? 'bg-slate-900/40 border-slate-800 opacity-70'
                          : crisis.severity === 'EMERGENCY'
                          ? 'bg-rose-950/20 border-rose-800/80 ring-1 ring-rose-500/40'
                          : 'bg-amber-950/20 border-amber-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <AlertOctagon className="w-4 h-4 text-rose-400" />
                            <strong className="text-sm text-slate-100">{crisis.title}</strong>
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-500/20 text-rose-300">
                              {crisis.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {crisis.description}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            District: <strong className="text-slate-200">{crisis.districtId.toUpperCase()}</strong> · Crowd Density: ~{crisis.crowdSize.toLocaleString()} citizens
                          </span>
                        </div>

                        {/* Fly to scene button */}
                        <button
                          onClick={() => onFlyToCoord(state.districts[crisis.districtId].cameraFocus)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1 shrink-0"
                        >
                          <Camera className="w-3 h-3 text-cyan-400" />
                          <span>View on 3D Map</span>
                        </button>
                      </div>

                      {/* Options if unresolved */}
                      {!crisis.resolved ? (
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Executive Council Options
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {crisis.options.map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => onResolveCrisis(crisis.id, opt.id)}
                                className="text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400 rounded-lg space-y-1 transition-all"
                              >
                                <div className="flex justify-between items-center">
                                  <strong className="text-slate-100 text-[11px] block">{opt.label}</strong>
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-2">
                                  {opt.description}
                                </p>
                                <span className="text-[10px] text-cyan-300 font-bold block pt-1">
                                  Cost: ${opt.cost}M
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800 text-[11px] text-emerald-300">
                          Resolved: {crisis.resolutionNote}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 6. INSPECTOR TAB */}
            {activeTab === 'INSPECTOR' && (
              <div>
                {selectedBuilding ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <strong className="text-sm text-slate-100 block">{selectedBuilding.name}</strong>
                        <span className="text-[11px] text-slate-400 font-mono">
                          District: {selectedBuilding.districtId.toUpperCase()} · Type: {selectedBuilding.type}
                        </span>
                      </div>
                      <button
                        onClick={() => onSelectBuilding(null)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                      >
                        Deselect
                      </button>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed">
                      {selectedBuilding.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Operating Status</span>
                        <span className={`text-sm font-bold ${
                          selectedBuilding.operatingStatus === 'ON_STRIKE' ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {selectedBuilding.operatingStatus}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Workforce Jobs</span>
                        <span className="text-sm font-bold text-slate-100 tabular-nums">
                          {selectedBuilding.jobs.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Monthly Output</span>
                        <span className="text-sm font-bold text-cyan-300 tabular-nums">
                          ${selectedBuilding.monthlyOutput}M
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Worker Unrest</span>
                        <span className={`text-sm font-bold tabular-nums ${
                          selectedBuilding.workerDissatisfaction > 60 ? 'text-rose-400' : 'text-slate-200'
                        }`}>
                          {selectedBuilding.workerDissatisfaction}%
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onFlyToCoord(selectedBuilding.position)}
                      className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Center Camera on Building</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    Click any building in the 3D city scene to inspect its jobs, output, operating status, and worker dissatisfaction.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
