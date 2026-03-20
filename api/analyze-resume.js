
import { callGemini, deduplicate, normaliseLocation, normaliseType } from './utils.js';

async function fetchActiveJobsDB(query, RAPIDAPI_KEY) {
    try {
        const url = `https://active-jobs-db.p.rapidapi.com/active-ats-1h?offset=0&title_filter=${encodeURIComponent(query || 'intern')}&limit=20`;
        const response = await fetch(url, {
            headers: { 
                'X-RapidAPI-Key': RAPIDAPI_KEY, 
                'X-RapidAPI-Host': 'active-jobs-db.p.rapidapi.com' 
            }
        });
        const data = await response.json();
        const jobs = Array.isArray(data) ? data : (data.data || data.jobs || []);
        return jobs.map((j, i) => ({
            id: `ajdb-${i}-${Date.now()}`,
            title: j.title || '',
            companyOrOrganizer: j.company || 'Company',
            type: normaliseType(j.employment_type || ''),
            location: normaliseLocation(j.location || ''),
            applyLink: j.url || '#',
            analysis: (j.description || '').slice(0, 200) + '...',
            matchScore: 75,
            platform: 'ActiveJobs'
        }));
    } catch (_) { return []; }
}

async function fetchJSearch(query, RAPIDAPI_KEY) {
    try {
        const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query || 'intern')} in India&num_pages=1`;
        const response = await fetch(url, {
            headers: { 
                'X-RapidAPI-Key': RAPIDAPI_KEY, 
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' 
            }
        });
        const data = await response.json();
        return (data.data || []).map((j, i) => ({
            id: `jsearch-${i}-${Date.now()}`,
            title: j.job_title || '',
            companyOrOrganizer: j.employer_name || 'Company',
            type: normaliseType(j.job_employment_type || ''),
            location: normaliseLocation(j.job_city || 'India'),
            applyLink: j.job_apply_link || '#',
            analysis: (j.job_description || '').slice(0, 200) + '...',
            matchScore: 72,
            platform: 'JSearch'
        }));
    } catch (_) { return []; }
}

// Commudle and Townscript could also be included here if needed, 
// but for resume analysis, we usually focus on jobs/internships.
// I'll keep them to match the original logic.

async function fetchCommudle(FIRECRAWL_API_KEY) {
    if (!FIRECRAWL_API_KEY) return [];
    try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://www.commudle.com/explore/events', formats: ['extract'], extract: { prompt: 'Extract tech events.' } })
        });
        const data = await response.json();
        return (Object.values(data.data?.extract || {}).find(v => Array.isArray(v)) || []).slice(0, 5).map((v, i) => ({
            id: `commudle-${i}`, title: v.title || 'Event', type: 'EVENT', location: 'India', applyLink: v.link || '#', platform: 'Commudle'
        }));
    } catch (_) { return []; }
}

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
        const { resumeText } = req.body || {};
        if (!resumeText) return res.status(400).json({ error: 'Resume text is required' });

        const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
        const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || '';

        const systemPrompt = "Extract profile. Return ONLY JSON: {skills:[], experienceLevel, domain, searchQuery}.";
        const aiResponse = await callGemini(systemPrompt, resumeText);
        
        const cleanJson = aiResponse.replace(/```json\n?|```/g, '').trim();
        const prof = JSON.parse(cleanJson);

        console.log(`[Resume Analysis] Extracted Search Query: "${prof.searchQuery}"`);

        // Fetch opportunities based on extracted search query
        const results = await Promise.all([
            fetchActiveJobsDB(prof.searchQuery, RAPIDAPI_KEY),
            fetchJSearch(prof.searchQuery, RAPIDAPI_KEY),
            fetchCommudle(FIRECRAWL_API_KEY)
        ]);

        const opportunities = deduplicate(results.flat()).slice(0, 10);

        res.status(200).json({ 
            success: true, 
            ...prof, 
            opportunities 
        });
    } catch (err) {
        console.error('[Resume Analysis] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
}
