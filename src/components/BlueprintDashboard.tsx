import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AuditResult } from '../services/auditService';
import { ExternalLink, Target, Zap, Layers, Link as LinkIcon, AlertCircle, ChevronLeft, History, Database } from 'lucide-react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface BlueprintDashboardProps {
  data: AuditResult;
  onReturn: () => void;
}

interface SavedAudit extends AuditResult {
  id: string;
  brandName: string;
  competitors: string[];
  strategicIntent: string;
  createdAt: string;
}

export const BlueprintDashboard: React.FC<BlueprintDashboardProps> = ({ data, onReturn }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [history, setHistory] = useState<SavedAudit[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<SavedAudit | null>(null);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const q = query(collection(db, 'audits'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const audits: SavedAudit[] = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        audits.push({
          id: doc.id,
          brandName: docData.brandName,
          competitors: docData.competitors || [],
          strategicIntent: docData.strategicIntent,
          visibilityDeficitScore: docData.visibilityDeficitScore,
          priorityScore: docData.priorityScore || 0,
          referenceParity: docData.referenceParity || '',
          authorityErasure: docData.authorityErasure || 0,
          statusText: docData.statusText || '',
          actionableBottlenecks: docData.actionableBottlenecks || [],
          competitorMO: docData.competitorMO || '',
          theFix: docData.theFix || [],
          platformGapAnalysis: docData.platformGapAnalysis || [],
          sourceAttribution: docData.sourceAttribution || [],
          createdAt: docData.createdAt,
        });
      });
      setHistory(audits);
    } catch (error: any) {
      console.error("Error fetching history:", error);
      setHistoryError(error.message || "Unknown error occurred while fetching database.");
      try {
        handleFirestoreError(error, OperationType.LIST, 'audits');
      } catch (e) {
        // Ignore the thrown error from handleFirestoreError as we already set it in state
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-mono p-8">
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center border-b border-slate-200 pb-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={onReturn}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900"
            title="Return to Void"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-blue-600">THE BLUEPRINT</h1>
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Admin-Only Strategic Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-200 p-1 rounded">
            <button 
              onClick={() => setActiveTab('current')}
              className={`px-4 py-2 text-xs font-bold uppercase rounded transition-colors ${activeTab === 'current' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Current Audit
            </button>
            <button 
              onClick={() => {
                setActiveTab('history');
                setSelectedAudit(null);
              }}
              className={`px-4 py-2 text-xs font-bold uppercase rounded transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Database size={14} /> Database
            </button>
          </div>
          <div className="bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase rounded">
            Admin Session Active
          </div>
          <button 
            onClick={() => {
              onReturn();
              // To fully reset, we need to call handleReset from App.tsx, but we only have onReturn.
              // Actually, we can just reload the page to go back to the start.
              window.location.href = '/';
            }}
            className="text-[10px] font-bold uppercase text-slate-400 hover:text-blue-600 transition-colors"
          >
            Return to Main Page
          </button>
          <button 
            onClick={onReturn}
            className="text-[10px] font-bold uppercase text-slate-400 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {activeTab === 'current' ? (
          <AuditDetailsView data={data} />
        ) : selectedAudit ? (
          <div>
            <button 
              onClick={() => setSelectedAudit(null)}
              className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={16} /> Back to Database
            </button>
            <div className="mb-8 p-6 bg-white border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-2">
                {selectedAudit.brandName} <span className="text-slate-400 font-normal">vs</span> {selectedAudit.competitors.join(', ')}
              </h2>
              <p className="text-sm text-slate-600 italic">"{selectedAudit.strategicIntent}"</p>
              <div className="mt-4 text-xs text-slate-400 font-bold uppercase">
                Audit Date: {new Date(selectedAudit.createdAt).toLocaleString()}
              </div>
            </div>
            <AuditDetailsView data={selectedAudit} />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-2 text-blue-600 border-b border-slate-100 pb-4">
              <History size={20} /> Audit Database (Global Record)
            </h3>
            
            {loadingHistory ? (
              <div className="text-center py-12 text-slate-400 text-sm font-bold uppercase animate-pulse">
                Querying Database...
              </div>
            ) : historyError ? (
              <div className="text-center py-12 text-red-500 text-sm font-bold uppercase max-w-2xl mx-auto">
                <AlertCircle className="mx-auto mb-4" size={32} />
                <p>Database Error</p>
                <p className="mt-2 text-xs opacity-80 normal-case">{historyError}</p>
                {historyError.includes('Missing or insufficient permissions') && (
                  <p className="mt-4 text-xs text-slate-500 normal-case">
                    Fix: Please ensure Anonymous Authentication is enabled in the Firebase Console.
                  </p>
                )}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm font-bold uppercase">
                No records found. Run a new audit to populate the database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Brand</th>
                      <th className="px-4 py-3">Strategic Intent</th>
                      <th className="px-4 py-3 text-right">Deficit Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((record) => (
                      <tr 
                        key={record.id} 
                        onClick={() => setSelectedAudit(record)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-slate-500">
                          {new Date(record.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-900">
                          {record.brandName}
                        </td>
                        <td className="px-4 py-4 text-slate-600 max-w-md truncate" title={record.strategicIntent}>
                          {record.strategicIntent}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            record.visibilityDeficitScore > 60 ? 'bg-red-100 text-red-700' : 
                            record.visibilityDeficitScore > 30 ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {record.visibilityDeficitScore}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const AuditDetailsView: React.FC<{ data: AuditResult }> = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    {/* Left Column: Actionable Intelligence */}
    <div className="lg:col-span-4 space-y-8">
      {/* Actionable Bottlenecks */}
      <section className="bg-white border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2 text-blue-600">
          <Target size={14} /> Actionable Bottlenecks
        </h3>
        <ul className="space-y-3">
          {data.actionableBottlenecks.map((item, i) => (
            <li key={i} className="text-sm flex gap-3">
              <span className="text-blue-600 font-bold">0{i + 1}</span>
              <span className="leading-tight">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Competitor MO */}
      <section className="bg-white border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2 text-blue-600">
          <Zap size={14} /> Competitor MO
        </h3>
        <p className="text-sm leading-relaxed italic border-l-2 border-blue-600 pl-4">
          {data.competitorMO}
        </p>
      </section>

      {/* The Fix */}
      <section className="bg-blue-600 text-white p-6 shadow-lg">
        <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2">
          <Layers size={14} /> The Fix (Sales Pitch)
        </h3>
        <div className="space-y-4">
          {data.theFix.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                {i + 1}
              </div>
              <p className="text-sm font-bold">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>

    {/* Right Column: Data & Sources */}
    <div className="lg:col-span-8 space-y-8">
      {/* Source Attribution */}
      <section className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <h3 className="text-xs font-black uppercase flex items-center gap-2">
            <LinkIcon size={14} /> Source Attribution (Competitor Wins)
          </h3>
          <span className="text-[10px] opacity-50">{data.sourceAttribution.length} Sources Found</span>
        </div>
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {data.sourceAttribution.map((source, i) => (
            <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded">
                  {source.competitor}
                </span>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  <ExternalLink size={14} />
                </a>
              </div>
              <p className="text-xs text-slate-500 mb-2 truncate">{source.url}</p>
              <p className="text-sm leading-relaxed text-slate-700 bg-slate-50 p-3 rounded border-l-2 border-slate-200">
                "{source.snippet}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Gap Analysis */}
      <section className="bg-white border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2 text-red-600">
          <AlertCircle size={14} /> Platform Gap Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.platformGapAnalysis.map((gap, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 text-red-700 rounded">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-bold uppercase">{gap}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);
