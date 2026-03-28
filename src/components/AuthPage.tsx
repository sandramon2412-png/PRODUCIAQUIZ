import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Loader2, Zap, ArrowRight, User, AlertCircle } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Ventana cerrada. Intenta de nuevo.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('El navegador bloqueó la ventana. Permite popups para este sitio e intenta de nuevo.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Dominio no autorizado. Puedes entrar como invitado o configurar tu propio Firebase (ver guía abajo).`);
        setShowSetupGuide(true);
      } else if (err.code === 'auth/network-request-failed') {
        setError('Error de red. Verifica tu conexión a internet.');
      } else {
        setError(`Error de autenticación. Puedes continuar como invitado mientras configuras Firebase.`);
        setShowSetupGuide(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    localStorage.setItem('producia_guest', 'true');
    localStorage.setItem('producia_guest_name', 'Invitado');
    navigate('/dashboard');
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

            <h1 className="text-3xl font-black tracking-tighter mb-3">Bienvenido</h1>
            <p className="text-zinc-500 text-sm">Accede a tu ecosistema de IA para productos digitales</p>
          </div>

          {/* Guest Access - Primary CTA */}
          <button
            onClick={handleGuestAccess}
            className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20 mb-4"
          >
            <Zap className="w-5 h-5" />
            Entrar Ahora
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">o inicia sesión</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-4 bg-white hover:bg-zinc-100 text-black rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
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
          <p className="text-[10px] text-zinc-600 text-center mt-2">Guarda tus quizzes en la nube y sincroniza entre dispositivos</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Firebase Setup Guide */}
          {showSetupGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-5 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl space-y-3"
            >
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Para activar Google Login en tu dominio:</p>
              <ol className="text-xs text-zinc-500 space-y-2 list-decimal list-inside">
                <li>Ve a <span className="text-white font-bold">console.firebase.google.com</span> y crea un proyecto gratis</li>
                <li>Activa <span className="text-white font-bold">Authentication → Sign-in method → Google</span></li>
                <li>En <span className="text-white font-bold">Settings → Authorized domains</span> agrega tu dominio Vercel</li>
                <li>Copia las credenciales y actualiza <code className="bg-zinc-900 px-1 rounded text-emerald-400">firebase-applet-config.json</code></li>
              </ol>
              <p className="text-[10px] text-zinc-600">Mientras tanto, puedes usar el modo invitado sin problemas. Tus datos se guardan localmente.</p>
            </motion.div>
          )}

          {/* What you get */}
          <div className="mt-8 space-y-3 border-t border-zinc-800/50 pt-6">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest text-center mb-4">Acceso completo incluye</p>
            {[
              { icon: Sparkles, text: '16 Bots de IA especializados' },
              { icon: ShieldCheck, text: 'Quiz Funnels con Pixel y redirección' },
              { icon: Zap, text: 'Lloyd AI como copiloto de estrategia' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-xl">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-sm text-zinc-400">{item.text}</span>
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
