import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DataverseService } from '../services/dataverseService.js';
import { validateTableName, validateGuid } from '../utils/validation.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('DeleteRecordTool');

export const deleteRecordTool: Tool = {
  name: 'dataverse_delete_record',
  description: 'Delete a record from a Dataverse table',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'The name of the Dataverse table (e.g., "contacts", "accounts")',
      },
      id: {
        type: 'string',
        description: 'The GUID of the record to delete',
      },
    },
    required: ['table', 'id'],
  },
};

export async function handleDeleteRecord(
  args: any,
  dataverseService: DataverseService
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    logger.info('Processing delete record request');

    // Validate inputs
    const table = validateTableName(args.table, 'table');
    const id = validateGuid(args.id, 'id');

    logger.debug(`Deleting record ${id} from table: ${table}`);

    // Delete the record
    await dataverseService.deleteRecord({
      table,
      id,
    });

    const successMessage = `Successfully deleted record ${id} from table '${table}'`;
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
    const errorMessage = `Failed to delete record: ${error instanceof Error ? error.message : 'Unknown error'}`;
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