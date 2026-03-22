import { corsHeaders, deduplicate, normaliseLocation, normaliseType, URL_PATTERNS, extractId } from './utils.js';

function formatKeyword(kw) {
    if (!kw) return 'tech';
    // Format for URLs: "React Developer" -> "react-developer"
    return kw.trim().replace(/\s+/g, '-').toLowerCase();
}

// ── RAPIDAPI FETCHERS (For Jobs & Job Giants) ──────────────────────────────────
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

async function fetchActiveJobsDB(query, RAPIDAPI_KEY) {
    if (!RAPIDAPI_KEY) return [];
    try {
        // Use regular URI encoding for ActiveJobsDB title filter
        const url = `https://active-jobs-db.p.rapidapi.com/active-ats-1h?offset=0&title_filter=${encodeURIComponent(query || 'intern')}&limit=20`;
        const response = await fetch(url, { headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': 'active-jobs-db.p.rapidapi.com' } });
        const data = await response.json();
        const jobs = Array.isArray(data) ? data : (data.data || data.jobs || []);
        return jobs.map((j, i) => ({
            id: `ajdb-${i}-${Date.now()}`,
            title: j.title || '',
            companyOrOrganizer: j.company || 'Company',
            type: normaliseType(j.employment_type || ''),
            location: normaliseLocation(j.location || ''),
            applyLink: j.url || '#',
            analysis: (j.description || '').slice(0, 150) + '...',
            matchScore: 75,
            platform: j.url?.includes('glassdoor') ? 'glassdoor' : 'naukri'
        }));
    } catch (_) { return []; }
}

// ── FIRECRAWL DYNAMIC LIVE SCRAPING ────────────────────────────────────────────────
async function scrapeLivePlatform(platform, query, type, FIRECRAWL_API_KEY) {
    if (!FIRECRAWL_API_KEY) return [];
    
    // We get the URL pattern for this platform
    const pattern = URL_PATTERNS[platform];
    if (!pattern) return [];

    const formattedKw = formatKeyword(query);
    const searchUrl = pattern.replace('{keyword}', formattedKw)
                             .replace('{role}', formattedKw)
                             .replace('{type}', 'hackathons'); // Default to hackathons for unstop

    console.log(`[Firecrawl] Live Scraping: ${platform} -> ${searchUrl}`);

    try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ 
                url: searchUrl, 
                formats: ['extract'], 
                extract: { prompt: `Extract exactly 5 ${type} records from this results page. Include title, company/organizer, location, and the precise apply link.` } 
            })
        });
        
        const data = await response.json();
        const items = Object.values(data.data?.extract || {}).find(v => Array.isArray(v)) || [];
        
        return items.map((v, i) => {
            // Ensure the link is absolute
            let applyLink = v.link || searchUrl;
            if (applyLink.startsWith('/')) {
                const urlObj = new URL(searchUrl);
                applyLink = `${urlObj.protocol}//${urlObj.hostname}${applyLink}`;
            }

            return {
                id: `${platform}-${i}-${Date.now()}`,
                title: v.title || `${query} Role`,
                companyOrOrganizer: v.company || v.organizer || platform.toUpperCase(),
                type: type, // JOB, INTERNSHIP, HACKATHON, EVENT
                location: normaliseLocation(v.location || 'India'),
                applyLink: applyLink,
                analysis: `Live opportunity extracted precisely from ${platform} via Firecrawl AI.`,
                matchScore: Math.floor(80 + Math.random() * 15),
                platform: platform
            };
        });
    } catch (err) {
        console.error(`[Firecrawl] Failed to scrape ${platform}:`, err.message);
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
        const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || '';

        console.log(`[Fetch] Live Search processing for: "${q}"`);

        // We use Promise.allSettled to parallelize scraping so Vercel doesn't hit 10s timeout immediately
        // We select the best platforms across all categories for real-time scraping
        const results = await Promise.allSettled([
            fetchJSearch(q, RAPIDAPI_KEY),
            fetchActiveJobsDB(q, RAPIDAPI_KEY),
            scrapeLivePlatform('internshala', q, 'INTERNSHIP', FIRECRAWL_API_KEY),
            scrapeLivePlatform('unstop', q, 'HACKATHON', FIRECRAWL_API_KEY),
            scrapeLivePlatform('devfolio', q, 'HACKATHON', FIRECRAWL_API_KEY),
            scrapeLivePlatform('nptel', q, 'COURSE', FIRECRAWL_API_KEY)
        ]);

        let extractedLinks = [];
        for (const res of results) {
            if (res.status === 'fulfilled' && res.value) {
                extractedLinks.push(...res.value);
            }
        }

        // We only return LIVE data, no fillers! If they want 5 each, we did our best via live APIs.
        let finalOpportunities = deduplicate(extractedLinks);

        // Sort by Match Score
        finalOpportunities.sort((a, b) => b.matchScore - a.matchScore);

        res.status(200).json({ success: true, opportunities: finalOpportunities });
    } catch (err) {
        console.error('[Fetch] Error fetching opportunities:', err.message);
        res.status(500).json({ error: err.message });
    }
}
