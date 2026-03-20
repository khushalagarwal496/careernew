import { useState, useEffect } from 'react';
import { Compass, Search, BookOpen, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  fileName: string;
}

const loadingSteps = [
  { icon: Search, text: 'Scanning Resume...', progress: 30 },
  { icon: Compass, text: 'Finding Hackathons & Events...', progress: 60 },
  { icon: BookOpen, text: 'Identifying Skill Gaps...', progress: 80 },
  { icon: Sparkles, text: 'Curating Opportunities...', progress: 95 },
];

export const LoadingScreen = ({ fileName }: LoadingScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    setProgress(loadingSteps[currentStep].progress);
  }, [currentStep]);

  const CurrentIcon = loadingSteps[currentStep].icon;

  return (
    <section className="bg-navy min-h-[calc(100vh-73px)] flex items-center justify-center px-[5%] py-12 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-primary/5 skew-x-12 transform -translate-x-1/2" />

      <div className="text-center max-w-sm mx-auto animate-fade-in relative z-10">
        {/* Animated Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-ping" />
          <div className="relative w-24 h-24 bg-primary/10 backdrop-blur-xl border border-primary/20 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
            <CurrentIcon className="w-12 h-12 text-primary animate-pulse" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-primary/10">
          <Sparkles className="w-3.5 h-3.5" />
          Neural Scanning
        </div>

        <h2 className="text-2xl font-black text-white mb-2 tracking-tighter">
          Analyzing Profile
        </h2>
        <p className="text-slate-400 font-bold text-xs mb-8 truncate opacity-80">
          {fileName}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 rounded-full h-3 mb-4 overflow-hidden border border-white/5 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Text */}
        <div className="h-6">
          <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">
            {loadingSteps[currentStep].text}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {loadingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-500 ${index === currentStep
                  ? 'w-6 bg-primary shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                  : index < currentStep
                    ? 'w-3 bg-primary/40'
                    : 'w-3 bg-white/5'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
