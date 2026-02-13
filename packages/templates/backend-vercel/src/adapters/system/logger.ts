import type { LoggerPort } from "../../../core/ports/logger";

export const consoleLogger: LoggerPort = {
  info: (message) => console.log(message),
  warn: (message) => console.warn(message),
  error: (message) => console.error(message)
};
