import { DataverseService } from '../src/services/dataverseService.js';
import { handleCreateRecord } from '../src/tools/createRecord.js';
import { handleReadRecord } from '../src/tools/readRecord.js';
import { handleQueryRecords } from '../src/tools/queryRecords.js';
import { handleUpdateRecord } from '../src/tools/updateRecord.js';
import { handleDeleteRecord } from '../src/tools/deleteRecord.js';
import { handleListTables } from '../src/tools/listTables.js';

// Mock the DataverseService
jest.mock('../src/services/dataverseService');
const MockedDataverseService = DataverseService as jest.MockedClass<typeof DataverseService>;

describe('Tool Handlers', () => {
  let mockDataverseService: jest.Mocked<DataverseService>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a mocked instance
    mockDataverseService = {
      createRecord: jest.fn(),
      readRecord: jest.fn(),
      queryRecords: jest.fn(),
      updateRecord: jest.fn(),
      deleteRecord: jest.fn(),
      listTables: jest.fn(),
      getTableMetadata: jest.fn(),
      associateRecords: jest.fn(),
      disassociateRecords: jest.fn(),
    } as any;
  });

  describe('handleCreateRecord', () => {
    it('should create a record successfully', async () => {
      const mockRecordId = '12345678-1234-1234-1234-123456789012';
      mockDataverseService.createRecord.mockResolvedValue(mockRecordId);

      const args = {
        table: 'contacts',
        data: {
          firstname: 'John',
          lastname: 'Doe',
          emailaddress1: 'john.doe@example.com'
        }
      };

      const result = await handleCreateRecord(args, mockDataverseService);

      expect(mockDataverseService.createRecord).toHaveBeenCalledWith({
        table: 'contacts',
        data: args.data
      });

      expect(result.content[0].text).toContain('Successfully created record');
      expect(result.content[0].text).toContain(mockRecordId);
    });

    it('should handle validation errors', async () => {
      const args = {
        table: '', // Invalid table name
        data: { firstname: 'John' }
      };

      const result = await handleCreateRecord(args, mockDataverseService);

      expect(result.content[0].text).toContain('Failed to create record');
      expect(mockDataverseService.createRecord).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockDataverseService.createRecord.mockRejectedValue(new Error('Service error'));

      const args = {
        table: 'contacts',
        data: { firstname: 'John' }
      };

      const result = await handleCreateRecord(args, mockDataverseService);

      expect(result.content[0].text).toContain('Failed to create record');
      expect(result.content[0].text).toContain('Service error');
    });
  });

  describe('handleReadRecord', () => {
    it('should read a record successfully', async () => {
      const mockRecord = {
        contactid: '12345678-1234-1234-1234-123456789012',
        firstname: 'John',
        lastname: 'Doe',
        emailaddress1: 'john.doe@example.com'
      };
      mockDataverseService.readRecord.mockResolvedValue(mockRecord);

      const args = {
        table: 'contacts',
        id: '12345678-1234-1234-1234-123456789012',
        select: 'firstname,lastname,emailaddress1'
      };

      const result = await handleReadRecord(args, mockDataverseService);

      expect(mockDataverseService.readRecord).toHaveBeenCalledWith({
        table: 'contacts',
        id: '12345678-1234-1234-1234-123456789012',
        select: 'firstname,lastname,emailaddress1',
        expand: undefined
      });

      expect(result.content[0].text).toContain('Successfully retrieved record');
      expect(result.content[0].text).toContain('John');
    });

    it('should handle invalid GUID', async () => {
      const args = {
        table: 'contacts',
        id: 'invalid-guid'
      };

      const result = await handleReadRecord(args, mockDataverseService);

      expect(result.content[0].text).toContain('Failed to read record');
      expect(result.content[0].text).toContain('valid GUID format');
      expect(mockDataverseService.readRecord).not.toHaveBeenCalled();
    });
  });

  describe('handleQueryRecords', () => {
    it('should query records successfully', async () => {
      const mockResponse = {
        '@odata.context': 'test',
        value: [
          { contactid: '1', firstname: 'John', lastname: 'Doe' },
          { contactid: '2', firstname: 'Jane', lastname: 'Smith' }
        ],
        '@odata.count': 2
      };
      mockDataverseService.queryRecords.mockResolvedValue(mockResponse);

      const args = {
        table: 'contacts',
        select: 'firstname,lastname',
        filter: "firstname eq 'John'",
        top: 10
      };

      const result = await handleQueryRecords(args, mockDataverseService);

      expect(mockDataverseService.queryRecords).toHaveBeenCalledWith({
        table: 'contacts',
        select: 'firstname,lastname',
        filter: "firstname eq 'John'",
        orderby: undefined,
        top: 10,
        skip: undefined,
        expand: undefined,
        count: undefined
      });

      expect(result.content[0].text).toContain('Successfully retrieved 2 records');
      expect(result.content[0].text).toContain('total available: 2');
    });

    it('should handle empty results', async () => {
      const mockResponse = {
        '@odata.context': 'test',
        value: []
      };
      mockDataverseService.queryRecords.mockResolvedValue(mockResponse);

      const args = {
        table: 'contacts'
      };

      const result = await handleQueryRecords(args, mockDataverseService);

      expect(result.content[0].text).toContain('Successfully retrieved 0 records');
      expect(result.content[0].text).toContain('No records found matching the criteria');
    });

    it('should handle dangerous OData queries', async () => {
      const args = {
        table: 'contacts',
        filter: 'DROP TABLE contacts'
      };

      const result = await handleQueryRecords(args, mockDataverseService);

      expect(result.content[0].text).toContain('Failed to query records');
      expect(result.content[0].text).toContain('potentially unsafe content');
      expect(mockDataverseService.queryRecords).not.toHaveBeenCalled();
    });
  });

  describe('handleUpdateRecord', () => {
    it('should update a record successfully', async () => {
      mockDataverseService.updateRecord.mockResolvedValue();

      const args = {
        table: 'contacts',
        id: '12345678-1234-1234-1234-123456789012',
        data: {
          jobtitle: 'Senior Developer'
        }
      };

      const result = await handleUpdateRecord(args, mockDataverseService);

      expect(mockDataverseService.updateRecord).toHaveBeenCalledWith({
        table: 'contacts',
        id: '12345678-1234-1234-1234-123456789012',
        data: { jobtitle: 'Senior Developer' }
      });

      expect(result.content[0].text).toContain('Successfully updated record');
    });

    it('should handle missing data', async () => {
      const args = {
        table: 'contacts',
        id: '12345678-1234-1234-1234-123456789012'
        // Missing data field
      };

      const result = await handleUpdateRecord(args, mockDataverseService);

      expect(result.content[0].text).toContain('Failed to update record');
      expect(result.content[0].text).toContain('data is required');
      expect(mockDataverseService.updateRecord).not.toHaveBeenCalled();
    });
  });

  describe('handleDeleteRecord', () => {
    it('should delete a record successfully', async () => {
      mockDataverseService.deleteRecord.mockResolvedValue();

      const args = {
        table: 'contacts',
        id: '12345678-1234-1234-1234-123456789012'
      };

      const result = await handleDeleteRecord(args, mockDataverseService);

      expect(mockDataverseService.deleteRecord).toHaveBeenCalledWith({
        table: 'contacts',
        id: '12345678-1234-1234-1234-123456789012'
      });

      expect(result.content[0].text).toContain('Successfully deleted record');
    });

    it('should handle service errors', async () => {
      mockDataverseService.deleteRecord.mockRejectedValue(new Error('Record not found'));

      const args = {
        table: 'contacts',
        id: '12345678-1234-1234-1234-123456789012'
      };

      const result = await handleDeleteRecord(args, mockDataverseService);

      expect(result.content[0].text).toContain('Failed to delete record');
      expect(result.content[0].text).toContain('Record not found');
    });
  });

  describe('handleListTables', () => {
    it('should list tables successfully', async () => {
      const mockTables = ['contacts', 'accounts', 'opportunities', 'leads'];
      mockDataverseService.listTables.mockResolvedValue(mockTables);

      const result = await handleListTables({}, mockDataverseService);

      expect(mockDataverseService.listTables).toHaveBeenCalled();
      expect(result.content[0].text).toContain('Successfully retrieved 4 tables');
      expect(result.content[0].text).toContain('• accounts');
      expect(result.content[0].text).toContain('• contacts');
      expect(result.content[0].text).toContain('• leads');
      expect(result.content[0].text).toContain('• opportunities');
    });

    it('should handle service errors', async () => {
      mockDataverseService.listTables.mockRejectedValue(new Error('Authentication failed'));

      const result = await handleListTables({}, mockDataverseService);

      expect(result.content[0].text).toContain('Failed to list tables');
      expect(result.content[0].text).toContain('Authentication failed');
    });
  });
}); 