import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewPage } from './pages/OverviewPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [alertCount, setAlertCount] = useState<number>(0);

  const fetchAlertCount = async () => {
    try {
      const alerts = await api.getAlerts({ status: 'NEW' });
      setAlertCount(alerts.length);
    } catch {
      // Graceful ignore
    }
  };

  useEffect(() => {
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectTransaction = (id: string) => {
    setSelectedTxId(id);
  };

  const handleBackToList = () => {
    setSelectedTxId(null);
  };

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    setSelectedTxId(null);
  };

  return (
    <div id="payshield-app-root" className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* Persistent Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        alertCount={alertCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header Bar */}
        <Header
          onSearchSelect={(txId) => {
            setSelectedTxId(txId);
          }}
          alertCount={alertCount}
          onOpenAlerts={() => handleTabChange('alerts')}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {selectedTxId ? (
            <TransactionDetailPage
              transactionId={selectedTxId}
              onBack={handleBackToList}
            />
          ) : (
            <>
              {currentTab === 'overview' && (
                <OverviewPage onSelectTransaction={handleSelectTransaction} />
              )}
              {currentTab === 'transactions' && (
                <TransactionsPage onSelectTransaction={handleSelectTransaction} />
              )}
              {currentTab === 'alerts' && (
                <AlertsPage onSelectTransaction={handleSelectTransaction} />
              )}
              {currentTab === 'analytics' && <AnalyticsPage />}
              {currentTab === 'architecture' && <ArchitecturePage />}
              {currentTab === 'settings' && <SettingsPage />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
