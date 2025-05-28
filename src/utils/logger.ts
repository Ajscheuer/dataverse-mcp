import { config } from '../config/environment.js';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

const logLevelMap: { [key: string]: LogLevel } = {
  error: LogLevel.ERROR,
  warn: LogLevel.WARN,
  info: LogLevel.INFO,
  debug: LogLevel.DEBUG,
};

function getCurrentLogLevel(): LogLevel {
  // Check environment variable first (for tests), then fall back to config
  const envLogLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLogLevel && logLevelMap[envLogLevel] !== undefined) {
    return logLevelMap[envLogLevel];
  }
  return logLevelMap[config.logging.level.toLowerCase()] ?? LogLevel.INFO;
}

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    const currentLogLevel = getCurrentLogLevel();
    if (level <= currentLogLevel) {
      const timestamp = new Date().toISOString();
      const levelName = LogLevel[level];
      console.error(`[${timestamp}] [${levelName}] [${this.context}] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }
}

// Create logger instances for different contexts
export const createLogger = (context: string): Logger => new Logger(context); 