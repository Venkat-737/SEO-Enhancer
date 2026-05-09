import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import UploadPage from './components/upload/UploadPage';
import DashboardPage from './components/dashboard/DashboardPage';
import './styles/videoiq.css';

export default function VideoIQApp() {
  const [activePage, setActivePage] = useState('upload');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    setActivePage('dashboard');
  };

  const handleBack = () => {
    setActivePage('upload');
    setAnalysisData(null);
  };

  const handleNavigate = (page) => {
    if (page === 'upload') {
      handleBack();
    } else if (page === 'dashboard' && analysisData) {
      setActivePage('dashboard');
    }
  };

  const pageTitles = {
    upload: 'Upload Video',
    dashboard: 'SEO Dashboard',
  };

  return (
    <div className="viq-root">
      {/* Background Effects */}
      <div className="viq-bg-mesh" />
      <div className="viq-grid-overlay" />

      {/* Layout */}
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
              <UploadPage
                key="upload"
                onAnalysisComplete={handleAnalysisComplete}
              />
            )}
            {activePage === 'dashboard' && analysisData && (
              <DashboardPage
                key="dashboard"
                data={analysisData}
                onBack={handleBack}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
