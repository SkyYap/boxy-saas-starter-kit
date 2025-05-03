import { Badge as ShadcnBadge } from '@/lib/components/ui/badge';

const Badge = (props) => {
  const { children, className, ...rest } = props;
  return (
    <ShadcnBadge className={className} {...rest}>
      {children}
    </ShadcnBadge>
  );
};

export default Badge;
