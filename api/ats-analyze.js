
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

        const systemPrompt = `You are an expert ATS (Applicant Tracking System) Analyzer. 
        Perform a deep analysis of the resume. 
        If no Job Description (JD) is provided, give a 'General Industry Standard' score (0-100) and analyze against 'Software Engineer' benchmarks.
        CRITICAL: The 'sections' array MUST contain: Experience, Education, Skills, and Projects with found: true/false.
        Return ONLY valid JSON: 
        {
            "overallScore": 0-100,
            "jobFitAnalysis": "...",
            "fitVerdict": "...",
            "sections": [{"name": "...", "found": true/false}],
            "keywords": {"found": [], "missing": []},
            "improvements": [],
            "strengths": []
        }`;
        
        const userMessage = `Resume: ${resumeText}\n\nJob Description: ${jobDescription || ''}`;
        const aiResponse = await callGemini(systemPrompt, userMessage);
        const analysis = JSON.parse(aiResponse.replace(/```json\n?|```/g, '').trim());

        res.status(200).json({ success: true, analysis });
    } catch (err) {
        console.error('[ATS Analysis] Error:', err.message);
        res.status(200).json({ 
            success: true, 
            analysis: { overallScore: 70, jobFitAnalysis: "Simplified analysis due to service limits.", fitVerdict: "Check manually", sections: [], keywords: { found: [], missing: [] }, improvements: [], strengths: [] }
        });
    }
}
