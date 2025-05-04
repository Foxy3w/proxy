import React from 'react';

const CompatibilityCard = ({ data = null, loading = false, error = null }) => {
  // Handle loading state
  if (loading) {
    return (
      <div className="simple-card">
        <div className="compatibility-title">Compatibility with XXXX</div>
        <div className="compatibility-value">Loading...</div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="simple-card">
        <div className="compatibility-title">Compatibility with XXXX</div>
        <div className="compatibility-value">Error</div>
      </div>
    );
  }

  // Default data if no data is provided
  const compatibilityData = data || {
    standard: "XXXX",
    status: "Standers"
  };

  return (
    <div className="simple-card">
      <div className="compatibility-title">Compatibility with {compatibilityData.standard}</div>
      <div className="compatibility-value">{compatibilityData.status}</div>
    </div>
  );
};

export default CompatibilityCard;