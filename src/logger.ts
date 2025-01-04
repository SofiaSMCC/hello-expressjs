import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info",
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message, service }) => {
      return `[${timestamp}] ${service} ${level}: ${message}`;
    })
  ),
  defaultMeta: { service: "User" },
});

export default logger;
