import { Suspense, lazy, memo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import { DataProvider } from './hooks/useCSVLoader.js';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Stations = lazy(() => import('./pages/Stations.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Explorer = lazy(() => import('./pages/Explorer.jsx'));
const About = lazy(() => import('./pages/About.jsx'));

function App() {
  return (
    <DataProvider>
      <AppShell>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stations" element={<Stations />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </DataProvider>
  );
}

export default memo(App);
