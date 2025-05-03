import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import InputWithLabel from '../shared/InputWithLabel';
import { defaultHeaders } from '@/lib/common';
import { Team } from '@prisma/client';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';

import { AccessControl } from '../shared/AccessControl';
import { z } from 'zod';
import { updateTeamSchema } from '@/lib/zod';
import useTeams from 'hooks/useTeams';

const TeamSettings = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { mutateTeams } = useTeams();

  const formik = useFormik<z.infer<typeof updateTeamSchema>>({
    initialValues: {
      name: team.name,
      slug: team.slug,
      domain: team.domain || '',
    },
    validateOnBlur: false,
    enableReinitialize: true,
    validate: (values) => {
      try {
        updateTeamSchema.parse(values);
      } catch (error: any) {
        return error.formErrors.fieldErrors;
      }
    },
    onSubmit: async (values) => {
      const response = await fetch(`/api/teams/${team.slug}`, {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = (await response.json()) as ApiResponse<Team>;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      toast.success(t('successfully-updated'));
      mutateTeams();
      router.push(`/teams/${json.data.slug}/settings`);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t('team-settings')}</CardTitle>
          <CardDescription>{t('team-settings-config')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <InputWithLabel
              name="name"
              label={t('team-name')}
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.errors.name}
            />
            <InputWithLabel
              name="slug"
              label={t('team-slug')}
              value={formik.values.slug}
              onChange={formik.handleChange}
              error={formik.errors.slug}
            />
            <InputWithLabel
              name="domain"
              label={t('team-domain')}
              value={formik.values.domain ? formik.values.domain : ''}
              onChange={formik.handleChange}
              error={formik.errors.domain}
            />
          </div>
        </CardContent>
        <AccessControl resource="team" actions={['update']}>
          <CardFooter>
            <div className="flex justify-end w-full">
              <Button
                type="submit"
                disabled={!formik.isValid || !formik.dirty || formik.isSubmitting}
              >
                {t('save-changes')}
              </Button>
            </div>
          </CardFooter>
        </AccessControl>
      </Card>
    </form>
  );
};

export default TeamSettings;
