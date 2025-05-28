import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DataverseService } from '../services/dataverseService.js';
import { validateTableName, validateGuid } from '../utils/validation.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ReadRecordTool');

export const readRecordTool: Tool = {
  name: 'dataverse_read_record',
  description: 'Read a single record from a Dataverse table by ID',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'The name of the Dataverse table (e.g., "contacts", "accounts")',
      },
      id: {
        type: 'string',
        description: 'The GUID of the record to read',
      },
      select: {
        type: 'string',
        description: 'Comma-separated list of columns to select (optional)',
      },
      expand: {
        type: 'string',
        description: 'Related entities to expand (optional)',
      },
    },
    required: ['table', 'id'],
  },
};

export async function handleReadRecord(
  args: any,
  dataverseService: DataverseService
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    logger.info('Processing read record request');

    // Validate inputs
    const table = validateTableName(args.table, 'table');
    const id = validateGuid(args.id, 'id');
    const select = args.select ? String(args.select).trim() : undefined;
    const expand = args.expand ? String(args.expand).trim() : undefined;

    logger.debug(`Reading record ${id} from table: ${table}`);

    // Read the record
    const record = await dataverseService.readRecord({
      table,
      id,
      select,
      expand,
    });

    const successMessage = `Successfully retrieved record from table '${table}':`;
    logger.info(successMessage);

    return {
      content: [
        {
          type: 'text',
          text: `${successMessage}\n\n${JSON.stringify(record, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = `Failed to read record: ${error instanceof Error ? error.message : 'Unknown error'}`;
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