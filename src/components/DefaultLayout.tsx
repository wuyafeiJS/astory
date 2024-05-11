import Head from 'next/head';
import type { ReactNode } from 'react';
import { Inter as FontSans } from 'next/font/google';

import { cn } from '@/utils/shadcn';
type DefaultLayoutProps = { children: ReactNode };
const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});
export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <>
      <Head>
        <title>Prisma Starter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        className={cn(
          'min-h-screen bg-background font-sans antialiased ',
          fontSans.variable,
        )}
      >
        {children}
      </main>
    </>
  );
};
