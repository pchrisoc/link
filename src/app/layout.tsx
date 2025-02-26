// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';

export const metadata = {
  title: 'pchrisoc.com',
  description: 'shorten links',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        style={{
          background:
            'url("/background.jpg") no-repeat center center fixed',
          backgroundSize: 'cover',
        }}
      >
        <MantineProvider
          theme={{ colorScheme: 'light' } as any}
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}