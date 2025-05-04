import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Settings from './Settings';
import Device from './Device'; // Import the new Device component
import TopBar from './components/TopBar';
import LeftBar from './components/LeftBar';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle sidebar visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Only auto-close on initial load or when transitioning to mobile
      if (mobile && !isMobile) {
        setSidebarOpen(false);
      } else if (!mobile && isMobile) {
        setSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(prevState => !prevState);
  };
  
  // Handle navigation between pages
  const handleNavigation = (pageName) => {
    setCurrentPage(pageName);
    // Close sidebar on navigation on mobile
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  // This function will be used when you implement the other pages
  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Statistics':
        // Replace with actual Statistics component when implemented
        return (
          <div className="card" style={{textAlign: 'center', padding: '40px'}}>
            <h1 style={{fontSize: '24px', fontWeight: 'bold'}}>Statistics Page</h1>
            <p>To be implemented</p>
          </div>
        );
      case 'Reports':
        // Replace with actual Reports component when implemented
        return (
          <div className="card" style={{textAlign: 'center', padding: '40px'}}>
            <h1 style={{fontSize: '24px', fontWeight: 'bold'}}>Reports Page</h1>
            <p>To be implemented</p>
          </div>
        );
      case 'Device':
        return <Device />;
      case 'Settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      
      <LeftBar 
        currentPage={currentPage} 
        onNavigate={handleNavigation} 
        isOpen={sidebarOpen}
      />
      
      <div className="main-content">
        <TopBar toggleSidebar={toggleSidebar} />
        <div className="content-area">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;