import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Search, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [prUrl, setPrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prUrl) return;

    setLoading(true);
    setError('');

    try {
      const customRules = localStorage.getItem('custom_rules') || '';
      const data = await api.post('/analyze-pr', { prUrl, customRules });
      navigate(`/pr/${data.pr.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze PR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Trigger an AI-powered code review pipeline manually.</p>
      </header>

      <div className="bg-panel p-8 rounded-lg border border-gray-800 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-6">Analyze GitHub Pull Request</h2>
        
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">GitHub PR URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="url"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/pull/123"
                className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md leading-5 bg-[#0f1115] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
                required
              />
            </div>
          </div>
          
          {error && <div className="text-red-400 text-sm">{error}</div>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !prUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[#0f1115] bg-accent hover:bg-[#1ea34d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#161b22] focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Analyzing with AI...
                </>
              ) : (
                'Start Review Pipeline'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder cards for metrics */}
        <div className="bg-panel p-6 rounded-lg border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Active Scans</div>
          <div className="text-2xl font-bold text-white">0</div>
        </div>
        <div className="bg-panel p-6 rounded-lg border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">Total Findings Dismissed</div>
          <div className="text-2xl font-bold text-white">0</div>
        </div>
        <div className="bg-panel p-6 rounded-lg border border-gray-800">
          <div className="text-gray-400 text-sm mb-1">AI Fixes Applied</div>
          <div className="text-2xl font-bold text-accent">0</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
