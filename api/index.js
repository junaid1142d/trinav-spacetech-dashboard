import app from '../server/app.js';

// Vercel's Node runtime calls exported functions with (req, res). An Express
// app instance is itself callable as (req, res) => void, so exporting it
// directly here is sufficient — no extra adapter needed.
export default app;
