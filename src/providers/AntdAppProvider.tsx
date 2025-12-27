import { App as AntdApp } from "antd";
import { useEffect } from "react";
import { setAntdMessageApi } from "@/lib/antdApp";

interface Props {
  children: React.ReactNode;
}

const AntdAppBridge = ({ children }: Props) => {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    setAntdMessageApi(message);
    return () => setAntdMessageApi(null);
  }, [message]);

  return children;
};

export const AntdAppProvider = ({ children }: Props) => (
  <AntdApp>
    <AntdAppBridge>{children}</AntdAppBridge>
  </AntdApp>
);

