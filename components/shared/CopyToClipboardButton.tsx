import { copyToClipboard } from '@/lib/common';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { Button } from '@/lib/components/ui/button';
import { toast } from 'react-hot-toast';

interface CopyToClipboardProps {
  value: string;
}

const CopyToClipboardButton = ({ value }: CopyToClipboardProps) => {
  const { t } = useTranslation('common');

  const handleCopy = () => {
    copyToClipboard(value);
    toast.success(t('copied-to-clipboard'));
  };

  return (
    <Button
      variant="link"
      size="icon"
      className="p-0 h-6 w-6"
      title={t('copy-to-clipboard')}
      type="button"
      onClick={handleCopy}
    >
      <ClipboardDocumentIcon className="w-5 h-5 text-muted-foreground" />
    </Button>
  );
};

export default CopyToClipboardButton;
