import { GoogleGenAI, Type } from "@google/genai";
import { SkillLevel, TrainingPlan, UserProfile, VideoAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateTrainingPlan(profile: UserProfile): Promise<TrainingPlan> {
  const { level, goals, discipline, context, focusArea, gameResults } = profile;
  
  const recentGames = gameResults.slice(-3).map(g => 
    `${g.date}: gegen ${g.opponent} (${g.score}, ${g.won ? 'Sieg' : 'Niederlage'}). Notizen: ${g.notes}`
  ).join("; ");

  const prompt = `Erstelle einen hochprofessionellen Badminton-Trainingsplan für einen ${level} Spieler. 
  Disziplin: ${discipline}.
  Schwerpunkt: ${focusArea}.
  Zusätzlicher Kontext: ${context || "Keiner"}.
  Ziele: ${goals.join(", ")}. 
  Letzte Spielergebnisse zur Analyse: ${recentGames || "Keine Ergebnisse vorhanden"}.
  
  Der Plan sollte 4-5 intensive Übungen enthalten, die Technik, Beinarbeit, Taktik und Ausdauer abdecken, aber besonders den Schwerpunkt ${focusArea} und Schwächen aus den letzten Spielen berücksichtigen.
  Berücksichtige das hohe Niveau (Bezirksliga/Leistungssport), falls zutreffend.
  
  Jede Übung muss folgende Felder enthalten:
  - 'description': Eine prägnante Zusammenfassung der Übung.
  - 'instructions': Eine sehr detaillierte Schritt-für-Schritt Erklärung der Durchführung.
  - 'tips': Spezifische technische Hinweise zur Perfektionierung (z.B. Griffhaltung, Treffpunkt).
  - 'commonErrors': Häufige Fehler, die vermieden werden sollten, um Verletzungen vorzubeugen oder die Effektivität zu steigern.
  
  Gib das Ergebnis im JSON-Format zurück.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  instructions: { type: Type.STRING },
                  tips: { type: Type.STRING },
                  commonErrors: { type: Type.STRING },
                  duration: { type: Type.NUMBER, description: "Dauer in Sekunden" },
                  reps: { type: Type.NUMBER },
                  xpReward: { type: Type.NUMBER },
                  category: { type: Type.STRING, enum: ["Technik", "Ausdauer", "Beinarbeit", "Kraft", "Taktik"] }
                },
                required: ["id", "title", "description", "instructions", "duration", "xpReward", "category"]
              }
            }
          },
          required: ["title", "exercises"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title || "Tages-Training",
      exercises: data.exercises || [],
      totalDuration: (data.exercises || []).reduce((acc: number, ex: any) => acc + ex.duration, 0)
    };
  } catch (error) {
    console.error("Error generating training plan:", error);
    // Fallback plan
    return {
      id: "fallback",
      title: "Basis Training",
      exercises: [
        { id: "1", title: "Schattenboxen (Beinarbeit)", description: "Bewege dich in alle 6 Ecken des Feldes.", instructions: "Starte in der Mitte. Bewege dich schnell in eine Ecke, simuliere einen Schlag und kehre in die Mitte zurück. Wiederhole dies für alle Ecken.", tips: "Achte auf kleine, schnelle Schritte.", commonErrors: "Fersenbelastung vermeiden; bleibe auf den Fußballen.", xpReward: 50, category: "Beinarbeit", duration: 300 },
        { id: "2", title: "High Clears", description: "Übe hohe Clears an die Grundlinie.", instructions: "Schlage den Ball hoch und weit an die gegenüberliegende Grundlinie. Achte auf die korrekte Ausholbewegung.", tips: "Nutze die Rotation des Oberkörpers.", commonErrors: "Treffpunkt zu weit hinten; Schlagarm nicht voll gestreckt.", xpReward: 100, category: "Technik", duration: 600 }
      ],
      totalDuration: 900
    };
  }
}

export async function analyzeVideoTechnique(profile: UserProfile, videoContext: string): Promise<VideoAnalysis> {
  const prompt = `Analysiere die Badminton-Technik eines ${profile.level} Spielers basierend auf dieser Video-Beschreibung: "${videoContext}".
  Schwerpunkt des Spielers: ${profile.focusArea}.
  
  Gib detailliertes Feedback zu Fehlern und schlage 3 spezifische Übungen vor, um diese zu beheben.
  
  Gib das Ergebnis im JSON-Format zurück.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            suggestedExercises: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["feedback", "suggestedExercises"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('de-DE'),
      feedback: data.feedback || "Deine Technik sieht solide aus, achte aber mehr auf die Beinarbeit.",
      suggestedExercises: data.suggestedExercises || ["Schatten-Beinarbeit", "Clear-Drills"]
    };
  } catch (error) {
    console.error("Error analyzing video:", error);
    return {
      id: "error",
      date: new Date().toLocaleDateString('de-DE'),
      feedback: "Die Video-Analyse konnte nicht durchgeführt werden. Bitte versuche es später erneut.",
      suggestedExercises: []
    };
  }
}
