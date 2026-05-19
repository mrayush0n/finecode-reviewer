import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderGit2, History, Settings, Activity } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-panel border-r border-gray-800 flex flex-col fixed left-0 top-0 text-gray-300">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2 font-mono">
          <Activity className="text-accent" />
          FINECODE
        </h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Agentic Reviewer</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'
            }`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/repositories"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'
            }`
          }
        >
          <FolderGit2 size={18} />
          Repositories
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'
            }`
          }
        >
          <History size={18} />
          Review History
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-white' : 'hover:bg-gray-800/50 hover:text-white'
            }`
          }
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Settings size={18} />
              Settings
            </div>
            {/* Mock IDE Connection Status */}
            <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(34,197,94,0.8)]" title="IDE Connected"></div>
          </div>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
        Powered by Advanced AI
      </div>
    </div>
  );
};

export default Sidebar;
