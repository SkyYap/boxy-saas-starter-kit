import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';

const Help = () => {
  const { t } = useTranslation('common');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('need-anything-else')}</CardTitle>
        <CardDescription>{t('billing-assistance-message')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" size="sm">
          <a
            href={process.env.NEXT_PUBLIC_SUPPORT_URL || ''}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('contact-support')}
            <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default Help;
