
import { callGemini } from './utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.status(204).json(null);
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const { message, conversationHistory } = req.body || {};
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const systemPrompt = "You are 'Study Buddy' - a personal study assistant for Indian students. Respond in a friendly, helpful manner in English or Hinglish (Hindi + English).";
        
        const aiResponse = await callGemini(systemPrompt, message, conversationHistory);
        
        res.status(200).json({ message: aiResponse });
    } catch (err) {
        console.error('[StudyBot] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
