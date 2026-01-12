
export interface WeatherSnapshot {
  temp: string;
  windSpeed: number;
  windDirection: string;
  visibility: string;
  timestamp: number;
  hasStormCell: boolean;
}

export interface WeatherAlert {
  id: string;
  type: 'WIND_SHIFT' | 'STORM_CELL' | 'RAPID_INCREASE';
  severity: 'high' | 'medium';
  message: string;
  timestamp: number;
}

/**
 * Simulates fetching data from a live weather API.
 * In a production app, this would use fetch() with an API key from OpenWeatherMap or similar.
 */
export const fetchLiveWeather = async (lat: number, lon: number, apiKey: string): Promise<WeatherSnapshot> => {
  // Log usage of apiKey to prepare for real-world integration
  if (!apiKey) {
    console.warn("fetchLiveWeather: Missing API Key for weather service.");
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock data generation with some randomness to simulate "real-time" changes
  const baseWind = 12;
  const randomShift = Math.random();
  
  return {
    temp: `${65 + Math.floor(Math.random() * 5)}°F`,
    windSpeed: baseWind + (randomShift > 0.8 ? 8 : Math.floor(Math.random() * 4)), // Occasional gust
    windDirection: randomShift > 0.9 ? 'W' : 'NW', // Occasional direction shift
    visibility: '10 mi',
    timestamp: Date.now(),
    hasStormCell: randomShift > 0.95 // 5% chance of a storm cell appearing in mock
  };
};

/**
 * Logic to detect rapid changes between two weather snapshots.
 */
export const detectWeatherAlerts = (current: WeatherSnapshot, previous: WeatherSnapshot | null): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];
  if (!previous) return alerts;

  // 1. Detect Rapid Wind Increase (> 5mph shift)
  if (current.windSpeed - previous.windSpeed >= 5) {
    alerts.push({
      id: `wind-inc-${current.timestamp}`,
      type: 'RAPID_INCREASE',
      severity: 'high',
      message: `Rapid wind increase detected: +${current.windSpeed - previous.windSpeed} mph in last interval.`,
      timestamp: current.timestamp
    });
  }

  // 2. Detect Direction Shift
  if (current.windDirection !== previous.windDirection) {
    alerts.push({
      id: `wind-shift-${current.timestamp}`,
      type: 'WIND_SHIFT',
      severity: 'medium',
      message: `Wind shift: Direction changed from ${previous.windDirection} to ${current.windDirection}.`,
      timestamp: current.timestamp
    });
  }

  // 3. Detect Storm Cells
  if (current.hasStormCell) {
    alerts.push({
      id: `storm-${current.timestamp}`,
      type: 'STORM_CELL',
      severity: 'high',
      message: 'Inbound storm cell detected within 5 miles. Immediate grounding advised.',
      timestamp: current.timestamp
    });
  }

  return alerts;
};
