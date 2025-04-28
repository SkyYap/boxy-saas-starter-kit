import { AuthLayout } from '@/components/layouts';
import { defaultHeaders } from '@/lib/common';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, type ReactElement, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { ApiResponse, NextPageWithLayout } from 'types';
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
import { Alert, AlertDescription } from '@/lib/components/ui/alert';

const formSchema = z.object({
  email: z.string().email({ message: "Valid email is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface Message {
  text: string | null;
  status: 'error' | 'success' | null;
}

const VerifyAccount: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [message, setMessage] = useState<Message>({
    text: null,
    status: null,
  });

  const { error } = router.query as { error: string };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });
  
  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }
  }, [router, router.query, error]);

  const onSubmit = async (values: FormValues) => {
    const response = await fetch('/api/auth/resend-email-token', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(values),
    });

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    form.reset();
    toast.success(t('verify-account-link-sent'));
    router.push('/auth/verify-email');
  };

  return (
    <>
      <Head>
        <title>{t('resend-token-title')}</title>
      </Head>
      {message.text && message.status && (
        <Alert variant={message.status === 'error' ? 'destructive' : 'default'} className="mb-5">
          <AlertDescription>{t(message.text)}</AlertDescription>
        </Alert>
      )}
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
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {t('resend-link')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

VerifyAccount.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout heading="verify-your-account">{page}</AuthLayout>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default VerifyAccount;
