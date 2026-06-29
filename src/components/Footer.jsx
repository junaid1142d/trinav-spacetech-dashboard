import { memo } from 'react';
import { appConfig } from '../config.js';

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/70 px-4 py-5 text-sm text-zinc-400 backdrop-blur-xl sm:px-6 lg:px-8 lg:pl-80">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>OGC SensorThings Compatible</p>
        <p>Powered by Azure Data Explorer</p>
        <p>
          Developed by{' '}
          <a
            href={appConfig.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
          >
            {appConfig.developerName}
          </a>
        </p>
      </div>
    </footer>
  );
}

export default memo(Footer);
