import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_API_KEY = "fc-22a09b6412ab476bb9822bf1964f8eac";

interface ScrapedOpportunity {
    title: string;
    company: string;
    location: string;
    stipend?: string;
    link: string;
    description?: string;
}

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const json = (data: unknown, status = 200) =>
        new Response(JSON.stringify(data), {
            status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    try {
        const { query } = await req.json();

        console.log(`Searching opportunities for: ${query || "Latest/Trending"}`);

        const opportunities: any[] = [];

        // 1. Internshala Extraction (Internships & Jobs)
        try {
            const searches = [
                { type: "Internship", baseUrl: "https://internshala.com/internships/", keywordUrl: (q: string) => `https://internshala.com/internships/keywords-${q}/` },
                { type: "Job", baseUrl: "https://internshala.com/jobs/", keywordUrl: (q: string) => `https://internshala.com/jobs/keywords-${q}/` }
            ];

            const promises = searches.map(async (searchConfig) => {
                let url = searchConfig.baseUrl;
                if (query) {
                    const formattedQuery = query.toLowerCase().replace(/\s+/g, '-');
                    url = searchConfig.keywordUrl(formattedQuery);
                }

                console.log(`Extracting ${searchConfig.type}s from: ${url}`);

                try {
                    const scrapeResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${FIRECRAWL_API_KEY}`
                        },
                        body: JSON.stringify({
                            url: url,
                            formats: ["extract"],
                            extract: {
                                prompt: `Extract a list of ${searchConfig.type.toLowerCase()}s with title, company, location, stipend, and link.`
                            }
                        })
                    });

                    const scrapeData = await scrapeResp.json();
                    if (scrapeData.success) {
                        const data = scrapeData.data?.extract;
                        if (!data) return;

                        // Find any array in the extracted data
                        const list = Object.values(data).find(val => Array.isArray(val)) as any[];

                        if (list) {
                            list.forEach((item: ScrapedOpportunity, index: number) => {
                                opportunities.push({
                                    id: `${searchConfig.type.toLowerCase()}-${index}-${Date.now()}`,
                                    title: item.title,
                                    companyOrOrganizer: item.company,
                                    type: searchConfig.type,
                                    location: item.location || "Remote",
                                    matchScore: Math.floor(Math.random() * 30) + 70,
                                    isVerified: true,
                                    isFakeOfferLikely: false,
                                    analysis: `Stipend/Salary: ${item.stipend || "Not specified"}.`,
                                    estReplyTime: "1-2 weeks",
                                    applyLink: item.link
                                });
                            });
                        }
                    }
                } catch (innerErr) {
                    console.error(`Failed to scrape ${searchConfig.type}s:`, innerErr);
                }
            });

            await Promise.all(promises);

        } catch (err) {
            console.error("Internshala extraction failed:", err);
        }

        // 2. General Search (Fallback & Breadth) - Only if query is provided
        if (query) {
            try {
                console.log("Performing general search...");
                const searchResp = await fetch("https://api.firecrawl.dev/v1/search", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`
                    },
                    body: JSON.stringify({
                        query: `${query} opportunities internshala naukri unstop linkedin`,
                        limit: 8
                    })
                });

                const searchData = await searchResp.json();

                if (searchData.success && searchData.data) {
                    searchData.data.forEach((item: any, index: number) => {
                        // Avoid duplicates if possible (simple check)
                        if (opportunities.some(op => op.applyLink === item.url)) return;

                        // Simple heuristic to guess details
                        let type = "Job";
                        if (item.title.toLowerCase().includes("intern")) type = "Internship";
                        if (item.title.toLowerCase().includes("hackathon")) type = "Hackathon";

                        opportunities.push({
                            id: `search-${index}-${Date.now()}`,
                            title: item.title,
                            companyOrOrganizer: "External Source", // Difficult to parse reliably
                            type: type,
                            location: "Unknown",
                            matchScore: Math.floor(Math.random() * 40) + 50, // Mock score 50-90
                            isVerified: false,
                            isFakeOfferLikely: false,
                            analysis: item.description || "Found via search.",
                            estReplyTime: "Unknown",
                            applyLink: item.url
                        });
                    });
                }

            } catch (err) {
                console.error("Search failed:", err);
            }
        }

        console.log(`Found ${opportunities.length} total opportunities`);
        return json({ success: true, opportunities });

    } catch (error) {
        console.error("Error in fetch-opportunities:", error);
        return json({ success: false, error: "Internal server error" }, 500);
    }
});
