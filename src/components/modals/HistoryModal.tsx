import { useEffect, useState } from 'react';
import { X, FileText, Calendar, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SavedAnalysis, Opportunity } from '@/types';

interface HistoryModalProps {
  onClose: () => void;
  onLoadAnalysis: (opportunities: Opportunity[]) => void;
}

export const HistoryModal = ({ onClose, onLoadAnalysis }: HistoryModalProps) => {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data with proper type casting
      const transformedData: SavedAnalysis[] = (data || []).map((item: any) => ({
        id: item.id,
        file_name: item.file_name,
        skills: item.skills || [],
        experience_level: item.experience_level || '',
        domain: item.domain || '',
        opportunities: Array.isArray(item.opportunities) ? item.opportunities : [],
        created_at: item.created_at,
      }));

      setAnalyses(transformedData);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnalyses(analyses.filter(a => a.id !== id));
      toast({
        title: "Deleted",
        description: "Analysis removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete analysis.",
        variant: "destructive",
      });
    }
  };

  const handleLoad = (analysis: SavedAnalysis) => {
    onLoadAnalysis(analysis.opportunities);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-2xl shadow-elegant max-w-2xl w-full max-h-[80vh] overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">My Saved Analyses</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No saved analyses yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Upload your resume to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div 
                  key={analysis.id}
                  className="bg-muted/50 rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">{analysis.file_name}</h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(analysis.created_at)}
                        </span>
                        <span>{analysis.opportunities.length} opportunities</span>
                      </div>

                      {analysis.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {analysis.skills.slice(0, 5).map((skill, idx) => (
                            <span 
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {analysis.skills.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{analysis.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(analysis.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleLoad(analysis)}
                        className="gap-1"
                      >
                        View
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
