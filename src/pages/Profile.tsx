import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  PieChart, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Settings, 
  CheckCircle2, 
  Clock, 
  Target, 
  ArrowLeft,
  Loader2,
  Trash2,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, analyses, applications, isLoading, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleUpdateProfile = async () => {
    const success = await updateProfile({ full_name: fullName });
    if (success) setIsEditing(false);
  };

  // Derived data
  const totalAnalyses = analyses.length;
  const totalApplications = applications.length;
  const allSkills = Array.from(new Set(analyses.flatMap(a => a.skills || [])));
  const avgMatchScore = analyses.length > 0 
    ? Math.round(analyses.reduce((acc, curr) => acc + (curr.opportunities?.[0]?.matchScore || 0), 0) / analyses.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-primary/30">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white hover:bg-white/5 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="border-white/10 bg-white/5 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Basic Info & Stats */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl shadow-elegant">
              <div className="flex flex-col items-center text-center">
                <div className="relative group mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1 shadow-glow animate-pulse-slow">
                    <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-black text-white">{fullName[0] || user.email?.[0].toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <button className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-[#020617] group-hover:scale-110 transition-transform">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>

                {isEditing ? (
                  <div className="w-full space-y-4">
                    <div className="space-y-2 text-left">
                      <Label className="text-slate-400 text-xs font-bold uppercase tracking-wider">Full Name</Label>
                      <Input 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateProfile} className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-xl h-10 font-bold">Save</Button>
                      <Button onClick={() => setIsEditing(false)} variant="ghost" className="flex-1 text-slate-400 rounded-xl h-10">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-black text-white mb-1 tracking-tight">{fullName || 'Career Navigator'}</h2>
                    <p className="text-slate-400 text-sm font-medium mb-6 flex items-center gap-2">
                       <Mail className="w-4 h-4" /> {user.email}
                    </p>
                    <Button 
                      onClick={() => setIsEditing(true)}
                      variant="outline" 
                      className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold py-5"
                    >
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-left">Joined</p>
                    <p className="text-sm font-black text-white">{new Date(profile?.created_at || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-6 bg-white/5 border-white/10 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-white">{totalAnalyses}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Analyses</p>
                </div>
              </Card>

              <Card className="p-6 bg-white/5 border-white/10 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-white">{avgMatchScore}%</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Avg. Match Score</p>
                </div>
              </Card>

              <Card className="p-6 bg-white/5 border-white/10 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-white">{totalApplications}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Applications</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column: Skills & Portfolio */}
          <div className="lg:col-span-8 space-y-8">
            {/* Skills Portfolio */}
            <Card className="p-8 bg-white/5 border-white/10 rounded-3xl shadow-elegant">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <PieChart className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight text-left">Skills Portfolio</h3>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold">AI Extracted</Badge>
              </div>

              <div className="flex flex-wrap gap-3">
                {allSkills.length > 0 ? (
                  allSkills.map((skill, i) => (
                    <Badge 
                      key={i} 
                      className="px-4 py-2 bg-white/5 hover:bg-primary/20 text-slate-200 border-white/10 rounded-xl text-sm font-medium transition-all cursor-default"
                    >
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-sm py-4">Upload your first resume to see your skills cloud...</p>
                )}
              </div>
            </Card>

            {/* Application Tracker */}
            <Card className="p-8 bg-white/5 border-white/10 rounded-3xl shadow-elegant">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight text-left">Recent Career Activity</h3>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {analyses.map((analysis, i) => (
                    <div 
                      key={analysis.id} 
                      className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-white mb-0.5">{analysis.file_name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-2 font-medium">
                            <Clock className="w-3 h-3" /> {new Date(analysis.created_at).toLocaleDateString()} • {analysis.domain || 'General'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                         <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate('/')}
                          className="text-primary font-bold hover:bg-primary/10 rounded-lg text-xs"
                         >
                           View Scan
                         </Button>
                      </div>
                    </div>
                  ))}

                  {totalAnalyses === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 grayscale">
                        <Target className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-500 font-medium">No activity yet. Start your journey today!</p>
                      <Button 
                        onClick={() => navigate('/')}
                        className="mt-4 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-bold"
                      >
                        Upload Resume
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
