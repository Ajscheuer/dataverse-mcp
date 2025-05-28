import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  dataverse: {
    clientId: process.env.DATAVERSE_CLIENT_ID!,
    clientSecret: process.env.DATAVERSE_CLIENT_SECRET!,
    tenantId: process.env.DATAVERSE_TENANT_ID!,
    environmentUrl: process.env.DATAVERSE_ENVIRONMENT_URL!,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  rateLimit: {
    requestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
  },
};

// Validate required environment variables
const requiredVars = [
  'DATAVERSE_CLIENT_ID',
  'DATAVERSE_CLIENT_SECRET', 
  'DATAVERSE_TENANT_ID',
  'DATAVERSE_ENVIRONMENT_URL'
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}. Please check your .env file.`);
  }
}

console.error('[Setup] Environment configuration loaded successfully');
console.error(`[Setup] Dataverse URL: ${config.dataverse.environmentUrl}`);
console.error(`[Setup] Log Level: ${config.logging.level}`); 