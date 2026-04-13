import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Swords, Trophy, Users, Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfile, Duel } from '../types';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface DuelModeProps {
  user: UserProfile;
  onCancel: () => void;
}

export default function DuelMode({ user, onCancel }: DuelModeProps) {
  const [duels, setDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [foundPlayer, setFoundPlayer] = useState<{ uid: string, name: string } | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'duels'),
      where('player1Id', '==', user.uid)
    );
    const q2 = query(
      collection(db, 'duels'),
      where('player2Id', '==', user.uid)
    );

    const unsub1 = onSnapshot(q, (snapshot) => {
      const d1 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Duel));
      setDuels(prev => {
        const combined = [...prev.filter(p => !d1.find(d => d.id === p.id)), ...d1];
        return combined.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
      setLoading(false);
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
      const d2 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Duel));
      setDuels(prev => {
        const combined = [...prev.filter(p => !d2.find(d => d.id === p.id)), ...d2];
        return combined.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
      setLoading(false);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [user.uid]);

  const handleSearchPlayer = async () => {
    if (!searchEmail) return;
    setSearching(true);
    setFoundPlayer(null);
    try {
      const q = query(collection(db, 'users'), where('email', '==', searchEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const p = snap.docs[0].data();
        if (p.uid === user.uid) {
          alert("Du kannst dich nicht selbst herausfordern!");
        } else {
          setFoundPlayer({ uid: p.uid, name: p.name });
        }
      } else {
        alert("Spieler nicht gefunden.");
      }
    } catch (e) {
      console.error(e);
    }
    setSearching(false);
  };

  const handleCreateDuel = async () => {
    if (!foundPlayer) return;
    const newDuel: Omit<Duel, 'id'> = {
      player1Id: user.uid,
      player1Name: user.name,
      player2Id: foundPlayer.uid,
      player2Name: foundPlayer.name,
      scores: [],
      winnerId: null,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'duels'), newDuel);
    setShowCreate(false);
    setFoundPlayer(null);
    setSearchEmail('');
  };

  const handleUpdateScore = async (duel: Duel, p1Score: number, p2Score: number) => {
    const updatedScores = [...duel.scores, { p1: p1Score, p2: p2Score }];
    
    // Check for winner (best of 3)
    let p1Wins = 0;
    let p2Wins = 0;
    updatedScores.forEach(s => {
      if (s.p1 > s.p2) p1Wins++;
      else if (s.p2 > s.p1) p2Wins++;
    });

    let winnerId = null;
    let status = duel.status;
    if (p1Wins >= 2) {
      winnerId = duel.player1Id;
      status = 'finished';
    } else if (p2Wins >= 2) {
      winnerId = duel.player2Id;
      status = 'finished';
    }

    await updateDoc(doc(db, 'duels', duel.id), {
      scores: updatedScores,
      winnerId,
      status
    });
  };

  return (
    <div className="fixed inset-0 bg-[#F9FAFB] z-50 flex flex-col">
      <header className="p-6 flex items-center justify-between border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <Swords size={24} />
          </div>
          <h1 className="text-xl font-bold">Duell-Modus</h1>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <button 
            onClick={() => setShowCreate(true)}
            className="w-full shuttle-gradient text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={20} />
            Neues Duell starten
          </button>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : duels.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Swords size={48} className="mx-auto mb-4 opacity-20" />
              <p>Noch keine Duelle vorhanden.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {duels.map(duel => (
                <DuelCard 
                  key={duel.id} 
                  duel={duel} 
                  currentUserId={user.uid} 
                  onUpdateScore={(p1, p2) => handleUpdateScore(duel, p1, p2)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">Gegner suchen</h2>
              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="email"
                    placeholder="E-Mail des Gegners"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    onClick={handleSearchPlayer}
                    disabled={searching}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50"
                  >
                    {searching ? "..." : "Suchen"}
                  </button>
                </div>

                {foundPlayer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-indigo-50 p-4 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {foundPlayer.name[0]}
                      </div>
                      <span className="font-bold">{foundPlayer.name}</span>
                    </div>
                    <button 
                      onClick={handleCreateDuel}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
                    >
                      Herausfordern
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DuelCardProps {
  duel: Duel;
  currentUserId: string;
  onUpdateScore: (p1: number, p2: number) => void | Promise<void>;
  key?: React.Key;
}

function DuelCard({ duel, currentUserId, onUpdateScore }: DuelCardProps) {
  const [p1Input, setP1Input] = useState('');
  const [p2Input, setP2Input] = useState('');
  const isFinished = duel.status === 'finished';
  const isPlayer1 = duel.player1Id === currentUserId;

  return (
    <div className={cn(
      "bg-white rounded-3xl border p-6 shadow-sm transition-all",
      isFinished ? "border-gray-100 opacity-80" : "border-indigo-100 shadow-indigo-50"
    )}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-center flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">{duel.player1Name}</p>
            <div className={cn(
              "w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl font-bold",
              duel.winnerId === duel.player1Id ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600"
            )}>
              {duel.player1Name[0]}
            </div>
          </div>
          <div className="text-xl font-bold text-gray-300 italic">VS</div>
          <div className="text-center flex-1">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">{duel.player2Name}</p>
            <div className={cn(
              "w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl font-bold",
              duel.winnerId === duel.player2Id ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600"
            )}>
              {duel.player2Name[0]}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {duel.scores.map((s, i) => (
          <div key={i} className="flex items-center justify-center gap-4 bg-gray-50 p-3 rounded-2xl">
            <span className={cn("text-xl font-mono font-bold", s.p1 > s.p2 ? "text-indigo-600" : "text-gray-400")}>{s.p1}</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className={cn("text-xl font-mono font-bold", s.p2 > s.p1 ? "text-indigo-600" : "text-gray-400")}>{s.p2}</span>
          </div>
        ))}
      </div>

      {!isFinished && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <input 
              type="number" 
              placeholder={duel.player1Name}
              value={p1Input}
              onChange={(e) => setP1Input(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-center font-mono font-bold"
            />
            <input 
              type="number" 
              placeholder={duel.player2Name}
              value={p2Input}
              onChange={(e) => setP2Input(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-center font-mono font-bold"
            />
          </div>
          <button 
            onClick={() => {
              if (p1Input && p2Input) {
                onUpdateScore(parseInt(p1Input), parseInt(p2Input));
                setP1Input('');
                setP2Input('');
              }
            }}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <CheckCircle2 size={20} />
          </button>
        </div>
      )}

      {isFinished && (
        <div className="flex items-center justify-center gap-2 text-yellow-600 font-bold bg-yellow-50 py-2 rounded-xl">
          <Trophy size={16} />
          <span>{duel.winnerId === duel.player1Id ? duel.player1Name : duel.player2Name} hat gewonnen!</span>
        </div>
      )}
    </div>
  );
}
