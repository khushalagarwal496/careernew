import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function ingestHackathons() {
    const filePath = path.join('.firecrawl', 'devpost_hackathons.json');
    if (!fs.existsSync(filePath)) return;

    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const hackathons = rawData.hackathons || [];

    for (const h of hackathons) {
        const { error } = await supabase
            .from('hackathons')
            .upsert({
                title: h.Hackathon_Name,
                themes: h.Theme_Tags,
                prize_pool: h.Prize_Pool,
                deadline: h.Submission_Deadline ? new Date(h.Submission_Deadline).toISOString() : null,
                apply_link: h.Registration_Link
            }, { onConflict: 'apply_link' });
        
        if (error) console.error(`Error inserting hackathon ${h.Hackathon_Name}:`, error.message);
        else console.log(`Inserted/Updated hackathon: ${h.Hackathon_Name}`);
    }
}

async function ingestCourses() {
    const filePath = path.join('.firecrawl', 'swayam_nptel_courses.json');
    if (!fs.existsSync(filePath)) return;

    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const courses = rawData.courses || [];

    for (const c of courses) {
        const { error } = await supabase
            .from('educational_opportunities')
            .upsert({
                title: c.Course_Name,
                provider: c.Course_Link.includes('nptel') ? 'NPTEL' : 'Swayam',
                institute: c.Institute_Name,
                duration: c.Duration,
                deadline: c.Enrollment_Deadline ? new Date(c.Enrollment_Deadline).toISOString() : null,
                apply_link: c.Course_Link,
                category: 'Course'
            }, { onConflict: 'apply_link' });
        
        if (error) console.error(`Error inserting course ${c.Course_Name}:`, error.message);
        else console.log(`Inserted/Updated course: ${c.Course_Name}`);
    }
}

async function main() {
    console.log('Starting data ingestion...');
    await ingestHackathons();
    await ingestCourses();
    console.log('Ingestion complete.');
}

main().catch(console.error);
