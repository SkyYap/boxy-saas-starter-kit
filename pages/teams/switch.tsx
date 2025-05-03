import { AuthLayout } from '@/components/layouts';
import { getSession } from '@/lib/session';
import { deleteCookie } from 'cookies-next';
import { getTeams } from 'models/team';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { type ReactElement, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';
import type { TeamWithMemberCount } from 'types/base';
import { Card, CardHeader, CardTitle, CardContent } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import LetterAvatar from '@/components/shared/LetterAvatar';
import Link from 'next/link';

const Organizations: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teams }: { teams: TeamWithMemberCount[] | null }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (teams === null) {
      toast.error(t('no-active-team'));
      return;
    }
    if (teams && teams.length === 1) {
      // If only one team, auto-select
      router.push(`/teams/${teams[0].slug}/settings`);
    }
  }, [teams, t, router]);

  const handleSelectTeam = (slug: string) => {
    router.push(`/teams/${slug}/settings`);
  };

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('choose-team')}</CardTitle>
        </CardHeader>
        <CardContent>
          {(!teams || teams.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              {t('no-active-team')}
            </div>
          )}
          {teams && teams.length > 0 && (
            <div className="space-y-2">
              {teams.map((team) => (
                <Button
                  key={team.id}
                  variant="outline"
                  className="w-full flex items-center justify-start gap-3"
                  onClick={() => handleSelectTeam(team.slug)}
                >
                  <LetterAvatar name={team.name} />
                  <span className="font-medium">{team.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {t('members')}: {team._count.members}
                  </span>
                </Button>
              ))}
              <div className="pt-4 border-t mt-4">
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/teams?newTeam=true">{t('create-team')}</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

Organizations.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { req, res, locale }: GetServerSidePropsContext = context;

  const session = await getSession(req, res);

  deleteCookie('pending-invite', { req, res });

  const teams = await getTeams(session?.user.id as string);

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teams: JSON.parse(JSON.stringify(teams)),
    },
  };
};

export default Organizations;
