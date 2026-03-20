import { X, Check, Sparkles, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumModalProps {
  onClose: () => void;
}

const features = [
  { icon: Zap, text: 'Unlimited resume scans' },
  { icon: Shield, text: 'Advanced scam detection' },
  { icon: Clock, text: 'Priority support' },
  { icon: Sparkles, text: 'Exclusive opportunities' },
];

export const PremiumModal = ({ onClose }: PremiumModalProps) => {
  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header with gradient */}
        <div className="gradient-primary p-8 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground mb-2">Go Premium</h2>
          <p className="text-primary-foreground/80">Unlock your full career potential</p>
        </div>

        {/* Pricing */}
        <div className="p-6 text-center border-b border-border">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-foreground">₹99</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Cancel anytime</p>
        </div>

        {/* Features */}
        <div className="p-6 space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-verified/10 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-verified" />
              </div>
              <span className="text-foreground">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="p-6 space-y-3">
          <Button className="w-full gradient-primary text-primary-foreground py-6 text-lg font-semibold">
            Upgrade Now
          </Button>
          <button 
            onClick={onClose}
            className="w-full text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
