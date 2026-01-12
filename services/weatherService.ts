
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
 * Converts wind degrees to cardinal direction strings.
 */
const getCardinalDirection = (angle: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(angle / 45) % 8];
};

/**
 * Fetches real-time weather data from OpenWeatherMap API.
 * Maps the response to the WeatherSnapshot format used by the Pilot Dashboard.
 */
export const fetchLiveWeather = async (lat: number, lon: number, apiKey: string): Promise<WeatherSnapshot> => {
  if (!apiKey || apiKey === 'FREE_SUN_MOCK_KEY') {
    // Graceful fallback for development if key is missing or is the mock placeholder
    console.warn("Weather API Key is missing or invalid. Using safety-first default values.");
    return {
      temp: '68°F',
      windSpeed: 0,
      windDirection: 'CALM',
      visibility: '10 mi',
      timestamp: Date.now(),
      hasStormCell: false
    };
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Weather Service Error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    // OpenWeatherMap visibility is in meters. 1609.34 meters = 1 mile.
    const visibilityInMiles = data.visibility ? Math.round(data.visibility / 1609.34) : 10;
    
    // Check for thunderstorm activity (Weather codes 2xx indicate Thunderstorms)
    const weatherId = data.weather?.[0]?.id || 800;
    const hasStormCell = weatherId >= 200 && weatherId < 300;

    return {
      temp: `${Math.round(data.main.temp)}°F`,
      windSpeed: Math.round(data.wind.speed),
      windDirection: getCardinalDirection(data.wind.deg),
      visibility: `${visibilityInMiles} mi`,
      timestamp: Date.now(), // Use local time of receipt for trend analysis
      hasStormCell: hasStormCell
    };
  } catch (err) {
    console.error("Critical Weather Fetch Failure:", err);
    throw err; // Re-throw to be handled by the UI layer (Dashboard.tsx)
  }
};

/**
 * Logic to detect rapid changes between two weather snapshots.
 * This is critical for hot air balloon safety as trends can indicate inbound hazards.
 */
export const detectWeatherAlerts = (current: WeatherSnapshot, previous: WeatherSnapshot | null): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];
  if (!previous) return alerts;

  // 1. Detect Rapid Wind Increase (> 5mph shift) - critical for landing safely
  if (current.windSpeed - previous.windSpeed >= 5) {
    alerts.push({
      id: `wind-inc-${current.timestamp}`,
      type: 'RAPID_INCREASE',
      severity: 'high',
      message: `Rapid wind increase detected: +${current.windSpeed - previous.windSpeed} mph in last interval. Check landing feasibility.`,
      timestamp: current.timestamp
    });
  }

  // 2. Detect Direction Shift - affects navigation and planned flight path
  if (current.windDirection !== previous.windDirection && previous.windDirection !== 'CALM') {
    alerts.push({
      id: `wind-shift-${current.timestamp}`,
      type: 'WIND_SHIFT',
      severity: 'medium',
      message: `Significant wind shift: Direction changed from ${previous.windDirection} to ${current.windDirection}.`,
      timestamp: current.timestamp
    });
  }

  // 3. Detect Storm Cells - immediate grounding required for balloons
  if (current.hasStormCell) {
    alerts.push({
      id: `storm-${current.timestamp}`,
      type: 'STORM_CELL',
      severity: 'high',
      message: 'Convective storm activity detected in your operational zone. Immediate landing/grounding advised.',
      timestamp: current.timestamp
    });
  }

  return alerts;
};
