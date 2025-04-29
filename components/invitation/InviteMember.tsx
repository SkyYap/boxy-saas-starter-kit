import React from 'react';
import { useTranslation } from 'next-i18next';
import type { Team } from '@prisma/client';
import InviteViaEmail from './InviteViaEmail';
import InviteViaLink from './InviteViaLink';
import { Separator } from '@/lib/components/ui/separator';
import Modal from '../shared/Modal';

interface InviteMemberProps {
  team: Team;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const InviteMember = ({ visible, setVisible, team }: InviteMemberProps) => {
  const { t } = useTranslation('common');

  return (
    <Modal open={visible} close={() => setVisible(false)}>
      <Modal.Header>{t('invite-new-member')}</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <InviteViaEmail setVisible={setVisible} team={team} />
          <Separator className="my-2" />
          <InviteViaLink team={team} />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default InviteMember;
