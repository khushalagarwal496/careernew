import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Sparkles,
  Briefcase,
  Target,
  BarChart,
  Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/hooks/useSupabase';


interface ATSResult {
  overallScore: number;
  jobFitAnalysis?: string;
  fitVerdict?: string;
  sections: {
    name: string;
    score: number;
    status: 'good' | 'warning' | 'error';
    feedback: string;
  }[];
  keywords: {
    found: string[];
    missing: string[];
  };
  improvements: string[];
  strengths: string[];
}

export const ATSAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const { toast } = useToast();
  const { saveResult, getCurrentUser } = useSupabase();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) setUserId(user.id);
    });
  }, [getCurrentUser]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      await processFile(droppedFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setIsExtracting(true);

    try {
      const { extractTextFromPDF } = await import('@/utils/pdfExtractor');
      const text = await extractTextFromPDF(selectedFile);
      setResumeText(text);
      toast({
        title: "Resume Loaded",
        description: `Extracted ${text.length} characters from your resume.`,
      });
    } catch (error) {
      console.error('PDF extraction error:', error);
      toast({
        title: "Extraction Error",
        description: "Could not extract text from PDF. Try a different file.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const analyzeResume = async () => {
    if (!resumeText) {
      toast({
        title: "No Resume",
        description: "Please upload a resume first.",
        variant: "destructive",
      });
      return;
    }

    const mode = jobDescription.trim() ? 'job-specific' : 'general';

    setIsAnalyzing(true);
    try {
      console.log('[ATSAnalyzer] Calling local proxy for analysis...');
      const response = await fetch('http://localhost:54321/functions/v1/ats-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription.trim() || undefined,
          mode
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze');

      if (data.success) {
        setResult(data.analysis);
        toast({
          title: "Analysis Complete!",
          description: `Your resume scored ${data.analysis.overallScore}% ${mode === 'job-specific' ? 'for this job' : 'ATS compatibility'}.`,
        });

        // Save result if user is logged in
        if (userId) {
          await saveResult(userId, {
            file_name: file?.name || 'resume.pdf',
            skills: data.analysis.keywords?.found || [],
            experience_level: mode,
            domain: 'General',
            opportunities: [], // Optional
          });
        }
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('ATS Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getFitVerdictBadge = (verdict: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      'STRONG_MATCH': { color: 'bg-green-500', label: '✓ Strong Match' },
      'MATCH': { color: 'bg-blue-500', label: '◉ Good Match' },
      'STRETCH': { color: 'bg-yellow-500', label: '⚡ Stretch Role' },
      'NOT_RECOMMENDED': { color: 'bg-red-500', label: '✗ Not Recommended' },
    };
    const v = variants[verdict] || variants['STRETCH'];
    return <Badge className={`${v.color} text-white`}>{v.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* 1. Analysis Dashboard Header */}
      <div className="bg-navy pt-8 pb-12 px-[5%] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-orange-500 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-primary/20">
            <Target className="w-3.5 h-3.5" />
            Precision Analysis
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter">
            ATS Resume <span className="text-primary">Analyzer</span>
          </h1>
          <p className="text-slate-400 text-base font-medium max-w-xl">
            Get past the automated filters. Match your resume against any job description with AI-powered precision.
          </p>
        </div>
      </div>

      {/* 2. Educational Content & Optimization Tips */}
      <section className="py-12 bg-blue-50/30 border-t border-blue-100/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Column: How it Works */}
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  <BarChart className="w-3.5 h-3.5" />
                  Inside the Tech
                </div>
                <h2 className="text-3xl font-black text-navy mb-4 tracking-tighter">How an ATS Resume <span className="text-primary">Analyzer Works</span></h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  ATS resume analyzers scan, parse, and score resumes against job descriptions by detecting formatting issues, extracting keywords, and measuring structure, using AI to simulate how hiring software evaluates candidates. They check for 98% Fortune 500 compatibility, focusing on key skills and, ideally, a score {">"}80% to pass.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    title: "Parsing",
                    icon: FileText,
                    desc: "The AI breaks down your resume, converting PDF or DOCX files into raw text to identify content, regardless of formatting."
                  },
                  {
                    title: "Keyword Extraction",
                    icon: Search,
                    desc: "The tool identifies job-specific keywords, skills, and titles, comparing them against the target job description."
                  },
                  {
                    title: "Formatting Analysis",
                    icon: Target,
                    desc: "The software detects complex elements (tables, columns, graphics, text boxes) that might confuse the parser."
                  },
                  {
                    title: "Scoring & Reporting",
                    icon: BarChart,
                    desc: "The analyzer provides a compatibility score and actionable feedback, highlighting missing keywords and structural improvements."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-navy text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Optimization Tips */}
            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-700">
              <div className="bg-navy rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="w-32 h-32" />
                </div>

                <div className="relative z-10">
                  <h2 className="text-3xl font-black mb-6 tracking-tighter">Pro <span className="text-primary">Optimization</span> Tips</h2>

                  <div className="space-y-6">
                    {[
                      {
                        title: "Use Simple Formats",
                        desc: "Avoid tables, graphics, images, and columns, as they can break parsing. Maintain a clean, linear structure."
                      },
                      {
                        title: "Include Specific Keywords",
                        desc: "Mirror the exact keywords found in the job description, including skills, job titles, and specialized tools."
                      },
                      {
                        title: "Standard Headings",
                        desc: "Use standard headings like 'Work Experience', 'Skills', and 'Education' for better system categorization."
                      },
                      {
                        title: "Fortune 500 Ready",
                        desc: "Our AI checks for 98% Fortune 500 compatibility. Aim for a score >80% to maximize your interview chances."
                      }
                    ].map((tip, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-black text-sm mb-1">{tip.title}</h3>
                          <p className="text-slate-400 text-xs font-medium leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                    <p className="text-sm font-bold text-slate-300 italic">
                      "Over 75% of resumes are rejected by ATS. Follow these steps to join the top 25%."
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Feature Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 text-center">
                  <p className="text-2xl font-black text-primary mb-1">98%</p>
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Compatibility</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center">
                  <p className="text-2xl font-black text-emerald-600 mb-1">80%+</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Target Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Analysis Dashboard (Now at bottom) */}
      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 space-y-10">
        {/* Tool Heading */}
        <div className="text-center lg:text-left space-y-2">
          <h2 className="text-3xl font-black text-navy tracking-tighter">
            Start Your <span className="text-primary">Analysis</span>
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Choose your mode and upload your resume to get instant AI feedback.
          </p>
        </div>

        {/* Profile Stats Bar (Visible after analysis) */}
        {!isAnalyzing && result && (
          <Card className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <BarChart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Overall ATS Score</p>
                <p className="text-2xl font-black text-navy">{result.overallScore}%</p>
              </div>
            </div>
            <Button variant="ghost" className="text-primary font-bold">
              View Details <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        )}

        {/* Tool Inputs Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* 1. Job Description (Optional) */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col h-full group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-navy text-sm">Target Job Specs (Optional)</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Paste JD for tailored matching</p>
              </div>
            </div>
            <Textarea
              placeholder="Paste the full job description here to see how well you match..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="flex-grow min-h-[160px] bg-slate-50 border-none rounded-2xl resize-none focus-visible:ring-primary/20 p-5 font-medium text-xs leading-relaxed"
            />
          </div>

          {/* 2. Resume Upload (Now on the Right) */}
          <div className="space-y-6">
            <div
              className={`bg-white rounded-3xl p-8 border-2 border-dashed transition-all cursor-pointer shadow-sm hover:shadow-xl group min-h-[220px] flex flex-col items-center justify-center text-center
                ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50'}
                ${file ? 'border-emerald-500/30 bg-emerald-50/10' : ''}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('ats-file-input')?.click()}
            >
              <input
                id="ats-file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {isExtracting ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="text-navy font-black text-xs uppercase tracking-[0.2em]">Processing PDF...</p>
                </div>
              ) : file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <FileText className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-black text-navy truncate max-w-[200px] mx-auto text-sm">{file.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                      {resumeText.length} Chars Found
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full text-[10px] font-bold h-8">
                    Change PDF
                  </Button>
                </div>
              ) : (
                <div className="py-2">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-sm group-hover:bg-primary/10 group-hover:text-primary">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-navy font-black text-lg mb-1 tracking-tight">Drop Resume Here</p>
                  <p className="text-slate-400 text-xs font-semibold">Only PDF files are supported</p>
                </div>
              )}
            </div>

            {/* Analyze Button */}
            {resumeText && (
              <Button
                onClick={analyzeResume}
                disabled={isAnalyzing}
                className="w-full h-14 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 gap-3 group"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    RUNNING AI SCAN...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    {jobDescription.trim() ? 'Analyze Job Match' : 'Run Full ATS Check'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Results Area */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-8 mt-4">
            {/* Main Score Board */}
            <div className="bg-white rounded-[2rem] p-1 shadow-2xl overflow-hidden border border-slate-100">
              <div className={`bg-gradient-to-br ${getScoreBg(result.overallScore)} p-6 text-white relative`}>
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Target className="w-32 h-32" />
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Final Assessment</h2>
                    <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                      <h3 className="text-2xl md:text-4xl font-black tracking-tighter">
                        {jobDescription.trim() ? 'Match Rating' : 'ATS Score'}
                      </h3>
                      {result.fitVerdict && getFitVerdictBadge(result.fitVerdict)}
                    </div>
                    {result.jobFitAnalysis && (
                      <p className="max-w-xl text-sm font-medium leading-relaxed opacity-90 italic">
                        "{result.jobFitAnalysis}"
                      </p>
                    )}
                  </div>
                  <div className="relative group">
                    <div className="bg-white/10 backdrop-blur-xl rounded-full p-8 border border-white/20 group-hover:scale-105 transition-transform duration-500">
                      <div className="text-5xl font-black tracking-tighter">{result.overallScore}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Section Progress */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-navy mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-navy">
                    <Target className="w-4 h-4" />
                  </div>
                  Critical Checks
                </h3>
                <div className="space-y-8">
                  {result.sections.map((section, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(section.status)}
                          <span className="font-bold text-navy">{section.name}</span>
                        </div>
                        <span className={`font-black ${getScoreColor(section.score)}`}>{section.score}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r transition-all duration-1000 ${getScoreBg(section.score)}`}
                          style={{ width: `${section.score}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-500 font-medium pl-8">{section.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords Cloud */}
              <div className="space-y-6">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black text-emerald-600 mb-6 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5" />
                    Optimized Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.found.map((kw, i) => (
                      <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-wider border border-emerald-100">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black text-rose-500 mb-6 flex items-center gap-3">
                    <XCircle className="w-5 h-5" />
                    Missing Opportunities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.missing.map((kw, i) => (
                      <span key={i} className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-xs font-black uppercase tracking-wider border border-rose-100">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Roadmap */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-navy mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  Competitive Strengths
                </h3>
                <ul className="space-y-4">
                  {result.strengths.map((item, i) => (
                    <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
                      <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 group-hover:text-navy transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-navy mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  Improvement Roadmap
                </h3>
                <ul className="space-y-4">
                  {result.improvements.map((item, i) => (
                    <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-orange-200 transition-colors">
                      <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Target className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 group-hover:text-navy transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSAnalyzer;
