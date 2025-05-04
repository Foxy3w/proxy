import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const UnitContext = createContext();

// Conversion functions for different units
const conversions = {
  temperature: {
    celsius: {
      fahrenheit: (value) => (value * 9/5) + 32,
      kelvin: (value) => value + 273.15
    },
    fahrenheit: {
      celsius: (value) => (value - 32) * 5/9,
      kelvin: (value) => ((value - 32) * 5/9) + 273.15
    },
    kelvin: {
      celsius: (value) => value - 273.15,
      fahrenheit: (value) => ((value - 273.15) * 9/5) + 32
    }
  },
  energy: {
    kwh: {
      mwh: (value) => value / 1000,
      joule: (value) => value * 3600000,
      btu: (value) => value * 3412.14
    },
    mwh: {
      kwh: (value) => value * 1000,
      joule: (value) => value * 3600000000,
      btu: (value) => value * 3412140
    },
    joule: {
      kwh: (value) => value / 3600000,
      mwh: (value) => value / 3600000000,
      btu: (value) => value / 1055.06
    },
    btu: {
      kwh: (value) => value / 3412.14,
      mwh: (value) => value / 3412140,
      joule: (value) => value * 1055.06
    }
  },
  pressure: {
    hpa: {
      pa: (value) => value * 100,
      bar: (value) => value / 1000,
      psi: (value) => value * 0.0145038
    },
    pa: {
      hpa: (value) => value / 100,
      bar: (value) => value / 100000,
      psi: (value) => value * 0.000145038
    },
    bar: {
      hpa: (value) => value * 1000,
      pa: (value) => value * 100000,
      psi: (value) => value * 14.5038
    },
    psi: {
      hpa: (value) => value / 0.0145038,
      pa: (value) => value / 0.000145038,
      bar: (value) => value / 14.5038
    }
  },
  co2: {
    ppm: {
      mgm3: (value) => value * 1.8  // Approximate conversion for CO2: 1 ppm ≈ 1.8 mg/m³
    },
    mgm3: {
      ppm: (value) => value / 1.8  // Approximate conversion for CO2: 1 mg/m³ ≈ 0.556 ppm
    }
  }


};

// Unit symbols for formatting
const unitSymbols = {
  temperature: {
    celsius: '°C',
    fahrenheit: '°F',
    kelvin: ' K'
  },
  energy: {
    kwh: ' kWh',
    mwh: ' MWh',
    joule: ' J',
    btu: ' BTU'
  },
  pressure: {
    hpa: ' hPa',
    pa: ' Pa',
    bar: ' bar',
    psi: ' PSI'
  },
  humidity: {
    percent: '%',
    gramsPerCubicMeter: ' g/m³'
  },
  lightintensity: {
    lux: ' lux',
    footCandle: ' fc'
  },
  light: {
    lux: ' lux',
    footCandle: ' fc'
  },
  co2: {
    ppm: ' ppm',
    mgm3: ' mg/m³'
  }
};

// Provider component
export const UnitProvider = ({ children }) => {
  // Default units
  const defaultUnits = {
    temperature: 'celsius',
    energy: 'kwh',
    pressure: 'hpa',
    humidity: 'percent',
    lightintensity: 'lux',
    light: 'lux',
    co2: 'ppm'
  };

  // Initialize state with values from localStorage or defaults
  const [units, setUnitsState] = useState(() => {
    try {
      const savedUnits = localStorage.getItem('seas-units');
      return savedUnits ? JSON.parse(savedUnits) : defaultUnits;
    } catch (e) {
      console.error('Error loading units from localStorage:', e);
      return defaultUnits;
    }
  });

  // Versioning to force component updates
  const [version, setVersion] = useState(1);

  // Save units to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('seas-units', JSON.stringify(units));
      console.log('Units saved:', units);
    } catch (e) {
      console.error('Error saving units to localStorage:', e);
    }
  }, [units]);

  // Function to update units
  const setUnit = (property, value) => {
    console.log(`Setting ${property} to ${value}`);
    setUnitsState(prev => {
      // Create a new object to ensure React detects the change
      const newUnits = { ...prev, [property]: value };
      
      // Handle aliases
      if (property === 'light') {
        newUnits.lightintensity = value;
      } else if (property === 'lightintensity') {
        newUnits.light = value;
      }
      
      return newUnits;
    });
    
    // Increment version to force updates
    setVersion(v => v + 1);
  };

  // Reset all units to defaults
  const resetUnits = () => {
    console.log('Resetting units to defaults');
    setUnitsState(defaultUnits);
    setVersion(v => v + 1);
  };

  // Convert value from one unit to another
  const convertValue = (property, value, fromUnit) => {
    try {
      // Handle non-numeric values
      if (typeof value !== 'number') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return value;
        value = numValue;
      }
      
      // Normalize property name
      let prop = property.toLowerCase();
      if (prop === 'light intensity') prop = 'lightintensity';
      
      // Get target unit
      const targetUnit = units[prop];
      
      // If units are the same, no conversion needed
      if (fromUnit === targetUnit) return value;
      
      // If we have conversion functions for this property
      if (conversions[prop] && conversions[prop][fromUnit] && conversions[prop][fromUnit][targetUnit]) {
        return conversions[prop][fromUnit][targetUnit](value);
      }
      
      // If no conversion function, return original value
      return value;
    } catch (e) {
      console.error('Conversion error:', e);
      return value;
    }
  };

  // Format a value with the appropriate unit symbol
  const formatValue = (property, value, fromUnit) => {
    try {
      // Handle non-numeric values
      if (typeof value !== 'number') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return String(value);
        value = numValue;
      }
      
      // Normalize property name
      let prop = property.toLowerCase();
      if (prop === 'light intensity') prop = 'lightintensity';
      
      // Get target unit
      const targetUnit = units[prop];
      
      // Convert value if needed
      const convertedValue = (fromUnit && fromUnit !== targetUnit) 
        ? convertValue(prop, value, fromUnit)
        : value;
      
      // Format with appropriate precision
      let formattedValue;
      if (prop === 'temperature') {
        formattedValue = convertedValue.toFixed(1);
      } else if (prop === 'co2') {
        // Special handling for CO2 - ensure it's an integer
        formattedValue = Math.round(convertedValue);
      } else if (prop === 'energy' && targetUnit === 'mwh') {
        formattedValue = convertedValue.toFixed(3);
      } else if (prop === 'pressure' && targetUnit === 'bar') {
        formattedValue = convertedValue.toFixed(3);
      } else {
        formattedValue = Math.round(convertedValue);
      }
      
      // Get unit symbol
      const symbol = unitSymbols[prop] && unitSymbols[prop][targetUnit] 
        ? unitSymbols[prop][targetUnit] 
        : '';
      
      return `${formattedValue}${symbol}`;
    } catch (e) {
      console.error('Formatting error:', e);
      return String(value);
    }
  };

  // Create context value with all needed functions
  const contextValue = {
    units,
    setUnit,
    resetUnits,
    convertValue,
    formatValue,
    version // Include version to force updates
  };

  return (
    <UnitContext.Provider value={contextValue}>
      {children}
    </UnitContext.Provider>
  );
};

// Custom hook to use the unit context
export const useUnits = () => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnits must be used within a UnitProvider');
  }
  return context;
};

export default UnitContext;