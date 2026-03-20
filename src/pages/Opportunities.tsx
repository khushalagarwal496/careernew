
import { useState, useEffect } from 'react';
import { Search, Loader2, Briefcase, GraduationCap, LayoutGrid } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OpportunityCard } from '@/components/OpportunityCard';
import { Opportunity, OpportunityType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

type FilterTab = 'ALL' | 'INTERNSHIP' | 'JOB';

const filterTabs: { id: FilterTab; label: string; icon: ReactNode }[] = [
    { id: 'ALL', label: 'All', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'INTERNSHIP', label: 'Internships', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'JOB', label: 'Full-time Jobs', icon: <Briefcase className="w-4 h-4" /> },
];

const Opportunities = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSearch = async (searchQuery?: string) => {
        setLoading(true);
        setOpportunities([]);

        const q = searchQuery !== undefined ? searchQuery : query;

        try {
            console.log('[Opportunities] Fetching with query:', q || '(default fresher listings)');

            const response = await fetch('http://localhost:54321/functions/v1/fetch-opportunities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to fetch');

            if (data.success) {
                setOpportunities(data.opportunities || []);
                if ((data.opportunities || []).length === 0) {
                    toast({
                        title: "No opportunities found",
                        description: "Try a different keyword like 'data science' or 'marketing'.",
                    });
                }
            } else {
                throw new Error(data.error || 'Failed to fetch');
            }
        } catch (error: any) {
            console.error('[Opportunities] Error:', error);
            toast({
                title: "Error fetching opportunities",
                description: error.message || "Make sure the proxy server is running (node proxy-server.cjs).",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Load fresh listing on mount
    useEffect(() => {
        handleSearch('');
    }, []);

    // Client-side filter
    const displayed = opportunities.filter((opp) => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'INTERNSHIP') return opp.type === OpportunityType.INTERNSHIP || opp.type === 'INTERNSHIP' as any;
        if (activeFilter === 'JOB') return opp.type === OpportunityType.JOB || opp.type === 'JOB' as any;
        return true;
    });

    const internshipCount = opportunities.filter(o => o.type === OpportunityType.INTERNSHIP || (o.type as string) === 'INTERNSHIP').length;
    const jobCount = opportunities.filter(o => o.type === OpportunityType.JOB || (o.type as string) === 'JOB').length;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar
                onNavigate={() => navigate('/')}
                onOpenModal={() => { }}
            />
            <div className="pt-12 px-4 pb-20">
                <div className="max-w-6xl mx-auto space-y-10">

                    {/* Hero Header */}
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-2">
                            🔍 Live Job Feed
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-navy tracking-tighter">
                            Your Next <span className="text-primary">Opportunity</span> Awaits
                        </h1>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                            Curated internships & fresher jobs in Software, Data Science, Marketing, Design & more — updated hourly via live APIs.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-3xl mx-auto flex gap-3 p-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                placeholder="e.g. Data Science Intern, Marketing, Software Engineer..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="h-14 pl-12 text-lg border-none bg-slate-50 rounded-xl focus-visible:ring-primary/20 font-bold placeholder:text-slate-400"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button
                            onClick={() => handleSearch()}
                            disabled={loading}
                            className="h-14 px-10 text-lg bg-primary hover:bg-primary-hover text-white rounded-xl font-black shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Search'}
                        </Button>
                    </div>

                    {/* Filter Tabs */}
                    {!loading && opportunities.length > 0 && (
                        <div className="flex justify-center gap-3 flex-wrap">
                            {filterTabs.map((tab) => {
                                const count =
                                    tab.id === 'ALL'
                                        ? opportunities.length
                                        : tab.id === 'INTERNSHIP'
                                        ? internshipCount
                                        : jobCount;

                                const isActive = activeFilter === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveFilter(tab.id)}
                                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
                                            isActive
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary'
                                        }`}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-black ${
                                                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <div className="inline-block p-6 rounded-2xl bg-primary/10 mb-6 animate-bounce">
                                <Search className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-black text-navy mb-2">Fetching live opportunities…</h3>
                            <p className="text-slate-400 font-medium">Pulling fresh data from our job APIs. Hang tight!</p>
                        </div>
                    )}

                    {/* Results Grid */}
                    {!loading && displayed.length > 0 && (
                        <>
                            <p className="text-center text-slate-400 text-sm font-semibold">
                                Showing <span className="text-primary font-black">{displayed.length}</span> opportunities
                                {activeFilter !== 'ALL' && ` · ${filterTabs.find(t => t.id === activeFilter)?.label}`}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayed.map((opp) => (
                                    <OpportunityCard key={opp.id} opportunity={opp} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Empty State */}
                    {!loading && opportunities.length > 0 && displayed.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                            <p className="text-3xl mb-3">🔍</p>
                            <h3 className="text-xl font-black text-slate-700 mb-2">No {activeFilter.toLowerCase()}s found</h3>
                            <p className="text-slate-400 font-medium">Try switching to a different tab or search with a new keyword.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Opportunities;
