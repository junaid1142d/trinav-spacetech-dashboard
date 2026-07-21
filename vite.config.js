import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ogc/wms': {
        target: 'https://gibs.earthdata.nasa.gov',
        changeOrigin: true,
        rewrite: () => '/wms/epsg3857/best/wms.cgi',
      },
      '/api/ogc/wfs': {
        target: 'https://ahocevar.com',
        changeOrigin: true,
        rewrite: () => '/geoserver/wfs',
      },
    },
  },
})
