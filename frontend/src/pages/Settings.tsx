import React, { useState, useEffect } from 'react';
import { Save, GitPullRequest, Code, Moon } from 'lucide-react';

const Settings = () => {
  const [pat, setPat] = useState('');
  const [rules, setRules] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPat(localStorage.getItem('github_pat') || '');
    setRules(localStorage.getItem('custom_rules') || '');
  }, []);

  const handleSave = () => {
    localStorage.setItem('github_pat', pat);
    localStorage.setItem('custom_rules', rules);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure FINECODE integration and analysis preferences.</p>
      </header>

      <div className="bg-panel border border-gray-800 rounded-lg p-8 space-y-8">
        {/* GitHub Integration */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <GitPullRequest className="text-gray-400" size={20} />
            <h2 className="text-xl font-semibold text-white">GitHub Integration</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Personal Access Token (PAT)</label>
            <input
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-[#0f1115] text-gray-300 focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm font-mono"
            />
            <p className="mt-2 text-xs text-gray-500">Requires `repo` permissions to analyze and commit fixes. Stored locally.</p>
          </div>
        </section>

        <hr className="border-gray-800" />

        {/* Custom Rules */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Code className="text-gray-400" size={20} />
            <h2 className="text-xl font-semibold text-white">AI Analysis Rules</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Global System Prompt Extensions</label>
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={4}
              placeholder="e.g., Always prefer functional patterns. Enforce strict null checks."
              className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-[#0f1115] text-gray-300 focus:outline-none focus:ring-1 focus:ring-accent sm:text-sm font-mono"
            />
          </div>
        </section>

        <hr className="border-gray-800" />

        {/* IDE Integration */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Moon className="text-gray-400" size={20} />
            <h2 className="text-xl font-semibold text-white">Theme & IDE</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Theme Preference</label>
              <select className="block w-full px-3 py-2 border border-gray-700 rounded-md bg-[#0f1115] text-gray-300 sm:text-sm">
                <option value="dark">Dark (Default)</option>
                <option value="light" disabled>Light (Coming Soon)</option>
                <option value="system" disabled>System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">VS Code Integration</label>
              <div className="text-sm text-gray-500">
                <p className="mb-2">Download the extension to sync findings directly to your editor.</p>
                <a href="#" className="text-accent hover:underline flex items-center gap-1">Download Extension</a>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-4 flex justify-end items-center gap-4">
          {saved && <span className="text-accent text-sm flex items-center gap-1">Saved successfully!</span>}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-[#0f1115] hover:bg-[#1ea34d] rounded-md font-medium transition-colors"
          >
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
