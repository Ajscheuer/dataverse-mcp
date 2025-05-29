import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Configuration interface
interface DataverseConfig {
  dataverse: {
    clientId: string;
    clientSecret: string;
    tenantId: string;
    environmentUrl: string;
  };
  logging: {
    level: string;
  };
  rateLimit: {
    requestsPerMinute: number;
  };
}

let config: DataverseConfig | null = null;

/**
 * Initialize configuration from CLI arguments or environment variables
 */
export function initializeConfig(cliArgs: Record<string, string> = {}): void {
  // Priority: CLI arguments > Environment variables
  const getConfigValue = (cliKey: string, envKey: string, defaultValue?: string): string => {
    return cliArgs[cliKey] || process.env[envKey] || defaultValue || '';
  };

  config = {
    dataverse: {
      clientId: getConfigValue('clientId', 'DATAVERSE_CLIENT_ID'),
      clientSecret: getConfigValue('clientSecret', 'DATAVERSE_CLIENT_SECRET'),
      tenantId: getConfigValue('tenantId', 'DATAVERSE_TENANT_ID'),
      environmentUrl: getConfigValue('environmentUrl', 'DATAVERSE_ENVIRONMENT_URL'),
    },
    logging: {
      level: getConfigValue('logLevel', 'LOG_LEVEL', 'info'),
    },
    rateLimit: {
      requestsPerMinute: parseInt(getConfigValue('rateLimit', 'RATE_LIMIT_REQUESTS_PER_MINUTE', '60')),
    },
  };

  // Validate required configuration values
  const requiredConfigs = [
    { key: 'clientId', value: config.dataverse.clientId },
    { key: 'clientSecret', value: config.dataverse.clientSecret },
    { key: 'tenantId', value: config.dataverse.tenantId },
    { key: 'environmentUrl', value: config.dataverse.environmentUrl },
  ];

  for (const { key, value } of requiredConfigs) {
    if (!value) {
      throw new Error(`Missing required configuration: ${key}. Please provide it via CLI argument --${key} or environment variable.`);
    }
  }

  console.error('[Setup] Configuration loaded successfully');
  console.error(`[Setup] Dataverse URL: ${config.dataverse.environmentUrl}`);
  console.error(`[Setup] Log Level: ${config.logging.level}`);
  console.error(`[Setup] Configuration source: ${Object.keys(cliArgs).length > 0 ? 'CLI arguments + environment' : 'environment variables'}`);
}

/**
 * Get the current configuration
 */
export function getConfig(): DataverseConfig {
  if (!config) {
    throw new Error('Configuration not initialized. Call initializeConfig() first.');
  }
  return config;
} 