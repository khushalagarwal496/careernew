import { X, Compass, Shield, Zap, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AboutModalProps {
  onClose: () => void;
}

const features = [
  {
    icon: Target,
    title: 'AI-Powered Matching',
    description: 'Our algorithm analyzes your resume to find the most relevant opportunities.'
  },
  {
    icon: Shield,
    title: 'Fake Offer Detection',
    description: 'We flag suspicious listings to protect you from scams.'
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description: 'New opportunities are added daily from trusted platforms.'
  }
];

const founders = [
  { name: 'Khushal Agarwal' },
  { name: 'Ganesh Agarwal' }
];

export const AboutModal = ({ onClose }: AboutModalProps) => {
  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">About Career Compass</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-muted-foreground">
            Career Compass is an AI-powered platform designed to help students and job seekers find the perfect opportunities. Upload your resume and let our intelligent system match you with internships, hackathons, events, and learning resources.
          </p>

          {/* Founders Section */}
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Founded By</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {founders.map((founder, index) => (
                <div key={index} className="bg-card rounded-lg p-3 text-center border border-border">
                  <p className="font-medium text-foreground">{founder.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-muted rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button onClick={onClose} className="w-full gradient-primary text-primary-foreground">
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
};
