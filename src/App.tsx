import React, { useState, useMemo, useEffect } from 'react';
import { ProjectScenario, HeavyEquipmentUnit, CurrencyType, ProjectIdentityConfig } from './types/mining';
import {
  PRESET_SCENARIOS,
  DEFAULT_RESERVES,
  DEFAULT_LOCATION_ROAD,
  DEFAULT_WEATHER_CORRECTION,
  DEFAULT_EQUIPMENTS,
  DEFAULT_FINANCIALS,
  DEFAULT_PROJECT_IDENTITY,
} from './data/defaultData';
import {
  calculateOperationalMetrics,
  calculateCashFlows,
  calculateSensitivityMatrix,
  generateStrategicRecommendations,
} from './utils/miningMath';
import { Navbar } from './components/Navbar';
import { ExecutiveSummaryTab } from './components/ExecutiveSummaryTab';
import { OperationalFleetTab } from './components/OperationalFleetTab';
import { FinancialFeasibilityTab } from './components/FinancialFeasibilityTab';
import { SensitivityAnalysisTab } from './components/SensitivityAnalysisTab';
import { RegulationPopupModal } from './components/RegulationPopupModal';
import { ScenarioManagerModal } from './components/ScenarioManagerModal';
import { ExportReportModal } from './components/ExportReportModal';
import { ProjectIdentityModal } from './components/ProjectIdentityModal';

export default function App() {
  // 1. Scenario state with localStorage persistence
  const [scenario, setScenario] = useState<ProjectScenario>(() => {
    try {
      const saved = localStorage.getItem('mining_active_scenario');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load active scenario from storage', e);
    }
    return PRESET_SCENARIOS[0]; // Base Case
  });

  const [savedScenarios, setSavedScenarios] = useState<ProjectScenario[]>(() => {
    try {
      const list = localStorage.getItem('mining_saved_scenarios');
      if (list) {
        return JSON.parse(list);
      }
    } catch (e) {
      console.error('Failed to load saved scenarios from storage', e);
    }
    return [];
  });

  // Save active scenario to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mining_active_scenario', JSON.stringify(scenario));
    } catch (e) {
      console.error('Failed to save active scenario', e);
    }
  }, [scenario]);

  // Save custom scenarios to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mining_saved_scenarios', JSON.stringify(savedScenarios));
    } catch (e) {
      console.error('Failed to save scenarios list', e);
    }
  }, [savedScenarios]);

  // 1.b Project Identity & Branding state with localStorage persistence
  const [identity, setIdentity] = useState<ProjectIdentityConfig>(() => {
    try {
      const saved = localStorage.getItem('mining_project_identity');
      if (saved) {
        return { ...DEFAULT_PROJECT_IDENTITY, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load project identity from storage', e);
    }
    return DEFAULT_PROJECT_IDENTITY;
  });

  // Save project identity to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mining_project_identity', JSON.stringify(identity));
    } catch (e) {
      console.error('Failed to save project identity', e);
    }
  }, [identity]);

  // 2. Navigation, Currency & Modals state
  const [currency, setCurrency] = useState<CurrencyType>('USD');
  const [activeTab, setActiveTab] = useState<'executive' | 'operational' | 'financial' | 'sensitivity'>('executive');
  const [regulationKey, setRegulationKey] = useState<string | null>(null);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);

  // 3. Real-Time Dynamic Mathematical & Economic Calculations Engine
  const operational = useMemo(() => {
    return calculateOperationalMetrics(
      scenario.reserves,
      scenario.locationRoad,
      scenario.weatherCorrection,
      scenario.equipments,
      scenario.financials
    );
  }, [scenario.reserves, scenario.locationRoad, scenario.weatherCorrection, scenario.equipments, scenario.financials]);

  const { cashFlows, results: financials } = useMemo(() => {
    return calculateCashFlows(
      scenario.reserves,
      scenario.locationRoad,
      scenario.financials,
      operational
    );
  }, [scenario.reserves, scenario.locationRoad, scenario.financials, operational]);

  const sensitivity = useMemo(() => {
    return calculateSensitivityMatrix(
      scenario.reserves,
      scenario.locationRoad,
      scenario.financials,
      operational
    );
  }, [scenario.reserves, scenario.locationRoad, scenario.financials, operational]);

  const recommendation = useMemo(() => {
    return generateStrategicRecommendations(
      scenario.reserves,
      scenario.locationRoad,
      scenario.financials,
      operational,
      financials
    );
  }, [scenario.reserves, scenario.locationRoad, scenario.financials, operational, financials]);

  // 4. Update Handlers
  const handleUpdateReserves = (updates: Partial<ProjectScenario['reserves']>) => {
    setScenario((prev) => ({
      ...prev,
      reserves: { ...prev.reserves, ...updates },
    }));
  };

  const handleUpdateLocation = (updates: Partial<ProjectScenario['locationRoad']>) => {
    setScenario((prev) => ({
      ...prev,
      locationRoad: { ...prev.locationRoad, ...updates },
    }));
  };

  const handleUpdateWeather = (updates: Partial<ProjectScenario['weatherCorrection']>) => {
    setScenario((prev) => ({
      ...prev,
      weatherCorrection: { ...prev.weatherCorrection, ...updates },
    }));
  };

  const handleUpdateEquipment = (index: number, updates: Partial<HeavyEquipmentUnit>) => {
    setScenario((prev) => {
      const nextEquipments = [...prev.equipments];
      nextEquipments[index] = { ...nextEquipments[index], ...updates };
      return {
        ...prev,
        equipments: nextEquipments,
      };
    });
  };

  const handleAddEquipment = (unit: HeavyEquipmentUnit) => {
    setScenario((prev) => ({
      ...prev,
      equipments: [...prev.equipments, unit],
    }));
  };

  const handleDeleteEquipment = (index: number) => {
    setScenario((prev) => {
      if (prev.equipments.length <= 1) return prev;
      return {
        ...prev,
        equipments: prev.equipments.filter((_, i) => i !== index),
      };
    });
  };

  const handleDuplicateEquipment = (index: number) => {
    setScenario((prev) => {
      const source = prev.equipments[index];
      if (!source) return prev;
      const copy: HeavyEquipmentUnit = {
        ...source,
        id: `fleet-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        model: `${source.model} (Salinan)`,
      };
      const nextEquipments = [...prev.equipments];
      nextEquipments.splice(index + 1, 0, copy);
      return {
        ...prev,
        equipments: nextEquipments,
      };
    });
  };

  const handleUpdateFinancials = (updates: Partial<ProjectScenario['financials']>) => {
    setScenario((prev) => ({
      ...prev,
      financials: { ...prev.financials, ...updates },
    }));
  };

  const handleSelectScenario = (scen: ProjectScenario) => {
    setScenario(scen);
  };

  const handleSaveCurrentAsNew = (name: string, description: string) => {
    const newScen: ProjectScenario = {
      ...scenario,
      id: `custom-${Date.now()}`,
      name,
      description,
      isPreset: false,
    };
    setSavedScenarios((prev) => [newScen, ...prev]);
    setScenario(newScen);
  };

  const handleDeleteScenario = (id: string) => {
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
    if (scenario.id === id) {
      setScenario(PRESET_SCENARIOS[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentScenario={scenario}
        financials={financials}
        operational={operational}
        currency={currency}
        identity={identity}
        onToggleCurrency={setCurrency}
        onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenRegulationModal={(key) => setRegulationKey(key)}
        onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'executive' && (
          <ExecutiveSummaryTab
            scenario={scenario}
            financials={financials}
            operational={operational}
            cashFlows={cashFlows}
            recommendation={recommendation}
            identity={identity}
            currency={currency}
            onOpenRegulationModal={(key) => setRegulationKey(key)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
          />
        )}

        {activeTab === 'operational' && (
          <OperationalFleetTab
            scenario={scenario}
            operational={operational}
            currency={currency}
            onUpdateReserves={handleUpdateReserves}
            onUpdateLocation={handleUpdateLocation}
            onUpdateWeather={handleUpdateWeather}
            onUpdateEquipment={handleUpdateEquipment}
            onAddEquipment={handleAddEquipment}
            onDeleteEquipment={handleDeleteEquipment}
            onDuplicateEquipment={handleDuplicateEquipment}
            onOpenRegulationModal={(key) => setRegulationKey(key)}
          />
        )}

        {activeTab === 'financial' && (
          <FinancialFeasibilityTab
            scenario={scenario}
            financials={financials}
            cashFlows={cashFlows}
            currency={currency}
            onUpdateFinancials={handleUpdateFinancials}
            onOpenRegulationModal={(key) => setRegulationKey(key)}
          />
        )}

        {activeTab === 'sensitivity' && (
          <SensitivityAnalysisTab
            scenario={scenario}
            financials={financials}
            operational={operational}
            sensitivity={sensitivity}
            onOpenRegulationModal={(key) => setRegulationKey(key)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {identity.mineConcessionName ? `${identity.mineConcessionName} &bull; ` : ''}Coal Mining Techno-Economic Feasibility Simulator &bull; Standard ESDM Kepmen 1827/2018 & PP 26/2022
          </span>
          <span className="font-semibold text-slate-700">
            {identity.companyName || 'PT Tambang Batubara Prima Mandiri'} &bull; {identity.analystName ? identity.analystName : 'Senior Mining Engineer'}
          </span>
        </div>
      </footer>

      {/* Regulation Details Popup Modal */}
      <RegulationPopupModal
        regulationKey={regulationKey}
        onClose={() => setRegulationKey(null)}
      />

      {/* Scenario Manager Modal */}
      <ScenarioManagerModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        currentScenario={scenario}
        onSelectScenario={handleSelectScenario}
        savedScenarios={savedScenarios}
        onSaveCurrentAsNew={handleSaveCurrentAsNew}
        onDeleteScenario={handleDeleteScenario}
      />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        scenario={scenario}
        operational={operational}
        cashFlows={cashFlows}
        financials={financials}
        sensitivity={sensitivity}
        recommendation={recommendation}
        identity={identity}
        onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
      />

      {/* Project Identity & Custom Branding Modal */}
      <ProjectIdentityModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
        identity={identity}
        onSaveIdentity={(newIdentity) => setIdentity(newIdentity)}
        onSyncWithScenarioMineName={(mineName, location, pitArea) => {
          handleUpdateReserves({
            mineName,
            location: location || scenario.reserves.location,
            pitArea: pitArea || scenario.reserves.pitArea,
          });
        }}
      />
    </div>
  );
}
