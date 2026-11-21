import { useEffect, useState } from 'react';
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import { About } from './components/About';
import { BeyondSection } from './components/BeyondSection';
import { ContactSection } from './components/ContactSection';
import { ExploringSection } from './components/ExploringSection';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { SelectedWork } from './components/SelectedWork';
import {
  createThrottledCallback,
  resolveActiveSectionId,
  type SectionBounds,
} from './utils/portfolio';

const TRACKED_SECTION_IDS = ['home', 'about', 'work', 'beyond', 'contact'] as const;

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    const updateActiveSection = () => {
      const bounds: SectionBounds[] = [];
      for (const id of TRACKED_SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          bounds.push({ id, top: rect.top, bottom: rect.bottom });
        }
      }

      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 24;

      const nextActive = resolveActiveSectionId(bounds, 140, isAtBottom);
      setActiveSection((prev) => (prev === nextActive ? prev : nextActive));
    };

    const throttledUpdate = createThrottledCallback(updateActiveSection, 100);

    updateActiveSection();
    window.addEventListener('scroll', throttledUpdate.run, { passive: true });
    window.addEventListener('resize', throttledUpdate.run, { passive: true });
    return () => {
      throttledUpdate.cancel();
      window.removeEventListener('scroll', throttledUpdate.run);
      window.removeEventListener('resize', throttledUpdate.run);
    };
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-[#0B0B0D] text-[#F0EFEC]">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-[#4E7EFF] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#F0EFEC]"
          >
            Skip to main content
          </a>

          <Navbar
            activeSection={activeSection}
            onSectionSelect={setActiveSection}
          />

        <main id="main-content">
          <Hero />
          <About />
          <SelectedWork />
          <BeyondSection />
          <ExploringSection />
          <ContactSection />
        </main>

          <Footer />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
