import React from 'react';
import { Alert } from '@/lib/components/ui/alert';

const CustomAlert = ({ children, className, ...rest }) => {
  return (
    <Alert className={className} {...rest}>
      {children}
    </Alert>
  );
};

export default CustomAlert;
