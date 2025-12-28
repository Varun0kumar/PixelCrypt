import React, { useState } from 'react';
import { UserPlus, Mail, Lock, AlertTriangle, Fingerprint, Cpu, ShieldCheck, Chrome, Github, Shield } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, sendEmailVerification, signOut } from "firebase/auth";

// --- FIREBASE CONFIG (Same as Login) ---
const firebaseConfig = {
  apiKey: "AIzaSyA9bEVAjPd2Jyjr50l01ZvrONHB4oq1Cqs",
  authDomain: "pixelcrypt-b84fe.firebaseapp.com",
  projectId: "pixelcrypt-b84fe",
  appId: "1:607789442226:web:dda6f9a2d14594abc995ab"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// CyberBackground Component
const CyberBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black"></div>
    <div className="absolute top-0 left-0 right-0 h-[500px] bg-green-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
  </div>
);

const SignupPage = ({ onNavigate, onSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- MANUAL REGISTRATION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfoMsg('');
    
    // 1. Strict Email Regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        setError("Invalid Format: Please enter a valid email address.");
        setIsLoading(false);
        return;
    }

    // 2. Domain Allowlist (Only Major Providers)
    const domain = email.split('@')[1].toLowerCase();
    const validDomains = ['gmail.com', 'google.com', 'github.com', 'protonmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
    if (!validDomains.includes(domain)) {
        setError("Restricted Domain: Only Gmail, Outlook, Yahoo, Proton, or iCloud allowed.");
        setIsLoading(false);
        return;
    }

    // 3. Block Obvious Fakes
    if (email.startsWith('test') || email.startsWith('user') || email.startsWith('fake')) {
         setError("Generic usernames are not allowed.");
         setIsLoading(false);
         return;
    }

    try {
      // 4. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 5. Send Verification & LOGOUT IMMEDIATELY
      await sendEmailVerification(userCredential.user);
      await signOut(auth); // <--- CRITICAL SECURITY STEP

      setInfoMsg(`Verification link sent to ${email}. You must verify before logging in.check your spam folder too!`);
      
      // Redirect to Login Page so they can login AFTER verifying
      setTimeout(() => {
          onNavigate('login');
      }, 5000);

    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Identity already exists in database.');
      } else if (err.code === 'auth/weak-password') {
        setError('Security Alert: Password too weak (Min 6 chars).');
      } else {
        setError(`Registration Failed: ${err.message}`);
      }
    }
    setIsLoading(false);
  };

  // --- OAUTH REGISTRATION ---
  const handleProviderLogin = async (provider) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      // OAuth accounts are pre-verified, so we can let them in.
      onSignup({ email: result.user.email }); 
    } catch (err) {
        if (err.code === 'auth/popup-closed-by-user') {
            setError('Operation cancelled by agent.');
        } else {
            setError(`OAuth Error: ${err.message}`);
        }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-mono relative overflow-hidden bg-black text-green-500">
      <CyberBackground />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-md bg-black/90 border-2 border-green-500/50 rounded-xl p-8 shadow-[0_0_50px_rgba(34,197,94,0.2)] relative z-10 backdrop-blur-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-green-900/20 rounded-full mb-4 border border-green-500 animate-pulse">
            <Fingerprint size={40} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-widest">NEW <span className="text-green-500">IDENTITY</span></h1>
          <p className="text-green-500/60 text-[10px] uppercase tracking-[0.4em] mt-2">Registration Protocol</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/50 border border-red-500 rounded flex items-center gap-3 text-red-500 text-xs font-bold animate-shake">
            <AlertTriangle size={16} /> <span>{error}</span>
          </div>
        )}

        {infoMsg && (
          <div className="mb-6 p-3 bg-green-900/30 border border-green-500 rounded flex items-center gap-3 text-green-400 text-xs font-bold">
            <Shield size={16} /> <span>{infoMsg}</span>
          </div>
        )}

        {/* --- OAUTH BUTTONS --- */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <button type="button" onClick={() => handleProviderLogin(googleProvider)} disabled={isLoading} className="flex items-center justify-center gap-2 py-3 bg-slate-900 border border-slate-700 hover:border-green-500 hover:bg-green-900/20 hover:text-white transition-all rounded-lg text-slate-300 text-xs font-bold uppercase tracking-wide group">
                <Chrome size={16} className="text-green-500 group-hover:scale-110 transition-transform"/> Google
            </button>
            <button type="button" onClick={() => handleProviderLogin(githubProvider)} disabled={isLoading} className="flex items-center justify-center gap-2 py-3 bg-slate-900 border border-slate-700 hover:border-green-500 hover:bg-green-900/20 hover:text-white transition-all rounded-lg text-slate-300 text-xs font-bold uppercase tracking-wide group">
                <Github size={16} className="text-green-500 group-hover:scale-110 transition-transform"/> GitHub
            </button>
        </div>

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-green-900"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-black px-2 text-green-700">Or Manually Assign</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Assign Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 text-green-700 group-focus-within:text-green-400 transition-colors" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-green-800 rounded-none py-3 pl-10 text-green-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder:text-green-900/50 font-mono" placeholder="agent@gmail.com" />
            </div>
            <p className="text-[9px] text-green-800 text-right uppercase">Valid Email Required for Verification</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Set Passcode</label>
            <div className="relative group">
              <ShieldCheck className="absolute left-3 top-3.5 text-green-700 group-focus-within:text-green-400 transition-colors" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-green-800 rounded-none py-3 pl-10 text-green-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder:text-green-900/50 font-mono" placeholder="••••••••••••" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-green-900/20 hover:bg-green-500/20 text-green-400 hover:text-white border border-green-500 font-bold py-3.5 rounded-none transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs group">
            {isLoading ? <Cpu className="animate-spin" /> : <UserPlus size={16} className="group-hover:translate-x-1 transition-transform" />}
            {isLoading ? 'Processing...' : 'Generate Profile'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-green-900/30 pt-4">
          <button onClick={() => onNavigate('login')} className="text-green-700 hover:text-green-400 text-xs font-bold uppercase tracking-widest transition-colors">
            [ Return to Login ]
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;