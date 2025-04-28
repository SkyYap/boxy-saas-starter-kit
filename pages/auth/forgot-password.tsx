import { AuthLayout } from '@/components/layouts';
import { defaultHeaders, maxLengthPolicies } from '@/lib/common';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Link from 'next/link';
import { useRef, type ReactElement, useState } from 'react';
import toast from 'react-hot-toast';
import type { ApiResponse, NextPageWithLayout } from 'types';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import env from '@/lib/env';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { Card, CardContent } from '@/lib/components/ui/card';

const formSchema = z.object({
  email: z.string().email({ message: "Valid email is required" }).max(maxLengthPolicies.email),
});

type FormValues = z.infer<typeof formSchema>;

const ForgotPassword: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ recaptchaSiteKey }) => {
  const { t } = useTranslation('common');
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        ...values,
        recaptchaToken,
      }),
    });

    const json = (await response.json()) as ApiResponse;

    form.reset();
    recaptchaRef.current?.reset();

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('password-reset-link-sent'));
  };

  return (
    <>
      <Head>
        <title>{t('forgot-password-title')}</title>
      </Head>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <GoogleReCAPTCHA
                recaptchaRef={recaptchaRef}
                onChange={setRecaptchaToken}
                siteKey={recaptchaSiteKey || ''}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={form.formState.isSubmitting}
              >
                {t('email-password-reset-link')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground mt-3">
        {t('already-have-an-account')}{' '}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:text-primary/90"
        >
          {t('sign-in')}
        </Link>
      </p>
    </>
  );
};

ForgotPassword.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout heading="reset-password">{page}</AuthLayout>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      recaptchaSiteKey: env.recaptcha.siteKey,
    },
  };
};

export default ForgotPassword;
