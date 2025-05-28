import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DataverseService } from '../services/dataverseService.js';
import { validateTableName, validateGuid, validateRequired } from '../utils/validation.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('UpdateRecordTool');

export const updateRecordTool: Tool = {
  name: 'dataverse_update_record',
  description: 'Update an existing record in a Dataverse table',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'The name of the Dataverse table (e.g., "contacts", "accounts")',
      },
      id: {
        type: 'string',
        description: 'The GUID of the record to update',
      },
      data: {
        type: 'object',
        description: 'The data to update as key-value pairs',
        additionalProperties: true,
      },
    },
    required: ['table', 'id', 'data'],
  },
};

export async function handleUpdateRecord(
  args: any,
  dataverseService: DataverseService
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    logger.info('Processing update record request');

    // Validate inputs
    const table = validateTableName(args.table, 'table');
    const id = validateGuid(args.id, 'id');
    const data = validateRequired(args.data, 'data');

    if (typeof data !== 'object' || data === null) {
      throw new Error('data must be a valid object');
    }

    logger.debug(`Updating record ${id} in table: ${table}`, data);

    // Update the record
    await dataverseService.updateRecord({
      table,
      id,
      data,
    });

    const successMessage = `Successfully updated record ${id} in table '${table}'`;
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
    const errorMessage = `Failed to update record: ${error instanceof Error ? error.message : 'Unknown error'}`;
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