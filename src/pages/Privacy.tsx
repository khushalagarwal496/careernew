import { ArrowLeft, Shield, Eye, Database, Lock, Users, Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

const Privacy = () => {
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
          <h1 className="text-xl font-bold text-foreground">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="space-y-8">
            {/* Information Collection */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We collect information you provide directly to us:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li><strong>Account Information:</strong> Name, email address, phone number when you register.</li>
                    <li><strong>Resume Data:</strong> Information extracted from uploaded resumes including skills, education, and work experience.</li>
                    <li><strong>Usage Data:</strong> How you interact with our services, features used, and preferences.</li>
                    <li><strong>Device Information:</strong> Browser type, IP address, device identifiers.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Analyze your resume and match you with relevant opportunities</li>
                    <li>Send you notifications about new opportunities and updates</li>
                    <li>Respond to your comments, questions, and requests</li>
                    <li>Monitor and analyze trends, usage, and activities</li>
                    <li>Detect, investigate, and prevent fraudulent transactions</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We take reasonable measures to help protect information about you from loss, theft, 
                    misuse, and unauthorized access. We use encryption for data transmission and secure 
                    servers for data storage. However, no Internet or electronic storage system is 100% secure.
                  </p>
                </div>
              </div>
            </section>

            {/* Sharing Information */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. Sharing of Information</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We may share your information in the following situations:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>With your consent or at your direction</li>
                    <li>With service providers who perform services on our behalf</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect the rights and safety of Career Compass and its users</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4 font-medium">
                    We do NOT sell your personal information to third parties.
                  </p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-3">5. Your Rights</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate or incomplete data</li>
                    <li>Request deletion of your data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Export your data in a portable format</li>
                  </ul>
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
                  <h2 className="text-xl font-semibold text-foreground mb-3">Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    If you have questions about this Privacy Policy, please contact us at:
                  </p>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Email:</strong> privacy@careercompass.com</p>
                    <p><strong>Phone:</strong> +91 12345 67890</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
