import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { ExternalLink, Download, Check, X, Code2, FileText, Activity, Brain, Users, Terminal, BookOpen, AlertTriangle, Target, Heart, ShieldQuestion, DollarSign } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MermaidViewer from '../components/MermaidViewer';

type PRData = {
  pr: { 
    id: string; number: number; title: string; url: string;
    advancedData?: {
      summary: string;
      reverseRequirements: string;
      burnoutEmpathy: string;
      busFactorDocs: string;
      chaosMeshTest: string;
      dependencyFuturism: string;
    }
  };
  findings: Array<{
    id: string; filePath: string; severity: string; description: string; snippet: string; suggestedFix: string; status: string;
    personaDebate?: { security: string; architect: string; junior: string; };
    mermaidDiagram?: string;
    exploitScript?: string;
    impactScore?: { carbonCost: string; cognitiveLoad: number; };
    complianceWarning?: string;
    chestertonsFence?: string;
    generatedUnitTest?: string;
    bountyValue?: number;
  }>;
};

const PRDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState<PRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'docs'>('overview');

  const fetchPR = () => {
    api.get(`/prs/${id}`)
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPR();
  }, [id]);

  const handleDismiss = async (findingId: string) => {
    setActionLoading(findingId);
    try {
      await api.post('/dismiss-finding', { findingId });
      fetchPR();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCommit = async (findingId: string) => {
    setActionLoading(findingId);
    try {
      await api.post('/commit-suggestion', { findingId });
      fetchPR();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const exportReport = () => {
    if (!data) return;
    const md = `# Report for PR #${data.pr.number}: ${data.pr.title}\n\n` +
      data.findings.map(f => `## ${f.filePath} (${f.severity})\n**Issue:** ${f.description}\n\n\`\`\`\n${f.snippet}\n\`\`\`\n**Fix:**\n\`\`\`\n${f.suggestedFix}\n\`\`\`\n`).join('\n---\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pr-${data.pr.number}-report.md`;
    a.click();
  };

  if (loading) return <div className="text-gray-400">Loading analysis...</div>;
  if (!data) return <div className="text-red-400">PR not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex justify-between items-start mb-8 bg-panel p-6 rounded-lg border border-gray-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{data.pr.title}</h1>
            <span className="text-gray-500 font-mono">#{data.pr.number}</span>
          </div>
          <a href={data.pr.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
            View on GitHub <ExternalLink size={14} />
          </a>
        </div>
        <div className="flex gap-3">
          <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 transition-colors border border-gray-700 text-sm">
            <Download size={16} /> Export Report
          </button>
        </div>
      </header>

      {/* IDE-Style Tabs */}
      <div className="flex border-b border-gray-800 mb-6 bg-[#09090b]">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`px-6 py-3 text-sm font-medium tracking-wide transition-colors border-b-2 ${activeTab === 'overview' ? 'border-accent text-white bg-panel' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-panel/50'}`}>
          <span className="opacity-50 mr-2 text-xs">01</span> README.md
        </button>
        <button 
          onClick={() => setActiveTab('findings')} 
          className={`px-6 py-3 text-sm font-medium tracking-wide transition-colors border-b-2 ${activeTab === 'findings' ? 'border-accent text-white bg-panel' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-panel/50'}`}>
          <span className="opacity-50 mr-2 text-xs">02</span> findings.json <span className="ml-2 text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">{data.findings.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('docs')} 
          className={`px-6 py-3 text-sm font-medium tracking-wide transition-colors border-b-2 ${activeTab === 'docs' ? 'border-accent text-white bg-panel' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-panel/50'}`}>
          <span className="opacity-50 mr-2 text-xs">03</span> chaos_mesh_spec.yml
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && data.pr.advancedData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          <div className="space-y-6">
            <div className="bg-panel border border-gray-800 p-6 shadow-sm">
              <h3 className="text-sm text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-widest"><BookOpen size={16} className="text-blue-400" /> Auto-Generated Summary</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{data.pr.advancedData.summary}</p>
            </div>
            
            <div className="bg-panel border border-gray-800 p-6 shadow-sm">
              <h3 className="text-sm text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-widest"><Target size={16} className="text-accent" /> Reverse-Engineered PRD</h3>
              <p className="text-gray-300 text-sm leading-relaxed italic border-l-2 border-accent pl-4">{data.pr.advancedData.reverseRequirements}</p>
            </div>
          </div>

          <div className="space-y-6">
            {data.pr.advancedData.burnoutEmpathy && (
              <div className="bg-[#1a1216] border border-[#3e1b29] p-6 shadow-sm">
                <h3 className="text-sm text-pink-500 mb-3 flex items-center gap-2 uppercase tracking-widest"><Heart size={16} /> Code Empathy Monitor</h3>
                <p className="text-pink-200 text-sm leading-relaxed">{data.pr.advancedData.burnoutEmpathy}</p>
              </div>
            )}
            
            {data.pr.advancedData.dependencyFuturism && (
              <div className="bg-panel border border-gray-800 p-6 shadow-sm">
                <h3 className="text-sm text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-widest"><Activity size={16} className="text-yellow-400"/> Dependency Risk Forecast</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{data.pr.advancedData.dependencyFuturism}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FINDINGS TAB */}
      {activeTab === 'findings' && (
      <div className="space-y-8 font-mono">
        <h2 className="text-sm text-gray-500 uppercase tracking-widest flex items-center gap-2"><Code2 size={16}/> Security & Quality Vectors</h2>
        {data.findings.length === 0 ? (
          <div className="text-gray-500 bg-panel p-8 border border-gray-800 text-center">system_status: OK // No vulnerabilities detected.</div>
        ) : (
          data.findings.map((finding) => (
            <div key={finding.id} className="bg-panel border border-gray-800 flex flex-col shadow-sm relative group">
              {/* Diff-style Header */}
              <div className="px-5 py-3 border-b border-gray-800 flex justify-between items-center bg-[#0d0d10]">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-0.5 text-xs font-bold ${
                    finding.severity === 'Blocker' ? 'bg-red-900/30 text-red-500 border border-red-500/30' :
                    finding.severity === 'Warning' ? 'bg-yellow-900/30 text-yellow-500 border border-yellow-500/30' :
                    'bg-blue-900/30 text-blue-500 border border-blue-500/30'
                  }`}>
                    [{finding.severity.toUpperCase()}]
                  </span>
                  <span className="text-sm text-gray-400 flex items-center gap-2"><Code2 size={14} className="text-gray-600"/> {finding.filePath}</span>
                </div>
                <div className="flex gap-3 items-center">
                  {finding.bountyValue && finding.status === 'active' && (
                    <span className="text-xs text-accent font-bold flex items-center gap-1">
                      <DollarSign size={14} /> {finding.bountyValue} BOUNTY
                    </span>
                  )}
                  {finding.status !== 'active' && (
                    <span className={`text-xs px-2 py-1 ${finding.status === 'applied' ? 'text-accent bg-accent/10' : 'text-gray-500 bg-gray-800'}`}>
                      STATUS: {finding.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6 space-y-8">
                <div>
                  <p className="text-gray-300 text-sm leading-relaxed">&gt;&gt; {finding.description}</p>
                </div>

                {finding.chestertonsFence && (
                  <div className="bg-[#1a1710] border border-[#3e341b] p-5 flex items-start gap-3">
                    <ShieldQuestion className="text-yellow-600 mt-0.5 shrink-0" size={18} />
                    <div>
                      <h4 className="text-xs font-bold text-yellow-600 mb-2 uppercase tracking-widest">Chesterton's Fence</h4>
                      <p className="text-sm text-yellow-200/80 leading-relaxed">{finding.chestertonsFence}</p>
                    </div>
                  </div>
                )}

                {finding.complianceWarning && (
                  <div className="bg-[#1a0f0f] border border-[#3e1b1b] p-5 flex items-start gap-3">
                    <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={18} />
                    <div>
                      <h4 className="text-xs font-bold text-red-500 mb-2 uppercase tracking-widest">Compliance Oracle Violation</h4>
                      <p className="text-sm text-red-200/80 leading-relaxed">{finding.complianceWarning}</p>
                    </div>
                  </div>
                )}

                {finding.impactScore && (
                  <div className="flex gap-4">
                    <div className="bg-[#0f0f12] border border-gray-800 p-4 flex-1 flex items-center gap-4">
                      <Activity className="text-blue-500" size={24} />
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Carbon & Compute Impact</div>
                        <div className="text-sm font-bold text-blue-400">{finding.impactScore.carbonCost}</div>
                      </div>
                    </div>
                    <div className="bg-[#0f0f12] border border-gray-800 p-4 flex-1 flex items-center gap-4">
                      <Brain className="text-purple-500" size={24} />
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cognitive Load Score</div>
                        <div className="text-sm font-bold text-purple-400">{finding.impactScore.cognitiveLoad} / 10</div>
                      </div>
                    </div>
                  </div>
                )}

                {finding.personaDebate && (
                  <div className="border border-gray-800 p-5 bg-[#0f0f12]">
                    <h4 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-widest"><Users size={14}/> Council Debate Thread</h4>
                    <div className="space-y-4">
                      <div className="text-sm"><span className="font-bold text-red-500">[Sec_Paranoid]:</span> <span className="text-gray-400">{finding.personaDebate.security}</span></div>
                      <div className="text-sm"><span className="font-bold text-blue-500">[Arch_Pedant]:</span> <span className="text-gray-400">{finding.personaDebate.architect}</span></div>
                      <div className="text-sm"><span className="font-bold text-green-500">[Jr_Dev]:</span> <span className="text-gray-400">{finding.personaDebate.junior}</span></div>
                    </div>
                  </div>
                )}

                {finding.mermaidDiagram && (
                  <div>
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">Visual AST Logic Diff</h4>
                    <MermaidViewer chart={finding.mermaidDiagram} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-0 border border-gray-800">
                  <div className="bg-[#1e1e1e]">
                    <div className="text-[10px] text-red-400/70 p-2 font-mono uppercase tracking-widest border-b border-gray-800 bg-[#2d1b1b]">Original / Vulnerable</div>
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent', padding: '1rem', fontSize: '0.85rem' }}>
                      {finding.snippet}
                    </SyntaxHighlighter>
                  </div>
                  <div className="bg-[#1e1e1e] border-l border-gray-800">
                    <div className="text-[10px] text-accent/70 p-2 font-mono uppercase tracking-widest border-b border-gray-800 bg-[#1b2d22]">Proposed Rewrite</div>
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent', padding: '1rem', fontSize: '0.85rem' }}>
                      {finding.suggestedFix}
                    </SyntaxHighlighter>
                  </div>
                </div>

                {finding.exploitScript && (
                  <div className="mt-6 border border-red-900/50">
                    <h4 className="text-[10px] text-red-500 p-2 uppercase tracking-widest bg-[#2d1b1b] flex items-center gap-2 border-b border-red-900/50"><Terminal size={12}/> auto_exploit.sh</h4>
                    <SyntaxHighlighter language="bash" style={vscDarkPlus} customStyle={{ margin: 0, background: '#1a0f0f', padding: '1rem', fontSize: '0.85rem' }}>
                      {finding.exploitScript}
                    </SyntaxHighlighter>
                  </div>
                )}

                {finding.generatedUnitTest && (
                  <div className="mt-6 border border-blue-900/30">
                    <h4 className="text-[10px] text-blue-400 p-2 uppercase tracking-widest bg-[#1b1f2d] flex items-center gap-2 border-b border-blue-900/30"><Code2 size={12}/> generated_spec.js</h4>
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, background: '#0f111a', padding: '1rem', fontSize: '0.85rem' }}>
                      {finding.generatedUnitTest}
                    </SyntaxHighlighter>
                  </div>
                )}

                {finding.status === 'active' && (
                  <div className="flex justify-end gap-4 pt-4 border-t border-gray-800/50">
                    <button
                      onClick={() => handleDismiss(finding.id)}
                      disabled={!!actionLoading}
                      className="px-5 py-2 text-sm text-gray-500 hover:text-white hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50 transition-colors border border-transparent"
                    >
                      <X size={16} /> Ignore
                    </button>
                    <button
                      onClick={() => handleCommit(finding.id)}
                      disabled={!!actionLoading}
                      className="px-5 py-2 text-sm bg-accent text-[#09090b] hover:bg-[#0ea5e9] hover:text-white font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)]"
                    >
                      {actionLoading === finding.id ? <span className="animate-spin text-xl leading-none">⟳</span> : <Check size={16} />}
                      EXECUTE_PATCH
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {/* DOCS & TESTS TAB */}
      {activeTab === 'docs' && data.pr.advancedData && (
        <div className="space-y-8 font-mono">
          <div className="bg-panel border border-gray-800 shadow-sm">
            <h3 className="text-[10px] text-purple-400 p-3 border-b border-gray-800 bg-[#16121f] uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} /> BUS_FACTOR_EXTRACTION.md</h3>
            {data.pr.advancedData.busFactorDocs ? (
               <div>
                 <SyntaxHighlighter language="markdown" style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent', padding: '1.5rem', fontSize: '0.85rem' }}>
                   {data.pr.advancedData.busFactorDocs}
                 </SyntaxHighlighter>
               </div>
            ) : <p className="text-gray-600 italic p-6">// No legacy systems detected requiring new bus factor documentation.</p>}
          </div>

          <div className="bg-panel border border-gray-800 shadow-sm">
            <h3 className="text-[10px] text-red-500 p-3 border-b border-gray-800 bg-[#2d1b1b] uppercase tracking-widest flex items-center gap-2"><Terminal size={14} /> CHAOS_MESH_SPEC.yaml</h3>
            {data.pr.advancedData.chaosMeshTest ? (
               <div>
                 <SyntaxHighlighter language="yaml" style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent', padding: '1.5rem', fontSize: '0.85rem' }}>
                   {data.pr.advancedData.chaosMeshTest}
                 </SyntaxHighlighter>
               </div>
            ) : <p className="text-gray-600 italic p-6">// No microservice architectural changes detected for Chaos Engineering.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PRDetail;
