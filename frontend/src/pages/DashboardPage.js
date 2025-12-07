// src/pages/DashboardPage.js
import React, { useState } from 'react';
import { 
  Lock, Unlock, Key, Image as ImageIcon, Music, Video, 
  AlertTriangle, CheckCircle, FileWarning, RefreshCw, 
  Ghost, Fingerprint, LogOut, Shield, Zap, Upload 
} from 'lucide-react';
import { CyberBackground } from '../components/Shared';
import { API_URL } from '../utils/validation';

const DashboardPage = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('image');
  const [mode, setMode] = useState('encode');
  const [file, setFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [secret, setSecret] = useState('');
  const [capacity, setCapacity] = useState(null);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isLoading, setIsLoading] = useState(false);

  const resetState = (tab) => {
    setActiveTab(tab);
    setFile(null);
    setKeyFile(null);
    setSecret('');
    setCapacity(null);
    setStatus({ type: '', msg: '' });
  };

  const checkCapacity = async (selectedFile) => {
    if (!selectedFile || mode !== 'encode') return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await fetch(`${API_URL}/check_capacity`, { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) setCapacity(data);
    } catch (e) {}
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      checkCapacity(e.target.files[0]);
      setStatus({ type: '', msg: '' });
    }
  };

  const handleGenerateKeys = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/generate_keys`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "pixelcrypt_keys.zip";
        a.click();
        setStatus({ type: 'success', msg: 'Keys generated successfully.' });
      } else {
        setStatus({ type: 'error', msg: 'Failed to generate keys.' });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'Connection error.' });
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !keyFile) return setStatus({ type: 'error', msg: 'Missing file or key.' });
    if (mode === 'encode' && !secret) return setStatus({ type: 'error', msg: 'Missing secret message.' });

    setIsLoading(true);
    setStatus({ type: 'info', msg: 'Processing cryptographic operations...' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', keyFile);
    if (mode === 'encode') formData.append('secret', secret);

    let endpoint = '';
    if (activeTab === 'image') endpoint = mode === 'encode' ? '/encode' : '/decode';
    if (activeTab === 'audio') endpoint = mode === 'encode' ? '/encode_audio' : '/decode_audio';
    if (activeTab === 'video') endpoint = mode === 'encode' ? '/encode_video' : '/decode_video';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, { method: 'POST', body: formData });
      if (res.ok) {
        if (mode === 'encode') {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const ext = activeTab === 'image' ? 'png' : activeTab === 'audio' ? 'wav' : 'mp4';
          a.download = `encoded_${activeTab}.${ext}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setStatus({ type: 'success', msg: 'Encrypted & Downloaded.' });
        } else {
          const data = await res.json();
          setSecret(data.secret);
          setStatus({ type: 'success', msg: 'Decryption Successful.' });
        }
      } else {
        const data = await res.json();
        if (res.status === 401) setStatus({ type: 'warning', msg: data.error });
        else if (res.status === 410) setStatus({ type: 'destruction', msg: data.error });
        else setStatus({ type: 'error', msg: data.error || 'Operation failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Server connection failed.' });
    }
    setIsLoading(false);
  };

  const renderNavButton = (id, label, Icon) => (
    <button
      onClick={() => resetState(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-all duration-300 ${
        activeTab === id 
          ? 'bg-slate-800/80 text-green-400 border-t-2 border-green-400 shadow-[0_-10px_20px_-10px_rgba(34,197,94,0.1)]' 
          : 'bg-slate-900/40 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen font-sans p-8 text-slate-200 relative">
      <CyberBackground />
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* DASHBOARD HEADER */}
        <header className="mb-8 flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)]">
              <Ghost className="text-green-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">PixelCrypt <span className="text-green-500 text-sm font-mono ml-2">v2.0</span></h1>
              <p className="text-slate-400 text-xs uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> System Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 rounded-md border border-slate-700 text-xs font-mono text-slate-400">
                <Shield size={12} className="text-green-500" /> AES-256-GCM
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 rounded-md border border-slate-700 text-xs font-mono text-slate-400">
                <Key size={12} className="text-blue-500" /> RSA-2048
              </div>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* NAVIGATION */}
        <div className="flex border-b border-slate-700/50 mb-0 px-4">
          {renderNavButton('image', 'Image', ImageIcon)}
          {renderNavButton('audio', 'Audio', Music)}
          {renderNavButton('video', 'Video', Video)}
          {renderNavButton('keys', 'Key Manager', Fingerprint)}
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-slate-900/60 rounded-b-2xl rounded-tr-2xl p-8 border border-slate-700/50 backdrop-blur-xl shadow-2xl min-h-[500px]">
          {activeTab === 'keys' ? (
            <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-500/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_40px_-10px_rgba(34,197,94,0.2)]">
                <Fingerprint size={48} className="text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Identity Management</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-10 text-sm leading-relaxed">
                Generate a cryptographically secure RSA-2048 Key Pair.<br/><span className="text-xs opacity-60 mt-2 block">This will create a ZIP containing your Public and Private keys.</span>
              </p>
              <button onClick={handleGenerateKeys} disabled={isLoading} className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-green-500/20 flex items-center gap-3 mx-auto disabled:opacity-50">
                {isLoading ? <RefreshCw className="animate-spin" /> : <Key />} Generate Secure Keys
              </button>
              {status.msg && (
                <div className={`mt-8 p-4 rounded-lg inline-flex items-center gap-2 ${status.type === 'error' ? 'bg-red-900/20 text-red-300 border border-red-500/30' : 'bg-green-900/20 text-green-300 border border-green-500/30'}`}>
                  {status.type === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>} {status.msg}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* LEFT COLUMN: CONTROLS */}
              <div className="space-y-8">
                <div className="bg-black/20 p-1.5 rounded-xl flex border border-slate-700/50">
                  {['encode', 'decode'].map((m) => (
                    <button key={m} onClick={() => { setMode(m); setStatus({type:'', msg:''}); setSecret(''); }} className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${mode === m ? 'bg-slate-700 text-white shadow-lg border border-slate-600' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
                      <div className="flex items-center justify-center gap-2">
                        {m === 'encode' ? <Lock size={16}/> : <Unlock size={16}/>} {m === 'encode' ? 'Encrypt' : 'Decrypt'}
                      </div>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{mode === 'encode' ? `1. Source ${activeTab}` : `1. Encoded ${activeTab}`}</label>
                    <div className="relative group cursor-pointer">
                      <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${file ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'}`}>
                        {file ? <div className="flex items-center justify-center gap-2 text-green-400 font-mono text-sm"><CheckCircle size={16} /> {file.name}</div> : <div className="text-slate-500"><div className="text-sm">Drag & drop or click to upload</div></div>}
                      </div>
                    </div>
                    {mode === 'encode' && capacity && (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1"><span>Payload Capacity</span><span>{capacity.max_chars} bytes</span></div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-green-600 to-emerald-400 h-full transition-all duration-700" style={{ width: `${Math.min((secret.length / capacity.max_chars) * 100, 100)}%` }}></div></div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{mode === 'encode' ? '2. Public Key (.pem)' : '2. Private Key (.pem)'}</label>
                    <div className="relative">
                      <input type="file" accept=".pem" onChange={(e) => setKeyFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className={`border border-slate-700 rounded-lg p-3 flex items-center gap-3 bg-slate-900/50 ${keyFile ? 'border-green-500/50 text-green-400' : 'text-slate-400'}`}>
                        <Key size={18} /> <span className="text-sm font-mono truncate">{keyFile ? keyFile.name : "Select Key File..."}</span>
                      </div>
                    </div>
                  </div>

                  {mode === 'encode' && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">3. Payload</label>
                      <textarea rows="4" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Enter confidential data..." className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-mono text-sm resize-none" />
                    </div>
                  )}

                  <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-3 ${mode === 'encode' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-500/25' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-blue-500/25'} ${isLoading ? 'opacity-50' : 'hover:scale-[1.02]'}`}>
                    {isLoading ? <RefreshCw className="animate-spin" /> : <Zap size={20} fill="currentColor" />} {mode === 'encode' ? 'Execute Encryption' : 'Execute Decryption'}
                  </button>
                </form>
              </div>

              {/* RIGHT COLUMN: OUTPUT */}
              <div className="flex flex-col h-full">
                <div className="flex-1 bg-black/40 rounded-xl border border-slate-700/50 p-6 relative overflow-hidden backdrop-blur-md flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50"></div>
                  
                  {!status.msg && !secret && (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-4">
                      <div className="p-4 rounded-full bg-slate-900/50 border border-slate-800"><FileWarning size={32} className="opacity-50" /></div>
                      <div className="text-center"><p className="font-mono text-sm">AWAITING INPUT</p><p className="text-xs opacity-50 mt-1">System Ready</p></div>
                    </div>
                  )}

                  {status.msg && (
                    <div className={`p-4 rounded-lg border flex items-start gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 ${status.type === 'error' ? 'bg-red-900/20 border-red-900/50 text-red-200' : status.type === 'warning' ? 'bg-yellow-900/20 border-yellow-900/50 text-yellow-200' : status.type === 'destruction' ? 'bg-red-950 border-red-500 text-red-500 font-bold animate-pulse' : 'bg-green-900/20 border-green-900/50 text-green-200'}`}>
                      {status.type === 'error' || status.type === 'destruction' ? <AlertTriangle className="shrink-0" /> : <CheckCircle className="shrink-0" />}
                      <div className="text-sm font-medium">{status.msg}</div>
                    </div>
                  )}

                  {mode === 'decode' && secret && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col">
                      <label className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Decrypted Payload</label>
                      <div className="flex-1 bg-black/60 rounded-lg p-4 font-mono text-sm text-green-300 border border-green-500/20 shadow-inner overflow-auto custom-scrollbar">{secret}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP (ROUTER) ---

const App = () => {
  const [view, setView] = useState('login');

  const handleLoginSuccess = () => setView('dashboard');
  const handleLogout = () => setView('login');

  if (view === 'dashboard') return <DashboardPage onLogout={handleLogout} />;
  if (view === 'signup') return <SignupPage onNavigate={setView} onSignup={handleLoginSuccess} />;
  return <LoginPage onNavigate={setView} onLogin={handleLoginSuccess} />;
};

export default App;