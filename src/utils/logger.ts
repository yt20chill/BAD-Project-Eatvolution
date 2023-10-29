import { env } from "src/env";
import { createLogger, format, transports } from "winston";

// custom log display format
const customFormat = format.printf(({ timestamp, level, stack, message }) => {
  return `${timestamp} - [${level.toUpperCase().padEnd(7)}] - ${stack || message}`;
});

const options = {
  file: {
    filename: "log/error.log",
    level: "error",
  },
  console: {
    level: "debug",
  },
};

// for development environment
const devLogger = {
  format: format.combine(format.timestamp(), format.errors({ stack: true }), customFormat),
  transports: [new transports.Console(options.console)],
};

// for production environment
const prodLogger = {
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: [
    new transports.File(options.file),
    new transports.File({
      filename: "log/combine.log",
      level: "info",
    }),
  ],
};

// export log instance based on the current environment
const instanceLogger = env.NODE_ENV === "production" ? prodLogger : devLogger;

export const logger = createLogger(instanceLogger);
