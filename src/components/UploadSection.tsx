import { useState, useRef, DragEvent } from 'react';
import { Upload, FileText, X, Image, AlertCircle, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg,.jpeg',
  'image/png': '.png',
};

const ACCEPTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

export const UploadSection = ({ onFileSelect }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = Object.keys(ACCEPTED_FILE_TYPES).includes(file.type) ||
      ACCEPTED_EXTENSIONS.includes(extension);

    if (!isValidType) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, JPG, JPEG, or PNG file only.",
        variant: "destructive",
      });
      return false;
    }

    // Max file size: 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 10MB. Please upload a smaller file.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelection = (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    toast({
      title: "File Uploaded Successfully",
      description: `${file.name} is ready for analysis.`,
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume to proceed.",
        variant: "destructive",
      });
      return;
    }
    onFileSelect(selectedFile);
  };

  const isPDF = selectedFile?.type === 'application/pdf' ||
    selectedFile?.name.toLowerCase().endsWith('.pdf');

  return (
    <section className="bg-navy pt-20 pb-12 px-[5%] flex items-center justify-center relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-primary/5 skew-x-12 transform -translate-x-1/2" />

      <div className="text-center max-w-xl mx-auto animate-fade-in relative z-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          AI Opportunity Matcher
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter">
          Let's Find Your <span className="text-primary">Match</span>
        </h2>
        <p className="text-slate-400 text-base font-medium mb-8 max-w-lg mx-auto">
          Upload your resume and our AI will find personalized opportunities tailored to your unique profile.
        </p>

        <div
          className={`bg-white/5 backdrop-blur-md max-w-md mx-auto p-8 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer shadow-2xl group
            ${isDragging ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary/50 hover:bg-white/10'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={handleFileChange}
          />

          {selectedFile ? (
            <div className="space-y-4">
              {/* File Preview */}
              {previewUrl ? (
                <div className="relative w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 border-white/10 shadow-xl">
                  <img
                    src={previewUrl}
                    alt="Resume preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
              )}

              {/* File Info */}
              <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between gap-3 border border-white/10">
                <div className="flex items-center gap-2 overflow-hidden text-left">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <p className="text-white font-black truncate text-xs">
                    {selectedFile.name}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleClearFile(); }}
                  className="text-slate-400 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-primary/20 transition-all duration-500">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-white font-black text-lg mb-1">
                Drop Resume
              </p>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                or click to browse
              </p>
              <div className="flex items-center justify-center gap-2">
                {['PDF', 'JPG', 'PNG'].map(ext => (
                  <span key={ext} className="px-2 py-0.5 bg-white/5 text-slate-400 rounded-lg text-[9px] font-black tracking-tighter border border-white/5 group-hover:border-primary/20 transition-colors">
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        <div className="mt-8 max-w-md mx-auto">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedFile}
            className={`w-full h-12 rounded-xl font-black text-base transition-all
              ${selectedFile
                ? 'bg-primary hover:bg-primary-hover text-white shadow-xl shadow-primary/30 hover:-translate-y-1'
                : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'}`}
          >
            {selectedFile ? 'Start Scanning' : 'Upload to Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-6 opacity-60">
            Secure Process • Data Encrypted
          </p>
        </div>
      </div>
    </section>
  );
};
