import * as yaml from 'js-yaml'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import styles from './NavigationSideBar.module.css'

interface NavigationItem {
  name: string;
  id: string;
}

interface NavigationConfig {
  sections: NavigationItem[];
}

export default function NavigationSideBar() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const response = await fetch('/config/navigation.yaml', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to fetch navigation: ${response.statusText}`);
        }
        const yamlText = await response.text();
        const data = yaml.load(yamlText) as NavigationConfig;
        setNavigationItems(data.sections || []);
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
    <div className={styles.navigationSidebar}>
      <div className={styles.sidebarContent}>
        {/* Navigation Items */}
        <nav className={styles.nav}>
          {navigationItems.map((item) => {
            const isActive = router.asPath.includes(item.id);
            return (
              <Link 
                href={`/${item.id}`} 
                key={item.id}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
