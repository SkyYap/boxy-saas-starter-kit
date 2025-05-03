import React from 'react';
import { Checkbox as ShadcnCheckbox } from '@/lib/components/ui/checkbox';

const CheckboxComponent = ({
  onCheckedChange,
  name,
  value,
  label,
  checked,
  className,
}: {
  onCheckedChange: React.ChangeEventHandler<HTMLInputElement>;
  name: string;
  value: string;
  label: string;
  checked: boolean;
  className?: string;
}) => {
  return (
    <div className={`flex items-center ${className || ''}`} key={value}>
      <label className="flex items-center gap-2 text-sm">
        <ShadcnCheckbox
          name={name}
          value={value}
          onCheckedChange={onCheckedChange}
          checked={checked}
          className="h-4 w-4 rounded"
        />
        <span className="text-gray-700">{label}</span>
      </label>
    </div>
  );
};

export default CheckboxComponent;
