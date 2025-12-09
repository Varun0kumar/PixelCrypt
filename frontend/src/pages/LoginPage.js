import React, { useState } from 'react';
import { 
  LogIn, Mail, Lock, AlertTriangle, Fingerprint, Cpu, 
  ShieldCheck, Github, Chrome, Ghost 
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut } from "firebase/auth";

// --- FIREBASE CONFIG (Keep your keys) ---
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

const LoginPage = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Backdoor state
  const [ghostClicks, setGhostClicks] = useState(0);

  const handleGhostClick = async () => {
    const newCount = ghostClicks + 1;
    setGhostClicks(newCount);
    
    if (newCount === 10) {
        try { await signOut(auth); } catch (e) {}
        onLogin({ email: "ghost_operator@classified.sys" }); // Bypass
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // --- SECURITY CHECK: EMAIL VERIFICATION ---
      if (!user.emailVerified) {
          await signOut(auth); // Kick them out immediately
          setError('Security Alert: Email not verified. Please check your inbox.');
          setIsLoading(false);
          return;
      }

      onLogin({ email: user.email });
    } catch (err) {
      console.error("Login Error:", err.code);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-email':
            setError('Identity Not Found: No such account exists.');
            break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            setError('Access Denied: Incorrect Password.');
            break;
        case 'auth/too-many-requests':
            setError('Security Lockout: Too many failed attempts.');
            break;
        default:
            setError(`Login Failed: ${err.message}`);
      }
    }
    setIsLoading(false);
  };

  const handleProviderLogin = async (provider) => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      // OAuth providers (Google/GitHub) verify emails automatically
      onLogin({ email: result.user.email });
    } catch (err) {
       setError(`OAuth Error: ${err.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-mono relative overflow-hidden bg-black text-green-500">
      <CyberBackground />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {ghostClicks >= 10 && (
        <div className="fixed inset-0 bg-green-500 z-50 animate-ping opacity-20 pointer-events-none"></div>
      )}

      <div className="w-full max-w-md bg-black/90 border-2 border-green-500/50 rounded-xl p-8 shadow-[0_0_50px_rgba(34,197,94,0.2)] relative z-10 backdrop-blur-md">
        
        <div className="text-center mb-8">
          <div
            onClick={handleGhostClick}
            className="inline-flex p-4 bg-green-900/20 rounded-full mb-4 border border-green-500 animate-pulse cursor-pointer select-none active:scale-95 transition-transform hover:bg-green-500/20"
            title="System Monitor"
          >
            <Ghost size={40} className={`text-green-500 ${ghostClicks > 0 ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : ''}`} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-widest">PIXEL<span className="text-green-500">CRYPT</span></h1>
          <p className="text-green-500/60 text-[10px] uppercase tracking-[0.4em] mt-2">Secure Gateway v1.0</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/50 border border-red-500 rounded flex items-center gap-3 text-red-500 text-xs font-bold animate-shake">
            <AlertTriangle size={16} /> <span>{error}</span>
          </div>
        )}

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
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-black px-2 text-green-700">Or use Credentials</span></div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Agent ID / Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 text-green-700 group-focus-within:text-green-400 transition-colors" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-green-800 rounded-none py-3 pl-10 text-green-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder:text-green-900/50 font-mono" placeholder="agent@domain.sys" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Passcode</label>
            <div className="relative group">
              <ShieldCheck className="absolute left-3 top-3.5 text-green-700 group-focus-within:text-green-400 transition-colors" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-green-800 rounded-none py-3 pl-10 text-green-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder:text-green-900/50 font-mono" placeholder="••••••••••••" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-green-900/20 hover:bg-green-500/20 text-green-400 hover:text-white border border-green-500 font-bold py-3.5 rounded-none transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs group">
            {isLoading ? <Cpu className="animate-spin" /> : <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />}
            {isLoading ? (ghostClicks > 7 ? 'Bypassing...' : 'Authenticating...') : 'Initialize Session'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-green-900/30 pt-4">
          <p className="text-[10px] text-green-800 mb-2">NO IDENTITY?</p>
          <button onClick={() => onNavigate('signup')} className="text-green-700 hover:text-green-400 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
             <Fingerprint size={14} /> [ Create New Identity ]
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;