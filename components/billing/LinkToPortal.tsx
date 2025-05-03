import toast from 'react-hot-toast';
import { Button } from '@/lib/components/ui/button';
import { useState } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/lib/components/ui/card';
import { Team } from '@prisma/client';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';

interface LinkToPortalProps {
  team: Team;
}

const LinkToPortal = ({ team }: LinkToPortalProps) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('common');

  const openStripePortal = async () => {
    setLoading(true);

    const response = await fetch(
      `/api/teams/${team.slug}/payments/create-portal-link`,
      {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'same-origin',
      }
    );

    const result = (await response.json()) as ApiResponse<{ url: string }>;

    if (!response.ok) {
      toast.error(result.error.message);
      return;
    }

    setLoading(false);
    window.open(result.data.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('manage-subscription')}</CardTitle>
        <CardDescription>{t('manage-billing-information')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={openStripePortal}
        >
          {t('billing-portal')}
          <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LinkToPortal;
