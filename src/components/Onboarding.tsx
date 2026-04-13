import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Trophy, Target, Zap } from 'lucide-react';
import { SkillLevel, UserProfile, Discipline } from '../types';
import { cn } from '../lib/utils';

interface OnboardingProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<SkillLevel>('Anfänger');
  const [discipline, setDiscipline] = useState<Discipline>('Einzel');
  const [goals, setGoals] = useState<string[]>([]);

  const [context, setContext] = useState('');

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else {
      onComplete({
        name,
        level,
        discipline,
        goals,
        context,
        focusArea: 'Allround',
        partnerName: ''
      });
    }
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F9FAFB] overflow-hidden relative">
      <div className="absolute inset-0 atmosphere opacity-30" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-panel rounded-[40px] p-10 shadow-2xl relative"
      >
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", step >= i ? "shuttle-gradient" : "bg-gray-200")} />
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {step === 1 && "Willkommen bei ShuttleUp"}
            {step === 2 && "Dein Level"}
            {step === 3 && "Deine Disziplin"}
            {step === 4 && "Deine Ziele"}
            {step === 5 && "Dein Hintergrund"}
          </h1>
          <p className="text-gray-500 mt-2">
            {step === 1 && "Lass uns dein Training personalisieren."}
            {step === 2 && "Wie schätzt du dein Spiel ein?"}
            {step === 3 && "Was spielst du am liebsten?"}
            {step === 4 && "Was möchtest du erreichen?"}
            {step === 5 && "Erzähl uns mehr (z.B. Liga, Position)."}
          </p>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <input 
              type="text"
              placeholder="Dein Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          )}

          {step === 2 && (
            <div className="grid gap-3">
              {(['Anfänger', 'Fortgeschritten', 'Profi'] as SkillLevel[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between font-bold",
                    level === l ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" : "border-white/40 bg-white/20 hover:bg-white/40"
                  )}
                >
                  <span>{l}</span>
                  {level === l && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3">
              {(['Einzel', 'Doppel', 'Beides'] as Discipline[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDiscipline(d)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between font-bold",
                    discipline === d ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" : "border-white/40 bg-white/20 hover:bg-white/40"
                  )}
                >
                  <span>{d}</span>
                  {discipline === d && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-2 gap-3">
              {['Beinarbeit', 'Schlagkraft', 'Präzision', 'Ausdauer', 'Taktik', 'Schnelligkeit'].map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-center transition-all text-sm font-medium",
                    goals.includes(goal) ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-100 text-gray-600"
                  )}
                >
                  {goal}
                </button>
              ))}
            </div>
          )}

          {step === 5 && (
            <textarea 
              placeholder="z.B. Bezirksliga NRW, Platz 1 gesetzt..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px] resize-none"
            />
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={step === 1 && !name}
          className="w-full mt-8 shuttle-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {step === 5 ? "Starten" : "Weiter"}
          <ChevronRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}
