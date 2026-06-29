# TRINAV SPACETECH

Atmospheric Pressure Monitoring Dashboard developed by Junaid Ahmed.

This is a production-ready React 19, Vite, Tailwind CSS, React Leaflet, PapaParse, Recharts, Framer Motion, Lucide React, and React CountUp dashboard for geospatial atmospheric pressure observations across Tamil Nadu.

## Features

- Automatic startup loading for `public/data/tamilnadu_pressure_latest.csv`
- Automatic startup loading for `public/data/tamilnadu_pressure_timeseries.csv`
- Tamil Nadu centered interactive Leaflet map with station popups
- Dashboard KPIs, recent observations, and system status
- Dedicated station analytics with pressure vs time charts
- Stations page with cards, table, search, filter, sort, and map view
- Data explorer with search, pagination, sorting, filters, and CSV export
- Future-ready API facade for Azure Data Explorer integration
- Azure Static Web Apps routing and GitHub Actions deployment workflow

## Local Development

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal.

## Production Build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

## Data Contract

Both CSV files must use these columns:

```csv
Station,City,Latitude,Longitude,Timestamp,Pressure_hPa
```

`Pressure_hPa` is parsed as a numeric value before calculations.

## Configuration

Update the LinkedIn profile URL in `src/config.js`:

```js
linkedinUrl: 'https://www.linkedin.com/in/junaid-ahmed/'
```

## Azure Static Web Apps

1. Create an Azure Static Web App resource connected to the GitHub repository.
2. Add the deployment token as `AZURE_STATIC_WEB_APPS_API_TOKEN` in GitHub repository secrets.
3. Push to `main` or `master`.
4. The workflow in `.github/workflows/azure-static-web-apps.yml` installs dependencies, builds the Vite app, and uploads `dist/`.

## Future Azure Data Explorer Integration

`src/services/api.js` exposes the prepared API boundary:

- `GET /api/stations`
- `GET /api/station/{id}`
- `GET /api/timeseries/{id}`

The current implementation intentionally continues to use CSV files through `src/services/csvService.js`.
