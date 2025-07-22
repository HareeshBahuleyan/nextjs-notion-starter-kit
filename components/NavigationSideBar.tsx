import * as yaml from 'js-yaml'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FiChevronLeft, FiMenu } from 'react-icons/fi'

import styles from './NavigationSideBar.module.css'

interface NavigationPage {
  name: string;
  id: string;
}

interface NavigationSection {
  name: string;
  pages: NavigationPage[];
}

interface NavigationConfig {
  sections: NavigationSection[];
}

export default function NavigationSideBar() {
  const [navigationSections, setNavigationSections] = useState<NavigationSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Handle window resize and set initial state
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On mobile, sidebar starts collapsed
      // On desktop, sidebar starts open
      setIsCollapsed(mobile);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Update CSS custom property for content offset
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty(
        '--sidebar-collapsed', 
        isCollapsed ? '1' : '0'
      );
    }
  }, [isCollapsed]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle sidebar with Ctrl/Cmd + B
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setIsCollapsed(!isCollapsed);
      }
      // Close sidebar on Escape (mobile only)
      if (event.key === 'Escape' && isMobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isCollapsed]);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        // Only fetch on client side to avoid SSG issues
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }
        
        const response = await fetch('/config/navigation.yaml', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to fetch navigation: ${response.statusText}`);
        }
        const yamlText = await response.text();
        const data = yaml.load(yamlText) as NavigationConfig;
        setNavigationSections(data.sections || []);
      } catch (err) {
        console.error('Error loading navigation:', err);
        setError('Failed to load navigation');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchNavigation();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.navigationSidebar}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.loadingItem}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.navigationSidebar}>
        <div className={styles.errorContainer}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && !isCollapsed && (
        <div 
          className={styles.backdrop}
          onClick={() => setIsCollapsed(true)}
          aria-hidden="true"
        />
      )}
      
      {/* Mobile Toggle Button - Rendered outside the sidebar */}
      {isMobile && (
        <button 
          onClick={toggleSidebar}
          className={`${styles.toggleButton} ${styles.mobileToggleButton}`}
          aria-label={isCollapsed ? 'Open navigation menu' : 'Close navigation menu'}
          aria-expanded={!isCollapsed}
          aria-controls="navigation-sidebar"
          title={`${isCollapsed ? 'Open' : 'Close'} navigation (${isMobile ? 'Esc' : 'Ctrl+B'})`}
        >
          {isCollapsed ? <FiMenu className={styles.menuIcon} /> : <FiChevronLeft className={styles.chevronIcon} />}
        </button>
      )}
      
      <div className={`${styles.navigationSidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        {/* Desktop Toggle Button - Only shown on desktop */}
        {!isMobile && (
          <button 
            onClick={toggleSidebar}
            className={styles.toggleButton}
            aria-label="Toggle navigation menu"
            aria-expanded={!isCollapsed}
            aria-controls="navigation-sidebar"
            title="Toggle navigation (Ctrl+B)"
          >
            <FiChevronLeft className={styles.chevronIcon} />
          </button>
        )}
        
        <div className={styles.sidebarContent} id="navigation-sidebar">
          {/* Navigation Items */}
          <nav className={styles.nav} role="navigation" aria-label="Main navigation">
            {navigationSections.map((section) => (
            <div key={section.name} className={styles.navSection}>
              <div className={styles.navSectionHeader}>
                {section.name}
              </div>
              <div className={styles.navSectionContent}>
                {section.pages.map((page) => {
                  const isActive = router.asPath.includes(page.id);
                  return (
                    <Link 
                      href={`/${page.id}`} 
                      key={page.id}
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                      onClick={() => isMobile && setIsCollapsed(true)}
                    >
                      {page.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          </nav>
        </div>
      </div>
    </>
  );
}
