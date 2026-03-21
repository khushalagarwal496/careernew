import { supabase } from "@/integrations/supabase/client";
import { Opportunity, SavedAnalysis, AppliedOpportunity } from "@/types";

export const supabaseService = {
  // 1. Profiles
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  // 2. Saved Analyses
  async saveAnalysis(userId: string, analysis: Omit<SavedAnalysis, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('saved_analyses')
      .insert([
        {
          user_id: userId,
          file_name: analysis.file_name,
          skills: analysis.skills,
          experience_level: analysis.experience_level,
          domain: analysis.domain,
          opportunities: analysis.opportunities as any,
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getSavedAnalyses(userId: string) {
    const { data, error } = await supabase
      .from('saved_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as unknown as SavedAnalysis[];
  },

  // 3. Applied Opportunities
  async applyToOpportunity(userId: string, opp: Opportunity, notes?: string) {
    const { data, error } = await supabase
      .from('applied_opportunities')
      .insert([
        {
          user_id: userId,
          opportunity_id: opp.id,
          opportunity_title: opp.title,
          company: opp.companyOrOrganizer,
          opportunity_type: opp.type,
          apply_link: opp.applyLink,
          status: 'applied',
          notes: notes,
        }
      ])
      .select()
      .single();
    
    if (error && error.code !== '23505') throw error; // Ignore duplicate key errors (already applied)
    return data;
  },

  async getAppliedOpportunities(userId: string) {
    const { data, error } = await supabase
      .from('applied_opportunities')
      .select('*')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false });
    
    if (error) throw error;
    return data as any as AppliedOpportunity[];
  },

  async updateApplicationStatus(userId: string, opportunityId: string, status: string) {
    const { data, error } = await supabase
      .from('applied_opportunities')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId);
    
    if (error) throw error;
    return data;
  },

  async getGlobalOpportunities() {
    const { data, error } = await (supabase.from('global_opportunities' as any) as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data;
  }
};
