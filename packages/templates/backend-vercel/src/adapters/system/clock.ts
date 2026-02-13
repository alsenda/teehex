import type { ClockPort } from "../../../core/ports/clock";

export const systemClock: ClockPort = {
  now: () => new Date()
};
