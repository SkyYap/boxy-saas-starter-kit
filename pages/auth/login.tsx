import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';

import * as z from 'zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { type ReactElement, useEffect, useState, useRef } from 'react';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import env from '@/lib/env';
import type { NextPageWithLayout } from 'types';
import { AuthLayout } from '@/components/layouts';
import GithubButton from '@/components/auth/GithubButton';
import GoogleButton from '@/components/auth/GoogleButton';
import { Loading } from '@/components/shared';
import { authProviderEnabled } from '@/lib/auth';
import Head from 'next/head';
import AgreeMessage from '@/components/auth/AgreeMessage';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import { maxLengthPolicies } from '@/lib/common';
import { cn } from '@/lib/utils';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/lib/components/ui/form';
import { Input } from '@/lib/components/ui/input';
import { Button } from '@/lib/components/ui/button';
import { Separator } from '@/lib/components/ui/separator';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';

const formSchema = z.object({
  email: z
    .string()
    .email()
    .max(maxLengthPolicies.email),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(maxLengthPolicies.password),
});

type FormValues = z.infer<typeof formSchema>;

interface Message {
  text: string | null;
  status: 'error' | 'success' | null;
}

const Login: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken, authProviders, recaptchaSiteKey }) => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation('common');
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [message, setMessage] = useState<Message>({ text: null, status: null });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const { error, success, token } = router.query as {
    error: string;
    success: string;
    token: string;
  };

  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }

    if (success) {
      setMessage({ text: success, status: 'success' });
    }
  }, [error, success]);

  const redirectUrl = token
    ? `/invitations/${token}`
    : env.redirectIfAuthenticated;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const { email, password } = values;

    setMessage({ text: null, status: null });

    const response = await signIn('credentials', {
      email,
      password,
      csrfToken,
      redirect: false,
      callbackUrl: redirectUrl,
      recaptchaToken,
    });

    form.reset();
    recaptchaRef.current?.reset();

    if (response && !response.ok) {
      setMessage({ text: response.error, status: 'error' });
      return;
    }
  };

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    router.push(redirectUrl);
  }

  const params = token ? `?token=${token}` : '';

  return (
    <>
      <Head>
        <title>{t('login-title')}</title>
      </Head>
      {message.text && message.status && (
        <Alert variant={message.status === 'error' ? 'destructive' : 'default'} className="mb-5">
          <AlertDescription>{t(message.text)}</AlertDescription>
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t('email')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>{t('password')}</FormLabel>
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs text-primary hover:text-primary/90"
                        >
                          {t('forgot-password')}
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={isPasswordVisible ? 'text' : 'password'}
                            placeholder={t('password')} 
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setIsPasswordVisible(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                          >
                            {isPasswordVisible ? (
                              <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <EyeIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <GoogleReCAPTCHA
                  recaptchaRef={recaptchaRef}
                  onChange={setRecaptchaToken}
                  siteKey={recaptchaSiteKey}
                />
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {t('sign-in')}
                </Button>
                <AgreeMessage text={t('sign-in')} />
              </form>
            </Form>
          )}

          {(authProviders.email || authProviders.saml) && (
            <Separator className="my-4" />
          )}

          <div className="space-y-3 mt-3">
            {authProviders.email && (
              <Link href={`/auth/magic-link${params}`} passHref>
                <Button variant="outline" className="w-full">
                  {t('sign-in-with-email')}
                </Button>
              </Link>
            )}

            {authProviders.saml && (
              <Link href="/auth/sso" passHref>
                <Button variant="outline" className="w-full">
                  {t('continue-with-saml-sso')}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground mt-3">
        {t('dont-have-an-account')}{' '}
        <Link
          href={`/auth/join${params}`}
          className="font-medium text-primary hover:text-primary/90"
        >
          {t('create-a-free-account')}
        </Link>
      </p>
    </>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="welcome-back" description="log-in-to-account">
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
      csrfToken: await getCsrfToken(context),
      authProviders: authProviderEnabled(),
      recaptchaSiteKey: env.recaptcha.siteKey,
    },
  };
};

export default Login;
