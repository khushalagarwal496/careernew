import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';
import ATSAnalyzer from '@/components/ATSAnalyzer';
import { ViewState } from '@/types';

const ATSAnalyzerPage = () => {
    // Dummy handlers to satisfy Navbar props while using React Router for main navigation
    const handleNavigate = (view: ViewState) => {
        if (view === 'HERO') window.location.href = '/';
    };
    const handleOpenModal = () => { };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar onNavigate={handleNavigate} onOpenModal={handleOpenModal} />
            <main className="flex-1 mt-[73px]">
                <ATSAnalyzer />
            </main>
            <Footer />
        </div>
    );
};

export default ATSAnalyzerPage;
