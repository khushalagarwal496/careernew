import { useState, useEffect } from 'react';
import { ViewState, ModalType, Opportunity, OpportunityType } from '@/types';
import { mockOpportunities } from '@/data/mockOpportunities';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { UploadSection } from '@/components/UploadSection';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Dashboard } from '@/components/Dashboard';
import { AboutModal } from '@/components/modals/AboutModal';
import { PremiumModal } from '@/components/modals/PremiumModal';
import { HistoryModal } from '@/components/modals/HistoryModal';
import StudyChatbot from '@/components/StudyChatbot';
import ResumeBuilder from '@/components/ResumeBuilder';
import ATSAnalyzer from '@/components/ATSAnalyzer';
import CodeCompiler from '@/components/CodeCompiler';
import StudentIDE from '@/components/ide/StudentIDE';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HERO');
  const [activeModal, setActiveModal] = useState<ModalType>(ModalType.NONE);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [currentAnalysisData, setCurrentAnalysisData] = useState<{
    skills: string[];
    experienceLevel: string;
    domain: string;
  } | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
  };

  const handleOpenModal = (modal: ModalType) => {
    setActiveModal(modal);
  };

  const handleCloseModal = () => {
    setActiveModal(ModalType.NONE);
  };

  const handleGetStarted = () => {
    setCurrentView('UPLOAD');
  };

  const handleLoadAnalysis = (loadedOpportunities: Opportunity[]) => {
    setOpportunities(loadedOpportunities);
    setCurrentView('DASHBOARD');
  };

  const saveAnalysis = async (
    fileName: string,
    skills: string[],
    experienceLevel: string,
    domain: string,
    opps: Opportunity[]
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_analyses')
        .insert({
          user_id: user.id,
          file_name: fileName,
          skills: skills,
          experience_level: experienceLevel,
          domain: domain,
          opportunities: opps as any,
        });

      if (error) throw error;

      toast({
        title: "Analysis Saved!",
        description: "Your resume analysis has been saved to your account.",
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  };

  const handleFileSelect = async (file: File) => {
    setUploadedFileName(file.name);
    setCurrentView('LOADING');

    try {
      // Extract text from PDF using pdfjs-dist
      const { extractTextFromPDF } = await import('@/utils/pdfExtractor');
      const resumeText = await extractTextFromPDF(file);

      if (resumeText.length < 100) {
        toast({
          title: "Invalid Resume",
          description: "Could not extract enough text from the PDF. Please try a different file.",
          variant: "destructive",
        });
        setCurrentView('UPLOAD');
        return;
      }

      // Call the AI analysis function with extracted text via Vercel Serverless Function
      console.log('[Index] Calling Vercel Serverless Function for resume analysis...');
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (!data.success) {
        if (!data.isResume) {
          toast({
            title: "Invalid Resume",
            description: data.reason || "Please upload a valid resume document.",
            variant: "destructive",
          });
          setCurrentView('UPLOAD');
          return;
        }
        throw new Error(data.error || 'Analysis failed');
      }

      // Use the new response format with opportunities directly
      const aiOpportunities: Opportunity[] = data.opportunities?.map(
        (opp: any) => ({
          id: opp.id,
          title: opp.title,
          companyOrOrganizer: opp.companyOrOrganizer,
          type: opp.type as OpportunityType,
          location: opp.location,
          matchScore: opp.matchScore,
          isVerified: opp.isVerified,
          isFakeOfferLikely: opp.isFakeOfferLikely,
          estReplyTime: opp.estReplyTime,
          applyLink: opp.applyLink,
          analysis: opp.analysis,
          platform: opp.platform,
        })
      ) || [];

      setOpportunities(aiOpportunities);
      setCurrentAnalysisData({
        skills: data.skills || [],
        experienceLevel: data.experienceLevel || '',
        domain: data.domain || '',
      });

      // Save analysis if user is logged in
      if (user) {
        await saveAnalysis(
          file.name,
          data.skills || [],
          data.experienceLevel || '',
          data.domain || '',
          aiOpportunities
        );
      }

      toast({
        title: "Resume Analyzed Successfully!",
        description: `Found ${aiOpportunities.length} opportunities matching your profile.`,
      });

      setCurrentView('DASHBOARD');

    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
      setCurrentView('UPLOAD');
    }
  };

  const handleRefresh = () => {
    setCurrentView('LOADING');
    setTimeout(() => {
      // Shuffle opportunities to simulate refresh
      setOpportunities([...opportunities].sort(() => Math.random() - 0.5));
      setCurrentView('DASHBOARD');
    }, 2000);
  };

  // Keyboard escape to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onNavigate={handleNavigate} onOpenModal={handleOpenModal} />

      <main className="flex-1">
        {currentView === 'HERO' && (
          <HeroSection
            onGetStarted={handleGetStarted}
          />
        )}

        {currentView === 'UPLOAD' && (
          <UploadSection onFileSelect={handleFileSelect} />
        )}

        {currentView === 'LOADING' && (
          <LoadingScreen fileName={uploadedFileName} />
        )}

        {currentView === 'DASHBOARD' && (
          <Dashboard
            opportunities={opportunities}
            onRefresh={handleRefresh}
          />
        )}

        {currentView === 'RESUME_BUILDER' && (
          <ResumeBuilder />
        )}

        {currentView === 'ATS_ANALYZER' && (
          <ATSAnalyzer />
        )}

        {currentView === 'CODE_COMPILER' && (
          <StudentIDE />
        )}
      </main>

      {/* Footer - show on HERO and other main views */}
      {(currentView === 'HERO' || currentView === 'RESUME_BUILDER' || currentView === 'ATS_ANALYZER' || currentView === 'CODE_COMPILER') && (
        <Footer />
      )}

      {/* Modals */}
      {activeModal === ModalType.ABOUT && (
        <AboutModal onClose={handleCloseModal} />
      )}

      {activeModal === ModalType.PREMIUM && (
        <PremiumModal onClose={handleCloseModal} />
      )}

      {activeModal === ModalType.HISTORY && (
        <HistoryModal
          onClose={handleCloseModal}
          onLoadAnalysis={handleLoadAnalysis}
        />
      )}

      {/* Study Chatbot */}
      <StudyChatbot />
    </div>
  );
};

export default Index;
