
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

        const sys = "You are Study Buddy, a helpful academic assistant for Indian students (BTech, MCA, MBA, etc.). Provide clear, concise, and encouraging study advice. Use emojis.";
        const history = conversationHistory || [];
        const aiResponse = await callGemini(sys, message, history);
        
        res.status(200).json({ message: aiResponse });
    } catch (err) {
        console.error('[StudyBot] Error:', err.message);
        res.status(200).json({ message: "Namaste! I'm here to help, but I'm currently having a bit of a 'study break'. How can I assist you?" });
    }
}
