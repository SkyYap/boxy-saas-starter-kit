import { AuthLayout } from '@/components/layouts';
import { InputWithLabel, Loading } from '@/components/shared';
import env from '@/lib/env';
import { useFormik } from 'formik';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type ReactElement, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';
import * as Yup from 'yup';
import Head from 'next/head';
import { maxLengthPolicies } from '@/lib/common';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Separator } from '@/lib/components/ui/separator';

const SSO: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ jacksonProductId }) => {
  const { t } = useTranslation('common');
  const { status } = useSession();
  const router = useRouter();
  const [useEmail, setUseEmail] = useState(true);

  const formik = useFormik({
    initialValues: {
      slug: '',
      email: '',
    },
    validationSchema: Yup.object().shape(
      useEmail
        ? {
            email: Yup.string()
              .email()
              .required('Email is required')
              .max(maxLengthPolicies.email),
          }
        : {
            slug: Yup.string()
              .required('Team slug is required')
              .max(maxLengthPolicies.slug),
          }
    ),
    onSubmit: async (values) => {
      const response = await fetch('/api/auth/sso/verify', {
        method: 'POST',
        body: JSON.stringify(values),
      });

      const { data, error } = await response.json();

      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.useSlug) {
        formik.resetForm();
        setUseEmail(false);
        toast.error(t('multiple-sso-teams'));
        return;
      }
      await signIn('boxyhq-saml', undefined, {
        tenant: data.teamId,
        product: jacksonProductId,
      });
    },
  });

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    router.push(env.redirectIfAuthenticated);
  }

  return (
    <>
      <Head>
        <title>{t('signin-with-saml-sso')}</title>
      </Head>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {useEmail ? (
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="user@boxyhq.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  className={formik.touched.email && formik.errors.email ? "border-destructive" : ""}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-destructive">{formik.errors.email}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="slug">{t('team-slug')}</Label>
                <Input
                  id="slug"
                  type="text"
                  name="slug"
                  placeholder="boxyhq"
                  value={formik.values.slug}
                  onChange={formik.handleChange}
                  className={formik.touched.slug && formik.errors.slug ? "border-destructive" : ""}
                />
                {formik.touched.slug && formik.errors.slug && (
                  <p className="text-xs text-destructive">{formik.errors.slug}</p>
                )}
                <p className="text-xs text-muted-foreground">{t('contact-admin-for-slug')}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={formik.isSubmitting || !formik.dirty}
            >
              {t('continue-with-saml-sso')}
            </Button>
          </form>
          <Separator className="my-6" />
          <div className="flex flex-col space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">{t('sign-in-with-password')}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/magic-link">{t('sign-in-with-email')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

SSO.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout
      heading="signin-with-saml-sso"
      description="desc-signin-with-saml-sso"
    >
      {page}
    </AuthLayout>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      jacksonProductId: env.jackson.productId,
    },
  };
}

export default SSO;
