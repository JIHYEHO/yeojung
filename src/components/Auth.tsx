import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      setMessage({ type: 'success', text: '이메일로 로그인 링크를 보냈어요! 메일함을 확인해 주세요. 💌' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '로그인 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="w-full space-y-8 py-8"
    >
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">로그인 🔐</h3>
        <p className="text-slate-500 font-bold text-sm leading-relaxed">
          여정을 기록하고 본인만의 <br/>데스크를 완성해 보세요!
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email Address</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-5 bg-white rounded-3xl border border-slate-100 shadow-sm focus:ring-2 focus:ring-rose-200 outline-none transition-all font-bold text-slate-700"
            required
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={`w-full py-5 rounded-[2rem] text-lg font-black transition-all shadow-lg flex items-center justify-center gap-2
            ${loading ? 'bg-slate-200 text-slate-400' : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'}
          `}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
          ) : (
            '매직 링크 보내기 💌'
          )}
        </button>
      </form>

      {message && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl text-sm font-bold text-center border ${
            message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
              : 'bg-rose-50 border-rose-100 text-rose-600'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="pt-8 text-center">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Simple & Secure Auth by Supabase</p>
      </div>
    </motion.div>
  );
}
