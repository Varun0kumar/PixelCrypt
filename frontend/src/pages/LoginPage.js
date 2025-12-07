// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Mail, Lock, LogIn, RefreshCw, Chrome, Github, ArrowRight } from 'lucide-react';
import { AuthLayout, InputField } from '../components/Shared';
import { validateEmail } from '../utils/validation';

const LoginPage = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!validateEmail(email)) newErrors.email = "Invalid Email";
    if (!password) newErrors.password = "Required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <AuthLayout title="Access Vault" subtitle="Authenticate with your secure credentials.">
      <form onSubmit={handleSubmit}>
        <InputField 
          label="Email Identity" 
          type="email" 
          placeholder="agent@pixelcrypt.io" 
          icon={Mail} 
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: ''}); }}
          error={errors.email}
        />
        <InputField 
          label="Passphrase" 
          type="password" 
          placeholder="••••••••••••" 
          icon={Lock} 
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ''}); }}
          error={errors.password}
        />
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <LogIn size={20} />}
          <span className="relative">Authenticate</span>
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px bg-slate-700 flex-1"></div>
        <span className="text-slate-500 text-xs uppercase tracking-widest">Or Continue With</span>
        <div className="h-px bg-slate-700 flex-1"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-all hover:border-slate-500">
          <Chrome size={18} /> Google
        </button>
        <button className="flex items-center justify-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-all hover:border-slate-500">
          <Github size={18} /> GitHub
        </button>
      </div>

      <div className="mt-8 text-center">
        <button onClick={() => onNavigate('signup')} className="text-slate-400 hover:text-green-400 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto group">
          New user? Initialize Profile
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;