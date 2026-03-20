import { ExternalLink, CheckCircle, AlertTriangle, MapPin, Calendar, Briefcase } from 'lucide-react';
import { Opportunity, OpportunityType } from '@/types';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/hooks/useSupabase';
import { useEffect, useState } from 'react';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const typeConfig: Record<string, { bgClass: string; textClass: string; borderClass: string; emoji: string }> = {
  // ... (keep existing typeConfig)
  [OpportunityType.INTERNSHIP]: {
    bgClass: 'bg-orange-50',
    textClass: 'text-primary',
    borderClass: 'border-orange-100',
    emoji: '🎓',
  },
  [OpportunityType.HACKATHON]: {
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-600',
    borderClass: 'border-emerald-100',
    emoji: '⚡',
  },
  [OpportunityType.EVENT]: {
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-600',
    borderClass: 'border-blue-100',
    emoji: '🎯',
  },
  [OpportunityType.JOB]: {
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-600',
    borderClass: 'border-indigo-100',
    emoji: '💼',
  },
  [OpportunityType.LEARNING]: {
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-600',
    borderClass: 'border-amber-100',
    emoji: '📚',
  },
};

export const OpportunityCard = ({ opportunity }: OpportunityCardProps) => {
  const { trackApplication, getCurrentUser } = useSupabase();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) setUserId(user.id);
    });
  }, [getCurrentUser]);

  const handleApply = async () => {
    window.open(opportunity.applyLink, '_blank');
    if (userId) {
      await trackApplication(userId, opportunity);
    }
  };

  const config = typeConfig[opportunity.type] ?? typeConfig[OpportunityType.JOB];
  const matchColor =
    opportunity.matchScore >= 80
      ? 'text-emerald-600'
      : opportunity.matchScore >= 60
      ? 'text-amber-600'
      : 'text-rose-600';

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 animate-fade-in group relative overflow-hidden flex flex-col">
      {/* Decorative background blob */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 ${config.bgClass} opacity-20 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500`}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-lg ${config.bgClass} ${config.textClass} border ${config.borderClass}`}
          >
            {config.emoji} {opportunity.type}
          </span>

          {opportunity.isFakeOfferLikely ? (
            <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-lg inline-flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-3 h-3" /> Suspicious
            </span>
          ) : opportunity.isVerified ? (
            <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-lg inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          ) : null}
        </div>
      </div>

      {/* Title & Company */}
      <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
        {opportunity.title}
      </h3>
      <div className="flex items-center gap-2 text-slate-500 text-sm mb-4 flex-wrap font-bold">
        <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="text-slate-700">{opportunity.companyOrOrganizer}</span>
        {opportunity.location && (
          <>
            <span className="opacity-30">•</span>
            <span className="inline-flex items-center gap-1 opacity-80">
              <MapPin className="w-3.5 h-3.5" />
              {opportunity.location}
            </span>
          </>
        )}
      </div>

      {/* Match Score */}
      <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100/50">
        <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest">
          <span className="text-slate-400">Match Score</span>
          <span className={matchColor}>{opportunity.matchScore}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              opportunity.matchScore >= 80
                ? 'bg-emerald-500'
                : opportunity.matchScore >= 60
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${opportunity.matchScore}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 mb-5 line-clamp-2 leading-relaxed font-medium flex-1">
        {opportunity.analysis}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {opportunity.deadline ? (
              <>Deadline: <span className="text-rose-500">{opportunity.deadline}</span></>
            ) : (
              'Open — Apply Soon'
            )}
          </span>
        </div>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary-hover text-white rounded-xl px-5 font-bold shadow-md hover:shadow-lg transition-all flex-shrink-0"
          onClick={handleApply}
          disabled={!opportunity.applyLink || opportunity.applyLink === '#'}
        >
          Apply Now
          <ExternalLink className="w-3.5 h-3.5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
