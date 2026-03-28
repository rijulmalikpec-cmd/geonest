import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, ShieldAlert, X } from 'lucide-react';

interface LoginModalProps {
  onLogin: (password: string) => void;
  onClose: () => void;
  error?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose, error }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border-4 border-blue-600 p-8 max-w-sm w-full shadow-[20px_20px_0px_0px_rgba(37,99,235,1)]"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-blue-600" size={24} />
            <h2 className="text-xl font-black uppercase tracking-tighter">Admin Access</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-black">
            <X size={20} />
          </button>
        </div>

        <p className="text-[10px] font-bold uppercase text-slate-500 mb-6 leading-tight">
          Restricted Area. Unauthorized access is logged and monitored. 
          Enter strategic credentials to proceed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase block mb-1">Access Token</label>
            <input 
              type="password" 
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-slate-200 p-3 outline-none focus:border-blue-600 font-mono"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <p className="text-[10px] text-red-600 font-bold uppercase animate-pulse">
              {error}
            </p>
          )}

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-4 font-bold uppercase hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Lock size={14} /> Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
};
