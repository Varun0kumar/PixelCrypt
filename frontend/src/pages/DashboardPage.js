import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
  Lock, Unlock, Key, Image as ImageIcon, Music, Video, 
  AlertTriangle, CheckCircle, RefreshCw, Ghost, Fingerprint, 
  LogOut, Shield, Zap, Upload, Terminal, FileText, Activity, 
  LifeBuoy, X, BookOpen, ShieldAlert, AlertOctagon, Trash2, FileX,
  Sun, Moon, User, Code, GraduationCap, Network, Clock, History, FileClock, EyeOff
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth"; 
import { 
  getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp 
} from "firebase/firestore";

// --- INLINED DEPENDENCIES ---

import { API_URL } from "../utils/validation";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9bEVAjPd2Jyjr50l01ZvrONHB4oq1Cqs",
  authDomain: "pixelcrypt-b84fe.firebaseapp.com",
  projectId: "pixelcrypt-b84fe",
  appId: "1:607789442226:web:dda6f9a2d14594abc995ab"
};

// Initialize Firebase & Database
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 

// --- MEMOIZED COMPONENTS ---

const CyberBackground = memo(() => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black"></div>
    <div className="absolute top-0 left-0 right-0 h-[500px] bg-green-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen"></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
  </div>
));

// --- HELPERS ---

const blobToFile = (text, filename = 'pasted_key.pem') => {
  const content = text ?? '';
  try { return new File([content], filename, { type: 'text/plain' }); } 
  catch (e) { const blob = new Blob([content], { type: 'text/plain' }); blob.name = filename; return blob; }
};

const utf8ByteLength = (str) => {
  try { return new TextEncoder().encode(str || '').length; } 
  catch (e) { return unescape(encodeURIComponent(str || '')).length; }
};

const normalizeCapacity = (data) => {
  if (!data) return { max_chars: 0, raw: data };
  const max_chars = data.max_chars ?? data.max_bytes ?? data.capacity ?? 0;
  return { max_chars, raw: data };
};

// --- SUBCOMPONENTS ---

const UserProfileModal = memo(({ user, onClose, darkMode }) => {
  const isGuest = !user; 
  const agentName = isGuest ? 'Shadow Operator' : (user?.email ? user.email.split('@')[0] : 'Unknown Agent');
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`relative w-full max-w-md p-1 rounded-2xl bg-gradient-to-br ${isGuest ? 'from-red-600 via-orange-600 to-red-500' : 'from-blue-500 via-indigo-500 to-violet-500'} shadow-2xl animate-in zoom-in-95 duration-300`}>
        <div className={`${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl p-8 flex flex-col items-center text-center relative overflow-hidden`}>
            <button onClick={onClose} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={20}/></button>
            <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${isGuest ? 'from-red-500 to-orange-600' : 'from-blue-400 to-indigo-600'} p-[2px] mb-4 shadow-lg`}>
                <div className={`${darkMode ? 'bg-slate-900' : 'bg-white'} w-full h-full rounded-full flex items-center justify-center`}>
                    {isGuest ? <EyeOff size={32} className="text-red-500" /> : <User size={32} className="text-blue-500" />}
                </div>
            </div>
            <h2 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{agentName}</h2>
            <div className={`px-3 py-1 rounded-full text-[10px] font-mono mb-6 border ${isGuest ? (darkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600') : (darkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600')}`}>
                SESSION ID: {isGuest ? 'ENCRYPTED_NULL_PTR' : (user?.uid?.slice(0, 8).toUpperCase() || 'UNKNOWN')}
            </div>
            <div className={`w-full p-4 rounded-xl text-left space-y-3 ${darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
                <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Registered Email</label>
                    <div className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{isGuest ? 'NO_TRACE_FOUND' : (user?.email || 'N/A')}</div>
                </div>
                <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Account Status</label>
                    <div className={`flex items-center gap-2 text-sm font-medium ${isGuest ? 'text-orange-500' : 'text-green-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${isGuest ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`}></span> {isGuest ? 'Stealth Mode (No History)' : 'Verified & Online'}
                    </div>
                </div>
            </div>
            <button onClick={onClose} className={`mt-6 w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white transition-colors ${isGuest ? 'bg-red-900 hover:bg-red-800' : 'bg-slate-800 hover:bg-slate-700'}`}>Close Profile</button>
        </div>
      </div>
    </div>
  );
});

const AuthorModal = memo(({ onClose, darkMode }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`relative w-full max-w-md p-1 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 shadow-[0_0_40px_rgba(99,102,241,0.3)] animate-in zoom-in-95 duration-300`}>
        <div className={`${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl p-8 flex flex-col items-center text-center relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
            <button onClick={onClose} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={20}/></button>
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 p-[3px] mb-6 shadow-lg relative group cursor-pointer">
                <div className={`${darkMode ? 'bg-slate-900' : 'bg-white'} w-full h-full rounded-full flex items-center justify-center overflow-hidden relative`}><Ghost size={40} className="text-indigo-500 group-hover:scale-110 transition-transform duration-500" /></div>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-slate-700 shadow-sm">DEV</div>
            </div>
            <h2 className={`text-2xl font-black tracking-tight mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Varun Kumar</h2>
            <div className="flex items-center gap-2 mb-6"><span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest ${darkMode ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>005varunkumar@gmail.com</span></div>
            <div className={`w-full space-y-4 text-left ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'} rounded-xl p-6 border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-start gap-4"><div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 shrink-0"><Code size={20}/></div><div><h4 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Project Context</h4><p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>3rd Semester MCA Project.</p></div></div>
                <div className="flex items-start gap-4"><div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 shrink-0"><Network size={20}/></div><div><h4 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Areas of Interest</h4><p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Cyber Security & Networking.</p></div></div>
                 <div className="flex items-start gap-4"><div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 shrink-0"><GraduationCap size={20}/></div><div><h4 className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Academic Status</h4><p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Pursuing MCA (Master of Computer Applications).</p></div></div>
            </div>
            <button onClick={onClose} className="mt-8 w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg text-sm uppercase tracking-wider">Close Profile</button>
        </div>
      </div>
    </div>
  );
});

const HelpModal = memo(({ onClose, darkMode }) => {
  const theme = { bg: darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200', header: darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200', text: darkMode ? 'text-slate-300' : 'text-slate-600', title: darkMode ? 'text-white' : 'text-slate-900' };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${theme.bg} border w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden`}>
        <div className={`p-6 border-b ${theme.header} flex justify-between items-center shrink-0`}>
          <div className="flex items-center gap-3"><div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><BookOpen size={24} /></div><div><h2 className={`text-xl font-bold ${theme.title}`}>Mission Manual</h2><p className="text-xs text-slate-400 uppercase tracking-widest">PixelCrypt Operator's Guide</p></div></div><button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-full transition-colors text-slate-400 hover:text-slate-500"><X size={24} /></button>
        </div>
        <div className={`p-6 overflow-y-auto custom-scrollbar space-y-8 ${theme.text} flex-1`}>
          
          <div className="space-y-2">
              <p className="text-sm leading-relaxed italic border-l-4 border-green-500 pl-4 bg-green-500/10 p-3 rounded-r-lg">
                "PixelCrypt is a secure steganography tool designed for academic purposes. It provides a hybrid security layer by combining robust AES/RSA encryption with advanced steganography. You can hide any confidential messages within ordinary files without anyone even noticing."
              </p>
          </div>

          <hr className={`border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`} />

          <div>
            <h3 className={`${theme.title} font-bold text-lg mb-4 flex items-center gap-2`}>
                <span className="bg-slate-700 text-white text-xs px-2 py-1 rounded">Step 1</span> Generate Keys
            </h3>
            <p className="text-sm ml-4 mb-2">Before doing anything, you need a digital identity.</p>
            <ol className="space-y-2 text-sm ml-8 list-decimal marker:text-slate-500 opacity-80">
                <li>Go to the <strong>Key Manager</strong> tab.</li>
                <li>Click <strong>Generate Secure Keys</strong>.</li>
                <li>A zip file will download. Extract it to find your <code>public_key.pem</code> and <code>private_key.pem</code>.</li>
            </ol>
          </div>

          <div>
            <h3 className={`${theme.title} font-bold text-lg mb-4 flex items-center gap-2`}>
                <span className="bg-slate-700 text-white text-xs px-2 py-1 rounded">Step 2</span> Encryption (Encode)
            </h3>
            <ol className="space-y-2 text-sm ml-8 list-decimal marker:text-slate-500 opacity-80">
                <li>Select your media type (Image, Audio, or Video).</li>
                <li>Ensure you are in <strong>ENCODE</strong> mode.</li>
                <li>Upload the <strong>Source File</strong> you want to hide data in.</li>
                <li>Upload the <strong>Public Key</strong>.</li>
                <li>Type your secret message and click <strong>Execute Encryption</strong>.</li>
            </ol>
          </div>

          <div>
            <h3 className={`${theme.title} font-bold text-lg mb-4 flex items-center gap-2`}>
                <span className="bg-slate-700 text-white text-xs px-2 py-1 rounded">Step 3</span> Decryption (Decode)
            </h3>
            <ol className="space-y-2 text-sm ml-8 list-decimal marker:text-slate-500 opacity-80">
                <li>Switch to <strong>DECODE</strong> mode.</li>
                <li>Upload the <strong>Encoded File</strong> (the one you just created).</li>
                <li>Upload your <strong>Private Key</strong>.</li>
                <li>Click <strong>Execute Decryption</strong> to reveal the hidden message.</li>
            </ol>
          </div>

          <div className="bg-red-500/10 border-2 border-red-500/50 p-5 rounded-xl flex items-start gap-4 mt-6">
            <ShieldAlert className="text-red-500 shrink-0 animate-pulse" size={40} />
            <div>
                <h3 className="text-red-500 font-black text-xl uppercase tracking-wider mb-2">STOP & READ THIS!</h3>
                <p className={`${theme.title} font-bold mb-1 text-sm`}>YOUR PRIVATE KEY IS YOUR SECRET IDENTITY.</p>
                <p className="text-xs text-red-400">Do not share your <code>private_key.pem</code> with anyone. If you lose it, your encrypted data is lost forever.</p>
            </div>
          </div>

        </div>
        <div className={`p-4 border-t ${theme.header} text-center shrink-0`}><button onClick={onClose} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-8 rounded-lg transition-all">I Understand</button></div>
      </div>
    </div>
  );
});

const SystemTerminal = memo(({ logs, hasResult, onClearLogs, darkMode }) => {
  const endRef = useRef(null);
  useEffect(() => { if (!hasResult) endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs, hasResult]);
  const bgClass = darkMode ? 'bg-black/80 border-slate-800' : 'bg-slate-900 border-slate-800'; 
  return (
    <div className={`flex flex-col h-full ${bgClass} rounded-xl border font-mono text-xs p-4 shadow-inner relative overflow-hidden group`}>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/5 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none animate-scan"></div>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-500">
        <div className="flex items-center gap-2"><Terminal size={12} className="text-green-500" /><span className="uppercase tracking-widest text-[10px] font-bold">Live System Log</span></div>
        <button onClick={onClearLogs} className="flex items-center gap-1 hover:text-white transition-colors text-[10px] uppercase tracking-wider opacity-60 hover:opacity-100"><Trash2 size={10}/> Clear</button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
        {logs.map((log, i) => (
          <div key={i} className={`flex gap-2 font-mono ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-slate-500'}`}><span className="opacity-40 select-none">[{log.time}]</span><span className="break-all">{log.msg}</span></div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
});

const HistoryPanel = memo(({ history, darkMode, onClose }) => {
    return (
        <div className={`flex flex-col h-full w-full rounded-2xl p-6 ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><FileClock size={24}/></div><div><h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Operation Audit Log</h2><p className={`text-xs uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Permanent Cloud Records</p></div></div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800/50 rounded-full transition-colors"><X size={20} className={darkMode ? 'text-slate-400' : 'text-slate-500'}/></button>
            </div>
            <div className={`flex-1 overflow-y-auto custom-scrollbar rounded-xl border font-mono text-sm ${darkMode ? 'bg-black/40 border-slate-800' : 'bg-white border-slate-200 shadow-inner'}`}>
                 <div className={`grid grid-cols-12 gap-2 p-3 text-[10px] uppercase font-bold border-b tracking-wider ${darkMode ? 'bg-slate-900/50 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    <div className="col-span-4">Timestamp</div><div className="col-span-2">Type</div><div className="col-span-2">Mode</div><div className="col-span-2">File</div><div className="col-span-2 text-right">Status</div>
                 </div>
                 {history.length === 0 ? (<div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-2 opacity-50"><Clock size={32}/><p>No operations recorded.</p></div>) : (
                    history.map((item) => (
                        <div key={item.id} className={`grid grid-cols-12 gap-2 p-3 border-b text-xs items-center hover:bg-white/5 transition-colors ${darkMode ? 'border-slate-800/30 text-slate-300' : 'border-slate-100 text-slate-700'}`}>
                            <div className="col-span-4 text-[10px] opacity-70">{item.timestamp?.toDate ? item.timestamp.toDate().toLocaleString() : 'Just now'}</div>
                            <div className="col-span-2 uppercase font-bold text-[10px]">{item.type}</div>
                            <div className="col-span-2 uppercase text-[10px] tracking-wider">{item.mode === 'encode' ? <span className="text-blue-400">ENC</span> : <span className="text-purple-400">DEC</span>}</div>
                            <div className="col-span-2 truncate opacity-80" title={item.file}>{item.file}</div>
                            <div className="col-span-2 text-right"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.status === 'Success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{item.status}</span></div>
                        </div>
                    ))
                 )}
            </div>
        </div>
    );
});

const OutputPanel = memo(({ status, mode, secret, onClear, darkMode }) => {
  if (!status.msg && !secret) return null;
  const theme = { bg: darkMode ? 'bg-black/90 border-slate-700/50' : 'bg-white/90 border-slate-200 shadow-xl', text: darkMode ? 'text-green-300' : 'text-green-700', box: darkMode ? 'bg-black/60 border-green-500/20 text-green-300' : 'bg-slate-100 border-green-500/20 text-green-800' };
  return (
    <div className={`flex-1 ${theme.bg} rounded-xl border p-6 relative overflow-hidden flex flex-col backdrop-blur-md animate-in fade-in zoom-in-95 duration-200`}>
      {status.msg && (<div className={`p-4 rounded-lg border flex items-start gap-3 mb-4 ${status.type === 'destruction' ? 'bg-red-950 border-red-600 text-red-500' : status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-green-500/10 border-green-500/30 text-green-600'}`}>{status.type === 'error' || status.type === 'destruction' ? <AlertTriangle className="shrink-0" /> : <CheckCircle className="shrink-0" />} <div className="text-sm font-medium break-words">{status.msg}</div></div>)}
      {mode === 'decode' && secret && (<div className="flex-1 flex flex-col mb-4 min-h-0"><label className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={12}/> Decrypted Message</label><div className={`flex-1 ${theme.box} rounded-lg p-4 font-mono text-sm border overflow-auto custom-scrollbar break-all shadow-inner`}>{secret}</div></div>)}
      <button onClick={onClear} className={`mt-auto text-xs underline self-start transition-colors ${darkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}>Acknowledge & Return to Terminal</button>
    </div>
  );
});

const FileDropZone = memo(({ file, onFileSelect, type, accept, disabled, darkMode }) => {
  const displayType = type ? type.toUpperCase() : "FILE";
  const theme = { base: darkMode ? 'border-slate-700 bg-slate-900/50 hover:border-slate-500' : 'border-emerald-200 bg-white/50 hover:border-emerald-300', active: darkMode ? 'border-green-500 bg-green-500/10' : 'border-emerald-400 bg-emerald-50', text: darkMode ? 'text-slate-300' : 'text-slate-700', subtext: darkMode ? 'text-slate-500' : 'text-slate-500' };
  return (
    <div className={`relative group cursor-pointer transition-all duration-300 border-2 border-dashed rounded-xl p-6 text-center ${disabled ? 'border-red-900/50 bg-red-900/10 cursor-not-allowed' : file ? theme.active : theme.base}`}>
      <input type="file" accept={accept} disabled={disabled} onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
      {disabled ? <div className="flex flex-col items-center justify-center gap-2 text-red-500 font-mono text-sm"><FileX size={24} className="opacity-80" /><span className="truncate max-w-[200px] font-bold">FILE CORRUPTED</span></div> : file ? <div className="flex flex-col items-center justify-center gap-2 text-green-500 font-mono text-sm"><CheckCircle size={24} className="opacity-80" /><span className="truncate max-w-[200px] font-bold">{file.name}</span></div> : <div className="flex flex-col items-center gap-2"><Upload className="opacity-50" size={24} /><p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Click or Drop {displayType}</p></div>}
    </div>
  );
});

// --- MAIN DASHBOARD COMPONENT ---

const DashboardPage = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('image');
  const [mode, setMode] = useState('encode');
  const [showHelp, setShowHelp] = useState(false);
  const [showAuthor, setShowAuthor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isSystemOnline, setSystemOnline] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  const [file, setFile] = useState(null);
  const [keyMode, setKeyMode] = useState('file'); 
  const [keyFile, setKeyFile] = useState(null);
  const [keyText, setKeyText] = useState('');
  const [secret, setSecret] = useState('');
  const [secretBytes, setSecretBytes] = useState(0);
  const [capacity, setCapacity] = useState(null);
  const [isCapLoading, setIsCapLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [opHistory, setOpHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [attempts, setAttempts] = useState(3);
  const [isCorrupted, setIsCorrupted] = useState(false);

  // UPDATED AUTH HELPER: Return null if no user, don't throw
  const getAuthToken = async () => {
    if (auth.currentUser) return await auth.currentUser.getIdToken(true);
    return null; 
  };

  // 1. LISTEN TO AUTH & LOAD HISTORY
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setCurrentUser(user);
            const historyRef = collection(db, 'audit_logs');
            const q = query(historyRef, where("userId", "==", user.uid));
            const unsubHistory = onSnapshot(q, (snapshot) => {
                const loadedHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Client-side Sort to avoid index error
                setOpHistory(loadedHistory.sort((a,b) => (b.timestamp?.seconds||0) - (a.timestamp?.seconds||0)));
            }, (error) => console.error("Firestore Error:", error));
            return () => unsubHistory();
        } else {
            setCurrentUser(null);
            setOpHistory([]);
        }
    });
    return () => unsubscribe();
  }, []);

  const saveToHistory = async (statusLabel, details = {}) => {
    if (!currentUser) return; // Guests do not save history
    try { await addDoc(collection(db, 'audit_logs'), { userId: currentUser.uid, timestamp: serverTimestamp(), type: activeTab, mode: mode, file: file ? file.name : 'Unknown', status: statusLabel, ...details }); } catch (e) { console.error("Failed to save log:", e); }
  };

  const addLog = useCallback((msg, type='info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit' });
    setLogs(prev => [...prev, { time, msg, type }]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  useEffect(() => { 
      addLog('System Initialized. Ready for secure tasks.', 'info'); 
      setSystemOnline(true);
  }, [addLog]);

  useEffect(() => {
    if (keyMode === 'paste') { if (keyText) setKeyFile(blobToFile(keyText, 'pasted_key.pem')); else setKeyFile(null); } 
    else { if (keyFile && keyFile.name === 'pasted_key.pem') setKeyFile(null); }
  }, [keyText, keyMode]);

  useEffect(() => { setSecretBytes(utf8ByteLength(secret)); }, [secret]);

  const resetState = (tab) => {
    setActiveTab(tab); setFile(null); setKeyFile(null); setKeyText(''); setSecret('');
    setCapacity(null); setStatus({ type:'', msg:'' }); setAttempts(3); setIsCorrupted(false);
    setShowHistory(false); addLog(`Switched module: ${tab.toUpperCase()} Processor`, 'warn');
  };

  const handleFileSelect = useCallback((f) => {
      setFile(f); setIsCorrupted(false); setAttempts(3); setStatus({ type:'', msg:'' });
      // Direct call is fine for now
  }, []);
  
  const onFileSelectWrapper = (f) => {
      handleFileSelect(f);
      checkCapacity(f);
  };

  const checkCapacity = async (selectedFile) => {
    if (!selectedFile || mode !== 'encode') return;
    setIsCapLoading(true); setCapacity(null);
    const fd = new FormData(); fd.append('file', selectedFile);
    try {
      const token = await getAuthToken();
      // UPDATED: No throw on null token. Just pass whatever we have.
      const headers = token ? {'Authorization': `Bearer ${token}`} : {};
      
      const res = await fetch(`${API_URL}/api/check_capacity`, { method: 'POST', body: fd, headers: headers });
      const data = await res.json();
      if (res.ok) {
        const normalized = normalizeCapacity(data); setCapacity(normalized);
        addLog(`[System] Ready. Max: ${normalized.max_chars} bytes.`, 'success');
      } else { addLog(`[Error] Analysis failed: ${data.error}`, 'error'); }
    } catch (e) { addLog(`[Error] Capacity check failed: ${e.message}`, 'error'); }
    setIsCapLoading(false);
  };

  const handleGenerateKeys = async () => {
    setIsLoading(true);
    try {
      // UPDATED: No auth token needed for keys
      const response = await fetch(`${API_URL}/api/generate_keys`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = "pixelcrypt_keys.zip"; a.click();
        addLog('[System] Keys downloaded.', 'success');
      } else { addLog('[Error] Key generation failed.', 'error'); }
    } catch (err) { addLog(`[Error] Network failed: ${err.message}`, 'error'); }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCorrupted && mode === 'decode') return setStatus({ type: 'destruction', msg: 'FILE CORRUPTED: Banned.' });
    if (!file || !keyFile && !keyText) return setStatus({ type:'error', msg:'Missing file or key.' });
    if (mode === 'encode' && !secret) return setStatus({ type:'error', msg:'Missing secret message.' });

    let finalKey = keyFile;
    if (keyMode === 'paste' && keyText) finalKey = blobToFile(keyText, 'pasted_key.pem');

    setIsLoading(true); setStatus({ type:'info', msg:'Processing...' });
    const fd = new FormData(); fd.append('file', file); fd.append('key', finalKey, finalKey.name); 
    if (mode === 'encode') fd.append('secret', secret);

    let endpoint = '';
    if (activeTab === 'image') endpoint = mode === 'encode' ? '/api/encode' : '/api/decode';
    if (activeTab === 'audio') endpoint = mode === 'encode' ? '/api/encode_audio' : '/api/decode_audio';
    if (activeTab === 'video') endpoint = mode === 'encode' ? '/api/encode_video' : '/api/decode_video';

    try {
      const token = await getAuthToken();
      // UPDATED: No throw on null token. Just pass whatever we have.
      const headers = token ? {'Authorization': `Bearer ${token}`} : {};

      const res = await fetch(`${API_URL}${endpoint}`, { method: 'POST', body: fd, headers: headers });
      
      if (res.ok && mode === 'encode') {
          addLog('[System] Success! Downloading...', 'success'); saveToHistory('Success'); 
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `encoded_${activeTab}.${activeTab === 'image' ? 'png' : activeTab === 'audio' ? 'wav' : 'mp4'}`;
          document.body.appendChild(a); a.click(); a.remove();
          setStatus({ type:'success', msg:'Encrypted & Downloaded.' }); setAttempts(3);
          return;
      }

      let data; try { data = await res.json(); } catch(e) { data = { error: "Unknown Server Error" }; }

      if (res.ok) {
          addLog('[System] Message recovered.', 'success'); saveToHistory('Success');
          setSecret(data.secret ?? ''); setStatus({ type:'success', msg:'Decryption Successful.' }); setAttempts(3);
      } else {
          if (res.status === 410) {
              setIsCorrupted(true); setFile(null); setStatus({ type: 'destruction', msg: data.error });
              addLog('[SECURITY] FILE DESTROYED.', 'error'); saveToHistory('Destroyed', { error: data.error });
          } else {
              const msg = data.error || "Failed";
              if (res.status === 401) setAttempts(prev => Math.max(0, prev - 1));
              setStatus({ type:'error', msg: msg }); addLog(`[Error] ${msg}`, 'error');
              saveToHistory('Failed', { error: msg });
          }
      }
    } catch (err) {
        setStatus({ type:'error', msg: err.message || 'Connection failed.' }); addLog(`[Fatal] Connection failed.`, 'error');
        saveToHistory('Error', { error: 'Network Fail' });
    } finally { setIsLoading(false); }
  };

  const renderNavButton = (id, label, Icon) => (
    <button onClick={() => resetState(id)} className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-all duration-300 ${activeTab === id ? (darkMode ? 'bg-slate-800/80 text-green-400 border-t-2 border-green-400' : 'bg-white text-green-600 border-t-2 border-green-500 shadow-sm') : (darkMode ? 'bg-slate-900/40 text-slate-500 hover:bg-slate-800' : 'bg-slate-200/50 text-slate-500 hover:bg-slate-200')}`}>
      <Icon size={18} /> {label}
    </button>
  );

  const capacityTotal = capacity?.max_chars ?? 0;
  const percentUsed = capacityTotal > 0 ? Math.min((secretBytes / capacityTotal) * 100, 100) : 0;
  const capacityDisplay = isCapLoading ? 'Calculating...' : (capacityTotal > 0 ? `${secretBytes} / ${capacityTotal} bytes` : '---');
  const showResultPanel = status.msg || (mode === 'decode' && secret);

 const theme = { bg: darkMode ? 'bg-slate-900 text-slate-200' : 'bg-emerald-50 text-slate-800', header: darkMode ? 'bg-black/40 border-slate-800/50' : 'bg-emerald-100/60 border-emerald-200 shadow-sm', card: darkMode ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white/90 border-emerald-200 shadow-lg ring-1 ring-emerald-50', input: darkMode ? 'bg-slate-900/50 border-slate-700 text-slate-200' : 'bg-white border-emerald-200 text-slate-800', inputPlaceholder: darkMode ? 'placeholder:text-slate-600' : 'placeholder:text-slate-400', modeBtn: darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-white text-orange-600 shadow-sm hover:bg-emerald-50', titleMain: darkMode ? 'text-white' : 'text-slate-900' };


  return (
    <div className={`min-h-screen font-sans p-4 md:p-8 relative transition-colors duration-500 ${theme.bg}`}>
      {darkMode && <CyberBackground />}
      {!darkMode && <div className="absolute inset-0 bg-emerald-50 -z-10"></div>}

      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className={`mb-8 flex flex-col md:flex-row items-center justify-between p-4 rounded-2xl border backdrop-blur-md gap-4 transition-colors duration-300 ${theme.header}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowUserProfile(true)} className={`p-3 rounded-xl border transition-all hover:scale-105 ${darkMode ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-green-100 border-green-200 text-green-600'}`} title="Account Profile">
                <Ghost size={28} />
            </button>
            <div onClick={() => setShowAuthor(true)} className="cursor-pointer group">
                <h1 className={`text-2xl font-bold tracking-tight group-hover:text-green-500 transition-colors ${theme.titleMain}`}>PixelCrypt <span className="text-green-500 text-sm font-mono ml-2">v1.0</span></h1>
                <p className={`text-xs uppercase tracking-widest flex items-center gap-2 ${isSystemOnline ? "text-green-500" : "text-red-500"}`}><span className={`w-2 h-2 rounded-full ${isSystemOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span> {isSystemOnline ? "System Online" : "System Offline"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg border border-transparent transition-all ${theme.modeBtn}`} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            <div className={`h-8 w-px ${darkMode ? 'bg-slate-800' : 'bg-slate-300'}`}></div>
            <button onClick={() => setShowHistory(!showHistory)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all group ${darkMode ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'}`}><History size={20} className="group-hover:rotate-12 transition-transform" /><span className="font-bold text-sm hidden md:inline">History</span></button>
            <button onClick={() => setShowHelp(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all group ${darkMode ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200'}`}><LifeBuoy size={20} className="group-hover:rotate-12 transition-transform" /><span className="font-bold text-sm hidden md:inline">Guide Me !</span><span className="md:hidden">Help</span></button>
            <button onClick={onLogout} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-red-500/10 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-600'}`}><LogOut size={20} /></button>
          </div>
        </header>

        {showHelp && <HelpModal onClose={() => setShowHelp(false)} darkMode={darkMode} />}
        {showAuthor && <AuthorModal onClose={() => setShowAuthor(false)} darkMode={darkMode} />}
        {showUserProfile && <UserProfileModal user={currentUser} onClose={() => setShowUserProfile(false)} darkMode={darkMode} />}

        <div className={`flex border-b mb-0 px-4 overflow-x-auto ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
          {renderNavButton('image', 'Image', ImageIcon)}
          {renderNavButton('audio', 'Audio', Music)}
          {renderNavButton('video', 'Video', Video)}
          {renderNavButton('keys', 'Key Manager', Fingerprint)}
        </div>
        
        {/* MAIN CARD FLIP CONTAINER */}
        <div className={`relative perspective-1000 min-h-[500px]`}>
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${showHistory ? 'rotate-y-180' : ''}`}>
                <div className={`backface-hidden relative w-full h-full z-10`}>
                    <div className={`rounded-b-2xl rounded-tr-2xl p-4 md:p-8 border backdrop-blur-xl shadow-2xl h-full transition-colors duration-300 ${theme.card}`}>
                      {activeTab === 'keys' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 min-h-[400px]">
                            <div className="text-center py-16">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border ${darkMode ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'}`}><Fingerprint size={48} className="text-green-500" /></div>
                                <h2 className={`text-3xl font-bold mb-4 ${theme.titleMain}`}>Identity Management</h2>
                                <p className={`max-w-md mx-auto mb-10 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Generate a cryptographically secure RSA-2048 Key Pair.</p>
                                <button onClick={handleGenerateKeys} disabled={isLoading} className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-10 rounded-xl transition duration-300 mx-auto">{isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Key size={18} />} Generate Secure Keys</button>
                            </div>
                            <div className="flex flex-col h-[300px] md:h-auto min-h-[400px]"><SystemTerminal logs={logs} hasResult={false} onClearLogs={clearLogs} darkMode={darkMode}/></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-8">
                            <div className={`p-1.5 rounded-xl flex border ${darkMode ? 'bg-black/20 border-slate-700/50' : 'bg-slate-100 border-slate-200'}`}>
                              {['encode','decode'].map(m => (
                                <button key={m} onClick={() => { 
                                    setMode(m); setStatus({type:'', msg:''}); setSecret(''); setCapacity(null); setFile(null); setKeyFile(null); setKeyText(''); 
                                    setAttempts(3); setIsCorrupted(false);
                                    addLog(`Switched mode: ${m.toUpperCase()}. Buffers flushed.`, 'warn');
                                }} className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase flex items-center justify-center gap-2 transition duration-200 ${mode===m ? (darkMode ? 'bg-slate-700 text-white shadow-lg' : 'bg-white text-slate-900 shadow-md') : (darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}>
                                  {m === 'encode' ? <Lock size={14}/> : <Unlock size={14}/>} {m.toUpperCase()}
                                </button>
                              ))}
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                              <div>
                                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{mode === 'encode' ? `1. Source ${activeTab}` : `1. Encoded ${activeTab}`}</label>
                                <FileDropZone 
                                    file={file} 
                                    onFileSelect={onFileSelectWrapper} 
                                    type={activeTab} 
                                    accept={activeTab === 'image' ? 'image/png' : activeTab === 'audio' ? 'audio/wav' : 'video/mp4'}
                                    disabled={isCorrupted}
                                    darkMode={darkMode}
                                />
                                {mode === 'encode' && !isCorrupted && (
                                  <div className="mt-3"><div className={`flex justify-between text-[10px] uppercase font-bold mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}><span>Message Capacity</span><span>{capacityDisplay}</span></div><div className={`w-full rounded-full h-2 overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}><div className="h-full transition-all duration-700 bg-gradient-to-r from-green-600 to-emerald-400" style={{ width: isCapLoading ? '100%' : `${percentUsed}%` }} /></div></div>
                                )}
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <label className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{mode === 'encode' ? '2. Public Key' : '2. Private Key'}</label>
                                  <div className={`flex gap-1 p-1 rounded-lg border ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                                    <button type="button" onClick={() => setKeyMode('file')} className={`px-2 py-1 rounded text-xs transition duration-200 ${keyMode === 'file' ? 'bg-green-600 text-white' : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>Upload File</button>
                                    <button type="button" onClick={() => setKeyMode('paste')} className={`px-2 py-1 rounded text-xs transition duration-200 ${keyMode === 'paste' ? 'bg-green-600 text-white' : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>Paste Key</button>
                                  </div>
                                </div>
                                {keyMode === 'file' ? <FileDropZone file={keyFile} onFileSelect={(f) => { setKeyFile(f); addLog(`Key loaded: ${f.name}`, 'info'); }} type=".pem Key" accept=".pem" disabled={isCorrupted} darkMode={darkMode} /> : (
                                  <><textarea disabled={isCorrupted} rows="3" value={keyText} onChange={(e) => setKeyText(e.target.value)} placeholder="-----BEGIN RSA KEY-----" className={`w-full rounded-xl p-3 font-mono text-xs resize-none disabled:opacity-50 ${theme.input} ${theme.inputPlaceholder}`} />{keyFile && keyText && (<div className={`mt-3 p-3 rounded-xl flex items-center justify-between border ${darkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}><div className="flex items-center gap-3"><FileText size={18} className={darkMode ? "text-slate-300" : "text-slate-600"} /><div className="text-left"><div className={`font-mono text-sm truncate max-w-[220px] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{keyFile.name}</div></div></div><div className="text-xs text-green-500 flex items-center gap-1"><CheckCircle size={12}/> Converted</div></div>)}</>
                                )}
                              </div>
                              {mode === 'encode' && (<div><label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>3. Secret Message</label><textarea disabled={isCorrupted} rows="4" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Enter confidential data..." className={`w-full rounded-xl p-4 font-mono text-sm resize-none disabled:opacity-50 ${theme.input} ${theme.inputPlaceholder}`} /></div>)}
                              {mode === 'decode' && attempts < 3 && !isCorrupted && (
                                  <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg animate-pulse"><AlertOctagon size={16} /> <span>WARNING: {attempts} attempts remaining. Data corruption imminent.</span></div>
                              )}
                              <button type="submit" disabled={isLoading || (mode === 'decode' && isCorrupted)} className={`w-full py-4 rounded-xl font-bold text-white transition duration-300 flex items-center justify-center gap-3 ${isLoading || (mode === 'decode' && isCorrupted) ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : mode === 'encode' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'}`}>{isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />} {mode === 'encode' ? 'Execute Encryption' : 'Execute Decryption'}</button>
                            </form>
                          </div>
                          <div className="flex flex-col h-[300px] md:h-auto min-h-[400px] relative"><SystemTerminal logs={logs} hasResult={showResultPanel} onClearLogs={clearLogs} darkMode={darkMode}/>{showResultPanel && <div className="absolute inset-0 z-20"><OutputPanel status={status} mode={mode} secret={secret} onClear={() => { setStatus({type:'', msg:''}); setSecret(''); addLog('Result acknowledged. Console ready.', 'info'); }} darkMode={darkMode} /></div>}</div>
                        </div>
                      )}
                    </div>
                </div>
                <div className="absolute inset-0 h-full w-full rotate-y-180 backface-hidden z-20">
                     <div className={`rounded-b-2xl rounded-tr-2xl p-4 md:p-8 border backdrop-blur-xl shadow-2xl h-full transition-colors duration-300 ${theme.card}`}>
                        <HistoryPanel history={opHistory} darkMode={darkMode} onClose={() => setShowHistory(false)} />
                     </div>
                </div>
            </div>
        </div>
      </div>
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default DashboardPage;