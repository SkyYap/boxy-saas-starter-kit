import Link from 'next/link';
import React from 'react';
import { useSession } from 'next-auth/react';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  SunIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import useTheme from 'hooks/useTheme';
import env from '@/lib/env';
import { useTranslation } from 'next-i18next';
import { useCustomSignOut } from 'hooks/useCustomSignout';
import { Button } from '@/lib/components/ui/button';

interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { toggleTheme } = useTheme();
  const { status, data } = useSession();
  const { t } = useTranslation('common');
  const signOut = useCustomSignOut();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
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

  if (status === 'loading' || !data) {
    return null;
  }

  const { user } = data;

  return (
    <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b px-4 sm:gap-x-6 sm:px-6 lg:px-8 bg-background">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-50 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">{t('open-sidebar')}</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-0 hover:bg-transparent"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="hidden lg:flex lg:items-center">
                <span className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-50">
                  {user.name}
                </span>
                <ChevronDownIcon
                  className="ml-2 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-md z-10 p-1 space-y-1 dark:bg-gray-800 dark:border-gray-700">
                <Link href="/settings/account">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm font-medium text-gray-900 dark:text-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserCircleIcon className="w-5 h-5 mr-2" /> {t('account')}
                  </Button>
                </Link>

                {env.darkModeEnabled && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm font-medium text-gray-900 dark:text-gray-50"
                    onClick={() => {
                      toggleTheme();
                      setIsOpen(false);
                    }}
                  >
                    <SunIcon className="w-5 h-5 mr-2" /> {t('switch-theme')}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-medium text-gray-900 dark:text-gray-50"
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" /> {t('logout')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
