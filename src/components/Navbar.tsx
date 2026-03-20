import { Compass, Menu, X, LogIn, LogOut, User, History, FileText, Search, Code, Briefcase, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ViewState, ModalType } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  onNavigate: (view: ViewState) => void;
  onOpenModal: (modal: ModalType) => void;
}

export const Navbar = ({ onNavigate, onOpenModal }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    onNavigate('HERO');
  };

  return (
    <nav className="bg-background/95 backdrop-blur-md px-[5%] py-3 flex justify-between items-center shadow-sm sticky top-0 z-50 print:hidden border-b border-blue-100">
      <div
        className="text-xl font-black text-foreground flex items-center gap-2 cursor-pointer"
        onClick={() => onNavigate('HERO')}
      >
        <div className="w-8 h-8 bg-navy text-primary rounded-lg flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <Compass className="w-5 h-5" />
        </div>
        <span className="hidden sm:inline tracking-tighter">Career<span className="text-primary">Compass</span></span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-6 items-center">
        <button
          onClick={() => onNavigate('HERO')}
          className="text-slate-600 font-bold hover:text-primary transition-colors cursor-pointer text-sm uppercase tracking-wider"
        >
          Home
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-slate-600 font-bold hover:text-primary transition-colors flex items-center gap-1 cursor-pointer text-sm uppercase tracking-wider">
              Explore Tools <ChevronDown className="w-4 h-4 ml-0.5 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 mt-4 rounded-xl p-2 border-slate-100 shadow-2xl animate-scale-in">
            <DropdownMenuItem onClick={() => navigate('/opportunities')} className="cursor-pointer py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mr-3 text-primary">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">Find Jobs</span>
                <span className="text-xs text-muted-foreground">Browse opportunities</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/resume-builder')} className="cursor-pointer py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mr-3 text-primary">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[13px] text-foreground">Resume Builder</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">Create ATS resumes</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/ats-analyzer')} className="cursor-pointer py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mr-3 text-primary">
                <Search className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[13px] text-foreground">ATS Analyzer</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">Score your resume</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onNavigate('CODE_COMPILER')} className="cursor-pointer py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mr-3 text-primary">
                <Code className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[13px] text-foreground">Code Compiler</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">Live IDE & analysis</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => onOpenModal(ModalType.ABOUT)}
          className="text-slate-600 font-bold hover:text-primary transition-colors cursor-pointer text-sm uppercase tracking-wider"
        >
          About
        </button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 border-slate-200 rounded-xl font-bold">
                <User className="w-4 h-4 text-primary" />
                <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 mt-2">
              <DropdownMenuItem onClick={() => onOpenModal(ModalType.HISTORY)} className="rounded-xl py-2">
                <History className="w-4 h-4 mr-2 text-primary" />
                My Analyses
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem onClick={() => onOpenModal(ModalType.PREMIUM)} className="rounded-xl py-2 font-bold text-primary">
                Go Premium
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive rounded-xl py-2">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="font-bold text-slate-600 hover:text-primary transition-colors"
            >
              Login
            </Button>
            <Button
              onClick={() => onOpenModal(ModalType.PREMIUM)}
              className="bg-primary hover:bg-primary-hover text-white rounded-xl px-6 font-bold shadow-md hover:shadow-lg transition-all"
            >
              Post a Job
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-foreground p-2"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg md:hidden animate-fade-in">
          <div className="flex flex-col p-4 gap-3">
            <button
              onClick={() => { onNavigate('HERO'); setIsMobileMenuOpen(false); }}
              className="text-foreground/70 font-medium hover:text-primary transition-colors py-2 text-left"
            >
              Home
            </button>
            <button
              onClick={() => { navigate('/opportunities'); setIsMobileMenuOpen(false); }}
              className="text-foreground/70 font-medium hover:text-primary transition-colors py-2 text-left flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Find Jobs
            </button>
            <button
              onClick={() => { navigate('/resume-builder'); setIsMobileMenuOpen(false); }}
              className="text-foreground/70 font-medium hover:text-primary transition-colors py-2 text-left flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Resume Builder
            </button>
            <button
              onClick={() => { navigate('/ats-analyzer'); setIsMobileMenuOpen(false); }}
              className="text-foreground/70 font-medium hover:text-primary transition-colors py-2 text-left flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              ATS Analyzer
            </button>
            <button
              onClick={() => { onNavigate('CODE_COMPILER'); setIsMobileMenuOpen(false); }}
              className="text-foreground/70 font-medium hover:text-primary transition-colors py-2 text-left flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              Code Compiler
            </button>
            <button
              onClick={() => { onOpenModal(ModalType.ABOUT); setIsMobileMenuOpen(false); }}
              className="text-foreground/70 font-medium hover:text-primary transition-colors py-2 text-left"
            >
              About
            </button>

            {user ? (
              <>
                <button
                  onClick={() => { onOpenModal(ModalType.HISTORY); setIsMobileMenuOpen(false); }}
                  className="text-foreground/70 font-medium hover:text-primary transition-colors py-2 text-left flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  My Analyses
                </button>
                <Button
                  variant="outline"
                  onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                  className="w-full gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}
                className="w-full gap-2"
              >
                <LogIn className="w-4 h-4" />
                Login / Sign Up
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => { onOpenModal(ModalType.PREMIUM); setIsMobileMenuOpen(false); }}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full"
            >
              Go Premium
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
