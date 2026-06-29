import { memo, useState } from 'react';
import { Menu } from 'lucide-react';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen subtle-grid text-white">
      <div className="fixed inset-0 -z-10 bg-black/50" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <Navbar onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto flex min-h-[calc(100vh-132px)] w-full max-w-[1680px] flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
            className="glass-panel fixed bottom-5 right-5 z-[700] grid h-12 w-12 place-items-center rounded-full text-white shadow-2xl lg:hidden"
          >
            <Menu size={20} />
          </button>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default memo(AppShell);
