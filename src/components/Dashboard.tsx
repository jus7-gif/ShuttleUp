import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, Clock, Play, CheckCircle2, Star, Info, X, ChevronDown, Settings, Plus, History, LogOut, Users, Target as TargetIcon, Loader2, Swords, Video, User, Award, Sparkles } from 'lucide-react';
import { UserProfile, TrainingPlan, Exercise, FocusArea, GameResult, Discipline, VideoAnalysis as IVideoAnalysis } from '../types';
import { cn } from '../lib/utils';
import TrophyPath from './TrophyPath';
import VideoAnalysis from './VideoAnalysis';

interface DashboardProps {
  user: UserProfile;
  plan: TrainingPlan | null;
  planLoading: boolean;
  onStartTraining: () => void;
  onStartDuel: () => void;
  onLogout: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onRefreshPlan: () => void;
}

export default function Dashboard({ user, plan, planLoading, onStartTraining, onStartDuel, onLogout, onUpdateProfile, onRefreshPlan }: DashboardProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showGameResults, setShowGameResults] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showTrophyPath, setShowTrophyPath] = useState(false);
  const [showVideoAnalysis, setShowVideoAnalysis] = useState(false);
  const [videoContext, setVideoContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const xpToNextLevel = user.level_rank * 1000;
  const progress = (user.xp % 1000) / 10;

  const handleAddGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newGame: GameResult = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      opponent: formData.get('opponent') as string,
      score: formData.get('score') as string,
      won: formData.get('result') === 'win',
      notes: formData.get('notes') as string,
      discipline: formData.get('discipline') as Discipline,
    };

    onUpdateProfile({
      gameResults: [...user.gameResults, newGame]
    });
    setShowAddGame(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24 relative">
      {/* Background Glows */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 blur-[120px] rounded-full" />
      </div>

      {/* Header / Stats */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Willkommen zurück</h2>
          <h1 className="text-4xl font-black tracking-tight">{user.name}</h1>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full font-bold text-gray-500 uppercase border border-white/40">{user.discipline}</span>
            <span className="text-[10px] bg-indigo-500/10 backdrop-blur-sm px-3 py-1 rounded-full font-bold text-indigo-600 uppercase border border-indigo-500/20">{user.focusArea}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="p-4 glass-button rounded-[24px] shadow-sm"
          >
            <Settings size={20} className="text-gray-600" />
          </button>
          <button 
            onClick={onLogout}
            className="p-4 glass-button rounded-[24px] shadow-sm hover:bg-red-50/50 hover:border-red-200 group"
          >
            <LogOut size={20} className="text-gray-600 group-hover:text-red-500" />
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        <button 
          onClick={() => setShowTrophyPath(true)}
          className="glass-panel p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] flex flex-col items-center text-center hover:scale-105 transition-all group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg sm:text-xl mb-2 sm:mb-3 shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
            {user.level_rank}
          </div>
          <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Rang</p>
        </button>
        <div className="glass-panel p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] flex flex-col items-center text-center">
          <Trophy className="text-yellow-500 mb-2 sm:mb-3 w-6 h-6 sm:w-7 sm:h-7" />
          <p className="text-lg sm:text-xl font-black">{user.completedWorkouts}</p>
          <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Sessions</p>
        </div>
        <div className="glass-panel p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] flex flex-col items-center text-center">
          <Zap className="text-indigo-500 mb-2 sm:mb-3 w-6 h-6 sm:w-7 sm:h-7" />
          <p className="text-lg sm:text-xl font-black">{user.xp}</p>
          <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Gesamt XP</p>
        </div>
      </div>

      {/* XP Progress */}
      <div className="glass-panel rounded-[32px] p-8 mb-8">
        <div className="flex justify-between items-end mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-white shadow-sm">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="font-black text-lg">{user.xp} XP</span>
          </div>
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{1000 - (user.xp % 1000)} XP bis Level {user.level_rank + 1}</span>
        </div>
        <div className="h-4 bg-gray-100/50 rounded-full overflow-hidden p-1 border border-white/40">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full shuttle-gradient rounded-full shadow-inner"
          />
        </div>
      </div>

      {/* AI Coach Tip */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-[32px] mb-8 border-l-4 border-l-indigo-500 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles size={48} className="text-indigo-600" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles size={16} />
          </div>
          <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">KI Coach Tipp</h4>
        </div>
        <p className="text-sm text-gray-700 font-medium leading-relaxed">
          {user.focusArea === 'Technik' && "Achte beim Smash auf die volle Armstreckung und den Einsatz des Handgelenks im Treffpunkt."}
          {user.focusArea === 'Beinarbeit' && "Nutze kleine Zwischenschritte (Split-Step), um schneller auf die Schläge deines Gegners zu reagieren."}
          {user.focusArea === 'Ausdauer' && "Intervalltraining auf dem Feld simuliert die Belastung eines echten Spiels am besten."}
          {user.focusArea === 'Kraft' && "Starke Rumpfmuskulatur ist die Basis für explosive Schläge und stabile Bewegungen."}
          {user.focusArea === 'Taktik' && "Versuche, deinen Gegner in die Ecken zu schicken, um das Feld für einen Angriffsschlag zu öffnen."}
          {user.focusArea === 'Allround' && "Konzentriere dich heute auf die Präzision deiner Clears, um den Gegner an die Grundlinie zu zwingen."}
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <button 
          onClick={() => setShowGameResults(true)}
          className="glass-card-v2 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] flex items-center gap-3 sm:gap-4 hover:scale-[1.02] transition-all"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-green-600 border border-green-500/20">
            <History size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-black">Historie</p>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Deine Spiele</p>
          </div>
        </button>
        <button 
          onClick={() => setShowAddGame(true)}
          className="glass-card-v2 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] flex items-center gap-3 sm:gap-4 hover:scale-[1.02] transition-all"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-600 border border-blue-500/20">
            <Plus size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-black">Ergebnis</p>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Neu eintragen</p>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
        <button 
          onClick={onStartDuel}
          className="bg-red-500/5 border border-red-500/10 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] flex items-center gap-3 sm:gap-4 hover:bg-red-500/10 transition-all group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-red-600 border border-red-500/20 group-hover:rotate-12 transition-transform">
            <Swords size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-black text-red-700">Duell</p>
            <p className="text-[9px] sm:text-[10px] text-red-500/60 font-bold uppercase tracking-tighter">Challenge</p>
          </div>
        </button>
        <button 
          onClick={() => setShowVideoAnalysis(true)}
          className="bg-indigo-500/5 border border-indigo-500/10 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] flex items-center gap-3 sm:gap-4 hover:bg-indigo-500/10 transition-all group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <Video size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-black text-indigo-700">KI Analyse</p>
            <p className="text-[9px] sm:text-[10px] text-indigo-500/60 font-bold uppercase tracking-tighter">Feedback</p>
          </div>
        </button>
      </div>

      {/* Daily Plan */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black tracking-tight">Trainingsplan</h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={onRefreshPlan}
              disabled={planLoading}
              className="p-3 glass-button rounded-2xl text-indigo-600 disabled:opacity-50"
              title="Neuen Plan generieren"
            >
              <Zap size={20} className={cn(planLoading && "animate-pulse")} />
            </button>
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/40 text-gray-500 text-sm font-bold">
              <Clock size={16} />
              <span>{Math.round((plan?.totalDuration || 0) / 60)} Min.</span>
            </div>
          </div>
        </div>

        {plan && !planLoading ? (
          <div className="space-y-3 sm:space-y-4">
            <button 
              onClick={onStartTraining}
              className="w-full mb-6 shuttle-gradient text-white py-4 sm:py-5 rounded-[28px] sm:rounded-[32px] font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Play size={20} fill="currentColor" className="sm:w-6 sm:h-6" />
              Training starten
            </button>

            {plan.exercises.map((ex, i) => (
              <motion.div 
                key={`${ex.id}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedExercise(ex)}
                className="glass-card-v2 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] flex items-center gap-4 sm:gap-5 hover:scale-[1.02] transition-all group cursor-pointer"
              >
                <div className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner",
                  ex.category === 'Technik' && "bg-blue-500/10 text-blue-600 border border-blue-500/20",
                  ex.category === 'Beinarbeit' && "bg-green-500/10 text-green-600 border border-green-500/20",
                  ex.category === 'Ausdauer' && "bg-orange-500/10 text-orange-600 border border-orange-500/20",
                  ex.category === 'Kraft' && "bg-purple-500/10 text-purple-600 border border-purple-500/20",
                  ex.category === 'Taktik' && "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                )}>
                  <Star size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-gray-900 leading-tight text-sm sm:text-base">{ex.title}</h4>
                  <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{ex.duration / 60} Min • {ex.xpReward} XP</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-indigo-50 transition-colors">
                  <Info size={16} className="text-gray-300 group-hover:text-indigo-400 sm:w-[18px] sm:h-[18px]" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center glass-panel rounded-[40px] flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Analysiere Fortschritte...</p>
          </div>
        )}
      </section>

      {/* Modals */}
      <AnimatePresence>
        {/* Trophy Path */}
        {showTrophyPath && (
          <TrophyPath user={user} onClose={() => setShowTrophyPath(false)} />
        )}

        {/* Video Analysis */}
        {showVideoAnalysis && (
          <VideoAnalysis 
            user={user} 
            onUpdateProfile={onUpdateProfile} 
            onClose={() => setShowVideoAnalysis(false)} 
          />
        )}

        {/* Exercise Detail Modal */}
        {selectedExercise && (
          <Modal onClose={() => setSelectedExercise(null)}>
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
              selectedExercise.category === 'Technik' && "bg-blue-50 text-blue-600",
              selectedExercise.category === 'Beinarbeit' && "bg-green-50 text-green-600",
              selectedExercise.category === 'Ausdauer' && "bg-orange-50 text-orange-600",
              selectedExercise.category === 'Kraft' && "bg-purple-50 text-purple-600",
              selectedExercise.category === 'Taktik' && "bg-indigo-50 text-indigo-600"
            )}>
              <Star size={32} />
            </div>

            <h2 className="text-2xl font-bold mb-2">{selectedExercise.title}</h2>
            <p className="text-gray-500 mb-6 leading-relaxed">{selectedExercise.description}</p>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Anleitung</h4>
                <div className="bg-gray-50 p-4 rounded-2xl text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedExercise.instructions}
                </div>
              </div>

              {selectedExercise.tips && (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Pro-Tipps</h4>
                  <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-700 leading-relaxed border border-indigo-100">
                    {selectedExercise.tips}
                  </div>
                </div>
              )}

              {selectedExercise.commonErrors && (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Häufige Fehler</h4>
                  <div className="bg-red-50 p-4 rounded-2xl text-red-700 leading-relaxed border border-red-100">
                    {selectedExercise.commonErrors}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Dauer</p>
                  <p className="font-bold">{selectedExercise.duration / 60} Min</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Belohnung</p>
                  <p className="font-bold text-indigo-600">{selectedExercise.xpReward} XP</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedExercise(null)}
                className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-colors"
              >
                Verstanden
              </button>
            </div>
          </Modal>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <Modal onClose={() => setShowSettings(false)} title="Profil & Einstellungen">
            <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              <section>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Trainings-Schwerpunkt</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Technik', 'Ausdauer', 'Beinarbeit', 'Kraft', 'Taktik', 'Allround'] as FocusArea[]).map(f => (
                    <button
                      key={f}
                      onClick={() => onUpdateProfile({ focusArea: f })}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-sm font-bold",
                        user.focusArea === f ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Personalien</label>
                <div className="space-y-4">
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Doppel-Partner"
                      defaultValue={user.partnerName}
                      onBlur={(e) => onUpdateProfile({ partnerName: e.target.value })}
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Lieblingsspieler"
                      defaultValue={user.personalDetails?.favoritePlayer}
                      onBlur={(e) => onUpdateProfile({ personalDetails: { ...user.personalDetails, favoritePlayer: e.target.value } })}
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <TargetIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Spielstil (z.B. Offensiv)"
                      defaultValue={user.personalDetails?.playingStyle}
                      onBlur={(e) => onUpdateProfile({ personalDetails: { ...user.personalDetails, playingStyle: e.target.value } })}
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              <section>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Disziplin</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Einzel', 'Doppel', 'Beides'] as Discipline[]).map(d => (
                    <button
                      key={d}
                      onClick={() => onUpdateProfile({ discipline: d })}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-sm font-bold",
                        user.discipline === d ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </Modal>
        )}

        {/* Add Game Modal */}
        {showAddGame && (
          <Modal onClose={() => setShowAddGame(false)} title="Spielergebnis eintragen">
            <form onSubmit={handleAddGame} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Gegner</label>
                  <input name="opponent" required className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Name" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Ergebnis</label>
                  <input name="score" required className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="z.B. 21:15, 21:19" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Disziplin</label>
                <select name="discipline" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white">
                  <option value="Einzel">Einzel</option>
                  <option value="Doppel">Doppel</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Ausgang</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                    <input type="radio" name="result" value="win" defaultChecked className="hidden" />
                    <span className="font-bold text-green-700">Sieg</span>
                  </label>
                  <label className="flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                    <input type="radio" name="result" value="loss" className="hidden" />
                    <span className="font-bold text-red-700">Niederlage</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Notizen / Schwächen</label>
                <textarea name="notes" className="w-full px-4 py-3 rounded-xl border border-gray-200 min-h-[80px]" placeholder="z.B. Rückhand-Clear war zu kurz..." />
              </div>
              <button type="submit" className="w-full shuttle-gradient text-white py-4 rounded-2xl font-bold mt-4">Speichern</button>
            </form>
          </Modal>
        )}

        {/* Game History Modal */}
        {showGameResults && (
          <Modal onClose={() => setShowGameResults(false)} title="Spielhistorie">
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {(!user.gameResults || user.gameResults.length === 0) ? (
                <div className="text-center py-12 text-gray-400">
                  <History size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Noch keine Spiele eingetragen.</p>
                </div>
              ) : (
                [...user.gameResults].reverse().map((game, index) => (
                  <div key={`${game.id}-${index}`} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">{game.date} • {game.discipline}</p>
                        <h4 className="font-bold">vs. {game.opponent}</h4>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        game.won ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      )}>
                        {game.won ? 'Sieg' : 'Niederlage'}
                      </span>
                    </div>
                    <p className="text-lg font-mono font-bold text-indigo-600 mb-2">{game.score}</p>
                    {game.notes && <p className="text-sm text-gray-600 italic">"{game.notes}"</p>}
                  </div>
                ))
              )}
            </div>
          </Modal>
        )}

        {/* Badges & Rewards Modal */}
        {showBadges && (
          <Modal onClose={() => setShowBadges(false)} title="Erfolge & Belohnungen">
            <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <section>
                <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Deine Abzeichen</h4>
                {(!user.badges || user.badges.length === 0) ? (
                  <p className="text-center py-8 text-gray-400 italic">Noch keine Abzeichen verdient. Trainiere weiter!</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {user.badges.map((badge, index) => (
                      <div key={`${badge.id}-${index}`} className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex flex-col items-center text-center">
                        <span className="text-3xl mb-2">{badge.icon}</span>
                        <h5 className="font-bold text-indigo-900 text-sm">{badge.name}</h5>
                        <p className="text-[10px] text-indigo-600 mt-1">{badge.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Freigeschaltete Belohnungen</h4>
                <div className="space-y-3">
                  {(!user.unlockedRewards || user.unlockedRewards.length === 0) ? (
                    <p className="text-center py-8 text-gray-400 italic">Steige im Level auf, um Belohnungen freizuschalten!</p>
                  ) : (
                    user.unlockedRewards.map((rewardId, index) => (
                      <div key={`${rewardId}-${index}`} className="flex items-center gap-4 bg-green-50 p-4 rounded-2xl border border-green-100">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600">
                          <Star size={20} fill="currentColor" />
                        </div>
                        <div>
                          <p className="font-bold text-green-900">Level Belohnung</p>
                          <p className="text-xs text-green-600">Du hast Zugriff auf exklusive KI-Tipps!</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </Modal>
        )}

        {/* Video Analysis Modal */}
        {showVideoAnalysis && (
          <VideoAnalysis 
            user={user} 
            onUpdateProfile={onUpdateProfile} 
            onClose={() => setShowVideoAnalysis(false)} 
          />
        )}

        {/* Trophy Path Modal */}
        {showTrophyPath && (
          <TrophyPath user={user} onClose={() => setShowTrophyPath(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="relative w-full max-w-lg glass-panel rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between mb-6">
          {title && <h3 className="text-xl font-bold">{title}</h3>}
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
