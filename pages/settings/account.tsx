import type { NextPageWithLayout } from 'types';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getSession } from '@/lib/session';
import { getUserBySession } from 'models/user';
import { UpdateAccount } from '@/components/account';
import env from '@/lib/env';
import UpdatePassword from '@/components/account/UpdatePassword';
import ManageSessions from '@/components/account/ManageSessions';

type AccountProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Account: NextPageWithLayout<AccountProps> = ({
  user,
  sessionStrategy,
}) => {
  return (
    <>
      <UpdateAccount user={user} allowEmailChange={env.confirmEmail === false} />
      <div className="flex flex-col space-y-6 mt-8">
        <UpdatePassword />
        {sessionStrategy === 'database' && <ManageSessions />}
      </div>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await getUserBySession(session);
  const { locale } = context;
  const { sessionStrategy } = env.nextAuth;

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      sessionStrategy,
    },
  };
};

export default Account;
