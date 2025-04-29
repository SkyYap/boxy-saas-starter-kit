import { useTranslation } from 'next-i18next';
import { useCustomSignOut } from 'hooks/useCustomSignout';
import { Button } from '@/lib/components/ui/button';

interface EmailMismatchProps {
  email: string;
}

const EmailMismatch = ({ email }: EmailMismatchProps) => {
  const { t } = useTranslation('common');
  const signOut = useCustomSignOut();

  return (
    <>
      <p className="text-sm text-center">
        {t('email-mismatch-error', { email })}
      </p>
      <p className="text-sm text-center">
        {t('accept-invitation-email-instruction')}
      </p>
      <Button
        className="w-full"
        variant="destructive"
        onClick={signOut}
      >
        {t('logout')}
      </Button>
    </>
  );
};

export default EmailMismatch;
