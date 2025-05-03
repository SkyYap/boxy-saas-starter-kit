import { useTranslation } from 'next-i18next';

import { Service, Subscription } from '@prisma/client';

interface SubscriptionsProps {
  subscriptions: (Subscription & { product: Service })[];
}

const Subscriptions = ({ subscriptions }: SubscriptionsProps) => {
  const { t } = useTranslation('common');

  if (subscriptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-medium leading-none tracking-tight">
        {t('subscriptions')}
      </h2>
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">{t('plan')}</th>
              <th className="px-4 py-2 text-left">{t('start-date')}</th>
              <th className="px-4 py-2 text-left">{t('end-date')}</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr key={subscription.id} className="border-t">
                <td className="px-4 py-2">{subscription.id}</td>
                <td className="px-4 py-2">{subscription.product.name}</td>
                <td className="px-4 py-2">{new Date(subscription.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{new Date(subscription.endDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscriptions;
