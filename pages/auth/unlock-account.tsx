import type { GetServerSidePropsContext } from 'next';
import { useState, type ReactElement, useEffect } from 'react';
import { useTranslation } from 'next-i18next';

import { AuthLayout } from '@/components/layouts';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';

import {
  deleteVerificationToken,
  getVerificationToken,
  isVerificationTokenExpired,
} from 'models/verificationToken';
import { defaultHeaders } from '@/lib/common';
import { unlockAccount } from '@/lib/accountLock';
import { getUser } from 'models/user';

interface UnlockAccountProps {
  email: string;
  error: string;
  expiredToken: string;
  enableRequestNewToken: boolean;
}

interface Message {
  text: string | null;
  status: 'error' | 'success' | null;
}

const UnlockAccount = ({
  email,
  error,
  expiredToken,
  enableRequestNewToken,
}: UnlockAccountProps) => {
  const [loading, setLoading] = useState(false);
  const [displayResendLink, setDisplayResendLink] = useState(false);
  const [message, setMessage] = useState<Message>({ text: null, status: null });
  const { t } = useTranslation('common');

  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }
  }, [error]);

  useEffect(() => {
    if (enableRequestNewToken) {
      setDisplayResendLink(true);
    }
  }, [enableRequestNewToken]);

  const requestNewLink = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/auth/unlock-account`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ email, expiredToken }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error.message);
      }

      setMessage({
        text: t('unlock-account-link-sent'),
        status: 'success',
      });
    } catch (error: any) {
      setMessage({ text: error.message, status: 'error' });
    } finally {
      setLoading(false);
      setDisplayResendLink(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {message.text && message.status && (
          <Alert variant={message.status === 'error' ? 'destructive' : 'default'} className="mb-5">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {displayResendLink && (
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={requestNewLink}
            disabled={loading}
          >
            {t('request-new-link')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

UnlockAccount.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout heading="unlock-account">{page}</AuthLayout>;
};

export const getServerSideProps = async ({
  query,
}: GetServerSidePropsContext) => {
  const { token } = query as { token: string };

  if (!token) {
    return {
      notFound: true,
    };
  }

  const verificationToken = await getVerificationToken(token);

  if (!verificationToken) {
    return {
      props: {
        error:
          'The link is invalid or has already been used. Please contact support if you need further assistance.',
        enableRequestNewToken: false,
        email: null,
        expiredToken: null,
      },
    };
  }

  const user = await getUser({ email: verificationToken.identifier });

  if (!user) {
    return {
      notFound: true,
    };
  }

  if (isVerificationTokenExpired(verificationToken)) {
    return {
      props: {
        error:
          'The link has expired. Please request a new one if you still need to unlock your account.',
        enableRequestNewToken: true,
        email: verificationToken.identifier,
        expiredToken: verificationToken.token,
      },
    };
  }

  await Promise.allSettled([
    unlockAccount(user),
    deleteVerificationToken(verificationToken.token),
  ]);

  return {
    redirect: {
      destination: '/auth/login?success=account-unlocked',
      permanent: false,
    },
  };
};

export default UnlockAccount;
