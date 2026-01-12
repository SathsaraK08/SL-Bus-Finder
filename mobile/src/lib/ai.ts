import { GoogleGenerativeAI } from '@google/generative-ai';
import { BusStop } from '../types';

const GENAI_KEY = 'AIzaSyDLcF0UlKcULV6Wr0ZlQGCozJbAotM6Dj8';
const genAI = new GoogleGenerativeAI(GENAI_KEY);

/**
 * AI Transit Analysis
 */
export const analyzeJourneyAI = async (from: string, to: string, allStops: BusStop[]) => {
    console.log(`🤖 AI Analyzing: ${from} -> ${to}`);

    // Try Flash, fallback to Pro
    const modelsToTry = ["gemini-1.5-flash", "gemini-pro"];

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const stopNames = allStops.map(s => s.name).join(', ');

            const prompt = `
                Expert Guide: Colombo Bus Transit.
                Query: "${from}" to "${to}".
                Stops: [${stopNames}].
                
                Task:
                1. If direct corridor (e.g. Galle Rd), use strategy "direct_priority".
                2. If cross-town, use "transfer_required" and suggest best stops from list.
                
                Return JSON only:
                {
                    "strategy": "direct_priority" | "transfer_required" | "standard",
                    "logic": "brief explanation",
                    "preferredTransferPoints": ["Stop Name"]
                }
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                console.log(`✅ AI Success (${modelName}):`, data.strategy);
                return data;
            }
        } catch (err) {
            console.warn(`Model ${modelName} failed, trying next...`);
        }
    }

    // HEURISTIC FALLBACKS (If AI is completely down)
    const fromL = from.toLowerCase();
    const toL = to.toLowerCase();

    // Galle Road Corridor (Fort/Pettah <-> Coastal areas)
    const coastal = ['fort', 'pettah', 'kollupitiya', 'bambalapitiya', 'wellawatte', 'dehiwala', 'mount lavinia', 'ratmalana'];
    const isCoastalStart = coastal.some(c => fromL.includes(c));
    const isCoastalEnd = coastal.some(c => toL.includes(c));

    if (isCoastalStart && isCoastalEnd) {
        return { strategy: 'direct_priority', logic: 'Coastal corridor (Heuristic)' };
    }

    return { strategy: 'standard', logic: 'Search based on geography' };
};
