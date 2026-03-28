import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, ShieldCheck, AlertCircle, Plus, X, ArrowRight } from 'lucide-react';
import { VoidDashboard } from './components/VoidDashboard';
import { BlueprintDashboard } from './components/BlueprintDashboard';
import { LoginModal } from './components/LoginModal';
import { performAudit, AuditInput, AuditResult } from './services/auditService';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './utils/firestoreErrorHandler';

const ADMIN_PASSWORD = 'geonest-admin';

const AuditForm = ({ onAuditStart }: { onAuditStart: (input: AuditInput) => void }) => {
  const [brandName, setBrandName] = useState('');
  const [competitors, setCompetitors] = useState<string[]>(['', '', '']);
  const [strategicIntent, setStrategicIntent] = useState('');

  const handleAddCompetitor = () => {
    if (competitors.length < 5) {
      setCompetitors([...competitors, '']);
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    if (competitors.length > 3) {
      const newCompetitors = [...competitors];
      newCompetitors.splice(index, 1);
      setCompetitors(newCompetitors);
    }
  };

  const handleCompetitorChange = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandName && competitors.every(c => c.trim()) && strategicIntent) {
      onAuditStart({ brandName, competitors, strategicIntent });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-mono flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full border-4 border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="mb-12">
          <h1 className="text-6xl font-black tracking-tighter mb-2">GEONEST</h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-600">Generative Engine Audit v1.0</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase block">Target Brand Name</label>
            <input 
              type="text" 
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. AcmeCorp"
              required
              className="w-full border-2 border-black p-4 text-xl font-bold outline-none focus:bg-black focus:text-white transition-colors"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase">Competitor Landscape (3-5)</label>
              {competitors.length < 5 && (
                <button 
                  type="button" 
                  onClick={handleAddCompetitor}
                  className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-red-600"
                >
                  <Plus size={12} /> Add Competitor
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {competitors.map((comp, i) => (
                <div key={i} className="relative">
                  <input 
                    type="text" 
                    value={comp}
                    onChange={(e) => handleCompetitorChange(i, e.target.value)}
                    placeholder={`Competitor ${i + 1}`}
                    required
                    className="w-full border-2 border-black p-3 font-bold outline-none focus:border-red-600"
                  />
                  {competitors.length > 3 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveCompetitor(i)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase block">Strategic Intent (Use-Case)</label>
            <textarea 
              value={strategicIntent}
              onChange={(e) => setStrategicIntent(e.target.value)}
              placeholder="e.g. Enterprise-grade AI infrastructure for financial compliance"
              required
              rows={3}
              className="w-full border-2 border-black p-4 font-bold outline-none focus:bg-black focus:text-white transition-colors resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-black text-white py-6 text-xl font-black uppercase hover:bg-red-600 transition-colors flex items-center justify-center gap-4 group"
          >
            Initiate Audit <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const LoadingScreen = ({ status, elapsed }: { status: string; elapsed: number }) => (
  <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-12 text-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="mb-8"
    >
      <Loader2 size={64} className="text-red-600" />
    </motion.div>
    <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter">Analyzing Narrative Dominance</h2>
    <p className="text-sm opacity-50 max-w-md uppercase tracking-widest mb-4">{status}</p>
    
    <div className="text-red-600 font-bold text-xl mb-8">
      ELAPSED: {elapsed}s <span className="text-[10px] opacity-50 ml-2">(EST. 45s)</span>
    </div>

    <div className="mt-4 w-64 h-1 bg-white/10 relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-red-600"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
    
    {elapsed > 90 && (
      <p className="mt-8 text-[10px] text-red-500 uppercase font-bold animate-pulse">
        Extended analysis in progress. Please hold...
      </p>
    )}
  </div>
);

const MainApp = () => {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [input, setInput] = useState<AuditInput | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let interval: any;
    if (loading) {
      setElapsed(0);
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAuditStart = async (auditInput: AuditInput) => {
    setInput(auditInput);
    setLoading(true);
    setLoadingStatus(`Intercepting active AI search queries for "${auditInput.strategicIntent}"... Identifying brand displacement.`);

    try {
      // 1. Scrape data via Tavily Proxy
      const queries = [
        `${auditInput.brandName} ${auditInput.strategicIntent}`,
        ...auditInput.competitors.map(c => `${c} ${auditInput.strategicIntent}`)
      ];

      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries })
      });

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(errorData.error || 'Search failed');
      }
      
      const searchData = await searchResponse.json();

      setLoadingStatus(`Calculating ${auditInput.brandName}'s authority erasure vs ${auditInput.competitors.join(', ')}...`);

      // 2. Analyze with Gemini
      const result = await performAudit(auditInput, searchData);
      setAuditResult(result);

      // 3. Save to Firestore
      try {
        const cleanData = {
          brandName: auditInput.brandName || '',
          competitors: auditInput.competitors || [],
          strategicIntent: auditInput.strategicIntent || '',
          visibilityDeficitScore: result.visibilityDeficitScore || 0,
          priorityScore: result.priorityScore || 0,
          referenceParity: result.referenceParity || '',
          authorityErasure: result.authorityErasure || 0,
          statusText: result.statusText || '',
          actionableBottlenecks: result.actionableBottlenecks || [],
          competitorMO: result.competitorMO || '',
          theFix: result.theFix || [],
          platformGapAnalysis: result.platformGapAnalysis || [],
          sourceAttribution: result.sourceAttribution || [],
          createdAt: new Date().toISOString(),
          userId: 'anonymous-fallback'
        };
        
        await addDoc(collection(db, 'audits'), cleanData);
        console.log('Audit saved to database.');
      } catch (dbError: any) {
        console.error("Save error:", dbError);
        alert(`Warning: Audit completed but failed to save to database.\n\nError: ${dbError.message}`);
        try {
          handleFirestoreError(dbError, OperationType.CREATE, 'audits');
        } catch (e) {
          // Ignore thrown error
        }
      }

    } catch (error: any) {
      console.error(error);
      let errorMsg = error.message || 'Unknown error occurred';
      let fixMsg = '';
      
      if (errorMsg.includes('TAVILY_API_KEY')) {
        fixMsg = '\n\nFix: Ensure TAVILY_API_KEY is set in Secrets.';
      } else if (errorMsg.includes('Tavily API rate limit')) {
        fixMsg = '\n\nFix: You have exceeded your Tavily API rate limit or credits. Please check your Tavily account.';
      } else if (errorMsg.includes('Gemini')) {
        fixMsg = '\n\nFix: The AI model failed to process the request. Please try again.';
      }
      
      alert(`AUDIT FAILED: ${errorMsg}${fixMsg}`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setShowLoginModal(false);
      setLoginError('');
      navigate('/admin-blueprint');
    } else {
      setLoginError('Invalid strategic credentials.');
    }
  };

  const toggleBlueprint = () => {
    if (location.pathname === '/admin-blueprint') {
      setIsAdminAuthenticated(false);
      navigate('/');
    } else if (auditResult) {
      if (isAdminAuthenticated) {
        navigate('/admin-blueprint');
      } else {
        setShowLoginModal(true);
      }
    } else {
      console.warn('No audit result found. Run an audit first.');
    }
  };

  const handleReset = () => {
    setAuditResult(null);
    setInput(null);
    navigate('/');
  };

  // Hidden admin access: Press 'Alt + Shift + B' to toggle Blueprint
  // Fallback: Click the "GEONEST" logo 5 times on the dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Using Alt + Shift + B as Ctrl + Shift + B is often a browser shortcut
      // Also checking for 'KeyB' code for better reliability
      if (e.altKey && e.shiftKey && (e.key === 'B' || e.key === 'b' || e.code === 'KeyB')) {
        e.preventDefault();
        console.log('Admin shortcut triggered');
        toggleBlueprint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [auditResult, location.pathname, navigate]);

  if (loading) return <LoadingScreen status={loadingStatus} elapsed={elapsed} />;

  return (
    <>
      <Routes>
        <Route path="/" element={
          auditResult && input ? (
            <VoidDashboard 
              data={auditResult} 
              brandName={input.brandName} 
              onSecretTrigger={toggleBlueprint}
              onReset={handleReset}
            />
          ) : (
            <AuditForm onAuditStart={handleAuditStart} />
          )
        } />
        <Route path="/admin-blueprint" element={
          auditResult && isAdminAuthenticated ? (
            <BlueprintDashboard 
              data={auditResult} 
              onReturn={() => {
                setIsAdminAuthenticated(false);
                navigate('/');
              }} 
            />
          ) : (
            <AuditForm onAuditStart={handleAuditStart} />
          )
        } />
      </Routes>

      <AnimatePresence>
        {showLoginModal && (
          <LoginModal 
            onLogin={handleLogin} 
            onClose={() => setShowLoginModal(false)} 
            error={loginError}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}
