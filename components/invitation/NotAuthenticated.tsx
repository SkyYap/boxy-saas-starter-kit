import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Button } from '@/lib/components/ui/button';
import { Invitation } from '@prisma/client';

interface NotAuthenticatedProps {
  invitation: Invitation;
}

const NotAuthenticated = ({ invitation }: NotAuthenticatedProps) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  return (
    <>
      <h3 className="text-center">{t('invite-create-account')}</h3>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          router.push(`/auth/join?token=${invitation.token}`);
        }}
      >
        {t('create-a-new-account')}
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          router.push(`/auth/login?token=${invitation.token}`);
        }}
      >
        {t('login')}
      </Button>
    </>
  );
};

export default NotAuthenticated;
