import { corsHeaders, deduplicate, normaliseLocation, normaliseType, URL_PATTERNS, extractId, callGemini } from './utils.js';

function formatKeyword(kw) {
    if (!kw) return 'tech';
    return kw.trim().replace(/\s+/g, '-').toLowerCase();
}

async function fetchJSearch(query, RAPIDAPI_KEY) {
    if (!RAPIDAPI_KEY) return [];
    try {
        const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query || 'intern')} in India&num_pages=1`;
        const response = await fetch(url, { headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' } });
        const data = await response.json();
        return (data.data || []).map((j, i) => {
            const platform = j.employer_website?.includes('linkedin') ? 'linkedin' : (j.employer_website?.includes('glassdoor') ? 'glassdoor' : 'indeed');
            return {
                id: extractId(j.job_apply_link, platform) || `js-${i}-${Date.now()}`,
                title: j.job_title || '',
                companyOrOrganizer: j.employer_name || 'Company',
                type: normaliseType(j.job_employment_type || ''),
                location: normaliseLocation(j.job_city || 'India'),
                applyLink: j.job_apply_link || j.job_google_link || '#',
                analysis: (j.job_description || '').slice(0, 150) + '...',
                matchScore: 85,
                platform: platform
            };
        });
    } catch (_) { return []; }
}

async function generateAllPlatformsFromGemini(query, URL_PATTERNS) {
    console.log(`[Gemini Fetch] Generating realistic opportunities for query: ${query}...`);
    const prompt = `You are a Live Opportunty Aggregator AI. 
    You have a search query: ${query}
    
    You must generate exactly 1-2 highly realistic, customized opportunity records for EACH platform in the provided URL_PATTERNS relevant to this query.
    Cover Jobs, Internships, Hackathons, Courses, and Events according to the platform's nature.
    The 'title' must sound like a real, scraped listing (e.g. "Full-Stack Development Intern", "AI Innovators Hackathon").
    The 'applyLink' must be constructed using the strict URL pattern provided for that platform, by replacing '{keyword}' or '{role}' or '{type}' with a proper, hyphenated query (e.g., "${formatKeyword(query)}").
    
    Return ONLY a raw JSON array of objects:
    [
      { "id": "unique-id", "platform": "internshala", "title": "...", "companyOrOrganizer": "...", "type": "INTERNSHIP", "location": "Remote", "applyLink": "https://internshala.com/...", "analysis": "1-sentence why it matches", "matchScore": 92 }
    ]`;
    
    const platformsData = JSON.stringify(URL_PATTERNS, null, 2);
    
    try {
        const response = await callGemini(prompt, platformsData);
        const jsonText = response.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error('[Gemini Fetch] Generation Error:', e.message);
        return [];
    }
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') { res.status(204).json(null); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method Not Allowed' }); return; }

    try {
        const { query } = req.body || {};
        const q = query || 'intern';
        const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

        console.log(`[Fetch] Fetching for: "${q}"`);

        // Fetch Live JSearch Data & Gemini Synthesis concurrently
        const [jsearchResults, geminiOpportunities] = await Promise.all([
            fetchJSearch(q, RAPIDAPI_KEY),
            generateAllPlatformsFromGemini(q, URL_PATTERNS)
        ]);

        let finalOpportunities = deduplicate([...jsearchResults, ...geminiOpportunities]);
        finalOpportunities.sort((a, b) => b.matchScore - a.matchScore);

        res.status(200).json({ success: true, opportunities: finalOpportunities });
    } catch (err) {
        console.error('[Fetch] Error fetching opportunities:', err.message);
        res.status(500).json({ error: err.message });
    }
}
