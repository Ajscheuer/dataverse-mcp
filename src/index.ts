#!/usr/bin/env node

/**
 * Dataverse MCP Server
 * 
 * A Model Context Protocol server that provides comprehensive CRUD operations
 * for Microsoft Dataverse. Supports creating, reading, updating, and deleting
 * records, as well as querying with OData filters and managing relationships.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import configuration and services
import { initializeConfig } from './config/environment.js';
import { DataverseService } from './services/dataverseService.js';
import { createLogger } from './utils/logger.js';

// Import all tools
import { createRecordTool, handleCreateRecord } from './tools/createRecord.js';
import { readRecordTool, handleReadRecord } from './tools/readRecord.js';
import { queryRecordsTool, handleQueryRecords } from './tools/queryRecords.js';
import { updateRecordTool, handleUpdateRecord } from './tools/updateRecord.js';
import { deleteRecordTool, handleDeleteRecord } from './tools/deleteRecord.js';
import { listTablesTool, handleListTables } from './tools/listTables.js';

/**
 * Parse command line arguments for configuration
 */
function parseArguments(): Record<string, string> {
  const args = process.argv.slice(2);
  const config: Record<string, string> = {};
  
  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith('--') && args[i + 1]) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      config[key] = value;
    }
  }
  
  return config;
}

const logger = createLogger('DataverseMCPServer');

/**
 * Create an MCP server with comprehensive Dataverse capabilities
 */
const server = new Server(
  {
    name: "dataverse-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize Dataverse service
let dataverseService: DataverseService;

// Parse command line arguments for configuration
const cliConfig = parseArguments();

try {
  logger.info('Initializing Dataverse MCP Server...');
  
  // Initialize configuration with CLI arguments
  initializeConfig(cliConfig);
  
  dataverseService = new DataverseService();
  logger.info('Dataverse MCP Server initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Dataverse service:', error);
  process.exit(1);
}

/**
 * Handler that lists all available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.info('Listing available tools');
  
  return {
    tools: [
      createRecordTool,
      readRecordTool,
      queryRecordsTool,
      updateRecordTool,
      deleteRecordTool,
      listTablesTool,
    ]
  };
});

/**
 * Handler for executing tools
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  logger.info(`Executing tool: ${name}`);
  logger.debug('Tool arguments:', args);

  try {
    switch (name) {
      case 'dataverse_create_record':
        return await handleCreateRecord(args, dataverseService);
      
      case 'dataverse_read_record':
        return await handleReadRecord(args, dataverseService);
      
      case 'dataverse_query_records':
        return await handleQueryRecords(args, dataverseService);
      
      case 'dataverse_update_record':
        return await handleUpdateRecord(args, dataverseService);
      
      case 'dataverse_delete_record':
        return await handleDeleteRecord(args, dataverseService);
      
      case 'dataverse_list_tables':
        return await handleListTables(args, dataverseService);
      
      default:
        const errorMessage = `Unknown tool: ${name}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
  } catch (error) {
    logger.error(`Error executing tool ${name}:`, error);
    
    // Return error as tool response rather than throwing
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        },
      ],
    };
  }
});

/**
 * Start the server
 */
async function main() {
  logger.info('Starting Dataverse MCP Server...');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  logger.info('Dataverse MCP Server is running and ready to accept requests');
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
