#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";
import { runCli } from "./cli.js";

const entrypoint = fileURLToPath(import.meta.url);
const invoked = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (entrypoint === invoked) {
  runCli(process.argv.slice(2));
}
