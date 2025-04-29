import React from 'react';
import * as Yup from 'yup';
import { mutate } from 'swr';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';

import type { ApiResponse } from 'types';
import { defaultHeaders, maxLengthPolicies } from '@/lib/common';
import { availableRoles } from '@/lib/permissions';
import type { Team } from '@prisma/client';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';

interface InviteViaEmailProps {
  team: Team;
  setVisible: (visible: boolean) => void;
}

const InviteViaEmail = ({ setVisible, team }: InviteViaEmailProps) => {
  const { t } = useTranslation('common');

  const FormValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email()
      .max(maxLengthPolicies.email)
      .required(t('require-email')),
    role: Yup.string()
      .required(t('required-role'))
      .oneOf(availableRoles.map((r) => r.id)),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      role: availableRoles[0].id,
      sentViaEmail: true,
    },
    validationSchema: FormValidationSchema,
    onSubmit: async (values) => {
      const response = await fetch(`/api/teams/${team.slug}/invitations`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const result = (await response.json()) as ApiResponse;
        toast.error(result.error.message);
        return;
      }

      toast.success(t('invitation-sent'));
      mutate(`/api/teams/${team.slug}/invitations?sentViaEmail=true`);
      setVisible(false);
      formik.resetForm();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} method="POST" className="pb-6">
      <h3 className="font-medium text-[14px] pb-2">{t('invite-via-email')}</h3>
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-2">
        <div className="w-full sm:w-1/2">
          <Label htmlFor="email" className="sr-only">
            {t('email')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            onChange={formik.handleChange}
            value={formik.values.email}
            placeholder="jackson@boxyhq.com"
            required
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-1/3">
          <select
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm appearance-none"
            name="role"
            onChange={formik.handleChange}
            value={formik.values.role}
            required
            style={{ minWidth: "100px" }}
          >
            {availableRoles.map((role) => (
              <option value={role.id} key={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-1/6">
          <Button
            type="submit"
            disabled={!formik.isValid || !formik.dirty || formik.isSubmitting}
            className="w-full"
          >
            {t('send-invite')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default InviteViaEmail;
