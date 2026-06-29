export const formatPressure = (value) =>
  Number.isFinite(value) ? `${value.toFixed(1)} hPa` : 'Unavailable';

export const formatDateTime = (value) => {
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unavailable';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
};

export const formatCoordinate = (value) => (Number.isFinite(value) ? value.toFixed(4) : '--');

export const trendLabel = (trend) => {
  if (trend > 0.25) return 'Rising';
  if (trend < -0.25) return 'Falling';
  return 'Stable';
};
