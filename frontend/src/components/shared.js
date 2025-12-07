// src/components/Shared.js
//holds all  shared components used across the frontend
import React from 'react';
import { Ghost } from 'lucide-react';

export const CyberBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black"></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
  </div>
);

export const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen font-sans flex items-center justify-center p-4 relative overflow-hidden">
    <CyberBackground />
    <div className="w-full max-w-md z-10 relative">
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex p-4 bg-black/40 rounded-2xl border border-green-500/30 mb-4 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] backdrop-blur-md relative group">
          <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full group-hover:bg-green-500/30 transition-all duration-500"></div>
          <Ghost className="text-green-400 relative z-10" size={48} />
        </div>
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-green-400 tracking-tighter mb-2">
          PixelCrypt
        </h1>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">Secure Steganography Vault</p>
      </div>

      <div className="bg-black/40 border border-slate-800/60 rounded-2xl shadow-2xl backdrop-blur-xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://assets.codepen.io/1462889/grid.png')] opacity-[0.03]"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-400 text-sm mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
      
      <div className="text-center mt-8 text-slate-600 text-xs font-mono">
        <p>ENCRYPTED CONNECTION • AES-256 • ZERO KNOWLEDGE</p>
      </div>
    </div>
  </div>
);

export const InputField = ({ label, type, placeholder, icon: Icon, value, onChange, error, helpText }) => (
  <div className="mb-5">
    <label className="block text-xs font-bold text-green-500/80 uppercase tracking-widest mb-2 ml-1 flex justify-between">
      {label}
      {error && <span className="text-red-400 normal-case tracking-normal">{error}</span>}
    </label>
    <div className="relative group">
      <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${error ? 'text-red-400' : 'text-slate-500 group-focus-within:text-green-400'}`}>
        <Icon size={18} />
      </div>
      <input 
        type={type} 
        value={value}
        onChange={onChange}
        className={`w-full bg-slate-900/50 border text-slate-200 text-sm rounded-lg block w-full pl-10 p-3 placeholder-slate-600 transition-all shadow-inner backdrop-blur-sm
          ${error 
            ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' 
            : 'border-slate-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:shadow-[0_0_15px_-3px_rgba(34,197,94,0.1)]'
          }
        `}
        placeholder={placeholder}
      />
    </div>
    {helpText && !error && <p className="text-xs text-slate-500 mt-1 ml-1">{helpText}</p>}
  </div>
);