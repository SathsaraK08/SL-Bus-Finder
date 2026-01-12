import 'react-native-url-polyfill/auto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BusStop } from '../types';

const GENAI_KEY = 'AIzaSyDLcF0UlKcULV6Wr0ZlQGCozJbAotM6Dj8';
const genAI = new GoogleGenerativeAI(GENAI_KEY);

/**
 * AI Transit Analysis - Smarter Geographic Grounding
 */
export const analyzeJourneyAI = async (from: string, to: string, allStops: BusStop[]) => {
    console.log(`🤖 AI Analyzing: ${from} -> ${to}`);

    // HEURISTIC PRE-CHECK (Colombo Wisdom) - FAST & RELIABLE
    const fromL = from.toLowerCase();
    const toL = to.toLowerCase();

    const coastal = ['kollupitiya', 'bambalapitiya', 'wellawatte', 'dehiwala', 'mount lavinia', 'galle road'];
    const inland = ['thalawathugoda', 'malabe', 'kaduwela', 'battaramulla', 'koswatte', 'pelawatte'];

    const isCoastalStart = coastal.some(c => fromL.includes(c));
    const isInlandEnd = inland.some(i => toL.includes(i));

    // Specific Rule: Kollupitiya area to Inland (Thalawathugoda/Malabe)
    // NEVER go via Pettah/Fort (it's a massive detour). Hubs: Borella/Town Hall.
    if (isCoastalStart && isInlandEnd) {
        console.log('📍 Geographic Heuristic Triggered: Coastal -> Inland');
        return {
            strategy: 'transfer_required',
            logic: 'Inland journey detected. Prioritizing central hubs (Borella/Town Hall) to avoid Pettah detour.',
            preferredTransferPoints: ['Borella Junction', 'Town Hall', 'Sethsiripaya', 'Rajagiriya']
        };
    }

    // Try AI for general cases
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const stopNames = allStops.map(s => s.name).join(', ');

        const prompt = `
            Expert Guide: Colombo Bus Transit.
            Query: "${from}" -> "${to}".
            Hubs: [${stopNames}].
            
            Rules:
            1. Coastal to Inland MUST use hub transfers (Borella, Rajagiriya).
            2. Avoid Pettah/Fort for Inland trips.
            3. Return JSON: { "strategy": "transfer_required" | "direct_priority", "logic": "...", "preferredTransferPoints": ["Hub Name"] }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (err) {
        console.warn('AI failed, using default standard search.');
    }

    return { strategy: 'standard', logic: 'Search based on geography' };
};
