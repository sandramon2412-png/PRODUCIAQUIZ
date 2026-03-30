import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Loader2, Zap, ArrowRight, AlertCircle, Crown, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabase';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/dashboard', { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        setSuccess('Revisa tu correo para confirmar tu cuenta.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email o contraseña incorrectos.');
          }
          throw error;
        }
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar. Intenta de nuevo.');
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-[40px] p-10 shadow-2xl backdrop-blur-xl"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <img src="https://i.imgur.com/GWLu6bm.png" alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-2xl font-black tracking-tighter uppercase leading-none">Producia</span>
                <span className="text-[8px] font-black tracking-[0.3em] text-purple-500 uppercase">Intelligence</span>
              </div>
            </Link>

            <h1 className="text-3xl font-black tracking-tighter mb-3">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
            <p className="text-zinc-500 text-sm">
              {mode === 'login' ? 'Accede a tu ecosistema de IA' : 'Únete y empieza a crear productos digitales'}
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-4 bg-white hover:bg-zinc-100 text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-white/10 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar con Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">o con email</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full py-4 pl-12 pr-4 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña (mín. 6 caracteres)"
                  required
                  minLength={6}
                  className="w-full py-4 pl-12 pr-12 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isEmailLoading}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isEmailLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'login' ? (
                'Entrar'
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
              className="text-xs text-zinc-500 hover:text-purple-400 transition-colors"
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
            >
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300">{success}</p>
              </div>
            </motion.div>
          )}

          {/* What you get */}
          <div className="mt-8 space-y-3 border-t border-zinc-800/50 pt-6">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center mb-4">Con tu cuenta obtienes</p>
            {[
              { icon: Sparkles, text: '17 Bots de IA especializados', sub: 'Copy, Ads, Productos, Sistemas' },
              { icon: ShieldCheck, text: 'Quiz Funnels con Pixel & Redirect', sub: 'Hotmart, Shopify, WhatsApp' },
              { icon: Zap, text: 'Lloyd AI como copiloto 24/7', sub: 'Estrategia de marketing en tiempo real' },
              { icon: Crown, text: 'Tus leads y datos guardados', sub: 'Sincronizados en la nube' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <span className="text-sm text-zinc-300 font-bold block">{item.text}</span>
                  <span className="text-[10px] text-zinc-600">{item.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <Link to="/pricing" className="text-xs text-purple-400 hover:text-purple-300 font-bold transition-colors flex items-center justify-center gap-1">
              Ver planes y precios <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to="/" className="block text-xs text-zinc-600 hover:text-zinc-400 font-bold transition-colors">
              Volver al inicio
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
