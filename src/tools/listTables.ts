import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DataverseService } from '../services/dataverseService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ListTablesTool');

export const listTablesTool: Tool = {
  name: 'dataverse_list_tables',
  description: 'List all available tables in the Dataverse environment',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export async function handleListTables(
  args: any,
  dataverseService: DataverseService
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    logger.info('Processing list tables request');

    // Get the list of tables
    const tables = await dataverseService.listTables();

    const successMessage = `Successfully retrieved ${tables.length} tables from Dataverse:`;
    logger.info(successMessage);

    // Format the response
    const tableList = tables.sort().map(table => `• ${table}`).join('\n');
    const resultText = `${successMessage}\n\n${tableList}`;

    return {
      content: [
        {
          type: 'text',
          text: resultText,
        },
      ],
    };
  } catch (error) {
    const errorMessage = `Failed to list tables: ${error instanceof Error ? error.message : 'Unknown error'}`;
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