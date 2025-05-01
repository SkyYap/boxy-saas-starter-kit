import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { cn } from '@/lib/utils';
import { CopyToClipboardButton } from '@/components/shared';

interface InputWithCopyButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

const InputWithCopyButton = (props: InputWithCopyButtonProps) => {
  const { label, value, description, className, ...rest } = props;
  const id = label.replace(/ /g, '');

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={id}>{label}</Label>
        <CopyToClipboardButton value={value?.toString() || ''} />
      </div>
      <Input
        id={id}
        className={cn('text-sm', className)}
        {...rest}
        value={value}
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default InputWithCopyButton;
