import { Server } from '@modelcontextprotocol/sdk/server/index.js';

// Import tool definitions
import { createRecordTool } from '../src/tools/createRecord.js';
import { readRecordTool } from '../src/tools/readRecord.js';
import { queryRecordsTool } from '../src/tools/queryRecords.js';
import { updateRecordTool } from '../src/tools/updateRecord.js';
import { deleteRecordTool } from '../src/tools/deleteRecord.js';
import { listTablesTool } from '../src/tools/listTables.js';

describe('MCP Server Integration', () => {
  describe('Tool Definitions', () => {
    it('should have correct tool definitions', () => {
      // Test createRecordTool
      expect(createRecordTool.name).toBe('dataverse_create_record');
      expect(createRecordTool.description).toContain('Create a new record');
      expect(createRecordTool.inputSchema.required).toEqual(['table', 'data']);

      // Test readRecordTool
      expect(readRecordTool.name).toBe('dataverse_read_record');
      expect(readRecordTool.description).toContain('Read a single record');
      expect(readRecordTool.inputSchema.required).toEqual(['table', 'id']);

      // Test queryRecordsTool
      expect(queryRecordsTool.name).toBe('dataverse_query_records');
      expect(queryRecordsTool.description).toContain('Query multiple records');
      expect(queryRecordsTool.inputSchema.required).toEqual(['table']);

      // Test updateRecordTool
      expect(updateRecordTool.name).toBe('dataverse_update_record');
      expect(updateRecordTool.description).toContain('Update an existing record');
      expect(updateRecordTool.inputSchema.required).toEqual(['table', 'id', 'data']);

      // Test deleteRecordTool
      expect(deleteRecordTool.name).toBe('dataverse_delete_record');
      expect(deleteRecordTool.description).toContain('Delete a record');
      expect(deleteRecordTool.inputSchema.required).toEqual(['table', 'id']);

      // Test listTablesTool
      expect(listTablesTool.name).toBe('dataverse_list_tables');
      expect(listTablesTool.description).toContain('List all available tables');
      expect(listTablesTool.inputSchema.required).toEqual([]);
    });

    it('should have proper input schema types', () => {
      // Test createRecordTool schema
      expect((createRecordTool.inputSchema.properties as any)?.table?.type).toBe('string');
      expect((createRecordTool.inputSchema.properties as any)?.data?.type).toBe('object');

      // Test readRecordTool schema
      expect((readRecordTool.inputSchema.properties as any)?.table?.type).toBe('string');
      expect((readRecordTool.inputSchema.properties as any)?.id?.type).toBe('string');
      expect((readRecordTool.inputSchema.properties as any)?.select?.type).toBe('string');

      // Test queryRecordsTool schema
      expect((queryRecordsTool.inputSchema.properties as any)?.table?.type).toBe('string');
      expect((queryRecordsTool.inputSchema.properties as any)?.filter?.type).toBe('string');
      expect((queryRecordsTool.inputSchema.properties as any)?.top?.type).toBe('number');

      // Test updateRecordTool schema
      expect((updateRecordTool.inputSchema.properties as any)?.table?.type).toBe('string');
      expect((updateRecordTool.inputSchema.properties as any)?.id?.type).toBe('string');
      expect((updateRecordTool.inputSchema.properties as any)?.data?.type).toBe('object');

      // Test deleteRecordTool schema
      expect((deleteRecordTool.inputSchema.properties as any)?.table?.type).toBe('string');
      expect((deleteRecordTool.inputSchema.properties as any)?.id?.type).toBe('string');
    });
  });

  describe('Tool Schema Validation', () => {
    it('should have valid JSON schemas', () => {
      const tools = [
        createRecordTool,
        readRecordTool,
        queryRecordsTool,
        updateRecordTool,
        deleteRecordTool,
        listTablesTool,
      ];

      tools.forEach(tool => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
        expect(Array.isArray(tool.inputSchema.required)).toBe(true);
      });
    });

    it('should have descriptive field descriptions', () => {
      // Check that all tools have meaningful descriptions for their parameters
      expect((createRecordTool.inputSchema.properties as any)?.table?.description).toContain('table');
      expect((createRecordTool.inputSchema.properties as any)?.data?.description).toContain('data');

      expect((readRecordTool.inputSchema.properties as any)?.id?.description).toContain('GUID');
      expect((readRecordTool.inputSchema.properties as any)?.select?.description).toContain('columns');

      expect((queryRecordsTool.inputSchema.properties as any)?.filter?.description).toContain('OData');
      expect((queryRecordsTool.inputSchema.properties as any)?.top?.description).toContain('Maximum');

      expect((updateRecordTool.inputSchema.properties as any)?.data?.description).toContain('update');
      expect((deleteRecordTool.inputSchema.properties as any)?.id?.description).toContain('delete');
    });
  });

  describe('Tool Parameter Validation', () => {
    it('should require correct parameters for each tool', () => {
      // Create record requires table and data
      expect(createRecordTool.inputSchema.required).toContain('table');
      expect(createRecordTool.inputSchema.required).toContain('data');

      // Read record requires table and id
      expect(readRecordTool.inputSchema.required).toContain('table');
      expect(readRecordTool.inputSchema.required).toContain('id');

      // Query records only requires table
      expect(queryRecordsTool.inputSchema.required).toContain('table');
      expect(queryRecordsTool.inputSchema.required).not.toContain('filter');

      // Update record requires table, id, and data
      expect(updateRecordTool.inputSchema.required).toContain('table');
      expect(updateRecordTool.inputSchema.required).toContain('id');
      expect(updateRecordTool.inputSchema.required).toContain('data');

      // Delete record requires table and id
      expect(deleteRecordTool.inputSchema.required).toContain('table');
      expect(deleteRecordTool.inputSchema.required).toContain('id');

      // List tables requires no parameters
      expect(listTablesTool.inputSchema.required).toHaveLength(0);
    });

    it('should have optional parameters marked correctly', () => {
      // Read record has optional select and expand
      expect(readRecordTool.inputSchema.required).not.toContain('select');
      expect(readRecordTool.inputSchema.required).not.toContain('expand');
      expect((readRecordTool.inputSchema.properties as any)?.select).toBeDefined();
      expect((readRecordTool.inputSchema.properties as any)?.expand).toBeDefined();

      // Query records has many optional parameters
      const queryOptionalParams = ['select', 'filter', 'orderby', 'top', 'skip', 'expand', 'count'];
      queryOptionalParams.forEach(param => {
        expect(queryRecordsTool.inputSchema.required).not.toContain(param);
        expect((queryRecordsTool.inputSchema.properties as any)?.[param]).toBeDefined();
      });
    });
  });

  describe('Tool Names and Consistency', () => {
    it('should have consistent naming convention', () => {
      const tools = [
        createRecordTool,
        readRecordTool,
        queryRecordsTool,
        updateRecordTool,
        deleteRecordTool,
        listTablesTool,
      ];

      tools.forEach(tool => {
        expect(tool.name).toMatch(/^dataverse_/);
        expect(tool.name).not.toContain(' ');
        expect(tool.name).toBe(tool.name.toLowerCase());
      });
    });

    it('should have unique tool names', () => {
      const tools = [
        createRecordTool,
        readRecordTool,
        queryRecordsTool,
        updateRecordTool,
        deleteRecordTool,
        listTablesTool,
      ];

      const names = tools.map(tool => tool.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });
}); 