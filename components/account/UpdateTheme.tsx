import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import useTheme from 'hooks/useTheme';
import { useState, useRef, useEffect } from 'react';
import type { Theme } from '@/lib/theme';

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';

const UpdateTheme = () => {
  const { setTheme, themes, selectedTheme, applyTheme } = useTheme();
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleThemeChange = (themeId: Theme) => {
    applyTheme(themeId);
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('theme')}</CardTitle>
        <CardDescription>{t('change-theme')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            className="w-60 justify-between"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>{selectedTheme.name}</span>
            <ChevronUpDownIcon className="w-5 h-5 ml-2" />
          </Button>

          {isOpen && (
            <div className="absolute mt-1 w-60 rounded-md border border-gray-200 bg-card shadow-md z-10">
              {themes.map((theme) => (
                <Button
                  key={theme.id}
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-left hover:bg-accent"
                  onClick={() => handleThemeChange(theme.id)}
                >
                  {theme.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpdateTheme;
