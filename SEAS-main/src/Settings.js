import React from 'react';
import { useUnits } from './context/UnitContext';

const Settings = () => {
  // Get units and setUnit function from the context
  const { units, setUnit, resetUnits } = useUnits();

  // Default unit options for each property
  const unitOptions = {
    temperature: [
      { value: 'celsius', label: 'Celsius (°C)' },
      { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
      { value: 'kelvin', label: 'Kelvin (K)' }
    ],
    energy: [
      { value: 'kwh', label: 'Kilowatt-hour (kWh)' },
      { value: 'mwh', label: 'Megawatt-hour (MWh)' },
      { value: 'joule', label: 'Joule (J)' },
      { value: 'btu', label: 'British Thermal Unit (BTU)' }
    ],
    pressure: [
      { value: 'hpa', label: 'Hectopascal (hPa)' },
      { value: 'pa', label: 'Pascal (Pa)' },
      { value: 'bar', label: 'Bar' },
      { value: 'psi', label: 'Pounds per Square Inch (PSI)' }
    ],
    humidity: [
      { value: 'percent', label: 'Percent (%)' },
      { value: 'gramsPerCubicMeter', label: 'Grams per Cubic Meter (g/m³)' }
    ],
    light: [
      { value: 'lux', label: 'Lux (lx)' },
      { value: 'footCandle', label: 'Foot-candle (fc)' }
    ],
    co2: [
      { value: 'ppm', label: 'Parts per Million (ppm)' },
      { value: 'mgm3', label: 'Milligrams per Cubic Meter (mg/m³)' }
    ]
  };

  // Handle unit change
  const handleUnitChange = (property, value) => {
    setUnit(property, value);
  };

  return (
    <div className="settings-container">
      <div className="card">
        <h2 className="card-title">Unit Settings</h2>
        <p className="settings-description">
          Customize the units used to display data across the dashboard.
        </p>
        
        <div className="settings-grid">
          {Object.keys(unitOptions).map((property) => (
            <div className="settings-item" key={property}>
              <div className="settings-label">
                {property === 'co2' ? 'CO2' : property.charAt(0).toUpperCase() + property.slice(1)}
              </div>
              <div className="settings-control">
                <select
                  value={units[property]}
                  onChange={(e) => handleUnitChange(property, e.target.value)}
                  className="settings-select"
                >
                  {unitOptions[property].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
        
        <div className="settings-actions">
          <button className="settings-reset-button" onClick={resetUnits}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;