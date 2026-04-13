import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Upload, Loader2, CheckCircle2, AlertCircle, Play, Sparkles, ChevronLeft } from 'lucide-react';
import { UserProfile, VideoAnalysis as IVideoAnalysis } from '../types';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

interface VideoAnalysisProps {
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
}

export default function VideoAnalysis({ user, onUpdateProfile, onClose }: VideoAnalysisProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<IVideoAnalysis | null>(null);
  const [description, setDescription] = useState('');

  const handleAnalyze = async () => {
    if (!description) return;
    setAnalyzing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

      const prompt = `
        Du bist ein professioneller Badminton-Coach. Analysiere die folgende Beschreibung einer Schlagtechnik oder eines Spielzuges und gib detailliertes Feedback sowie Verbesserungsvorschläge.
        
        Beschreibung des Spielers: "${description}"
        Aktuelles Level des Spielers: ${user.level}
        Fokusbereich: ${user.focusArea}
        
        Antworte im JSON-Format:
        {
          "feedback": "Detailliertes Coaching-Feedback...",
          "suggestedExercises": ["Übung 1", "Übung 2", "Übung 3"]
        }
      `;

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });
      
      const text = result.text || "";
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson);

      const newAnalysis: IVideoAnalysis = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        feedback: data.feedback,
        suggestedExercises: data.suggestedExercises
      };

      setResult(newAnalysis);
      onUpdateProfile({
        videoAnalyses: [...(user.videoAnalyses || []), newAnalysis]
      });
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="relative w-full max-w-xl glass-panel rounded-[40px] p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold">KI Video-Analyse</h2>
            <p className="text-sm text-gray-500">Verbessere deine Technik mit KI-Feedback</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
          {!result ? (
            <div className="space-y-6">
              <div className="p-8 border-2 border-dashed border-white/40 rounded-[32px] bg-white/20 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Video size={32} />
                </div>
                <div>
                  <p className="font-bold">Lade ein Video hoch oder beschreibe dein Problem</p>
                  <p className="text-xs text-gray-500 mt-1">Die KI analysiert deine Bewegungsabläufe</p>
                </div>
                <button className="bg-white px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Upload size={18} />
                  Video auswählen
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Beschreibung (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschreibe was du verbessern möchtest (z.B. Mein Smash landet oft im Netz...)"
                  className="w-full bg-white/40 border border-white/40 rounded-3xl p-6 min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                />
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={analyzing || !description}
                className="w-full shuttle-gradient text-white py-4 rounded-3xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-200"
              >
                {analyzing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    KI analysiert...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Analyse starten
                  </>
                )}
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-green-50/50 border border-green-100 p-6 rounded-[32px] flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-green-900">Analyse abgeschlossen</h4>
                  <p className="text-sm text-green-700">Hier ist dein personalisiertes Feedback:</p>
                </div>
              </div>

              <div className="bg-white/40 border border-white/40 p-8 rounded-[32px] space-y-4">
                <h4 className="font-bold text-lg">Feedback</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.feedback}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Empfohlene Übungen</h4>
                <div className="grid gap-2">
                  {result.suggestedExercises.map((ex, i) => (
                    <div key={i} className="bg-white/60 p-4 rounded-2xl border border-white/40 flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {i + 1}
                      </div>
                      <span className="font-medium">{ex}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setResult(null)}
                className="w-full bg-white/60 border border-white/40 py-4 rounded-3xl font-bold hover:bg-white/80 transition-colors"
              >
                Neue Analyse
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
