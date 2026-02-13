#!/usr/bin/env node

import { createLogger } from "@teehex/shared";
import { TEMPLATES } from "@teehex/templates";

const logger = createLogger("teehex");

export async function run(argv: string[]): Promise<number> {
  if (argv.includes("--help") || argv.includes("-h")) {
    logger.info("teehex - hexagonal architecture generator");
    logger.info("usage: teehex [--help]");
    logger.info(`templates: ${TEMPLATES.map((template) => template.id).join(", ")}`);
    return 0;
  }

  logger.info("CLI scaffold initialized. Generator commands will be added next.");
  logger.info(`available templates: ${TEMPLATES.length}`);
  return 0;
}

void run(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
});
