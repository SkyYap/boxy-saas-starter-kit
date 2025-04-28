import {
  Error,
  Loading,
  WithLoadingAndError,
} from '@/components/shared';
import {
  defaultHeaders,
  maxLengthPolicies,
  passwordPolicies,
} from '@/lib/common';
import useInvitation from 'hooks/useInvitation';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { useRef, useState, useEffect } from 'react';
import AgreeMessage from './AgreeMessage';
import GoogleReCAPTCHA from '../shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

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

interface JoinWithInvitationProps {
  inviteToken: string;
  recaptchaSiteKey: string | null;
}

// Define schema outside component to avoid re-creation on renders
const createFormSchema = (sentViaEmail: boolean) => 
  z.object({
    name: z.string().min(1, { message: "Name is required" }).max(maxLengthPolicies.name),
    password: z.string()
      .min(passwordPolicies.minLength, { 
        message: `Password must be at least ${passwordPolicies.minLength} characters` 
      })
      .max(maxLengthPolicies.password),
    email: sentViaEmail
      ? z.string().optional()
      : z.string().email({ message: "Valid email is required" }).max(maxLengthPolicies.email),
  });

type FormValues = {
  name: string;
  email?: string;
  password: string;
};

const JoinWithInvitation = ({
  inviteToken,
  recaptchaSiteKey,
}: JoinWithInvitationProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const { isLoading, error, invitation } = useInvitation();
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const formSchema = createFormSchema(invitation?.sentViaEmail || false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  });
  
  // Update form values when invitation loads
  useEffect(() => {
    if (invitation && invitation.email) {
      form.setValue('email', invitation.email);
    }
  }, [invitation, form]);

  const onSubmit = async (values: FormValues) => {
    const response = await fetch('/api/auth/join', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        ...values,
        recaptchaToken,
        inviteToken,
        sentViaEmail: invitation?.sentViaEmail || false,
      }),
    });

    const json = (await response.json()) as ApiResponse;

    recaptchaRef.current?.reset();

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    form.reset();
    toast.success(t('successfully-joined'));
    router.push(`/auth/login?token=${inviteToken}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !invitation) {
    return <Error message={error.message} />;
  }

  return (
    <WithLoadingAndError isLoading={isLoading} error={error}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('your-name')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {invitation.sentViaEmail ? (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input type="email" value={invitation.email || ''} disabled />
              </FormControl>
            </FormItem>
          ) : (
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
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
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
            siteKey={recaptchaSiteKey || ''}
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={form.formState.isSubmitting}
          >
            {t('create-account')}
          </Button>
          
          <AgreeMessage text={t('create-account')} />
        </form>
      </Form>
    </WithLoadingAndError>
  );
};

export default JoinWithInvitation;
