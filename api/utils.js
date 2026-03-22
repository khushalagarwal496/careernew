export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const URL_PATTERNS = {
    // 🎓 1. Internships & Fresher Jobs
    internshala: 'https://internshala.com/internships/{keyword}-internship', 
    wellfound: 'https://wellfound.com/jobs/{role}?location=India', 
    instahyre: 'https://instahyre.com/jobs/?keyword={keyword}', 
    hirist: 'https://www.hirist.tech/browse-all-jobs/?q={keyword}',
    naukri: 'https://www.naukri.com/{keyword}-jobs', 
    foundit: 'https://www.foundit.in/srp?query={keyword}',
    freshersworld: 'https://www.freshersworld.com/jobs/jobsearch/{keyword}-jobs',
    aicte: 'https://internship.aicte-india.org/internships.php',
    letsintern: 'https://letsintern.in/internships',
    yuvaintern: 'https://yuvaintern.com/internships',
    apna: 'https://apna.co/jobs?search={keyword}',
    internshipwala: 'https://www.internshipwala.com/internships',

    // 🏆 2. Hackathons & Competitions
    unstop: 'https://unstop.com/{type}', 
    devfolio: 'https://devfolio.co/hackathons?status=live', 
    hackerearth: 'https://www.hackerearth.com/challenges/', 
    hack2skill: 'https://hack2skill.com/hackathons',
    reskilll: 'https://reskilll.com/allhacks', 
    commudle: 'https://commudle.com/events', 

    // 🏢 3. Job Giants
    linkedin: 'https://www.linkedin.com/jobs/search/?keywords={keyword}&location=India', 
    indeed: 'https://in.indeed.com/jobs?q={keyword}&l=India', 
    glassdoor: 'https://www.glassdoor.co.in/Job/india-{keyword}-jobs',
    prosple: 'https://in.prosple.com/search-jobs?keyword={keyword}',
    stuintern: 'https://www.stuintern.com/internships', 

    // 📚 4. Learning/Upskilling (Courses URLs)
    nptel: 'https://nptel.ac.in/courses', 
    swayam: 'https://swayam.gov.in/explorer', 
    freecodecamp: 'https://www.freecodecamp.org/learn/', 
    youtube: 'https://www.youtube.com/results?search_query={keyword}+full+course', 
    coursera: 'https://www.coursera.org/search?query={keyword}&productDifficultyLevel=Beginner',
    udemy: 'https://www.udemy.com/courses/search/?q={keyword}&price=price-free',

    // 🎟️ 5. Events & Communities
    townscript: 'https://www.townscript.com/in/india/tech',
    eventbrite: 'https://www.eventbrite.com/d/india/tech-events/',
    almamater: 'https://almamater.io/events'
};

export function extractId(url, platform) {
    if (!url) return null;
    const patterns = {
        internshala: /internship-detail\/[^\/]+-(\d+)/, 
        naukri: /-[0-9]+$/, 
        wellfound: /jobs\/(\d+)-/, 
        hirist: /r\/(\d+)-/, 
        instahyre: /job\/(\d+)-/, 
        foundit: /-(\d+)\??/,
        apna: /-([a-zA-Z0-9]+)(?:\?|$)/,
        freshersworld: /-(\d+)$/,
        aicte: /opportunity\/([a-zA-Z0-9-]+)/, 
        letsintern: /internship\/([a-zA-Z0-9-]+)/,
        yuvaintern: /details\/([a-zA-Z0-9-]+)/,
        internshipwala: /internship\/([a-zA-Z0-9-]+)/,
        unstop: /competitions\/[^\/]+-([a-f0-9]{24})/, 
        devfolio: /hackathons\/([^\/]+)/, 
        hackerearth: /challenges\/[^\/]+\/([^\/]+)/, 
        hack2skill: /\/hack\/([^\/]+)/,
        reskilll: /\/hackathon\/([^\/]+)/,
        commudle: /events\/([a-zA-Z0-9-]+)/, 
        linkedin: /jobs\/view\/(\d+)/, 
        indeed: /jk=([a-zA-Z0-9]+)/, 
        glassdoor: /jl=([0-9]+)/, 
        prosple: /prosple\.com\/[^\/]+\/([^\/]+)/,
        stuintern: /internship\/([a-zA-Z0-9-]+)/,
        coursera: /\/learn\/([^\/?]+)/,             
        udemy: /\/course\/([^\/?]+)/,               
        youtube: /(?:v=|youtu\.be\/|list=)([\w-]+)/,
        nptel: /(noc\d+_[a-zA-Z0-9]+)/,             
        swayam: /swayam2\.ac\.in\/([^\/?]+)/,       
        freecodecamp: /learn\/[^\/]+\/([^\/?]+)/,
        townscript: /e\/([a-zA-Z0-9-]+)/,
        eventbrite: /tickets-([0-9]+)/,
        almamater: /event\/([a-zA-Z0-9-]+)/
    };
    
    // Exact Regex match
    if (patterns[platform]) {
        const match = url.match(patterns[platform]);
        if (match && match[1]) return match[1];
    }
    
    // Hash fallback
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

export async function callGemini(systemPrompt, userMessage, history = []) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');

    console.log(`[Gemini] Requesting analysis for: "${userMessage.slice(0, 40)}..."`);

    const contents = [];
    
    history.forEach(msg => {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += "\n" + msg.content;
        } else {
            contents.push({ role, parts: [{ text: msg.content }] });
        }
    });

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts[0].text += "\n" + userMessage;
    } else {
        contents.push({ role: 'user', parts: [{ text: userMessage }] });
    }

    const body = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: contents,
        generationConfig: { 
            temperature: 0.7, 
            maxOutputTokens: 8192,
        }
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (data.error) {
        throw new Error(`Gemini API Error: ${data.error.message}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error('No response generated by AI');
    }
    
    return text;
}

export function normaliseLocation(raw) {
    if (!raw) return 'Remote';
    const l = raw.toLowerCase();
    if (l.includes('remote')) return 'Remote';
    if (l.includes('hybrid')) return 'Hybrid';
    return raw.replace(/,?\s*(united states|usa|us|uk|india)/gi, '').trim() || raw;
}

export function normaliseType(raw) {
    if (!raw) return 'JOB';
    const l = raw.toLowerCase();
    if (l.includes('intern')) return 'INTERNSHIP';
    return 'JOB';
}

export function isFresherRelevant(title, description) {
    const keys = ['intern', 'fresher', 'graduate', 'entry level', 'junior', 'trainee'];
    const text = `${title} ${description}`.toLowerCase();
    return keys.some(k => text.includes(k));
}

export function deduplicate(list) {
    const seen = new Set();
    return list.filter(item => { 
        if (!item.applyLink || item.applyLink === '#' || seen.has(item.applyLink)) return false; 
        seen.add(item.applyLink); 
        return true; 
    });
}

export function getPlatformFromUrl(url) {
    for (const platform of Object.keys(URL_PATTERNS)) {
        if (url.toLowerCase().includes(platform)) return platform;
    }
    return 'Website';
}

export function getMockOpportunities(query = '') {
    const mocks = [
        { id: 'mock-1', title: 'React Developer Intern', companyOrOrganizer: 'TechGrowth India', type: 'INTERNSHIP', location: 'Remote', applyLink: 'https://internshala.com', analysis: 'Perfect for beginners with React & JS skills.', matchScore: 92, platform: 'Internshala' },
        { id: 'mock-2', title: 'Associate Software Engineer', companyOrOrganizer: 'Future Systems', type: 'JOB', location: 'Bangalore / Hybrid', applyLink: 'https://www.naukri.com/intern-jobs', analysis: 'Great entry-level role for CS graduates.', matchScore: 88, platform: 'Naukri' },
        { id: 'mock-3', title: 'Python Backend Trainee', companyOrOrganizer: 'DataFlow Inc', type: 'INTERNSHIP', location: 'Pune', applyLink: 'https://www.linkedin.com/jobs', analysis: 'Hands-on experience with Django/Flask.', matchScore: 85, platform: 'LinkedIn' },
        { id: 'mock-4', title: 'Frontend Developer (Fresher)', companyOrOrganizer: 'Pixel Perfect', type: 'JOB', location: 'Remote', applyLink: 'https://wellfound.com/jobs/frontend', analysis: 'Join a fast-growing startup team.', matchScore: 82, platform: 'Wellfound' },
        { id: 'mock-5', title: 'Java Developer Internship', companyOrOrganizer: 'Enterprise Solutions', type: 'INTERNSHIP', location: 'Hyderabad', applyLink: 'https://www.glassdoor.co.in/Job', analysis: 'Focus on Spring Boot and Microservices.', matchScore: 78, platform: 'Glassdoor' }
    ];
    
    if (!query) return mocks;
    
    const results = mocks.filter(m => 
        m.title.toLowerCase().includes(query.toLowerCase()) || 
        m.analysis.toLowerCase().includes(query.toLowerCase())
    );
    
    return results.length > 0 ? results : mocks;
}
