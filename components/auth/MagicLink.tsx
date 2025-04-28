import { Loading } from '@/components/shared';
import { maxLengthPolicies } from '@/lib/common';
import env from '@/lib/env';
import useInvitation from 'hooks/useInvitation';
import { signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
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
  email: z
    .string()
    .email()
    .max(maxLengthPolicies.email),
});

type FormValues = z.infer<typeof formSchema>;

interface MagicLinkProps {
  csrfToken: string | undefined;
}

const MagicLink = ({ csrfToken }: MagicLinkProps) => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation('common');
  const { invitation } = useInvitation();

  const params = invitation ? `?token=${invitation.token}` : '';

  const callbackUrl = invitation
    ? `/invitations/${invitation.token}`
    : env.redirectIfAuthenticated;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const response = await signIn('email', {
      email: values.email,
      csrfToken,
      redirect: false,
      callbackUrl,
    });

    form.reset();

    if (response?.error) {
      toast.error(t('email-login-error'));
      return;
    }

    if (response?.status === 200 && response?.ok) {
      toast.success(t('email-login-success'));
      return;
    }
  };

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    router.push(env.redirectIfAuthenticated);
  }

  return (
    <>
      <Head>
        <title>{t('magic-link-title')}</title>
      </Head>
      <Card className="shadow-none">
        <CardContent className="pt-6 space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="jackson@boxyhq.com" 
                        {...field} 
                        className="h-12"
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      We'll email you a magic link for a password-free sign in.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit"
                className="w-full h-12 bg-gray-400 hover:bg-gray-500 text-white" 
                disabled={form.formState.isSubmitting || !form.formState.isDirty}
              >
                {t('send-magic-link')}
              </Button>
            </form>
          </Form>
          
          <div className="flex flex-col space-y-3">
            <Link href={`/auth/login/${params}`} passHref>
              <Button variant="outline" className="w-full border-gray-300">
                {t('sign-in-with-password')}
              </Button>
            </Link>
            <Link href="/auth/sso" passHref>
              <Button variant="outline" className="w-full border-gray-300">
                {t('continue-with-saml-sso')}
              </Button>
            </Link>
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

export default MagicLink;
