import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ChevronRight } from 'lucide-react';

type PR = {
  id: string;
  number: number;
  title: string;
  url: string;
  status: string;
  timestamp: string;
};

const History = () => {
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/prs')
      .then(setPrs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Review History</h1>
        <p className="text-gray-400">Past AI code review scans.</p>
      </header>

      {loading ? (
        <div className="text-gray-400">Loading history...</div>
      ) : prs.length === 0 ? (
        <div className="bg-panel border border-gray-800 p-8 rounded-lg text-center text-gray-500">
          No PRs scanned yet.
        </div>
      ) : (
        <div className="space-y-4">
          {prs.map((pr) => (
            <Link
              key={pr.id}
              to={`/pr/${pr.id}`}
              className="block bg-panel border border-gray-800 rounded-lg p-5 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-gray-400 font-mono text-sm">#{pr.number}</span>
                    <h3 className="text-lg font-medium text-white">{pr.title}</h3>
                  </div>
                  <div className="text-sm text-gray-500">
                    Scanned {new Date(pr.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                    pr.status === 'scanned' ? 'bg-green-900/20 text-accent border border-accent/20' : 'bg-gray-800 text-gray-300'
                  }`}>
                    {pr.status}
                  </span>
                  <ChevronRight className="text-gray-600" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
