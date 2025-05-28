import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DataverseService } from '../services/dataverseService.js';
import { validateTableName, validateODataQuery, validatePositiveInteger, validateNonNegativeInteger } from '../utils/validation.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('QueryRecordsTool');

export const queryRecordsTool: Tool = {
  name: 'dataverse_query_records',
  description: 'Query multiple records from a Dataverse table with OData filters',
  inputSchema: {
    type: 'object',
    properties: {
      table: {
        type: 'string',
        description: 'The name of the Dataverse table (e.g., "contacts", "accounts")',
      },
      select: {
        type: 'string',
        description: 'Comma-separated list of columns to select (optional)',
      },
      filter: {
        type: 'string',
        description: 'OData filter expression (optional, e.g., "firstname eq \'John\'")',
      },
      orderby: {
        type: 'string',
        description: 'OData orderby expression (optional, e.g., "createdon desc")',
      },
      top: {
        type: 'number',
        description: 'Maximum number of records to return (optional)',
      },
      skip: {
        type: 'number',
        description: 'Number of records to skip (optional)',
      },
      expand: {
        type: 'string',
        description: 'Related entities to expand (optional)',
      },
      count: {
        type: 'boolean',
        description: 'Include total count in response (optional)',
      },
    },
    required: ['table'],
  },
};

export async function handleQueryRecords(
  args: any,
  dataverseService: DataverseService
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    logger.info('Processing query records request');

    // Validate inputs
    const table = validateTableName(args.table, 'table');
    const select = args.select ? String(args.select).trim() : undefined;
    const expand = args.expand ? String(args.expand).trim() : undefined;
    const count = args.count ? Boolean(args.count) : undefined;

    // Validate OData query parameters
    const filter = args.filter ? validateODataQuery(String(args.filter).trim(), 'filter') : undefined;
    const orderby = args.orderby ? validateODataQuery(String(args.orderby).trim(), 'orderby') : undefined;

    // Validate numeric parameters
    const top = args.top ? validatePositiveInteger(args.top, 'top') : undefined;
    const skip = args.skip ? validateNonNegativeInteger(args.skip, 'skip') : undefined;

    logger.debug(`Querying records from table: ${table}`);

    // Query the records
    const response = await dataverseService.queryRecords({
      table,
      select,
      filter,
      orderby,
      top,
      skip,
      expand,
      count,
    });

    const recordCount = response.value?.length || 0;
    const totalCount = response['@odata.count'];
    
    let successMessage = `Successfully retrieved ${recordCount} records from table '${table}'`;
    if (totalCount !== undefined) {
      successMessage += ` (total available: ${totalCount})`;
    }
    
    logger.info(successMessage);

    // Format the response
    let resultText = `${successMessage}:\n\n`;
    
    if (response.value && response.value.length > 0) {
      resultText += JSON.stringify(response.value, null, 2);
    } else {
      resultText += 'No records found matching the criteria.';
    }

    // Add pagination info if available
    if (response['@odata.nextLink']) {
      resultText += '\n\nNote: More records are available. Use skip parameter to retrieve additional pages.';
    }

    return {
      content: [
        {
          type: 'text',
          text: resultText,
        },
      ],
    };
  } catch (error) {
    const errorMessage = `Failed to query records: ${error instanceof Error ? error.message : 'Unknown error'}`;
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