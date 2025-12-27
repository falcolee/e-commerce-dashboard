import { message as staticMessage } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

let messageApi: MessageInstance | null = null;

export function setAntdMessageApi(api: MessageInstance | null) {
  messageApi = api;
}

export const message = {
  open: (...args: Parameters<typeof staticMessage.open>) =>
    (messageApi ?? staticMessage).open(...args),
  success: (...args: Parameters<typeof staticMessage.success>) =>
    (messageApi ?? staticMessage).success(...args),
  error: (...args: Parameters<typeof staticMessage.error>) =>
    (messageApi ?? staticMessage).error(...args),
  info: (...args: Parameters<typeof staticMessage.info>) =>
    (messageApi ?? staticMessage).info(...args),
  warning: (...args: Parameters<typeof staticMessage.warning>) =>
    (messageApi ?? staticMessage).warning(...args),
  loading: (...args: Parameters<typeof staticMessage.loading>) =>
    (messageApi ?? staticMessage).loading(...args),
  destroy: (...args: Parameters<typeof staticMessage.destroy>) =>
    (messageApi ?? staticMessage).destroy(...args),
  config: (...args: Parameters<typeof staticMessage.config>) =>
    (messageApi ?? staticMessage).config(...args),
};

