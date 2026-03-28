import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Gauge } from './Gauge';
import { AuditResult } from '../services/auditService';
import { AlertTriangle, ShieldAlert, Ghost, Lock, ExternalLink, ChevronRight, Search } from 'lucide-react';

interface VoidDashboardProps {
  data: AuditResult;
  brandName: string;
  onSecretTrigger: () => void;
  onReset: () => void;
}

export const VoidDashboard: React.FC<VoidDashboardProps> = ({ data, brandName, onSecretTrigger, onReset }) => {
  const [showBooking, setShowBooking] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 5) {
      onSecretTrigger();
      setLogoClicks(0);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-mono p-8 max-w-7xl mx-auto border-x border-black/5">
      {/* Header */}
      <header className="border-b-2 border-black pb-6 mb-12 flex justify-between items-end">
        <div onClick={handleLogoClick} className="cursor-default select-none">
          <h1 className="text-6xl font-black tracking-tighter">GEONEST</h1>
          <p className="text-sm mt-2 font-bold uppercase tracking-widest text-red-600">Generative Engine Audit // {brandName}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-3">
          <div>
            <p className="text-xs opacity-50">SYSTEM STATUS</p>
            <p className="text-sm font-bold text-red-600 uppercase">Critical Disparity Detected</p>
          </div>
          <button 
            onClick={onReset}
            className="text-[10px] font-bold uppercase border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
          >
            Return to Main Page
          </button>
        </div>
      </header>

      {/* Top Section: Score & Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 border-2 border-black p-6 flex flex-col items-center justify-center bg-black text-white"
        >
          <p className="text-xs uppercase mb-4 opacity-70">Visibility Deficit Score</p>
          <span className="text-8xl font-black">{data.visibilityDeficitScore}%</span>
          <p className="text-[10px] mt-4 text-center opacity-50 leading-tight">
            PROBABILITY OF BRAND EXCLUSION IN SYNTHESIZED SEARCH QUERIES
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1 border-2 border-black p-6 flex flex-col items-center justify-center"
        >
          <p className="text-xs uppercase mb-4 font-bold">Priority Meter</p>
          <Gauge value={data.priorityScore} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 border-2 border-black p-6 flex flex-col justify-between bg-red-50"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="text-red-600" size={20} />
              <p className="text-xs uppercase font-bold">Status Report</p>
            </div>
            <p className="text-xl font-bold leading-tight uppercase italic">
              "{data.statusText}"
            </p>
          </div>
          <p className="text-[10px] mt-4 opacity-70">
            Identity Theft in Progress. Structural Narrative Deficit Detected.
          </p>
        </motion.div>
      </div>

      {/* Middle Section: Narrative Share & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="border-2 border-black p-6">
          <h3 className="text-xs uppercase font-bold mb-6 flex items-center gap-2">
            <Search size={14} /> Competitive Narrative Infiltration
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.narrativeShare} layout="vertical" margin={{ left: 40, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#000', color: '#fff', border: 'none', fontSize: '10px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {data.narrativeShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === brandName ? '#ef4444' : '#000'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] opacity-50 mt-4 uppercase">Share of Narrative Dominance across indexed platforms</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border-2 border-black p-6 flex flex-col justify-center items-center">
            <p className="text-xs uppercase mb-2 font-bold opacity-50">Reference Parity</p>
            <span className="text-5xl font-black">{data.referenceParity}</span>
            <p className="text-[10px] mt-2 text-center">COMPETITOR VS BRAND MENTIONS</p>
          </div>
          <div className="border-2 border-black p-6 flex flex-col justify-center items-center bg-black text-white">
            <p className="text-xs uppercase mb-2 font-bold opacity-50">Authority Erasure</p>
            <span className="text-5xl font-black">{data.authorityErasure}%</span>
            <p className="text-[10px] mt-2 text-center">PLATFORMS WITH ZERO FOOTPRINT</p>
          </div>
          <div className="col-span-full border-2 border-black p-6 bg-red-600 text-white flex items-center justify-between cursor-pointer hover:bg-red-700 transition-colors">
            <div className="flex items-center gap-4">
              <AlertTriangle size={32} />
              <div>
                <p className="text-sm font-bold uppercase">Critical Disparity Detected</p>
                <p className="text-[10px] opacity-80 uppercase">Immediate intervention required to prevent total brand obsolescence</p>
              </div>
            </div>
            <ChevronRight />
          </div>
        </div>
      </div>

      {/* Bottom Section: Ghosting */}
      <div className="border-2 border-black mb-12">
        <div className="bg-black text-white p-4 flex items-center gap-2">
          <Ghost size={18} />
          <h3 className="text-xs uppercase font-bold">High-Intent Ghosting Analysis</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.highIntentGhosting.map((item, i) => (
            <div key={i} className="border-l-4 border-red-600 pl-4">
              <p className="text-xs font-bold uppercase text-red-600 mb-2">Query Type {i + 1}</p>
              <p className="text-sm italic leading-relaxed mb-4">"{item.query}"</p>
              <p className="text-[10px] opacity-50 uppercase font-bold">Result: Brand is 0% visible. AI recommends competitors.</p>
            </div>
          ))}
        </div>

        {/* Blurred Slots */}
        <div className="relative p-6 border-t-2 border-black bg-gray-50 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 blur-md select-none">
            {[1, 2, 3].map(i => (
              <div key={i} className="border-2 border-gray-300 p-4">
                <div className="h-4 w-24 bg-gray-300 mb-2" />
                <div className="h-20 w-full bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <button 
              onClick={() => setShowBooking(true)}
              className="bg-black text-white px-8 py-4 font-bold uppercase text-sm hover:bg-red-600 transition-colors flex items-center gap-2 shadow-2xl"
            >
              <Lock size={16} /> Unlock Full-Spectrum Optimization Audit
            </button>
          </div>
        </div>
      </div>

      {/* Explore More Tools Link */}
      <div className="flex flex-col items-center gap-6 mb-12">
        <button 
          onClick={onReset}
          className="bg-white text-black border-2 border-black px-8 py-4 font-bold uppercase text-sm hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
        >
          Return to Main Page
        </button>
        <a href="#" className="text-sm font-bold uppercase text-red-600 hover:text-black transition-colors flex items-center gap-2 border-b-2 border-red-600 hover:border-black pb-1">
          Explore more audit tools <ExternalLink size={14} />
        </a>
      </div>

      {/* Footer */}
      <footer className="flex justify-between items-center text-[10px] opacity-30 uppercase font-bold border-t-2 border-black pt-4">
        <p>© GEONEST SYSTEMS // AUDIT_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        <p>INTERNAL USE ONLY // CLASSIFIED</p>
      </footer>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 md:p-12 max-w-md w-full border-4 border-red-600 my-8"
          >
            <h2 className="text-3xl font-black uppercase mb-4">Strategic Intervention</h2>
            <p className="text-sm mb-8 leading-relaxed">
              The audit has detected structural failures in your brand's generative narrative. 
              Manual optimization is required to reclaim identity dominance.
            </p>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Strategy Call Requested. A GEO specialist will contact you shortly.'); setShowBooking(false); }}>
              <div>
                <label className="text-[10px] font-bold uppercase block mb-1">Work Email</label>
                <input type="email" required className="w-full border-2 border-black p-2 outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase block mb-1">Company Website</label>
                <input type="url" required placeholder="https://" className="w-full border-2 border-black p-2 outline-none focus:border-red-600" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase block mb-1">Current Monthly Revenue</label>
                <select required className="w-full border-2 border-black p-2 outline-none focus:border-red-600 bg-white">
                  <option value="">Select Range</option>
                  <option value="<10k">Under $10k</option>
                  <option value="10k-50k">$10k - $50k</option>
                  <option value="50k-200k">$50k - $200k</option>
                  <option value="200k+">$200k+</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase block mb-1">Primary Growth Bottleneck</label>
                <input type="text" required placeholder="e.g., High CAC, Low Conversion" className="w-full border-2 border-black p-2 outline-none focus:border-red-600" />
              </div>
              <button className="w-full bg-black text-white py-4 font-bold uppercase hover:bg-red-600 transition-colors mt-4">
                Unlock Full Audit & Strategy
              </button>
              <button 
                type="button"
                onClick={() => setShowBooking(false)}
                className="w-full text-[10px] uppercase font-bold opacity-50 hover:opacity-100 mt-2"
              >
                Return to Void
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
