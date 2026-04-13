import React, { useState, useEffect } from 'react';
import { AppState, UserProfile, TrainingPlan } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import TrainingSession from './components/TrainingSession';
import DuelMode from './components/DuelMode';
import { generateTrainingPlan } from './services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { LogIn, Loader2 } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>('onboarding');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthReady(true);
      if (firebaseUser) {
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          setUser(userData);
          setState('dashboard');
          
          if (userData.currentPlan) {
            setPlan(userData.currentPlan);
          } else {
            fetchPlan(userData);
          }
          
          // Subscribe to real-time updates
          onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
            if (snapshot.exists()) {
              const updatedData = snapshot.data() as UserProfile;
              // Ensure arrays exist for existing users
              const sanitizedData: UserProfile = {
                ...updatedData,
                badges: updatedData.badges || [],
                unlockedRewards: updatedData.unlockedRewards || [],
                gameResults: updatedData.gameResults || [],
                videoAnalyses: updatedData.videoAnalyses || [],
                personalDetails: updatedData.personalDetails || {}
              };
              setUser(sanitizedData);
              if (sanitizedData.currentPlan) {
                setPlan(sanitizedData.currentPlan);
              }
            }
          });
        } else {
          setState('onboarding');
        }
      } else {
        setUser(null);
        setState('onboarding');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchPlan = async (profile: UserProfile) => {
    setPlanLoading(true);
    try {
      const newPlan = await generateTrainingPlan(profile);
      setPlan(newPlan);
      // Save plan to profile
      await setDoc(doc(db, 'users', profile.uid), {
        ...profile,
        currentPlan: newPlan
      });
    } catch (error) {
      console.error("Failed to fetch plan", error);
    }
    setPlanLoading(false);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setState('onboarding');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleOnboardingComplete = async (profileData: Partial<UserProfile>) => {
    if (!auth.currentUser) return;

    const newUser: UserProfile = {
      uid: auth.currentUser.uid,
      name: profileData.name || auth.currentUser.displayName || 'Spieler',
      email: auth.currentUser.email || '',
      level: profileData.level || 'Anfänger',
      discipline: profileData.discipline || 'Einzel',
      goals: profileData.goals || [],
      xp: 0,
      level_rank: 1,
      completedWorkouts: 0,
      context: profileData.context || '',
      partnerName: profileData.partnerName || '',
      focusArea: profileData.focusArea || 'Allround',
      gameResults: [],
      badges: [],
      unlockedRewards: [],
      videoAnalyses: [],
      personalDetails: {
        favoritePlayer: '',
        playingStyle: '',
        racketModel: '',
        clubName: ''
      }
    };

    await setDoc(doc(db, 'users', newUser.uid), newUser);
    setUser(newUser);
    setState('dashboard');
    fetchPlan(newUser);
  };

  const handleTrainingComplete = async (earnedXp: number) => {
    if (!user) return;
    
    const newXp = user.xp + earnedXp;
    const newLevel = Math.floor(newXp / 1000) + 1;
    const newWorkouts = user.completedWorkouts + 1;
    
    let newBadges = [...(user.badges || [])];
    let newRewards = [...(user.unlockedRewards || [])];

    // Check for new badges
    if (newWorkouts === 1 && !newBadges.find(b => b.id === 'first_workout')) {
      newBadges.push({
        id: 'first_workout',
        name: 'Erster Schritt',
        description: 'Dein erstes Training absolviert!',
        icon: '🎯',
        unlockedAt: new Date().toISOString()
      });
    }
    if (newWorkouts === 5 && !newBadges.find(b => b.id === 'regular')) {
      newBadges.push({
        id: 'regular',
        name: 'Stammgast',
        description: '5 Trainings abgeschlossen!',
        icon: '🔥',
        unlockedAt: new Date().toISOString()
      });
    }
    if (newLevel > user.level_rank) {
      newBadges.push({
        id: `level_${newLevel}`,
        name: `Level ${newLevel} erreicht`,
        description: `Du steigst auf!`,
        icon: '⭐',
        unlockedAt: new Date().toISOString()
      });
      // Unlock a reward every level
      newRewards.push(`reward_lvl_${newLevel}`);
    }

    const updatedUser: UserProfile = {
      ...user,
      xp: newXp,
      completedWorkouts: newWorkouts,
      level_rank: newLevel,
      badges: newBadges,
      unlockedRewards: newRewards
    };
    
    await setDoc(doc(db, 'users', user.uid), updatedUser);
    setState('dashboard');
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    await setDoc(doc(db, 'users', user.uid), updatedUser);
    if (updates.focusArea || updates.discipline) {
      fetchPlan(updatedUser);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <AnimatePresence mode="wait">
        {!auth.currentUser && (
          <motion.div 
            key="login" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-20 h-20 shuttle-gradient rounded-3xl flex items-center justify-center mb-8 shadow-xl rotate-12">
              <span className="text-4xl">🏸</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">ShuttleUp</h1>
            <p className="text-gray-500 mb-12 max-w-xs text-lg">Dein KI-gestützter Badminton-Coach für maximale Performance.</p>
            <button 
              onClick={handleLogin}
              className="flex items-center gap-3 bg-white border border-gray-200 px-8 py-4 rounded-2xl font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <LogIn size={20} />
              Mit Google anmelden
            </button>
          </motion.div>
        )}

        {auth.currentUser && state === 'onboarding' && !user && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Onboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {auth.currentUser && state === 'dashboard' && user && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Dashboard 
              user={user} 
              plan={plan} 
              planLoading={planLoading}
              onStartTraining={() => setState('training')} 
              onStartDuel={() => setState('duel')}
              onLogout={handleLogout}
              onUpdateProfile={handleUpdateProfile}
              onRefreshPlan={() => fetchPlan(user)}
            />
          </motion.div>
        )}

        {auth.currentUser && state === 'training' && plan && (
          <motion.div key="training" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TrainingSession 
              plan={plan} 
              onComplete={handleTrainingComplete}
              onCancel={() => setState('dashboard')}
            />
          </motion.div>
        )}

        {auth.currentUser && state === 'duel' && user && (
          <motion.div key="duel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DuelMode 
              user={user} 
              onCancel={() => setState('dashboard')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
