import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const AgreeMessage = ({ text }) => {
  const { t } = useTranslation('common');

  return (
    <p className="text-sm text-center text-muted-foreground mt-2">
      {t('agree-message-part', { button: text })}{' '}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={process.env.NEXT_PUBLIC_TERMS_URL || '/terms'}
        className="font-medium text-primary hover:text-primary/90"
      >
        {t('terms')}
      </Link>{' '}
      {t('and')}{' '}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={process.env.NEXT_PUBLIC_PRIVACY_URL || '/privacy'}
        className="font-medium text-primary hover:text-primary/90"
      >
        {t('privacy')}
      </Link>
    </p>
  );
};

export default AgreeMessage;
