import { useMemo } from 'react';
import { ConfigProvider, theme as antdTheme, type ThemeConfig } from 'antd';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

interface Props {
  children: React.ReactNode;
}

const AntdThemeBridge = ({ children }: Props) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const config = useMemo<ThemeConfig>(
    () => ({
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: '#2563eb',
        borderRadius: 6,
      },
      components: {
        Layout: {
          bodyBg: isDark ? '#0f172a' : '#f5f5f5',
        },
      },
    }),
    [isDark]
  );

  return <ConfigProvider theme={config}>{children}</ConfigProvider>;
};

export const AppThemeProvider = ({ children }: Props) => (
  <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
    <AntdThemeBridge>{children}</AntdThemeBridge>
  </NextThemesProvider>
);
