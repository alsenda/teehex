export type LoggerPort = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
};
