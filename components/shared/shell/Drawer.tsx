import React, { useState } from 'react';
import TeamDropdown from '../TeamDropdown';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Brand from './Brand';
import Navigation from './Navigation';
import { useTranslation } from 'next-i18next';

interface DrawerProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

const Drawer = ({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }: DrawerProps) => {
  const { t } = useTranslation('common');

  return (
    <>
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600/80" />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">{t('close-sidebar')}</span>
                  <XMarkIcon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background px-6 pb-4">
                <Brand />
                <TeamDropdown />
                <Navigation />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar with collapse */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ${collapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className="flex flex-col gap-y-5 overflow-y-auto border-r px-2 h-full">
          {collapsed ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setCollapsed(false)}
                aria-label={t('expand-sidebar')}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pt-6 px-4">
                <Brand collapsed={false} />
                <button
                  type="button"
                  className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => setCollapsed(true)}
                  aria-label={t('collapse-sidebar')}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-y-5">
                <TeamDropdown />
                <Navigation />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Drawer;
