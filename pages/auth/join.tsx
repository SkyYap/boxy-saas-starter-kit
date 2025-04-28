import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { type ReactElement, useEffect } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import type { NextPageWithLayout } from 'types';
import { authProviderEnabled } from '@/lib/auth';
import { AuthLayout } from '@/components/layouts';
import GithubButton from '@/components/auth/GithubButton';
import GoogleButton from '@/components/auth/GoogleButton';
import { JoinWithInvitation, Join } from '@/components/auth';
import Head from 'next/head';
import { Loading } from '@/components/shared';
import env from '@/lib/env';

import { Card, CardContent } from '@/lib/components/ui/card';
import { Separator } from '@/lib/components/ui/separator';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';

const Signup: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ authProviders, recaptchaSiteKey }) => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation('common');

  const { error, token } = router.query as {
    error: string;
    token: string;
  };

  useEffect(() => {
    if (error) {
      toast.error(t(error));
    }
  }, [error, t]);

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    router.push(env.redirectIfAuthenticated);
  }

  const params = token ? `?token=${token}` : '';

  return (
    <>
      <Head>
        <title>{t('sign-up-title')}</title>
      </Head>
      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>{t(error)}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            {authProviders.github && <GithubButton />}
            {authProviders.google && <GoogleButton />}
          </div>

          {(authProviders.github || authProviders.google) &&
            authProviders.credentials && (
              <div className="relative my-4">
                <Separator className="my-4" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card px-2 text-muted-foreground text-sm">
                    {t('or')}
                  </span>
                </div>
              </div>
            )}

          {authProviders.credentials && (
            <>
              {token ? (
                <JoinWithInvitation
                  inviteToken={token}
                  recaptchaSiteKey={recaptchaSiteKey}
                />
              ) : (
                <Join recaptchaSiteKey={recaptchaSiteKey} />
              )}
            </>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground mt-3">
        {t('already-have-an-account')}{' '}
        <Link
          href={`/auth/login/${params}`}
          className="font-medium text-primary hover:text-primary/90"
        >
          {t('sign-in')}
        </Link>
      </p>
    </>
  );
};

Signup.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="get-started" description="create-a-new-account">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      authProviders: authProviderEnabled(),
      recaptchaSiteKey: env.recaptcha.siteKey,
    },
  };
};

export default Signup;
