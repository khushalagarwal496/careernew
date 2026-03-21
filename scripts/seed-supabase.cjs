const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env
function loadEnv() {
    const env = {};
    try {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
            for (const line of lines) {
                const match = line.match(/^([^=]+)\s*=\s*"?([^"]+)"?/);
                if (match) env[match[1].trim()] = match[2].trim();
            }
        }
    } catch (_) {}
    return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const dummyData = [
    {
        id: 'mock-sih-2024',
        title: 'Smart India Hackathon 2024',
        company_or_organizer: 'Government of India',
        type: 'HACKATHON',
        location: 'Pan India',
        match_score: 95,
        is_verified: true,
        apply_link: 'https://sih.gov.in',
        platform: 'Gov',
        analysis: { focus: 'Innovation', difficulty: 'High' }
    },
    {
        id: 'mock-unstop-code',
        title: 'Google Girl Hackathon 2024',
        company_or_organizer: 'Google',
        type: 'HACKATHON',
        location: 'Online',
        match_score: 98,
        is_verified: true,
        apply_link: 'https://unstop.com',
        platform: 'Unstop',
        analysis: { focus: 'Algorithms', difficulty: 'Medium' }
    },
    {
        id: 'mock-devfolio-eth',
        title: 'ETHIndia 2024',
        company_or_organizer: 'Devfolio',
        type: 'HACKATHON',
        location: 'Bengaluru',
        match_score: 92,
        is_verified: true,
        apply_link: 'https://devfolio.co',
        platform: 'Devfolio',
        analysis: { focus: 'Web3', difficulty: 'Extreme' }
    },
    {
        id: 'mock-event-ms',
        title: 'Microsoft Azure Community Meetup',
        company_or_organizer: 'Microsoft',
        type: 'EVENT',
        location: 'Delhi NCR',
        match_score: 85,
        is_verified: true,
        apply_link: 'https://microsoft.com',
        platform: 'Direct',
        analysis: { focus: 'Cloud', difficulty: 'Low' }
    },
    {
        id: 'mock-hackerearth-hire',
        title: 'Amazon ML Challenge',
        company_or_organizer: 'Amazon',
        type: 'HACKATHON',
        location: 'Remote',
        match_score: 90,
        is_verified: true,
        apply_link: 'https://hackerearth.com',
        platform: 'HackerEarth',
        analysis: { focus: 'Machine Learning', difficulty: 'High' }
    }
];

async function seed() {
    console.log(`🚀 Seeding ${dummyData.length} items to Supabase...`);
    const { data, error } = await supabase
        .from('global_opportunities')
        .upsert(dummyData, { onConflict: 'id' });

    if (error) {
        console.error('❌ Seeding Failed:', error.message);
        if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
            console.log('💡 TIP: Ensure you added the SUPABASE_SERVICE_ROLE_KEY to .env OR disabled RLS for this table.');
        }
    } else {
        console.log('✅ Seeding Successful!');
    }
}

seed();
