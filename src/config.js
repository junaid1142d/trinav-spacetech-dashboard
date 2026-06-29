export const appConfig = {
  organization: 'TRINAV SPACETECH',
  title: 'Atmospheric Pressure Monitoring Dashboard',
  subtitle: 'Developed by Junaid Ahmed',
  developerName: 'Junaid Ahmed',
  linkedinUrl: 'https://www.linkedin.com/in/junaid-ahmed-a38480288',
  map: {
    center: [11.1271, 78.6569],
    zoom: 7,
    bounds: [
      [8.0, 76.0],
      [13.7, 80.7],
    ],
  },
  dataSources: {
    latest: '/data/tamilnadu_pressure_latest.csv',
    timeseries: '/data/tamilnadu_pressure_timeseries.csv',
  },
};
