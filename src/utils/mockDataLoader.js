// Tamil Nadu Weather Stations details
export const defaultStations = [
  { id: "ST-001", name: "Chennai Space & Coastal Observatory", city: "Chennai", lat: 13.0827, lng: 80.2707, basePressure: 1011 },
  { id: "ST-002", name: "Western Ghats Pressure Station", city: "Coimbatore", lat: 11.0168, lng: 76.9558, basePressure: 1008 },
  { id: "ST-003", name: "Madurai Environmental Sensor Hub", city: "Madurai", lat: 9.9252, lng: 78.1198, basePressure: 1013 },
  { id: "ST-004", name: "Cauvery Delta Meteorological Lab", city: "Trichy", lat: 10.7905, lng: 78.7047, basePressure: 1012 },
  { id: "ST-005", name: "Shevaroy Range Monitoring Node", city: "Salem", lat: 11.6643, lng: 78.1460, basePressure: 1007 },
  { id: "ST-006", name: "Indian Ocean Gateway Sensor", city: "Kanyakumari", lat: 8.0883, lng: 77.5385, basePressure: 1014 },
  { id: "ST-007", name: "Nilgiris High-Altitude Observatory", city: "Ooty", lat: 11.4102, lng: 76.6950, basePressure: 1005 }, // Higher altitude = lower baseline pressure, but let's keep it representative of local weather variation or standard sea-level equivalent for dashboard visibility, say base 990 or standard 1012. Let's make it 995 to represent Low Pressure!
  { id: "ST-008", name: "Vellore Smart Meteorological Node", city: "Vellore", lat: 12.9165, lng: 79.1325, basePressure: 1012 },
  { id: "ST-009", name: "Tuticorin Deepwater Port Tracker", city: "Tuticorin", lat: 8.7642, lng: 78.1348, basePressure: 1013 },
  { id: "ST-010", name: "Thanjavur Delta Sensor Node", city: "Thanjavur", lat: 10.7870, lng: 79.1378, basePressure: 1012 }
];

export const generateMockObservations = () => {
  const observations = [];
  const now = new Date();
  
  // Let's generate data for the last 30 days
  // To avoid performance issues in rendering the main list, we can generate hourly data for the last 7 days, 
  // and daily data or 3-hour intervals for the rest. Let's generate 4-hour intervals for 30 days.
  // 10 stations * 6 observations/day * 30 days = 1,800 observations. Extremely responsive, yet rich!
  for (let day = 30; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour += 4) {
      const timestamp = new Date(now.getTime());
      timestamp.setDate(now.getDate() - day);
      timestamp.setHours(hour, 0, 0, 0);
      
      // format: YYYY-MM-DD HH:mm:ss
      const formattedTimestamp = timestamp.toISOString().replace('T', ' ').substring(0, 19);

      defaultStations.forEach((station) => {
        // Base value + diurnal variation (tides) + random walk / storm pattern
        const diurnalVar = Math.sin((hour / 24) * 2 * Math.PI) * 1.5;
        
        // Let's create an environmental storm effect on days 12-15 to simulate a cyclonic depression (Low Pressure)
        let stormEffect = 0;
        if (day >= 12 && day <= 15) {
          // Cyclone Nilam / storm simulation: pressure drops up to 18 hPa in coastal zones
          const proximityToCoast = station.city === "Chennai" || station.city === "Kanyakumari" || station.city === "Tuticorin" ? 1.0 : 0.4;
          stormEffect = - (15 - Math.abs(13.5 - day) * 10) * proximityToCoast;
        }

        // Let's create a high pressure ridge on days 5-8
        let ridgeEffect = 0;
        if (day >= 5 && day <= 8) {
          ridgeEffect = (4 - Math.abs(6.5 - day)) * 1.2;
        }
        
        const noise = (Math.random() - 0.5) * 1.0;
        const pressure = parseFloat((station.basePressure + diurnalVar + stormEffect + ridgeEffect + noise).toFixed(2));
        
        observations.push({
          Station: station.name,
          City: station.city,
          Latitude: station.lat,
          Longitude: station.lng,
          Timestamp: formattedTimestamp,
          Pressure_hPa: pressure
        });
      });
    }
  }
  
  return observations;
};
