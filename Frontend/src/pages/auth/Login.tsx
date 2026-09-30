import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Shield, Key, User as UserIcon, LogIn, Activity } from 'lucide-react';

const Login: React.FC = () => {
  const { setAuthenticated } = useAppStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', data.username);
        setAuthenticated(true);
      } else {
        const err = await res.json();
        setError(err.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection to server failed. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)' }} />
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none"
           style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)', backgroundSize: '100% 4px' }} />
      
      <div className="z-10 w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-black border border-[#10b981] rounded-full mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Shield size={48} className="text-[#10b981]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-widest text-[#10b981] uppercase">IBVAP Command</h1>
          <p className="text-sm text-gray-400 mt-2 font-mono tracking-wide">INTELLIGENT BORDER VIDEO ANALYTICS PLATFORM</p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1f2937] rounded-xl shadow-2xl p-6 md:p-8 relative">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-50" />
          
          <div className="flex items-center gap-2 mb-6 text-gray-300 font-mono text-sm border-b border-[#1f2937] pb-3">
             <Activity size={16} className="text-[#10b981]" />
             <span>AUTHORIZATION REQUIRED</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded text-sm text-center font-mono">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Operator ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={16} className="text-gray-500" />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] focus:border-[#10b981] text-white rounded px-4 py-2.5 pl-10 text-sm outline-none transition-colors"
                  placeholder="Enter ID..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Security Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={16} className="text-gray-500" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] focus:border-[#10b981] text-white rounded px-4 py-2.5 pl-10 text-sm outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-4 bg-gradient-to-r from-[#059669] to-[#10b981] hover:from-[#047857] hover:to-[#059669] text-black font-bold tracking-wider uppercase py-3 rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? 'AUTHENTICATING...' : (
                <>
                  <span>INITIALIZE SYSTEM</span>
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
             <p className="text-[10px] text-gray-600 font-mono">UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
