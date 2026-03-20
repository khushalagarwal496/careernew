import { Compass, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy border-t border-slate-800 mt-auto text-slate-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-[5%] py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">Career<span className="text-primary">Compass</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
              Your AI-powered career guide. We help students and professionals find the best opportunities
              matching their skills and aspirations. Build ATS-friendly resumes and land your dream job.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-slate-800 hover:bg-primary text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-black text-lg mb-6 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', path: '/' },
                { label: 'Resume Builder', path: '/' },
                { label: 'ATS Analyzer', path: '/' },
                { label: 'Resume Analysis', path: '/' },
                { label: 'Study Assistant', path: '/' }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-slate-400 hover:text-primary transition-all duration-300 text-sm flex items-center gap-2 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-primary transition-colors"></div>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h3 className="text-white font-black text-lg mb-6 uppercase tracking-wider">For Students</h3>
            <ul className="space-y-3">
              {[
                'BTech / BCA / MCA',
                'BBA / MBA',
                'MBBS / Medical',
                'Internships',
                'Hackathons'
              ].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-slate-400 hover:text-primary transition-all duration-300 text-sm flex items-center gap-2 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-primary transition-colors"></div>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-black text-lg mb-6 uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <span className="text-slate-400 text-sm pt-1">
                  Noida sector 126,<br />
                  Uttar Pradesh, India
                </span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <a href="mailto:khushalgarg496@gmail.com" className="text-slate-400 hover:text-primary transition-colors text-sm font-bold">
                  khushalgarg496@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col text-slate-400 text-sm pt-1">
                  <a href="tel:+918949243066" className="hover:text-primary transition-colors font-bold">+91 8949243066</a>
                  <a href="tel:+916375476136" className="hover:text-primary transition-colors font-bold">+91 6375476136</a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-black/20">
        <div className="max-w-7xl mx-auto px-[5%] py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-sm flex items-center gap-2 font-medium">
              © {currentYear} <span className="text-slate-300 font-bold tracking-tighter">CareerCompass</span>. Made with <Heart className="w-4 h-4 text-primary fill-primary animate-pulse" /> in India
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold">
              {[
                { label: 'Terms', path: '/terms' },
                { label: 'Privacy', path: '/privacy' },
                { label: 'Refunds', path: '/refund' },
                { label: 'Contact', path: '/contact' }
              ].map((link, i) => (
                <Link key={i} to={link.path} className="text-slate-500 hover:text-white transition-all duration-300 uppercase tracking-widest text-[10px]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
