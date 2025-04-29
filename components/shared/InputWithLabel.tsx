import React from 'react';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { cn } from '@/lib/utils';

interface InputWithLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string | React.ReactNode;
  error?: string;
  descriptionText?: string;
}

const InputWithLabel = (props: InputWithLabelProps) => {
  const { label, error, descriptionText, className, ...rest } = props;

  return (
    <div className="w-full space-y-2">
      {typeof label === 'string' ? (
        <Label htmlFor={rest.id || rest.name}>{label}</Label>
      ) : (
        label
      )}
      <Input 
        className={cn(error && "border-destructive", className)} 
        {...rest} 
      />
      {(error || descriptionText) && (
        <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
          {error || descriptionText}
        </p>
      )}
    </div>
  );
};

export default InputWithLabel;
