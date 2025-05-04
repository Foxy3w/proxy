import React from 'react';

const TopBar = ({ toggleSidebar }) => {
  return (
    <div className="top-bar">
      {/* Hamburger menu for mobile */}
      <button className="hamburger-menu" onClick={toggleSidebar}>
        <span className="material-icons">menu</span>
      </button>
    </div>
  );
};

export default TopBar;