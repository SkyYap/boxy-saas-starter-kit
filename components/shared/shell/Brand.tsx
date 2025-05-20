import app from '@/lib/app';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const Brand = ({ collapsed = false }: { collapsed?: boolean }) => {
  const [theme, setTheme] = useState(
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex pt-6 shrink-0 items-center text-xl font-bold gap-2 dark:text-gray-100">
      <Image
        src={theme !== 'dark' ? app.logoUrl : '/logowhite.png'}
        alt={app.name}
        width={30}
        height={30}
      />
      {!collapsed && app.name}
    </div>
  );
};

export default Brand;
