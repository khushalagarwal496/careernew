import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabaseService } from '@/lib/supabase-service';
import { SavedAnalysis, AppliedOpportunity } from '@/types';
import { useToast } from './use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [applications, setApplications] = useState<AppliedOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfileData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [profileData, analysesData, appsData] = await Promise.all([
        supabaseService.getProfile(user.id).catch(() => null),
        supabaseService.getSavedAnalyses(user.id).catch(() => []),
        supabaseService.getAppliedOpportunities(user.id).catch(() => []),
      ]);

      setProfile(profileData as UserProfile);
      setAnalyses(analysesData);
      setApplications(appsData);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch profile data'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      await supabaseService.updateProfile(user.id, updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Profile Updated",
        description: "Your information has been successfully saved.",
      });
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: "Update Failed",
        description: "Could not save your changes. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    profile,
    analyses,
    applications,
    isLoading,
    error,
    updateProfile,
    refresh: fetchProfileData
  };
};
