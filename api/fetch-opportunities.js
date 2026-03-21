
import { corsHeaders, deduplicate, normaliseLocation, normaliseType, isFresherRelevant } from './utils.js';

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
    } catch (err) {
        console.error('[fetchActiveJobsDB] Error:', err.message);
        return [];
    }
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
    } catch (err) {
        console.error('[fetchJSearch] Error:', err.message);
        return [];
    }
}

async function fetchCommudle(FIRECRAWL_API_KEY) {
    if (!FIRECRAWL_API_KEY) return [];
    try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ 
                url: 'https://www.commudle.com/explore/events', 
                formats: ['extract'], 
                extract: { prompt: 'Extract a list of upcoming tech events with title, organizer, and link. Focus on Indian communities.' } 
            })
        });
        const data = await response.json();
        return (Object.values(data.data?.extract || {}).find(v => Array.isArray(v)) || []).map((v, i) => ({
            id: `commudle-${i}-${Date.now()}`,
            title: v.title || 'Event',
            companyOrOrganizer: v.organizer || 'Commudle',
            type: 'EVENT',
            location: 'India',
            applyLink: v.link || '#',
            analysis: 'Local tech community events.',
            matchScore: 85,
            platform: 'Commudle'
        }));
    } catch (err) {
        console.error('[fetchCommudle] Error:', err.message);
        return [];
    }
}

async function fetchTownscript(FIRECRAWL_API_KEY) {
    if (!FIRECRAWL_API_KEY) return [];
    try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ 
                url: 'https://www.townscript.com/in/india/technology-events', 
                formats: ['extract'], 
                extract: { prompt: 'Extract tech events with title, organizer, and link.' } 
            })
        });
        const data = await response.json();
        return (Object.values(data.data?.extract || {}).find(v => Array.isArray(v)) || []).map((v, i) => ({
            id: `townscript-${i}-${Date.now()}`,
            title: v.title || 'Tech Event',
            companyOrOrganizer: v.organizer || 'Townscript',
            type: 'EVENT',
            location: 'India',
            applyLink: v.link || '#',
            analysis: 'Technology seminars and workshops.',
            matchScore: 80,
            platform: 'Townscript'
        }));
    } catch (err) {
        console.error('[fetchTownscript] Error:', err.message);
        return [];
    }
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
        const { query } = req.body || {};
        const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
        const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || '';

        console.log(`[Proxy] Fetching opportunities for query: "${query}"`);

        const results = await Promise.all([
            fetchActiveJobsDB(query, RAPIDAPI_KEY),
            fetchJSearch(query, RAPIDAPI_KEY),
            fetchCommudle(FIRECRAWL_API_KEY),
            fetchTownscript(FIRECRAWL_API_KEY)
        ]);

        let all = deduplicate(results.flat());
        
        // If live APIs failed or returned nothing, use high-quality mock fallback
        if (all.length === 0) {
            const { getMockOpportunities } = await import('./utils.js');
            all = getMockOpportunities(query);
        }
        
        // If no query, prioritize events or fresher items
        if (!query) {
            all = all.filter(o => o.type === 'EVENT' || isFresherRelevant(o.title, o.analysis));
            // Ensure at least 3 items show up even after filter
            if (all.length < 3) {
                const { getMockOpportunities } = await import('./utils.js');
                all = [...all, ...getMockOpportunities().slice(0, 3)].slice(0, 6);
            }
        }

        all.sort((a, b) => {
            if (a.type === 'EVENT' && b.type !== 'EVENT') return -1;
            if (a.type !== 'EVENT' && b.type === 'EVENT') return 1;
            return b.matchScore - a.matchScore;
        });

        res.status(200).json({ success: true, opportunities: all });
    } catch (err) {
        console.error('[Proxy] Error fetching opportunities:', err.message);
        res.status(500).json({ error: err.message });
    }
}
