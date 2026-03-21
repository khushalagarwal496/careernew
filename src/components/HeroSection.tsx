import { ArrowRight, Briefcase, Code, GraduationCap, Star, Zap, Upload, Search, CheckCircle2, FileText, Check, ChevronDown, Palette, BarChart, CircleDollarSign, Megaphone, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({
  onGetStarted
}: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* 1. Original Hero Banner (Restored) */}
      <section className="gradient-hero min-h-[calc(100vh-73px)] px-[5%] py-12 flex items-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-10 items-center">
          {/* Left Content */}
          <div className="animate-fade-in z-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Career Matching
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-4 tracking-tight">
              Your Career<br />Journey,<br />
              <span className="text-primary">Simplified.</span>
            </h1>

            <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
              Don't let ATS reject you. Check your resume score, test your logic on our live compiler, and discover personalized opportunities tailored perfectly to your tech stack.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-4 text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 rounded-xl"
              >
                Upload Resume
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-6 py-4 text-base rounded-xl shadow-sm"
              >
                Explore Features
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-1 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm font-medium text-slate-400">
                <span className="text-white font-bold">4.9/5</span> from 10,000+ Students
              </p>
            </div>
          </div>

          {/* Right: Floating 3D Composition */}
          <div className="relative hidden lg:block h-full min-h-[500px]">
            {/* Background Gradient Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[100px] -z-10" />

            {/* Floating Cards */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              {/* Main Sketch Illustration (Compass) */}
              <div className="relative z-10 w-full flex items-center justify-center animate-float">
                <img 
                  src="/assets/sketches/compass-sketch.png" 
                  alt="Career Compass Illustration" 
                  className="w-full max-w-sm h-auto drop-shadow-2xl opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Main Card - Software Engineer */}
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/50 animate-float w-full max-w-md absolute -bottom-10 -left-10 z-20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Software Engineer Intern</h3>
                    <p className="text-sm text-muted-foreground">Google • Bangalore</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-500">94% Match</span>
                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-semibold">Verified ✓</span>
                </div>
              </div>

              {/* Top Right Card - HackMIT 2024 */}
              <div className="absolute top-0 -right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-white/60 animate-float-delayed z-20 max-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Code className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-sm leading-tight mb-0.5 tracking-tight">HackMIT 2024</h4>
                    <p className="text-xs text-slate-500 font-medium">88% Match</p>
                  </div>
                </div>
              </div>

              {/* Bottom Left Card - React Mastery */}
              <div className="absolute bottom-6 -left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-white/60 animate-float z-20 max-w-[200px]" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-sm mb-0.5 tracking-tight">React Mastery</h4>
                    <p className="text-xs text-slate-500 font-medium">91% Match</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 2. Stats Section (Moved up) */}
      <section className="bg-blue-50/80 py-8 px-[5%] border-b border-blue-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-4xl font-bold mb-2 text-foreground">10,000+</h3>
            <p className="text-muted-foreground">Students Helped</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-4xl font-bold mb-2 text-foreground">48h</h3>
            <p className="text-muted-foreground">Opportunity Refresh</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-4xl font-bold mb-2 text-foreground">94%</h3>
            <p className="text-muted-foreground">Match Accuracy</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-primary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-4xl font-bold mb-2 flex items-center justify-center gap-1 text-foreground">4.9<Star className="w-6 h-6 fill-primary text-primary pb-1" /></h3>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="py-12 px-[5%] bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-semibold mb-3">
              ▶ How It Works
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter">
              From Resume to Opportunity <span className="text-primary">in 4 Steps</span>
            </h2>
            <div className="flex justify-center mt-6">
              <img 
                src="/assets/sketches/meeting-sketch.png" 
                alt="Community Meeting" 
                className="w-64 h-auto opacity-70"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gray-200 z-0"></div>

            {[
              { num: '01', title: 'Upload Resume', desc: 'Drop your PDF or Word resume — we extract your skills, experience & domain automatically.' },
              { num: '02', title: 'AI Analysis', desc: 'Our AI matches your profile with live opportunities from Unstop, LinkedIn, Naukri & Internshala.' },
              { num: '03', title: 'Get Matched', desc: 'Browse personalized results with match scores, verified badges & direct apply links.' },
              { num: '04', title: 'Track & Apply', desc: 'Apply directly, track your applications, and refresh for the latest opportunities anytime.' }
            ].map((step, i) => (
              <div key={i} className="text-center relative z-10 group">
                <div className="w-20 h-20 mx-auto bg-white border-2 border-primary/20 text-primary rounded-full flex items-center justify-center text-2xl font-black mb-6 shadow-sm group-hover:border-primary group-hover:scale-110 transition-all duration-300">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="features-section" className="scroll-mt-24">
        {/* 3. Browse by Category Section (Inspired by JobHive) */}
        <section className="py-12 px-[5%] bg-blue-50/30 border-y border-blue-100">
          <div className="max-w-7xl mx-auto text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-navy mb-2 tracking-tighter">Browse by <span className="text-primary">Category</span></h2>
            <p className="text-slate-500 text-sm font-medium">Explore 10,000+ new opportunities from top platforms</p>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: Code, label: 'Technology', color: 'bg-orange-50 text-orange-600', count: '4k+' },
              { icon: Palette, label: 'Design', color: 'bg-blue-50 text-blue-600', count: '2k+' },
              { icon: BarChart, label: 'Marketing', color: 'bg-emerald-50 text-emerald-600', count: '3k+' },
              { icon: CircleDollarSign, label: 'Finance', color: 'bg-indigo-50 text-indigo-600', count: '1k+' },
              { icon: Megaphone, label: 'Sales', color: 'bg-rose-50 text-rose-600', count: '5k+' },
              { icon: HeartPulse, label: 'Health', color: 'bg-amber-50 text-amber-600', count: '1.2k+' },
            ].map((cat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer text-center group">
                <div className={`w-12 h-12 ${cat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-navy text-sm mb-1">{cat.label}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cat.count} Roles</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Tools Section Header */}
        <section className="pt-12 pb-8 px-[5%] flex flex-col items-center text-center bg-slate-50/50">
          <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight mb-3 max-w-4xl">
            Every Tool You Need to <span className="text-primary">Land Your Dream Role</span>
          </h2>
          <p className="text-base text-muted-foreground mb-3 max-w-2xl">
            Click any feature to open it directly. No sign-up required.
          </p>
        </section>

        {/* 5. Resume Analyzer Section */}
        <section className="py-12 px-[5%] bg-blue-50/50">
          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-semibold mb-4">
                🔥 Most Used
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-1">Resume Analyzer</h2>
              <p className="text-primary font-black mb-4 text-sm">AI-Powered Opportunity Matching</p>
              <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                Upload your resume once and let our AI do the heavy lifting. We scan
                your skills, experience, and domain to match you with matching
                opportunities in real-time.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Internships from LinkedIn & Internshala',
                  'Hackathons directly from Unstop',
                  'Jobs from Naukri & LinkedIn',
                  'Updated every 48 hours automatically'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" onClick={() => navigate('/ats-analyzer')} className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-lg w-full sm:w-auto">
                Analyze My Resume <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="relative">
              {/* Mockup Card */}
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  Verified ✓
                </div>
                <h3 className="text-xl font-bold mb-1">Software Engineer Intern</h3>
                <p className="text-muted-foreground text-sm mb-6">Google • Bangalore • 94% Match</p>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Skills Match</span>
                      <span className="text-primary font-medium">94%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Experience Fit</span>
                      <span className="text-primary font-medium">88%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Domain Relevance</span>
                      <span className="text-primary font-medium">91%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '91%' }}></div>
                    </div>
                  </div>
                </div>

                <button className="text-primary font-medium text-sm flex items-center gap-1 hover:underline" onClick={() => navigate('/ats-analyzer')}>
                  Open Resume Analyzer <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* 5. Resume Builder Section */}
        <section className="py-12 px-[5%] bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 group hover:shadow-2xl transition-all duration-500">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
                  <FileText className="w-8 h-8 text-primary" />
                </div>

                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-6">
                  Export Now ↓
                </div>

                <h3 className="text-2xl font-black mb-2 text-foreground">Resume Score: 92/100</h3>
                <p className="text-muted-foreground text-sm mb-8">ATS Compatible • PDF Ready</p>

                <div className="space-y-6 mb-8">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Skills Match</span>
                      <span className="text-primary font-bold">94%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Experience Fit</span>
                      <span className="text-primary font-bold">88%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>

                <button onClick={() => navigate('/resume-builder')} className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                  Open Resume Builder <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-6">
                ✨ New
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-2 text-foreground">Resume Builder</h2>
              <p className="text-primary font-black mb-4 text-base">ATS-Ready Resumes in Minutes</p>
              <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                No design skills needed. Craft a professional, ATS-optimized resume step by step.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Multiple professional templates',
                  'ATS keyword optimization built-in',
                  'One-click PDF export',
                  'Tailored for freshers & experienced both'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => navigate('/resume-builder')} variant="outline" size="sm" className="border-2 border-slate-200 hover:bg-slate-50 px-6 py-4 rounded-xl text-base w-full sm:w-auto text-foreground font-bold">
                Build My Resume <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* 6. ATS Analyzer Section */}
        <section className="py-12 px-[5%] bg-blue-50/30">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-semibold mb-4">
                📊 Data-Driven
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-2 text-foreground">ATS Analyzer</h2>
              <p className="text-primary font-black mb-4 text-base">Get Past the Bots</p>
              <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                Over 75% of resumes are rejected by ATS. Our analyzer tells you exactly what to fix.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Detailed ATS compatibility score',
                  'Missing keyword identification',
                  'Section-by-section feedback',
                  'Industry-specific suggestions'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => navigate('/ats-analyzer')} variant="outline" size="lg" className="border-2 border-slate-200 hover:bg-white px-8 py-6 rounded-xl text-lg w-full sm:w-auto text-foreground font-bold">
                Check ATS Score <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 group hover:shadow-2xl transition-all duration-500">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
                  <Search className="w-8 h-8 text-primary" />
                </div>

                <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-6">
                  View Report →
                </div>

                <h3 className="text-3xl font-black mb-2 text-foreground">ATS Score: 78/100</h3>
                <p className="text-muted-foreground text-sm mb-8">3 keywords missing • 2 sections to fix</p>

                <div className="space-y-6 mb-8">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Skills Match</span>
                      <span className="text-primary font-bold">94%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Experience Fit</span>
                      <span className="text-primary font-bold">88%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>

                <button onClick={() => navigate('/ats-analyzer')} className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                  Open ATS Analyzer <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div >
  );
};
