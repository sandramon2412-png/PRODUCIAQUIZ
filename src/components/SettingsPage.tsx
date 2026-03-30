import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, Crown, Zap, Shield, LogOut,
  Mail, Calendar, Rocket, Check, ExternalLink, Trash2
} from 'lucide-react';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session?.user) navigate('/login', { replace: true });
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (!session?.user) navigate('/login', { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userPlan: 'free' | 'pro' | 'agency' = (localStorage.getItem(`producia_plan_${user.id}`) as any) || 'free';
  const planColors = {
    free: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', text: 'text-zinc-400', label: 'Starter' },
    pro: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', label: 'Pro' },
    agency: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', label: 'Agency' },
  };
  const plan = planColors[userPlan];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    try {
      localStorage.removeItem(`producia_plan_${user.id}`);
      localStorage.removeItem('producia_onboarded');
      await supabase.auth.signOut();
      navigate('/');
      alert('Para eliminar tu cuenta completamente, contacta a soporte.');
    } catch (error: any) {
      console.error('Error:', error);
    }
  };

  const createdAt = user.created_at ? new Date(user.created_at) : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Header */}
      <header className="h-20 border-b border-zinc-800/50 flex items-center justify-between px-6 md:px-12 sticky top-0 bg-[#050505]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-white font-black text-lg tracking-tight uppercase">Mi Cuenta</h2>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8"
        >
          <div className="flex items-center gap-6 mb-8">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" referrerPolicy="no-referrer" className="w-20 h-20 rounded-2xl border-2 border-emerald-500/50" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-2xl font-black">
                {(user.user_metadata?.full_name || user.email || 'U')[0]}
              </div>
            )}
            <div>
              <h3 className="text-2xl font-black text-white">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-sm text-zinc-500">{user.email}</span>
              </div>
              {createdAt && (
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs text-zinc-600">Miembro desde {createdAt.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-800/30 rounded-2xl p-5 border border-zinc-800/50">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">ID de Usuario</p>
              <p className="text-xs text-zinc-400 font-mono truncate">{user.id}</p>
            </div>
            <div className="bg-zinc-800/30 rounded-2xl p-5 border border-zinc-800/50">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Proveedor</p>
              <p className="text-xs text-zinc-400">Google OAuth</p>
            </div>
          </div>
        </motion.div>

        {/* Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${plan.bg} flex items-center justify-center`}>
                {userPlan === 'free' ? <Zap className={`w-6 h-6 ${plan.text}`} /> :
                 userPlan === 'pro' ? <Crown className={`w-6 h-6 ${plan.text}`} /> :
                 <Rocket className={`w-6 h-6 ${plan.text}`} />}
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Plan {plan.label}</h3>
                <p className="text-xs text-zinc-500">
                  {userPlan === 'free' ? 'Gratis - Funciones básicas' :
                   userPlan === 'pro' ? '$47/mes - Acceso completo' :
                   '$147/mes - Agencia & equipo'}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 ${plan.bg} border ${plan.border} rounded-full`}>
              <span className={`text-[10px] font-black ${plan.text} uppercase tracking-widest`}>Activo</span>
            </div>
          </div>

          {/* Plan features */}
          <div className="space-y-3 mb-8">
            {userPlan === 'free' ? (
              <>
                <Feature text="3 Quizzes activos" included />
                <Feature text="100 leads/mes" included />
                <Feature text="3 Bots básicos" included />
                <Feature text="Todos los bots especializados" />
                <Feature text="Redirección Hotmart/Shopify/WhatsApp" />
                <Feature text="Generación de imágenes AI" />
              </>
            ) : (
              <>
                <Feature text="Quizzes ilimitados" included />
                <Feature text="Leads ilimitados" included />
                <Feature text="Todos los bots especializados" included />
                <Feature text="Redirección Hotmart/Shopify/WhatsApp" included />
                <Feature text="Generación de imágenes AI" included />
                <Feature text="Lloyd completo con voz" included />
              </>
            )}
          </div>

          {userPlan === 'free' ? (
            <Link
              to="/pricing"
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center block shadow-xl shadow-purple-500/10"
            >
              Mejorar a Pro — $47/mes
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Tu suscripción se renueva automáticamente.</span>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-4 bg-red-500/5 border border-red-500/10 hover:border-red-500/30 text-red-400/60 hover:text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3"
            >
              <Trash2 className="w-4 h-4" /> Eliminar Cuenta
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
              <p className="text-sm text-red-300 font-bold mb-4">
                ¿Estás seguro? Esta acción eliminará tu cuenta y todos tus datos permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Sí, Eliminar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function Feature({ text, included }: { text: string; included?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {included ? (
        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
      ) : (
        <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
      )}
      <span className={`text-sm ${included ? 'text-zinc-300' : 'text-zinc-600'}`}>{text}</span>
    </div>
  );
}
