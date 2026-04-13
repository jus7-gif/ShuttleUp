import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, ChevronRight, Trophy, Zap, Star } from 'lucide-react';
import { TrainingPlan, Exercise } from '../types';
import { cn } from '../lib/utils';

interface TrainingSessionProps {
  plan: TrainingPlan;
  onComplete: (earnedXp: number) => void;
  onCancel: () => void;
}

export default function TrainingSession({ plan, onComplete, onCancel }: TrainingSessionProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(plan.exercises[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [totalXp, setTotalXp] = useState(0);

  const currentExercise = plan.exercises[currentIdx];

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      setIsActive(false);
    }
  }, [timeLeft, isActive]);

  const handleNext = () => {
    setTotalXp(prev => prev + currentExercise.xpReward);
    if (currentIdx < plan.exercises.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setTimeLeft(plan.exercises[nextIdx].duration);
      setIsActive(false);
    } else {
      setIsFinished(true);
      setIsActive(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-[#F9FAFB] z-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="absolute inset-0 atmosphere opacity-30" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 bg-yellow-100/50 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-200">
            <Trophy size={48} className="text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Training Beendet!</h1>
          <p className="text-gray-500">Großartige Arbeit auf dem Feld.</p>
        </motion.div>

        <div className="glass-panel p-6 rounded-[32px] w-full max-w-xs mb-8 relative">
          <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-2xl">
            <Zap fill="currentColor" />
            <span>+{totalXp} XP</span>
          </div>
          <p className="text-indigo-400 text-sm font-medium">Level Aufstieg rückt näher!</p>
        </div>

        <button 
          onClick={() => onComplete(totalXp)}
          className="relative w-full max-w-xs shuttle-gradient text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:scale-[1.02] transition-transform"
        >
          Zurück zum Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#F9FAFB] z-50 flex flex-col overflow-hidden">
      <div className="absolute inset-0 atmosphere opacity-20" />
      
      {/* Header */}
      <div className="relative p-6 flex items-center justify-between">
        <button onClick={onCancel} className="p-2 glass-button rounded-full">
          <X size={24} />
        </button>
        <div className="flex gap-1.5">
          {plan.exercises.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 w-6 sm:w-8 rounded-full transition-all duration-500",
                i < currentIdx ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : i === currentIdx ? "shuttle-gradient shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-gray-200/50"
              )} 
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 text-center min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-md flex flex-col items-center"
          >
            <div className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-3 glass-panel",
              currentExercise.category === 'Technik' && "text-blue-600",
              currentExercise.category === 'Beinarbeit' && "text-green-600",
              currentExercise.category === 'Ausdauer' && "text-orange-600",
              currentExercise.category === 'Kraft' && "text-purple-600",
              currentExercise.category === 'Taktik' && "text-indigo-600"
            )}>
              {currentExercise.category}
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black mb-1 tracking-tight text-gray-900">{currentExercise.title}</h2>
            <p className="text-gray-400 mb-6 text-xs sm:text-base leading-relaxed max-w-[280px] font-medium">{currentExercise.description}</p>

            {/* Timer Circle - Responsive */}
            <div className="relative w-48 h-48 sm:w-72 sm:h-72 mx-auto mb-4 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-gray-100/50"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="282.7"
                  animate={{ 
                    strokeDashoffset: 282.7 - (282.7 * timeLeft) / currentExercise.duration,
                    scale: isActive ? [1, 1.02, 1] : 1
                  }}
                  transition={{
                    scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                    strokeDashoffset: { duration: 0.5 }
                  }}
                  className="text-indigo-600"
                  style={{ strokeLinecap: 'round' }}
                />
              </svg>
              <div className="flex flex-col items-center">
                <div className="text-4xl sm:text-7xl font-black tracking-tighter tabular-nums text-gray-900">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Verbleibend</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="relative p-6 pb-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-8">
          {timeLeft > 0 ? (
            <button 
              onClick={() => setIsActive(!isActive)}
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-full glass-panel flex items-center justify-center text-indigo-600 hover:scale-105 active:scale-95 transition-all shadow-2xl border border-white/50"
            >
              {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
          ) : (
            <motion.button 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleNext}
              className="px-10 py-4 rounded-[28px] shuttle-gradient text-white font-black text-base flex items-center gap-3 shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
            >
              <ChevronRight size={20} />
              {currentIdx < plan.exercises.length - 1 ? "Nächste Übung" : "Training abschließen"}
            </motion.button>
          )}
        </div>
        
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Übung {currentIdx + 1} von {plan.exercises.length}
        </p>
      </div>
    </div>
  );
}
