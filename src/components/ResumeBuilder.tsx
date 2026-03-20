import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  FileText,
  Plus,
  Trash2,
  Download,
  Linkedin,
  Github,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  grade: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  summary: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: string[];
}

const initialResumeData: ResumeData = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  summary: '',
  skills: [],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
};

export const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const addSkill = () => {
    if (newSkill.trim()) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now().toString(),
        degree: '',
        institution: '',
        year: '',
        grade: ''
      }]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now().toString(),
        title: '',
        company: '',
        duration: '',
        description: ''
      }]
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now().toString(),
        name: '',
        description: '',
        technologies: '',
        link: ''
      }]
    }));
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setResumeData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const generateResumeText = () => {
    let resume = '';

    // Header
    resume += `${resumeData.fullName.toUpperCase()}\n`;
    resume += `${resumeData.email} | ${resumeData.phone} | ${resumeData.location}\n`;
    if (resumeData.linkedin) resume += `LinkedIn: ${resumeData.linkedin}\n`;
    if (resumeData.github) resume += `GitHub: ${resumeData.github}\n`;
    resume += '\n';

    // Summary
    if (resumeData.summary) {
      resume += `PROFESSIONAL SUMMARY\n`;
      resume += `${'─'.repeat(50)}\n`;
      resume += `${resumeData.summary}\n\n`;
    }

    // Skills
    if (resumeData.skills.length > 0) {
      resume += `SKILLS\n`;
      resume += `${'─'.repeat(50)}\n`;
      resume += `${resumeData.skills.join(' • ')}\n\n`;
    }

    // Education
    if (resumeData.education.length > 0) {
      resume += `EDUCATION\n`;
      resume += `${'─'.repeat(50)}\n`;
      resumeData.education.forEach(edu => {
        resume += `${edu.degree}\n`;
        resume += `${edu.institution} | ${edu.year}${edu.grade ? ` | ${edu.grade}` : ''}\n\n`;
      });
    }

    // Experience
    if (resumeData.experience.length > 0) {
      resume += `WORK EXPERIENCE\n`;
      resume += `${'─'.repeat(50)}\n`;
      resumeData.experience.forEach(exp => {
        resume += `${exp.title} | ${exp.company}\n`;
        resume += `${exp.duration}\n`;
        resume += `${exp.description}\n\n`;
      });
    }

    // Projects
    if (resumeData.projects.length > 0) {
      resume += `PROJECTS\n`;
      resume += `${'─'.repeat(50)}\n`;
      resumeData.projects.forEach(proj => {
        resume += `${proj.name}\n`;
        resume += `Technologies: ${proj.technologies}\n`;
        resume += `${proj.description}\n`;
        if (proj.link) resume += `Link: ${proj.link}\n`;
        resume += '\n';
      });
    }

    // Certifications
    if (resumeData.certifications.length > 0) {
      resume += `CERTIFICATIONS\n`;
      resume += `${'─'.repeat(50)}\n`;
      resumeData.certifications.forEach(cert => {
        resume += `• ${cert}\n`;
      });
    }

    return resume;
  };

  const downloadResume = async () => {
    setIsGenerating(true);

    try {
      console.log('jsPDF imported:', jsPDF);
      // @ts-ignore
      console.log('jsPDF.default:', jsPDF.default);

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = 20;
      const lineHeight = 6;
      const sectionGap = 8;

      // Helper to add new page if needed
      const checkNewPage = (neededSpace: number) => {
        if (yPos + neededSpace > 280) {
          doc.addPage();
          yPos = 20;
        }
      };

      // Header - Name
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(resumeData.fullName.toUpperCase() || 'YOUR NAME', pageWidth / 2, yPos, { align: 'center' });
      yPos += lineHeight + 2;

      // Contact info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const contactParts = [resumeData.email, resumeData.phone, resumeData.location].filter(Boolean);
      if (contactParts.length > 0) {
        doc.text(contactParts.join(' | '), pageWidth / 2, yPos, { align: 'center' });
        yPos += lineHeight;
      }

      // LinkedIn & GitHub
      const links = [];
      if (resumeData.linkedin) links.push(`LinkedIn: ${resumeData.linkedin}`);
      if (resumeData.github) links.push(`GitHub: ${resumeData.github}`);
      if (links.length > 0) {
        doc.setTextColor(0, 102, 204);
        doc.text(links.join(' | '), pageWidth / 2, yPos, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        yPos += lineHeight;
      }
      yPos += sectionGap;

      // Section helper
      const addSection = (title: string) => {
        checkNewPage(15);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), margin, yPos);
        yPos += 2;
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += lineHeight;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      };

      // Professional Summary
      if (resumeData.summary) {
        addSection('Professional Summary');
        const summaryLines = doc.splitTextToSize(resumeData.summary, contentWidth);
        summaryLines.forEach((line: string) => {
          checkNewPage(lineHeight);
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
        yPos += sectionGap;
      }

      // Skills
      if (resumeData.skills.length > 0) {
        addSection('Skills');
        const skillsText = resumeData.skills.join(' - ');
        const skillLines = doc.splitTextToSize(skillsText, contentWidth);
        skillLines.forEach((line: string) => {
          checkNewPage(lineHeight);
          doc.text(line, margin, yPos);
          yPos += lineHeight;
        });
        yPos += sectionGap;
      }

      // Education
      if (resumeData.education.length > 0) {
        addSection('Education');
        resumeData.education.forEach((edu) => {
          checkNewPage(15);
          doc.setFont('helvetica', 'bold');
          doc.text(edu.degree, margin, yPos);
          yPos += lineHeight;
          doc.setFont('helvetica', 'normal');
          const eduDetails = [edu.institution, edu.year, edu.grade].filter(Boolean).join(' | ');
          doc.text(eduDetails, margin, yPos);
          yPos += lineHeight + 2;
        });
        yPos += sectionGap - 2;
      }

      // Work Experience
      if (resumeData.experience.length > 0) {
        addSection('Work Experience');
        resumeData.experience.forEach((exp) => {
          checkNewPage(20);
          doc.setFont('helvetica', 'bold');
          doc.text(`${exp.title} | ${exp.company}`, margin, yPos);
          yPos += lineHeight;
          doc.setFont('helvetica', 'italic');
          doc.text(exp.duration, margin, yPos);
          yPos += lineHeight;
          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(exp.description, contentWidth);
          descLines.forEach((line: string) => {
            checkNewPage(lineHeight);
            doc.text(line, margin, yPos);
            yPos += lineHeight;
          });
          yPos += 3;
        });
        yPos += sectionGap - 3;
      }

      // Projects
      if (resumeData.projects.length > 0) {
        addSection('Projects');
        resumeData.projects.forEach((proj) => {
          checkNewPage(20);
          doc.setFont('helvetica', 'bold');
          doc.text(proj.name, margin, yPos);
          yPos += lineHeight;
          doc.setFont('helvetica', 'normal');
          doc.text(`Technologies: ${proj.technologies}`, margin, yPos);
          yPos += lineHeight;
          const projLines = doc.splitTextToSize(proj.description, contentWidth);
          projLines.forEach((line: string) => {
            checkNewPage(lineHeight);
            doc.text(line, margin, yPos);
            yPos += lineHeight;
          });
          if (proj.link) {
            doc.setTextColor(0, 102, 204);
            doc.text(proj.link, margin, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += lineHeight;
          }
          yPos += 3;
        });
        yPos += sectionGap - 3;
      }

      // Certifications
      if (resumeData.certifications.length > 0) {
        addSection('Certifications');
        resumeData.certifications.forEach((cert) => {
          checkNewPage(lineHeight);
          doc.text(`- ${cert}`, margin, yPos);
          yPos += lineHeight;
        });
      }

      // Save the PDF manually to ensure download works
      const pdfBlob = doc.output('blob');

      if (pdfBlob.size === 0) {
        throw new Error('Generated PDF is empty');
      }

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;

      // Use a very simple filename to avoid any OS/Browser issues with special chars
      const safeName = resumeData.fullName.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume';
      link.download = `${safeName}_ATS_Friendly.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast({
        title: "Resume Downloaded!",
        description: "Your ATS-friendly resume has been saved as a PDF.",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateATSScore = () => {
    let score = 0;
    let maxScore = 100;

    // Personal info (20 points)
    if (resumeData.fullName) score += 5;
    if (resumeData.email) score += 5;
    if (resumeData.phone) score += 5;
    if (resumeData.location) score += 5;

    // Summary (10 points)
    if (resumeData.summary && resumeData.summary.length > 50) score += 10;

    // Skills (20 points)
    if (resumeData.skills.length >= 5) score += 20;
    else if (resumeData.skills.length >= 3) score += 15;
    else if (resumeData.skills.length >= 1) score += 10;

    // Education (15 points)
    if (resumeData.education.length > 0) score += 15;

    // Experience (20 points)
    if (resumeData.experience.length >= 2) score += 20;
    else if (resumeData.experience.length >= 1) score += 15;

    // Projects (10 points)
    if (resumeData.projects.length >= 2) score += 10;
    else if (resumeData.projects.length >= 1) score += 5;

    // Certifications (5 points)
    if (resumeData.certifications.length > 0) score += 5;

    return Math.min(score, maxScore);
  };

  const atsScore = calculateATSScore();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            📝 ATS-Friendly Resume Builder
          </h1>
          <p className="text-muted-foreground">
            Create a professional resume that passes Applicant Tracking Systems
          </p>
        </div>

        {/* ATS Score Card */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">ATS Score</h3>
                <p className="text-sm text-muted-foreground">Based on your resume completeness</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary">{atsScore}%</div>
                <div className="w-32 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500"
                    style={{ width: `${atsScore}%` }}
                  />
                </div>
              </div>
              <Button onClick={downloadResume} disabled={isGenerating} className="gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Full Name"
                  value={resumeData.fullName}
                  onChange={(e) => setResumeData(prev => ({ ...prev, fullName: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Email"
                      className="pl-10"
                      value={resumeData.email}
                      onChange={(e) => setResumeData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Phone"
                      className="pl-10"
                      value={resumeData.phone}
                      onChange={(e) => setResumeData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Location (City, State)"
                    className="pl-10"
                    value={resumeData.location}
                    onChange={(e) => setResumeData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="LinkedIn URL"
                      className="pl-10"
                      value={resumeData.linkedin}
                      onChange={(e) => setResumeData(prev => ({ ...prev, linkedin: e.target.value }))}
                    />
                  </div>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="GitHub URL"
                      className="pl-10"
                      value={resumeData.github}
                      onChange={(e) => setResumeData(prev => ({ ...prev, github: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Write a brief professional summary (2-3 sentences) highlighting your key skills, experience, and career goals..."
                  value={resumeData.summary}
                  onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="w-5 h-5 text-primary" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., Python, React, Data Analysis)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 py-1 px-3">
                      {skill}
                      <button onClick={() => removeSkill(index)} className="ml-1 hover:text-destructive">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Education
                </CardTitle>
                <Button onClick={addEducation} size="sm" variant="outline" className="gap-1">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                    <div className="flex justify-between items-start">
                      <Input
                        placeholder="Degree (e.g., B.Tech Computer Science)"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => removeEducation(edu.id)}
                        size="icon"
                        variant="ghost"
                        className="text-destructive ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Institution Name"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Year (e.g., 2020-2024)"
                        value={edu.year}
                        onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                      />
                      <Input
                        placeholder="Grade/CGPA"
                        value={edu.grade}
                        onChange={(e) => updateEducation(edu.id, 'grade', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - More Sections */}
          <div className="space-y-6">
            {/* Experience */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Work Experience
                </CardTitle>
                <Button onClick={addExperience} size="sm" variant="outline" className="gap-1">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                    <div className="flex justify-between items-start">
                      <Input
                        placeholder="Job Title"
                        value={exp.title}
                        onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => removeExperience(exp.id)}
                        size="icon"
                        variant="ghost"
                        className="text-destructive ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    />
                    <Input
                      placeholder="Duration (e.g., Jan 2023 - Present)"
                      value={exp.duration}
                      onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                    />
                    <Textarea
                      placeholder="Description (Use action verbs: Led, Developed, Implemented...)"
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="w-5 h-5 text-primary" />
                  Projects
                </CardTitle>
                <Button onClick={addProject} size="sm" variant="outline" className="gap-1">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.projects.map((proj) => (
                  <div key={proj.id} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                    <div className="flex justify-between items-start">
                      <Input
                        placeholder="Project Name"
                        value={proj.name}
                        onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => removeProject(proj.id)}
                        size="icon"
                        variant="ghost"
                        className="text-destructive ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Technologies Used (e.g., React, Node.js, MongoDB)"
                      value={proj.technologies}
                      onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                    />
                    <Textarea
                      placeholder="Project Description"
                      value={proj.description}
                      onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                      rows={2}
                    />
                    <Input
                      placeholder="Project Link (optional)"
                      value={proj.link}
                      onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-primary" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add certification (e.g., AWS Certified, Google Analytics)"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                  />
                  <Button onClick={addCertification} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {resumeData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                      <span className="text-sm">{cert}</span>
                      <button onClick={() => removeCertification(index)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ATS Tips */}
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-yellow-600">
                  💡 ATS Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ Use standard section headings (Education, Experience, Skills)</li>
                  <li>✓ Include keywords from the job description</li>
                  <li>✓ Avoid tables, graphics, and fancy formatting</li>
                  <li>✓ Use simple fonts and bullet points</li>
                  <li>✓ Save as PDF or plain text format</li>
                  <li>✓ Include your contact information at the top</li>
                  <li>✓ Use action verbs to describe achievements</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
