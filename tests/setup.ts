// Test setup file

// Set test environment variables
process.env.DATAVERSE_CLIENT_ID = 'test-client-id';
process.env.DATAVERSE_CLIENT_SECRET = 'test-client-secret';
process.env.DATAVERSE_TENANT_ID = 'test-tenant-id';
process.env.DATAVERSE_ENVIRONMENT_URL = 'https://test.crm.dynamics.com';
process.env.LOG_LEVEL = 'error'; // Reduce logging during tests

// Global test timeout
jest.setTimeout(10000);

// Mock console.error to reduce noise during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
}); 