// NoDataFallback.js
import React from 'react';

const NoDataFallback = ({ message, onCreateSample }) => {
  return (
    <div className="no-data-fallback">
      <p>{message || "No data available."}</p>
      {onCreateSample && (
        <button 
          className="create-sample-button"
          onClick={onCreateSample}
        >
          Create Sample Data
        </button>
      )}
    </div>
  );
};

export default NoDataFallback;