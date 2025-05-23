import { eventTypes } from '@/lib/common';
import React, { ReactElement } from 'react';
import type { WebhookFormSchema } from 'types';
import { Checkbox } from '../shared';

const EventTypes = ({
  onChange,
  values,
  error,
}: {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  values: WebhookFormSchema['eventTypes'];
  error: string | string[] | undefined;
}) => {
  const events: ReactElement[] = [];

  eventTypes.forEach((eventType) => {
    events.push(
      <Checkbox
        name="eventTypes"
        value={eventType}
        onCheckedChange={onChange}
        label={eventType}
        checked={values ? values.includes(eventType) : false}
      />
    );
  });

  return (
    <>
      {events}
      {error && typeof error === 'string' && (
        <div className="text-xs text-destructive">{error}</div>
      )}
    </>
  );
};

export default EventTypes;
