// Demo wrapper that allows testing the dashboard with mock data
// Visit /videoiq/demo to see the full dashboard with sample data
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import UploadPage from '../components/upload/UploadPage';
import DashboardPage from '../components/dashboard/DashboardPage';
import { mockAnalysisData } from '../data/mockData';
import '../styles/videoiq.css';

export default function VideoIQDemo() {
  const [activePage, setActivePage] = useState('upload');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setActivePage('dashboard');
  };

  const handleDemoMode = () => {
    setAnalysisData(mockAnalysisData);
    setActivePage('dashboard');
  };

  const handleBack = () => {
    setActivePage('upload');
    setAnalysisData(null);
  };

  const handleNavigate = (page) => {
    if (page === 'upload') handleBack();
    else if (page === 'dashboard') handleDemoMode();
  };

  const pageTitles = { upload: 'Upload Video', dashboard: 'SEO Dashboard' };

  return (
    <div className="viq-root">
      <div className="viq-bg-mesh" />
      <div className="viq-grid-overlay" />
      <div className="viq-layout">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="viq-main-content">
          <Topbar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            pageTitle={pageTitles[activePage]}
          />
          <AnimatePresence mode="wait">
            {activePage === 'upload' && (
              <div key="upload">
                <UploadPage onAnalysisComplete={handleAnalysisComplete} />
                {/* Demo Button */}
                <div className="flex justify-center mt-6">
                  <button className="viq-btn-ghost text-sm" onClick={handleDemoMode}>
                    🎮 Try Demo with Sample Data
                  </button>
                </div>
              </div>
            )}
            {activePage === 'dashboard' && analysisData && (
              <DashboardPage key="dashboard" data={analysisData} onBack={handleBack} />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
