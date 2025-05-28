import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DataverseService } from '../services/dataverseService.js';
import { validateTableName, validateRequired } from '../utils/validation.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('CreateRecordTool');

export const createRecordTool: Tool = {
  name: 'dataverse_create_record',
  description: 'Create a new record in a Dataverse table',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'The name of the Dataverse table (e.g., "contacts", "accounts")',
      },
      data: {
        type: 'object',
        description: 'The data for the new record as key-value pairs',
        additionalProperties: true,
      },
    },
    required: ['table', 'data'],
  },
};

export async function handleCreateRecord(
  args: any,
  dataverseService: DataverseService
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    logger.info('Processing create record request');

    // Validate inputs
    const table = validateTableName(args.table, 'table');
    const data = validateRequired(args.data, 'data');

    if (typeof data !== 'object' || data === null) {
      throw new Error('data must be a valid object');
    }

    logger.debug(`Creating record in table: ${table}`, data);

    // Create the record
    const recordId = await dataverseService.createRecord({
      table,
      data,
    });

    const successMessage = `Successfully created record in table '${table}' with ID: ${recordId}`;
    logger.info(successMessage);

    return {
      content: [
        {
          type: 'text',
          text: successMessage,
        },
      ],
    };
  } catch (error) {
    const errorMessage = `Failed to create record: ${error instanceof Error ? error.message : 'Unknown error'}`;
    logger.error(errorMessage, error);

    return {
      content: [
        {
          type: 'text',
          text: errorMessage,
        },
      ],
    };
  }
} 