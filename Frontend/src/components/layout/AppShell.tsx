import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import AIAssistantDrawer from './AIAssistantDrawer';

const AppShell: React.FC = () => {
  const { sidebarCollapsed, aiDrawerOpen, startSimulation } = useAppStore();
  const location = useLocation();

  React.useEffect(() => {
    startSimulation();
  }, [startSimulation]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-base)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '60px' : '240px' }}
      >
        {/* Top Navbar */}
        <TopNavbar />

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: 'var(--color-bg-base)' }}
        >
          <div className="h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* AI Assistant Drawer (global, slides from right) */}
      <AIAssistantDrawer />

      {/* Backdrop for AI drawer on mobile */}
      {aiDrawerOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => useAppStore.getState().closeAIDrawer()}
        />
      )}
    </div>
  );
};

export default AppShell;
