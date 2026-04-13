import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Lock, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { UserProfile, Badge } from '../types';
import { cn } from '../lib/utils';

interface TrophyPathProps {
  user: UserProfile;
  onClose: () => void;
}

const PATH_STEPS = [
  { id: 'level_1', type: 'level', value: 1, label: 'Anfänger', icon: '🌱', reward: 'Starter Pack' },
  { id: 'first_workout', type: 'badge', badgeId: 'first_workout', label: 'Erster Schritt', icon: '🎯', reward: '50 XP Bonus' },
  { id: 'level_2', type: 'level', value: 2, label: 'Aufsteiger', icon: '🚀', reward: 'Neue Übungen' },
  { id: 'regular', type: 'badge', badgeId: 'regular', label: 'Stammgast', icon: '🔥', reward: 'Bronze Abzeichen' },
  { id: 'level_3', type: 'level', value: 3, label: 'Fortgeschritten', icon: '⭐', reward: 'Video Analyse+' },
  { id: 'duel_master', type: 'badge', badgeId: 'duel_master', label: 'Duell-Meister', icon: '⚔️', reward: 'Silber Abzeichen' },
  { id: 'level_4', type: 'level', value: 4, label: 'Könner', icon: '🏆', reward: 'Profi Tipps' },
  { id: 'streak_7', type: 'badge', badgeId: 'streak_7', label: 'Wochen-Held', icon: '⚡', reward: 'Gold Abzeichen' },
  { id: 'level_5', type: 'level', value: 5, label: 'Profi', icon: '👑', reward: 'ShuttleUp Elite' },
  { id: 'legend', type: 'level', value: 10, label: 'Legende', icon: '🌌', reward: 'Hall of Fame' },
];

export default function TrophyPath({ user, onClose }: TrophyPathProps) {
  const isUnlocked = (step: typeof PATH_STEPS[0]) => {
    if (step.type === 'level') {
      return user.level_rank >= (step.value || 0);
    }
    if (step.type === 'badge') {
      return (user.badges || []).some(b => b.id === step.badgeId);
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full h-full sm:h-[90vh] sm:max-w-4xl sm:rounded-[48px] bg-[#F9FAFB] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="relative p-8 sm:p-12 flex items-center justify-between z-20 bg-[#F9FAFB]/80 backdrop-blur-md border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl shuttle-gradient flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Trophy size={20} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">Trophäen-Pfad</h2>
            </div>
            <p className="text-gray-500 font-medium ml-13">Meistere Herausforderungen und steige auf</p>
          </div>
          <button 
            onClick={onClose}
            className="p-4 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <X size={32} className="text-gray-400" />
          </button>
        </div>

        {/* Path Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50">
          <div className="relative min-h-[1200px] py-20 px-8 flex flex-col items-center">
            {/* Background Path Line */}
            <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 1200">
              <path 
                d="M 200 0 Q 350 150 200 300 Q 50 450 200 600 Q 350 750 200 900 Q 50 1050 200 1200" 
                fill="none" 
                stroke="url(#pathGradient)" 
                strokeWidth="12" 
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="relative w-full max-w-lg">
              {PATH_STEPS.map((step, index) => {
                const unlocked = isUnlocked(step);
                const current = step.type === 'level' && user.level_rank === step.value;
                const isLeft = index % 2 === 0;
                
                return (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={cn(
                      "relative mb-32 flex items-center gap-8",
                      isLeft ? "flex-row" : "flex-row-reverse text-right"
                    )}
                  >
                    {/* Step Node */}
                    <div className="relative group">
                      <div className={cn(
                        "w-24 h-24 sm:w-32 sm:h-32 rounded-[40px] flex items-center justify-center text-4xl sm:text-5xl shadow-2xl transition-all duration-500 relative z-10",
                        unlocked ? "bg-white scale-110 rotate-3" : "bg-gray-200 grayscale opacity-40",
                        current && "ring-8 ring-indigo-400/30 ring-offset-4"
                      )}>
                        {unlocked ? step.icon : <Lock size={32} className="text-gray-400" />}
                        
                        {unlocked && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg"
                          >
                            <CheckCircle2 size={16} />
                          </motion.div>
                        )}
                      </div>
                      
                      {/* Glow Effect */}
                      {unlocked && (
                        <div className="absolute inset-0 bg-indigo-400/20 blur-3xl rounded-full -z-10 group-hover:bg-indigo-400/40 transition-colors" />
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="flex-1">
                      <div className={cn(
                        "inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2",
                        unlocked ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"
                      )}>
                        {step.type === 'level' ? `Level ${step.value}` : 'Abzeichen'}
                      </div>
                      <h3 className={cn(
                        "text-2xl sm:text-3xl font-black mb-1",
                        unlocked ? "text-gray-900" : "text-gray-300"
                      )}>
                        {step.label}
                      </h3>
                      <p className={cn(
                        "text-sm font-bold flex items-center gap-2",
                        isLeft ? "" : "justify-end",
                        unlocked ? "text-indigo-500" : "text-gray-300"
                      )}>
                        <Star size={14} fill="currentColor" />
                        {step.reward}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="p-8 sm:p-12 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 z-20">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[24px] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
              <Trophy size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Aktueller Status</p>
              <p className="text-2xl font-black text-gray-900">Level {user.level_rank} Profi</p>
            </div>
          </div>
          
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none glass-panel px-8 py-4 rounded-2xl text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gesamt XP</p>
              <p className="text-xl font-black text-indigo-600">{user.xp}</p>
            </div>
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none shuttle-gradient text-white px-10 py-4 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200"
            >
              Weiter trainieren
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
