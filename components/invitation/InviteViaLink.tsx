import * as Yup from 'yup';
import { mutate } from 'swr';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';

import type { ApiResponse } from 'types';
import useInvitations from 'hooks/useInvitations';
import { availableRoles } from '@/lib/permissions';
import type { Team } from '@prisma/client';
import { defaultHeaders, isValidDomain, maxLengthPolicies } from '@/lib/common';
import { InputWithCopyButton } from '../shared';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import ConfirmationDialog from '../shared/ConfirmationDialog';

interface InviteViaLinkProps {
  team: Team;
}

const InviteViaLink = ({ team }: InviteViaLinkProps) => {
  const [showDelDialog, setShowDelDialog] = useState(false);
  const { t } = useTranslation('common');
  const { invitations } = useInvitations({
    slug: team.slug,
    sentViaEmail: false,
  });

  const FormValidationSchema = Yup.object().shape({
    domains: Yup.string()
      .nullable()
      .max(maxLengthPolicies.domains)
      .test(
        'domains',
        'Enter one or more valid domains, separated by commas.',
        (value) => {
          if (!value) {
            return true;
          }

          return value.split(',').every(isValidDomain);
        }
      ),
    role: Yup.string()
      .required(t('required-role'))
      .oneOf(availableRoles.map((r) => r.id)),
  });

  // Create a new invitation link
  const formik = useFormik({
    initialValues: {
      domains: '',
      role: availableRoles[0].id,
      sentViaEmail: false,
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

      mutate(`/api/teams/${team.slug}/invitations?sentViaEmail=false`);
      toast.success(t('invitation-link-created'));
      formik.resetForm();
    },
  });

  // Delete an existing invitation link
  const deleteInvitationLink = async (id: string) => {
    const response = await fetch(
      `/api/teams/${team.slug}/invitations?id=${id}`,
      {
        method: 'DELETE',
        headers: defaultHeaders,
      }
    );

    if (!response.ok) {
      const result = (await response.json()) as ApiResponse;
      toast.error(result.error.message);
      return;
    }

    mutate(`/api/teams/${team.slug}/invitations?sentViaEmail=false`);
    toast.success(t('invitation-link-deleted'));
    setShowDelDialog(false);
  };

  const invitation = invitations ? invitations[0] : null;

  if (invitation) {
    return (
      <div className="pt-4">
        <InputWithCopyButton
          label={t('share-invitation-link')}
          value={invitation.url}
          className="text-sm w-full"
        />
        <p className="text-sm text-slate-500 my-2">
          {invitation.allowedDomains.length > 0
            ? `Anyone with an email address ending with ${invitation.allowedDomains} can use this link to join your team.`
            : 'Anyone can use this link to join your team.'}
          <Button
            variant="link"
            className="text-destructive hover:text-destructive/80 p-0 h-auto text-xs"
            onClick={() => setShowDelDialog(true)}
          >
            {t('delete-link')}
          </Button>
        </p>

        <ConfirmationDialog
          visible={showDelDialog}
          onCancel={() => setShowDelDialog(false)}
          onConfirm={() => deleteInvitationLink(invitation.id)}
          title={t('delete-invitation-link')}
        >
          {t('delete-invitation-warning')}
        </ConfirmationDialog>
      </div>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit} method="POST" className="pt-4">
      <h3 className="font-medium text-[14px] pb-2">{t('invite-via-link')}</h3>
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-2">
        <div className="w-full sm:w-1/2">
          <Label htmlFor="domains" className="sr-only">
            {t('domains')}
          </Label>
          <Input
            id="domains"
            name="domains"
            onChange={formik.handleChange}
            value={formik.values.domains}
            placeholder="Restrict domain: boxyhq.com"
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
            disabled={!formik.isValid || formik.isSubmitting}
            className="w-full"
          >
            {t('create-link')}
          </Button>
        </div>
      </div>
      <p className="text-sm text-slate-500 my-2">
        {formik.values.domains && !formik.errors.domains
          ? `Anyone with an email address ending with ${formik.values.domains} can use this link to join your team.`
          : 'Anyone can use this link to join your team.'}
      </p>
    </form>
  );
};

export default InviteViaLink;
