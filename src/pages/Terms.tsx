import { ArrowLeft, Shield, FileText, AlertTriangle, Scale, Clock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border py-4 px-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Terms & Conditions</h1>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Terms & Conditions
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to Career Compass ("we," "our," or "us"). By accessing or using our website, 
                    mobile application, or any of our services (collectively, the "Services"), you agree 
                    to be bound by these Terms and Conditions. If you do not agree to these terms, please 
                    do not use our Services.
                  </p>
                </div>
              </div>
            </section>

            {/* Services Description */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">2. Services Description</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Career Compass provides the following services:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li><strong>Resume Analysis:</strong> AI-powered analysis of uploaded resumes to identify skills, experience, and potential opportunities.</li>
                    <li><strong>Resume Builder:</strong> Tools to create ATS-friendly resumes optimized for applicant tracking systems.</li>
                    <li><strong>ATS Analyzer:</strong> Evaluation of resume compatibility with common ATS software.</li>
                    <li><strong>Career Opportunities:</strong> Curated job listings, internships, hackathons, and learning resources based on your profile.</li>
                    <li><strong>Study Assistant:</strong> AI chatbot for academic and career guidance.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. User Responsibilities</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    By using our Services, you agree to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Provide accurate, current, and complete information when creating an account or using our services.</li>
                    <li>Maintain the security of your account credentials and not share them with others.</li>
                    <li>Use the Services only for lawful purposes and in accordance with these Terms.</li>
                    <li>Not upload any malicious content, viruses, or harmful code.</li>
                    <li>Not attempt to gain unauthorized access to our systems or other users' accounts.</li>
                    <li>Not use automated systems or bots to access our Services without permission.</li>
                    <li>Respect intellectual property rights of Career Compass and third parties.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Privacy */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Privacy & Security</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Your privacy is important to us. When you use our Services:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>We collect and process personal information as described in our Privacy Policy.</li>
                    <li>Uploaded resumes are processed using AI technology to provide our services.</li>
                    <li>We implement industry-standard security measures to protect your data.</li>
                    <li>We do not sell your personal information to third parties.</li>
                    <li>You can request deletion of your data at any time by contacting us.</li>
                    <li>Your resume data may be temporarily stored for analysis purposes.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">5. Disclaimer of Warranties</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Please understand the following limitations:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Our Services are provided "as is" without warranties of any kind.</li>
                    <li>We do not guarantee employment or job placement through our platform.</li>
                    <li>AI-generated analysis and recommendations are for informational purposes only.</li>
                    <li>Job listings and opportunities are provided by third parties; we are not responsible for their accuracy.</li>
                    <li>ATS scores and analysis are estimates and may vary between different applicant tracking systems.</li>
                    <li>We recommend verifying all information before making career decisions.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. Intellectual Property</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All content, features, and functionality of Career Compass, including but not limited to 
                    text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, 
                    and software, are the exclusive property of Career Compass or its licensors and are 
                    protected by copyright, trademark, and other intellectual property laws. You may not 
                    reproduce, distribute, modify, create derivative works of, publicly display, or exploit 
                    any of our content without prior written consent.
                  </p>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To the fullest extent permitted by applicable law, Career Compass shall not be liable 
                    for any indirect, incidental, special, consequential, or punitive damages, including 
                    without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
                    resulting from (i) your access to or use of or inability to access or use the Services; 
                    (ii) any conduct or content of any third party on the Services; (iii) any content 
                    obtained from the Services; and (iv) unauthorized access, use, or alteration of your 
                    transmissions or content.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-teal-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify or replace these Terms at any time at our sole discretion. 
                    If a revision is material, we will provide at least 30 days' notice prior to any new terms 
                    taking effect. What constitutes a material change will be determined at our sole discretion. 
                    By continuing to access or use our Services after any revisions become effective, you agree 
                    to be bound by the revised terms.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Information</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    If you have any questions about these Terms & Conditions, please contact us:
                  </p>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Email:</strong> legal@careercompass.com</p>
                    <p><strong>Phone:</strong> +91 12345 67890</p>
                    <p><strong>Address:</strong> 123 Career Street, Tech Park, New Delhi, India - 110001</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Agreement */}
            <div className="bg-card rounded-xl p-6 border-2 border-primary/30 text-center">
              <p className="text-foreground font-medium">
                By using Career Compass, you acknowledge that you have read, understood, and agree to be 
                bound by these Terms & Conditions.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
