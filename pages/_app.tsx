import app from '@/lib/app';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import type { AppPropsWithLayout } from 'types';
import mixpanel from 'mixpanel-browser';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

import '@boxyhq/react-ui/dist/react-ui.css';
import '../styles/globals.css';
import { useEffect } from 'react';
import env from '@/lib/env';
import { Theme, applyTheme } from '@/lib/theme';
import { AccountLayout } from '@/components/layouts';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const { session, ...props } = pageProps;

  // Add mixpanel
  useEffect(() => {
    if (env.mixpanel.token) {
      mixpanel.init(env.mixpanel.token, {
        debug: true,
        ignore_dnt: true,
        track_pageview: true,
      });
    }

    if (env.darkModeEnabled) {
      applyTheme(localStorage.getItem('theme') as Theme);
    }
  }, []);

  const getLayout =
    Component.getLayout || ((page) => <AccountLayout>{page}</AccountLayout>);

  return (
    <>
      <Head>
        <title>{app.name}</title>
        <link rel="icon" href="https://boxyhq.com/img/favicon.ico" />
      </Head>
      <SessionProvider session={session}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <div className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden antialiased`}>
            <Toaster toastOptions={{ duration: 4000 }} />
            {getLayout(<Component {...props} />)}
          </div>
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}

export default appWithTranslation<never>(MyApp);
