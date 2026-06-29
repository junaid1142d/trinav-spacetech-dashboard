import { Activity, Cloud, Database, Map } from 'lucide-react';
import { appConfig } from '../config.js';

const pillars = [
  { icon: Activity, title: 'SensorThings model', body: 'Observation records are normalized into stations, coordinates, timestamps, and numeric pressure values.' },
  { icon: Database, title: 'Azure Data Explorer ready', body: 'The service layer exposes API boundaries that can be redirected from CSV to ADX-backed endpoints.' },
  { icon: Map, title: 'GIS visualization', body: 'React Leaflet renders Tamil Nadu stations on a dark operational map surface.' },
  { icon: Cloud, title: 'Static cloud deployment', body: 'The app is prepared for GitHub and Azure Static Web Apps delivery.' },
];

export default function About() {
  return (
    <>
      <section className="glass-panel rounded-lg p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">
          {appConfig.organization}
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold text-white">{appConfig.title}</h1>
        <p className="mt-5 max-w-4xl text-lg leading-8 text-zinc-300">
          This dashboard demonstrates an atmospheric pressure monitoring system built using an OGC
          SensorThings-compatible data model, Azure Data Explorer, GIS visualization, and time-series
          analytics.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pillars.map(({ icon: Icon, title, body }) => (
          <article key={title} className="glass-panel rounded-lg p-5">
            <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/5">
              <Icon size={20} />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
