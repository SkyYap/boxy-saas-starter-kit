import { useTranslation } from 'next-i18next';
import { Button } from '@/lib/components/ui/button';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  close: () => void;
  children: React.ReactNode;
}

interface BodyProps {
  children: React.ReactNode;
  className?: string;
}

const Modal = ({ open, close, children }: ModalProps) => {
  const { t } = useTranslation('common');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background relative rounded-lg p-6 w-full max-w-2xl max-h-[85vh] overflow-auto">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 p-0 rounded-full"
          onClick={close}
          aria-label="close"
        >
          <X className="h-4 w-4" />
        </Button>
        <div>{children}</div>
      </div>
    </div>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="font-bold text-lg mb-4">{children}</h3>;
};

const Description = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-sm text-muted-foreground pt-1">{children}</p>;
};

const Body = ({ children, className }: BodyProps) => {
  return <div className={`py-3 ${className || ''}`}>{children}</div>;
};

const Footer = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex justify-end gap-2 mt-4">{children}</div>;
};

Modal.Header = Header;
Modal.Description = Description;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;
