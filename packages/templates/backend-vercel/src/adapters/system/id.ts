import type { IdPort } from "../../../core/ports/id";

export const cryptoId: IdPort = {
  next: () => crypto.randomUUID()
};
