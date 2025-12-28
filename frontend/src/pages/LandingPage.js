import React, { useState } from 'react';
import { Shield, Lock, Eye, ArrowRight, Ghost, FileKey, Cpu } from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
  // Switched to a "Matrix Code / Digital Security" image that fits the green theme perfectly
  const [bgImage, setBgImage] = useState("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop");

  return (
    <div className="min-h-screen relative overflow-hidden bg-black font-mono text-green-500">
      
      {/* 1. Static Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage}
          alt="Cyber Security Matrix Background" 
          className="w-full h-full object-cover opacity-75" // Increased opacity from 50 to 75
          onError={() => setBgImage("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop")} // Fallback
        />
        
        {/* Gradient Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black"></div>
        
        {/* Cyber Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      {/* 2. Main Content */}
      <div className="relative z-10 container mx-auto px-6 h-screen flex flex-col justify-center items-center text-center">
        
        {/* Logo / Icon */}
        <div className="mb-6 p-4 rounded-full border border-green-500/30 bg-green-500/10 animate-pulse">
          <Ghost size={64} className="text-green-400" />
        </div>

        {/* Headlines */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
          PIXEL<span className="text-green-500">CRYPT</span>
        </h1>
        
        <p className="text-lg md:text-xl text-green-400/80 max-w-2xl mb-12 leading-relaxed font-bold bg-black/60 p-4 rounded-xl backdrop-blur-sm border border-green-900/30">
          The art of hiding in plain sight. <br />
          Secure academic steganography gateway combining <span className="text-white">AES-256 Encryption</span> with advanced media concealment.
        </p>

        {/* Feature Grid (Mini) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 w-full max-w-4xl">
            <div className="p-4 border border-green-900/50 bg-black/60 rounded-xl backdrop-blur-sm hover:border-green-500 transition-colors group">
                <Shield className="mx-auto mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold mb-1">Hybrid Security</h3>
                <p className="text-xs text-green-600">RSA + AES Architecture</p>
            </div>
            <div className="p-4 border border-green-900/50 bg-black/60 rounded-xl backdrop-blur-sm hover:border-green-500 transition-colors group">
                <Eye className="mx-auto mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold mb-1">Invisible Data</h3>
                <p className="text-xs text-green-600">LSB Steganography</p>
            </div>
            <div className="p-4 border border-green-900/50 bg-black/60 rounded-xl backdrop-blur-sm hover:border-green-500 transition-colors group">
                <FileKey className="mx-auto mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold mb-1">Audit Trails</h3>
                <p className="text-xs text-green-600">Secure Operation Logs</p>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
          <button 
            onClick={() => onNavigate('login')}
            className="flex-1 py-2 px-5 bg-black border-2 border-green-600 text-green-500 hover:bg-green-600 hover:text-black hover:shadow-[0_0_25px_rgba(34,197,94,0.55)] font-bold text-lg rounded-none uppercase tracking-widest transition-all hover:scale-105 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(34,197,94,0.4)]"
          >
            <Lock size={20} /> Access Gateway
          </button>
          
          <button 
            onClick={() => onNavigate('signup')}
            className="
            flex-1
                    py-2 px-5
    bg-black
    border-2 border-green-600
    text-green-500
    font-bold text-lg
    uppercase tracking-wider
    transition-all duration-200
    hover:bg-green-600
    hover:text-black
    hover:shadow-[0_0_25px_rgba(34,197,94,0.55)]
    flex items-center justify-center gap-2
  "
          >
            <Cpu size={20} /> New Identity
          </button>
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-8 text-xs text-green-800 uppercase tracking-widest">
            System Status: <span className="text-green-500 animate-pulse">● Online</span> | Ver 2.0.1
        </div>

      </div>
    </div>
  );
};

export default LandingPage;