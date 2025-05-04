import React from 'react';

const LeftBar = ({ currentPage = 'Dashboard', onNavigate, isOpen }) => {
  const navItems = [
    { name: 'Dashboard', active: currentPage === 'Dashboard' },
    /*{ name: 'Statistics', active: currentPage === 'Statistics' },
    { name: 'Reports', active: currentPage === 'Reports' },*/
    { name: 'Device', active: currentPage === 'Device' },
    { name: 'Settings', active: currentPage === 'Settings' },
  ];

  return (
    <div className={`left-bar ${isOpen ? 'open' : ''}`}>
      <div className="logo-container">
        <span className="logo-text-black">SEAS</span>
      </div>
      <div className="nav-container">
        {navItems.map((item) => (
          <button
            key={item.name}
            className={`nav-item ${item.active ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate(item.name)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeftBar;