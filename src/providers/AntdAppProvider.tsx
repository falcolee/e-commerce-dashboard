import { App as AntdApp } from "antd";
import { useEffect } from "react";
import { setAntdMessageApi } from "@/lib/antdApp";

interface Props {
  children: React.ReactNode;
}

const AntdAppBridge = ({ children }: Props) => {
  const { message } = AntdApp.useApp();

  // Ensure `@/lib/antdApp` always uses the contextual message API (avoids antd warning
  // about static message functions not consuming theme/context).
  setAntdMessageApi(message);

  useEffect(() => () => setAntdMessageApi(null), []);

  return children;
};

export const AntdAppProvider = ({ children }: Props) => (
  <AntdApp>
    <AntdAppBridge>{children}</AntdAppBridge>
  </AntdApp>
);
