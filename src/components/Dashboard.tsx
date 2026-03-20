import { useState, useMemo } from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { Opportunity, OpportunityType } from '@/types';
import { OpportunityCard } from './OpportunityCard';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  opportunities: Opportunity[];
  onRefresh: () => void;
}

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Internships', value: 'INTERNSHIP' },
  { label: 'Hackathons', value: 'HACKATHON' },
  { label: 'Events', value: 'EVENT' },
  { label: 'Jobs', value: 'JOB' },
  { label: 'Learning', value: 'LEARNING' },
];

export const Dashboard = ({ opportunities, onRefresh }: DashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.companyOrOrganizer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = activeFilter === 'all' || opp.type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [opportunities, searchQuery, activeFilter]);

  const stats = useMemo(() => ({
    total: opportunities.length,
    highMatch: opportunities.filter(o => o.matchScore >= 80).length,
    verified: opportunities.filter(o => o.isVerified).length,
  }), [opportunities]);

  const handleExport = () => {
    const csvContent = [
      ['Title', 'Company', 'Type', 'Location', 'Match Score', 'Link'].join(','),
      ...filteredOpportunities.map(opp =>
        [opp.title, opp.companyOrOrganizer, opp.type, opp.location, opp.matchScore, opp.applyLink].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'opportunities.csv';
    a.click();
  };

  return (
    <section className="px-[5%] py-8 animate-fade-in min-h-[calc(100vh-73px)] bg-background">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50 shadow-sm text-center group hover:shadow-md transition-all duration-300">
          <p className="text-3xl font-black text-navy mb-1">{stats.total}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Matches</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50 shadow-sm text-center group hover:shadow-md transition-all duration-300">
          <p className="text-3xl font-black text-emerald-500 mb-1">{stats.highMatch}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High Match (80%+)</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50 shadow-sm text-center group hover:shadow-md transition-all duration-300">
          <p className="text-3xl font-black text-primary mb-1">{stats.verified}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Roles</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white/90 p-2 rounded-xl shadow-xl border border-blue-100/50 mb-8 flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center backdrop-blur-md">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 flex-grow">
          <div className="relative flex-grow max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border-none bg-slate-50 rounded-lg w-full outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-bold placeholder:text-slate-400 transition-all text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap p-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeFilter === option.value
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-transparent text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-1 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-slate-500 font-bold hover:text-primary rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      {filteredOpportunities.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity, index) => (
            <div key={opportunity.id} style={{ animationDelay: `${index * 0.1}s` }}>
              <OpportunityCard opportunity={opportunity} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No matches found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </section>
  );
};
