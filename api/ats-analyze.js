
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
        const { resumeText, jobDescription } = req.body || {};
        
        if (!resumeText) {
            return res.status(400).json({ success: false, error: 'Resume text is required' });
        }

        // Control: Check length to prevent massive token usage
        if (resumeText.length > 30000) {
            return res.status(400).json({ success: false, error: 'Resume text too long' });
        }

        const systemPrompt = "You are an ATS expert. Analyze and return ONLY JSON.";
        const userMessage = `Resume:\n${resumeText}\nJD:\n${jobDescription || 'N/A'}\nFormat: {overallScore, jobFitAnalysis, fitVerdict, sections:[], keywords:{found:[], missing:[]}, improvements:[], strengths:[]}`;
        
        const aiResponse = await callGemini(systemPrompt, userMessage);
        
        // Clean AI response
        const cleanJson = aiResponse.replace(/```json\n?|```/g, '').trim();
        const analysis = JSON.parse(cleanJson);

        res.status(200).json({ success: true, analysis });
    } catch (err) {
        console.error('[ATS Analysis] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
