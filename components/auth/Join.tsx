import { useRef, useState } from 'react';
import { defaultHeaders, passwordPolicies } from '@/lib/common';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import GoogleReCAPTCHA from '../shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import { maxLengthPolicies } from '@/lib/common';
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
import AgreeMessage from './AgreeMessage';

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(maxLengthPolicies.name),
  email: z.string().email().max(maxLengthPolicies.email),
  password: z.string()
    .min(passwordPolicies.minLength, { 
      message: `Password must be at least ${passwordPolicies.minLength} characters` 
    })
    .max(maxLengthPolicies.password),
  team: z.string().min(3, { message: "Team name must be at least 3 characters" }).max(maxLengthPolicies.team),
});

type FormValues = z.infer<typeof formSchema>;

interface JoinProps {
  recaptchaSiteKey: string | null;
}

const Join = ({ recaptchaSiteKey }: JoinProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      team: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const response = await fetch('/api/auth/join', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        ...values,
        recaptchaToken,
      }),
    });

    const json = (await response.json()) as ApiResponse<{
      confirmEmail: boolean;
    }>;

    recaptchaRef.current?.reset();

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    form.reset();

    if (json.data.confirmEmail) {
      router.push('/auth/verify-email');
    } else {
      toast.success(t('successfully-joined'));
      router.push('/auth/login');
    }
  };

  return (
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
        
        <FormField
          control={form.control}
          name="team"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('team')}</FormLabel>
              <FormControl>
                <Input placeholder={t('team-name')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={t('email-placeholder')} {...field} />
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
          siteKey={recaptchaSiteKey}
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
  );
};

export default Join;
