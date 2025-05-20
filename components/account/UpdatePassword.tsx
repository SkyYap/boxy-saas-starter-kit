import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

import InputWithLabel from '@/components/shared/InputWithLabel';
import { defaultHeaders, passwordPolicies } from '@/lib/common';
import { maxLengthPolicies } from '@/lib/common';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';

const schema = Yup.object().shape({
  currentPassword: Yup.string().required().max(maxLengthPolicies.password),
  newPassword: Yup.string()
    .required()
    .min(passwordPolicies.minLength)
    .max(maxLengthPolicies.password),
});

const UpdatePassword = () => {
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const response = await fetch('/api/password', {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(values),
      });

      const json = await response.json();

      if (!response.ok) {
        // Try to show a user-friendly error
        let errorMsg = json.error?.message;
        if (
          errorMsg === "Illegal arguments: string, object" ||
          !errorMsg ||
          typeof errorMsg !== "string"
        ) {
          errorMsg = "Wrong current password.";
        }
        toast.error(errorMsg);
        return;
      }

      toast.success(t('successfully-updated'));
      formik.resetForm();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t('password')}</CardTitle>
          <CardDescription>{t('change-password-text')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <InputWithLabel
              type="password"
              label={t('current-password')}
              name="currentPassword"
              placeholder={t('current-password')}
              value={formik.values.currentPassword}
              error={
                formik.touched.currentPassword
                  ? formik.errors.currentPassword
                  : undefined
              }
              onChange={formik.handleChange}
              className="text-sm"
            />
            <InputWithLabel
              type="password"
              label={t('new-password')}
              name="newPassword"
              placeholder={t('new-password')}
              value={formik.values.newPassword}
              error={
                formik.touched.newPassword
                  ? formik.errors.newPassword
                  : undefined
              }
              onChange={formik.handleChange}
              className="text-sm"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            variant="default"
            disabled={!formik.dirty || !formik.isValid}
            className={formik.isSubmitting ? "opacity-70 pointer-events-none" : ""}
          >
            {formik.isSubmitting ? t('saving') : t('change-password')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UpdatePassword;
