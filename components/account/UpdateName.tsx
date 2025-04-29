import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { User } from '@prisma/client';

import type { ApiResponse } from 'types';
import { defaultHeaders } from '@/lib/common';
import { updateAccountSchema } from '@/lib/zod';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/lib/components/ui/card';
import { Input } from '@/lib/components/ui/input';
import { Button } from '@/lib/components/ui/button';

const UpdateName = ({ user }: { user: Partial<User> }) => {
  const { t } = useTranslation('common');
  const { update } = useSession();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: user.name,
    },
    validateOnBlur: false,
    enableReinitialize: true,
    validate: (values) => {
      try {
        updateAccountSchema.parse(values);
      } catch (error: any) {
        return error.formErrors.fieldErrors;
      }
    },
    onSubmit: async (values) => {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const json = (await response.json()) as ApiResponse;
        toast.error(json.error.message);
        return;
      }

      await update({
        name: values.name,
      });

      router.replace('/settings/account');
      toast.success(t('successfully-updated'));
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t('name')}</CardTitle>
          <CardDescription>{t('name-appearance')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            name="name"
            placeholder={t('your-name')}
            value={formik.values.name}
            onChange={formik.handleChange}
            className="w-full max-w-md"
            required
          />
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            variant="default"
            disabled={!formik.dirty || !formik.isValid}
            className={formik.isSubmitting ? "opacity-70 pointer-events-none" : ""}
          >
            {formik.isSubmitting ? t('saving') : t('save-changes')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UpdateName;
