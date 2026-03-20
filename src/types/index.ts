export enum OpportunityType {
  INTERNSHIP = 'INTERNSHIP',
  HACKATHON = 'HACKATHON',
  EVENT = 'EVENT',
  JOB = 'JOB',
  LEARNING = 'LEARNING',
}

export interface Opportunity {
  id: string;
  title: string;
  companyOrOrganizer: string;
  type: OpportunityType;
  location: string;
  matchScore: number;
  description?: string;
  isVerified: boolean;
  isFakeOfferLikely: boolean;
  estReplyTime: string;
  applyLink: string;
  deadline?: string | null;
  analysis: string;
  platform?: string;
}

export type ViewState = 'HERO' | 'UPLOAD' | 'LOADING' | 'DASHBOARD' | 'RESUME_BUILDER' | 'ATS_ANALYZER' | 'CODE_COMPILER';

export enum ModalType {
  NONE = 'NONE',
  ABOUT = 'ABOUT',
  PREMIUM = 'PREMIUM',
  HISTORY = 'HISTORY',
}

export interface SavedAnalysis {
  id: string;
  file_name: string;
  skills: string[];
  experience_level: string;
  domain: string;
  opportunities: Opportunity[];
  created_at: string;
}

export interface AppliedOpportunity {
  id: string;
  opportunity_id: string;
  opportunity_title: string;
  company: string;
  opportunity_type: string;
  apply_link?: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted';
  notes?: string;
  applied_at: string;
}
