import {
  defaultHeaders,
  maxLengthPolicies,
  passwordPolicies,
} from '@/lib/common';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { ApiResponse } from 'types';
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
import { Card, CardContent } from '@/lib/components/ui/card';

const formSchema = z.object({
  password: z.string()
    .min(passwordPolicies.minLength, {
      message: `Password must be at least ${passwordPolicies.minLength} characters`
    })
    .max(maxLengthPolicies.password),
  confirmPassword: z.string()
    .max(maxLengthPolicies.password)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const ResetPassword = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState<boolean>(false);
  const router = useRouter();
  const { t } = useTranslation('common');
  const { token } = router.query as { token: string };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({
          ...values,
          token,
        }),
      });

      const json = (await response.json()) as ApiResponse;

      if (!response.ok) {
        toast.error(json.error.message);
        return;
      }

      form.reset();
      toast.success(t('password-updated'));
      router.push('/auth/login');
    } catch (error) {
      console.error(error);
      toast.error(t('something-went-wrong'));
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('new-password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={isPasswordVisible ? 'text' : 'password'} 
                        placeholder={t('new-password')} 
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
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirm-password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={isConfirmPasswordVisible ? 'text' : 'password'} 
                        placeholder={t('confirm-password')} 
                        {...field} 
                      />
                      <button
                        type="button"
                        onClick={() => setIsConfirmPasswordVisible(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {isConfirmPasswordVisible ? (
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
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {t('reset-password')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
