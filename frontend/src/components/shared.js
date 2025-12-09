// src/components/Shared.js
//holds all  shared components used across the frontend
import React from 'react';
import { Ghost } from 'lucide-react';
export const CyberBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-slate-900"></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
  </div>
);
export const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex items-center justify-center p-4 relative font-sans text-slate-200">
    <CyberBackground />
    <div className="w-full max-w-md z-10 relative bg-black/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-md">
      <div className="text-center mb-8"><Ghost className="text-green-400 mx-auto mb-2" size={48} /><h1 className="text-4xl font-bold text-white">PixelCrypt</h1><p className="text-slate-400">Secure Steganography Vault</p></div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2><p className="text-slate-400 text-sm mb-6">{subtitle}</p>{children}
    </div>
  </div>
);
export const InputField = ({ label, type, placeholder, icon: Icon, value, onChange, error, helpText }) => (
  <div className="mb-5">
    <label className="block text-xs font-bold text-green-500 uppercase tracking-widest mb-2 flex justify-between">{label} {error && <span className="text-red-400">{error}</span>}</label>
    <div className="relative group"><div className={`absolute inset-y-0 left-0 pl-3 flex items-center ${error?'text-red-400':'text-slate-500'}`}><Icon size={18} /></div><input type={type} value={value} onChange={onChange} className={`w-full bg-slate-900/50 border text-slate-200 text-sm rounded-lg pl-10 p-3 ${error?'border-red-500':'border-slate-700 focus:border-green-500'}`} placeholder={placeholder} /></div>{helpText && !error && <p className="text-xs text-slate-500 mt-1">{helpText}</p>}
  </div>
);