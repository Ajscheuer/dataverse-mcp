import { Logger, LogLevel, createLogger } from '../src/utils/logger.js';

// Mock console.error to capture log output
const originalConsoleError = console.error;
let logCalls: any[][] = [];

beforeAll(() => {
  console.error = jest.fn((...args) => {
    logCalls.push(args);
  });
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('Logger', () => {
  beforeEach(() => {
    logCalls = [];
    (console.error as jest.Mock).mockClear();
  });

  describe('Logger class', () => {
    it('should create logger with context', () => {
      const logger = new Logger('TestContext');
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should log error messages', () => {
      // Set environment to ensure error logging is enabled
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'debug'; // Enable all logging
      
      const logger = new Logger('TestContext');
      logger.error('Test error message');

      expect(logCalls.length).toBeGreaterThan(0);
      const logCall = logCalls[logCalls.length - 1][0]; // Get the last log call
      expect(logCall).toMatch(/\[ERROR\]/);
      expect(logCall).toMatch(/\[TestContext\]/);
      expect(logCall).toMatch(/Test error message/);
      
      // Restore original log level
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });

    it('should log warn messages when log level allows', () => {
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'debug'; // Enable all logging
      
      const logger = new Logger('TestContext');
      logger.warn('Test warning message');

      expect(logCalls.length).toBeGreaterThan(0);
      const logCall = logCalls[logCalls.length - 1][0];
      expect(logCall).toMatch(/\[WARN\]/);
      expect(logCall).toMatch(/Test warning message/);
      
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });

    it('should log info messages when log level allows', () => {
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'debug'; // Enable all logging
      
      const logger = new Logger('TestContext');
      logger.info('Test info message');

      expect(logCalls.length).toBeGreaterThan(0);
      const logCall = logCalls[logCalls.length - 1][0];
      expect(logCall).toMatch(/\[INFO\]/);
      expect(logCall).toMatch(/Test info message/);
      
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });

    it('should log debug messages when log level allows', () => {
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'debug'; // Enable all logging
      
      const logger = new Logger('TestContext');
      logger.debug('Test debug message');

      expect(logCalls.length).toBeGreaterThan(0);
      const logCall = logCalls[logCalls.length - 1][0];
      expect(logCall).toMatch(/\[DEBUG\]/);
      expect(logCall).toMatch(/Test debug message/);
      
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });

    it('should not log messages below current log level', () => {
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'error'; // Only allow error messages
      
      const initialCallCount = logCalls.length;
      const logger = new Logger('TestContext');
      
      logger.warn('Should not appear');
      logger.info('Should not appear');
      logger.debug('Should not appear');

      // Should not have added any new log calls
      expect(logCalls.length).toBe(initialCallCount);
      
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });

    it('should include timestamp in log messages', () => {
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'debug'; // Enable all logging
      
      const logger = new Logger('TestContext');
      logger.error('Test message');

      expect(logCalls.length).toBeGreaterThan(0);
      const logCall = logCalls[logCalls.length - 1][0];
      expect(logCall).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
      
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });
  });

  describe('createLogger function', () => {
    it('should create logger instance', () => {
      const logger = createLogger('TestContext');
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create loggers with different contexts', () => {
      const originalLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'debug'; // Enable all logging
      
      const initialCallCount = logCalls.length;
      const logger1 = createLogger('Context1');
      const logger2 = createLogger('Context2');

      logger1.error('Message from context 1');
      logger2.error('Message from context 2');

      expect(logCalls.length).toBe(initialCallCount + 2);
      
      const firstCall = logCalls[logCalls.length - 2][0];
      const secondCall = logCalls[logCalls.length - 1][0];
      
      expect(firstCall).toContain('[Context1]');
      expect(secondCall).toContain('[Context2]');
      
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });
  });

  describe('LogLevel enum', () => {
    it('should have correct numeric values', () => {
      expect(LogLevel.ERROR).toBe(0);
      expect(LogLevel.WARN).toBe(1);
      expect(LogLevel.INFO).toBe(2);
      expect(LogLevel.DEBUG).toBe(3);
    });
  });
}); 