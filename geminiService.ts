
import { GoogleGenAI, Type } from "@google/genai";
import { Task, EnergyLevel, DailyPlan, Priority } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function processBrainDump(inputs: { text?: string; images?: string[]; audio?: string }): Promise<Task[]> {
  const parts: any[] = [
    { text: `You are an ADHD Productivity Assistant. Extract tasks from the provided brain dump (text, images, or voice recording). 
    ADHD users often have scattered thoughts. Identify concrete tasks, estimate time needed, and assign:
    1. Energy Level (Low, Medium, High) - how much mental effort it takes.
    2. Priority (Low, Medium, High) - how urgent/important it is.
    
    Return a JSON array of tasks with: title, description, estimatedMinutes, energyRequired, priority, category.
    Categories: Work, Personal, Self-care, Errands, Health.` }
  ];

  if (inputs.text) {
    parts.push({ text: `Text input: ${inputs.text}` });
  }

  if (inputs.images) {
    inputs.images.forEach((img) => {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: img.split(',')[1] || img
        }
      });
    });
  }

  if (inputs.audio) {
    parts.push({
      inlineData: {
        mimeType: 'audio/webm',
        data: inputs.audio.split(',')[1] || inputs.audio
      }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedMinutes: { type: Type.NUMBER },
            energyRequired: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            priority: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            category: { type: Type.STRING, enum: ['Work', 'Personal', 'Self-care', 'Errands', 'Health'] }
          },
          required: ['title', 'estimatedMinutes', 'energyRequired', 'priority', 'category']
        }
      }
    }
  });

  try {
    const raw = JSON.parse(response.text || '[]');
    return raw.map((t: any) => ({
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      isCompleted: false
    }));
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}

export async function generateDailyPlan(tasks: Task[], wakeTime: string = "08:00"): Promise<DailyPlan> {
  const prompt = `Based on these tasks, create a realistic daily schedule for someone with ADHD. 
  Include breaks (e.g., 5-10 mins) and "buffer time". 
  PRIORITIZE: High priority tasks should be scheduled during the user's likely peak focus times.
  Group high-energy tasks during periods of peak focus (usually mornings) and low-energy tasks for lulls.
  Start the day at ${wakeTime}. 
  Identify one primary "Focus Goal" for the day.
  
  Tasks: ${JSON.stringify(tasks)}
  
  Return a JSON object: { "focusGoal": "...", "items": [ { "startTime": "HH:mm", "endTime": "HH:mm", "task": TaskObject } ] }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          focusGoal: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
                task: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    estimatedMinutes: { type: Type.NUMBER },
                    energyRequired: { type: Type.STRING },
                    priority: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}') as DailyPlan;
}

export async function breakdownTask(task: Task): Promise<string[]> {
  const prompt = `I have a task that feels overwhelming: "${task.title}". 
  Break it down into 3-5 tiny, non-intimidating steps that an ADHD person can easily start.
  Return only a JSON array of strings.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text || '[]');
}
