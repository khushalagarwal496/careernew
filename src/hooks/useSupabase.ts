import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { supabaseService } from "@/lib/supabase-service";
import { Opportunity, SavedAnalysis, AppliedOpportunity } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAction = useCallback(async (action: () => Promise<any>, successMsg?: string) => {
    setLoading(true);
    try {
      const result = await action();
      if (successMsg) {
        toast({
          title: "Success",
          description: successMsg,
        });
      }
      return result;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Auth helpers
  const getCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }, []);

  // Profile data
  const getProfile = useCallback(async (userId: string) => {
    return handleAction(() => supabaseService.getProfile(userId));
  }, [handleAction]);

  const updateProfile = useCallback(async (userId: string, updates: any) => {
    return handleAction(
      () => supabaseService.updateProfile(userId, updates),
      "Profile updated successfully"
    );
  }, [handleAction]);

  // Analysis data
  const saveResult = useCallback(async (userId: string, analysis: Omit<SavedAnalysis, 'id' | 'created_at'>) => {
    return handleAction(
      () => supabaseService.saveAnalysis(userId, analysis),
      "Analysis saved to your history"
    );
  }, [handleAction]);

  const getHistory = useCallback(async (userId: string) => {
    return handleAction(() => supabaseService.getSavedAnalyses(userId));
  }, [handleAction]);

  // Applications
  const trackApplication = useCallback(async (userId: string, opp: Opportunity, notes?: string) => {
    return handleAction(
      () => supabaseService.applyToOpportunity(userId, opp, notes),
      "Opportunity marked as applied"
    );
  }, [handleAction]);

  const getApplications = useCallback(async (userId: string) => {
    return handleAction(() => supabaseService.getAppliedOpportunities(userId));
  }, [handleAction]);

  const updateAppStatus = useCallback(async (userId: string, opportunityId: string, status: string) => {
    return handleAction(
      () => supabaseService.updateApplicationStatus(userId, opportunityId, status),
      "Application status updated"
    );
  }, [handleAction]);

  return {
    loading,
    getCurrentUser,
    getProfile,
    updateProfile,
    saveResult,
    getHistory,
    trackApplication,
    getApplications,
    updateAppStatus,
  };
};
