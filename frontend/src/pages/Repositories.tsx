import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ExternalLink, RefreshCw } from 'lucide-react';

type Repo = {
  id: string;
  name: string;
  owner: string;
  syncStatus: string;
  url: string;
};

const Repositories = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/repos')
      .then(setRepos)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tracked Repositories</h1>
          <p className="text-gray-400">Manage GitHub repositories connected to FINECODE.</p>
        </div>
      </header>

      {loading ? (
        <div className="text-gray-400">Loading repositories...</div>
      ) : repos.length === 0 ? (
        <div className="bg-panel border border-gray-800 p-8 rounded-lg text-center text-gray-500">
          No repositories tracked yet. Analyze a PR to add a repository.
        </div>
      ) : (
        <div className="bg-panel border border-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#0f1115]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Repository</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-panel divide-y divide-gray-800">
              {repos.map((repo) => (
                <tr key={repo.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-white">{repo.owner}/{repo.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/30 text-accent border border-accent/20">
                      <RefreshCw className="w-3 h-3 mr-1 inline animate-spin-slow" />
                      {repo.syncStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`https://vscode.dev/github/${repo.owner}/${repo.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white flex items-center justify-end gap-1"
                    >
                      Open in VS Code.dev <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Repositories;
