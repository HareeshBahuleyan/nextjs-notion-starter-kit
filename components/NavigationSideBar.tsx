import * as yaml from 'js-yaml'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

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
      <div 
        className="w-64 h-screen border-r overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-color)',
          borderColor: 'var(--fg-color-0)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
        }}
      >
        <div className="p-6">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i} 
                className="h-4 rounded"
                style={{ backgroundColor: 'rgba(55, 53, 47, 0.1)' }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="w-64 h-screen border-r overflow-y-auto p-6"
        style={{
          backgroundColor: 'var(--bg-color)',
          borderColor: 'var(--fg-color-0)',
          color: 'rgba(220, 38, 127, 1)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
        }}
      >
        <div className="text-sm">Error: {error}</div>
      </div>
    );
  }

  return (
    <div 
      className="w-64 h-screen border-r overflow-y-auto"
      style={{
        backgroundColor: 'var(--bg-color)',
        borderColor: 'var(--fg-color-0)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"'
      }}
    >
      {/* Header */}
      <div 
        className="p-6 border-b"
        style={{
          borderColor: 'var(--fg-color-0)',
          background: 'hsla(0, 0%, 100%, 0.8)',
          backdropFilter: 'saturate(180%) blur(16px)'
        }}
      >
        <h2 
          className="text-xl font-semibold mb-1"
          style={{ color: 'rgb(55, 53, 47)' }}
        >
          Navigation
        </h2>
        <p 
          className="text-sm"
          style={{ color: 'rgba(55, 53, 47, 0.6)' }}
        >
          
        </p>
      </div>
      
      {/* Navigation Items */}
      <nav className="p-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = router.asPath.includes(item.id);
          return (
            <Link 
              href={`/${item.id}`} 
              key={item.id}
              className="block px-4 py-3 rounded-lg transition-all duration-200 group"
              style={{
                backgroundColor: isActive ? 'rgba(35, 131, 226, 0.1)' : 'transparent',
                color: isActive ? 'rgb(35, 131, 226)' : 'rgb(55, 53, 47)',
                borderLeft: isActive ? '3px solid rgb(35, 131, 226)' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(55, 53, 47, 0.05)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-base">
                  {item.name}
                </span>
                {isActive && (
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'rgb(35, 131, 226)' }}
                  ></div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div 
        className="mt-auto p-4 border-t"
        style={{
          borderColor: 'var(--fg-color-0)',
          background: 'hsla(0, 0%, 100%, 0.5)',
          backdropFilter: 'saturate(180%) blur(8px)'
        }}
      >
        <div 
          className="text-xs text-center"
          style={{ color: 'rgba(55, 53, 47, 0.5)' }}
        >
          <div className="flex items-center justify-center space-x-2">
            <div 
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(16, 185, 129, 1)' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
