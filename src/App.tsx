import { useCallback, useEffect, useState } from 'react';
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { CreativeSection } from './components/CreativeSection';
import { ExperimentsSection } from './components/ExperimentsSection';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { MobileNavOverlay } from './components/MobileNavOverlay';
import { Navbar } from './components/Navbar';
import { PersistentIdentityNav } from './components/PersistentIdentityNav';
import { SayLoader } from './components/SayLoader';
import { SelectedWork } from './components/SelectedWork';
import type { DestinationId } from './data/portfolio';
import {
  createThrottledCallback,
  resolveActiveSectionId,
  type SectionBounds,
} from './utils/portfolio';

const TRACKED_SECTION_IDS = [
  'home',
  'work',
  'creative',
  'experiments',
  'about',
  'contact',
] as const;

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [showPersistentNav, setShowPersistentNav] = useState<boolean>(false);
  const [miniPortraitUrl, setMiniPortraitUrl] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const scrollToElementId = useCallback((elementId: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    setActiveSection(elementId);
  }, []);

  const handleReturnHome = useCallback(() => {
    setMobileMenuOpen(false);
    scrollToElementId('home');
  }, [scrollToElementId]);

  const handleNavigateDestination = useCallback(
    (id: DestinationId) => {
      setMobileMenuOpen(false);
      scrollToElementId(id);
    },
    [scrollToElementId],
  );

  const handleToggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleOpenMobileMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

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

      const homeEl = document.getElementById('home');
      const heroRect = homeEl?.getBoundingClientRect();
      const shouldShowPersistent = heroRect ? heroRect.bottom < 220 : window.scrollY > 420;
      setShowPersistentNav((prev) =>
        prev === shouldShowPersistent ? prev : shouldShowPersistent,
      );
    };

    const throttledUpdate = createThrottledCallback(updateActiveSection, 90);

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
          <SayLoader />

          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-[#7C3AED] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#F0EFEC]"
          >
            Skip to main content
          </a>

          <Navbar
            activeSection={activeSection}
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={handleToggleMobileMenu}
            onReturnHome={handleReturnHome}
            onNavigateDestination={handleNavigateDestination}
          />

          <main id="main-content">
            <Hero
              activeSection={activeSection}
              onNavigateDestination={handleNavigateDestination}
              onMiniPortraitReady={setMiniPortraitUrl}
            />

            <SelectedWork
              selectedProjectId={selectedProjectId}
              onSelectProjectId={setSelectedProjectId}
            />

            <CreativeSection onOpenProject={setSelectedProjectId} />

            <ExperimentsSection
              miniPortraitUrl={miniPortraitUrl}
              onFocusCelestialPortrait={handleReturnHome}
            />

            <AboutSection />

            <ContactSection />
          </main>

          <Footer onReturnHome={handleReturnHome} />

          <PersistentIdentityNav
            visible={showPersistentNav}
            activeSection={activeSection}
            miniPortraitUrl={miniPortraitUrl}
            mobileMenuOpen={mobileMenuOpen}
            onOpenMobileMenu={handleOpenMobileMenu}
            onReturnHome={handleReturnHome}
            onNavigateDestination={handleNavigateDestination}
          />

          <MobileNavOverlay
            open={mobileMenuOpen}
            activeSection={activeSection}
            miniPortraitUrl={miniPortraitUrl}
            onClose={handleCloseMobileMenu}
            onReturnHome={handleReturnHome}
            onNavigateDestination={handleNavigateDestination}
          />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
