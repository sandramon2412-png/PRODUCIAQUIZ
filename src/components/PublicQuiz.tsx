import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, ArrowRight, Sparkles, ShieldCheck, 
  Zap, Trophy, Target, Rocket, Layout, ChevronRight,
  Mail, User, Send, AlertCircle, Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  theme: string;
  questions: {
    id: string;
    text: string;
    options: { id: string; text: string; value: number }[];
  }[];
  results: {
    id: string;
    title: string;
    desc: string;
    minScore: number;
    maxScore: number;
  }[];
  leadConfig: {
    title: string;
    subtitle: string;
    buttonText: string;
    fields: { id: string; label: string; type: string; required: boolean }[];
  };
}

export default function PublicQuiz() {
  const { id: quizId } = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentStep, setCurrentStep] = useState<'intro' | 'questions' | 'lead' | 'result'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [leadData, setLeadData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      
      try {
        const quizRef = doc(db, 'quizzes', quizId);
        const quizSnap = await getDoc(quizRef);
        
        if (quizSnap.exists()) {
          setQuiz({ id: quizSnap.id, ...quizSnap.data() } as Quiz);
        } else {
          // Fallback to localStorage for local previews
          const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
          const foundQuiz = savedQuizzes.find((q: any) => q.id === quizId);
          if (foundQuiz) setQuiz(foundQuiz);
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };

    fetchQuiz();
  }, [quizId]);

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto border border-zinc-800">
            <AlertCircle className="w-8 h-8 text-zinc-600" />
          </div>
          <h1 className="text-xl font-bold text-white">Quiz no encontrado</h1>
          <p className="text-zinc-500 text-sm">El link que seguiste podría estar roto o el quiz fue eliminado.</p>
        </div>
      </div>
    );
  }

  const handleStart = () => setCurrentStep('questions');

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentStep('lead');
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Calculate final score
      const totalScore = Object.values(answers).reduce((acc: number, val: number) => acc + val, 0);
      setScore(totalScore);

      // Save lead to Firestore
      if (quizId && quiz) {
        await addDoc(collection(db, 'leads'), {
          quizId,
          authorUid: (quiz as any).authorUid, // Include authorUid for easier querying
          ...leadData,
          score: totalScore,
          answers,
          submittedAt: serverTimestamp(),
        });
      }

      setCurrentStep('result');
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("Hubo un error al guardar tus datos. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResult = () => {
    return quiz.results.find(r => score >= r.minScore && score <= r.maxScore) || quiz.results[0];
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-1000",
      quiz.theme === 'dark' ? "bg-[#050505] text-white" : "bg-white text-zinc-900"
    )}>
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          {currentStep === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Quiz Interactivo
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9]">{quiz.title}</h1>
              <p className="text-zinc-500 text-lg leading-relaxed max-w-lg mx-auto">{quiz.description}</p>
              <button 
                onClick={handleStart}
                className="group relative px-12 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[32px] font-black text-lg uppercase tracking-widest transition-all hover:scale-105 shadow-2xl shadow-emerald-500/20"
              >
                Comenzar Ahora
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {currentStep === 'questions' && (
            <motion.div 
              key="questions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <span>Pregunta {currentQuestionIndex + 1} de {quiz.questions.length}</span>
                  <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}% Completado</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  {quiz.questions[currentQuestionIndex].text}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {quiz.questions[currentQuestionIndex].options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(quiz.questions[currentQuestionIndex].id, option.value)}
                      className="group relative p-6 bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 rounded-3xl text-left transition-all hover:bg-zinc-800/80"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-zinc-300 group-hover:text-white transition-colors">{option.text}</span>
                        <div className="w-8 h-8 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/20 flex items-center justify-center transition-all">
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'lead' && (
            <motion.div 
              key="lead"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-[40px] p-8 md:p-12 space-y-8 shadow-2xl"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Trophy className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black tracking-tight">{quiz.leadConfig.title}</h2>
                <p className="text-zinc-500 text-sm">{quiz.leadConfig.subtitle}</p>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-4">
                {quiz.leadConfig.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">{field.label}</label>
                    <div className="relative">
                      {field.type === 'email' ? (
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      ) : (
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      )}
                      <input 
                        type={field.type}
                        required={field.required}
                        value={leadData[field.id] || ''}
                        onChange={(e) => setLeadData(prev => ({ ...prev, [field.id]: e.target.value }))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                        placeholder={`Tu ${field.label.toLowerCase()}...`}
                      />
                    </div>
                  </div>
                ))}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
                    </>
                  ) : (
                    <>
                      {quiz.leadConfig.buttonText} <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600">
                  <ShieldCheck className="w-3 h-3" /> Datos Protegidos
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600">
                  <Zap className="w-3 h-3" /> Resultado Instantáneo
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-10"
            >
              <div className="space-y-6">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-[32px] flex items-center justify-center mx-auto border border-emerald-500/30 relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 relative z-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">{getResult().title}</h2>
                  <p className="text-emerald-500 font-black text-sm uppercase tracking-widest">Resultado Final</p>
                </div>
              </div>

              <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-[40px] space-y-6">
                <p className="text-zinc-400 text-lg leading-relaxed">{getResult().desc}</p>
                <div className="pt-6 border-t border-zinc-800/50">
                  <button className="w-full py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3">
                    Agendar Consultoría <Rocket className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Tu Puntuación</p>
                  <p className="text-2xl font-black text-white">{score} pts</p>
                </div>
                <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Nivel</p>
                  <p className="text-2xl font-black text-emerald-400">Avanzado</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
