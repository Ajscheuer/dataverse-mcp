import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { DataverseAuth } from '../auth/dataverseAuth.js';
import { getConfig } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';
import {
  DataverseRecord,
  DataverseResponse,
  DataverseSingleResponse,
  DataverseError,
  ODataQueryOptions,
  CreateRecordRequest,
  ReadRecordRequest,
  UpdateRecordRequest,
  DeleteRecordRequest,
  QueryRecordsRequest,
  AssociateRecordsRequest,
  DisassociateRecordsRequest,
  TableMetadata,
} from '../types/dataverse.js';

const logger = createLogger('DataverseService');

export class DataverseService {
  private auth: DataverseAuth;
  private httpClient: AxiosInstance;
  private baseUrl: string;

  constructor() {
    logger.info('Initializing Dataverse service...');
    
    this.auth = new DataverseAuth();
    this.baseUrl = `${getConfig().dataverse.environmentUrl}/api/data/v9.2`;
    
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.httpClient.interceptors.request.use(async (config) => {
      const authHeader = await this.auth.getAuthorizationHeader();
      Object.assign(config.headers, authHeader);
      return config;
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );

    logger.info('Dataverse service initialized successfully');
  }

  private handleApiError(error: AxiosError): void {
    if (error.response) {
      const dataverseError = error.response.data as DataverseError;
      logger.error(`API Error ${error.response.status}:`, dataverseError.error?.message || error.message);
      
      if (dataverseError.error?.innererror) {
        logger.debug('Inner error details:', dataverseError.error.innererror);
      }
    } else if (error.request) {
      logger.error('Network error - no response received:', error.message);
    } else {
      logger.error('Request setup error:', error.message);
    }
  }

  private buildQueryString(options: ODataQueryOptions): string {
    const params = new URLSearchParams();
    
    if (options.$select) params.append('$select', options.$select);
    if (options.$filter) params.append('$filter', options.$filter);
    if (options.$orderby) params.append('$orderby', options.$orderby);
    if (options.$top) params.append('$top', options.$top.toString());
    if (options.$skip) params.append('$skip', options.$skip.toString());
    if (options.$expand) params.append('$expand', options.$expand);
    if (options.$count) params.append('$count', 'true');

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Create a new record in the specified table
   */
  async createRecord(request: CreateRecordRequest): Promise<string> {
    try {
      logger.info(`Creating record in table: ${request.table}`);
      logger.debug('Record data:', request.data);

      const response: AxiosResponse = await this.httpClient.post(
        `/${request.table}`,
        request.data,
        {
          headers: {
            'Prefer': 'return=representation',
          },
        }
      );

      // Extract the ID from the OData-EntityId header or response data
      const entityId = response.headers['odata-entityid'] || 
                      response.data[`${request.table.slice(0, -1)}id`] ||
                      response.data.id;

      if (entityId) {
        // Extract GUID from the full URL if needed
        const guidMatch = entityId.match(/\(([^)]+)\)/);
        const recordId = guidMatch ? guidMatch[1] : entityId;
        
        logger.info(`Record created successfully with ID: ${recordId}`);
        return recordId;
      }

      throw new Error('Could not extract record ID from response');
    } catch (error) {
      logger.error(`Failed to create record in table ${request.table}:`, error);
      throw error;
    }
  }

  /**
   * Read a single record by ID
   */
  async readRecord(request: ReadRecordRequest): Promise<DataverseRecord> {
    try {
      logger.info(`Reading record ${request.id} from table: ${request.table}`);

      const queryOptions: ODataQueryOptions = {};
      if (request.select) queryOptions.$select = request.select;
      if (request.expand) queryOptions.$expand = request.expand;

      const queryString = this.buildQueryString(queryOptions);
      const response: AxiosResponse<DataverseSingleResponse> = await this.httpClient.get(
        `/${request.table}(${request.id})${queryString}`
      );

      logger.info(`Record retrieved successfully`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to read record ${request.id} from table ${request.table}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing record
   */
  async updateRecord(request: UpdateRecordRequest): Promise<void> {
    try {
      logger.info(`Updating record ${request.id} in table: ${request.table}`);
      logger.debug('Update data:', request.data);

      await this.httpClient.patch(
        `/${request.table}(${request.id})`,
        request.data
      );

      logger.info(`Record updated successfully`);
    } catch (error) {
      logger.error(`Failed to update record ${request.id} in table ${request.table}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async deleteRecord(request: DeleteRecordRequest): Promise<void> {
    try {
      logger.info(`Deleting record ${request.id} from table: ${request.table}`);

      await this.httpClient.delete(`/${request.table}(${request.id})`);

      logger.info(`Record deleted successfully`);
    } catch (error) {
      logger.error(`Failed to delete record ${request.id} from table ${request.table}:`, error);
      throw error;
    }
  }

  /**
   * Query multiple records with OData options
   */
  async queryRecords(request: QueryRecordsRequest): Promise<DataverseResponse> {
    try {
      logger.info(`Querying records from table: ${request.table}`);

      const queryOptions: ODataQueryOptions = {
        $select: request.select,
        $filter: request.filter,
        $orderby: request.orderby,
        $top: request.top,
        $skip: request.skip,
        $expand: request.expand,
        $count: request.count,
      };

      const queryString = this.buildQueryString(queryOptions);
      logger.debug(`Query string: ${queryString}`);

      const response: AxiosResponse<DataverseResponse> = await this.httpClient.get(
        `/${request.table}${queryString}`
      );

      logger.info(`Query completed successfully. Records returned: ${response.data.value?.length || 0}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to query records from table ${request.table}:`, error);
      throw error;
    }
  }

  /**
   * Associate two records
   */
  async associateRecords(request: AssociateRecordsRequest): Promise<void> {
    try {
      logger.info(`Associating record ${request.id} with ${request.relatedId} via ${request.relationshipName}`);

      const associationData = {
        '@odata.id': `${this.baseUrl}/${request.relatedTable}(${request.relatedId})`,
      };

      await this.httpClient.post(
        `/${request.table}(${request.id})/${request.relationshipName}/$ref`,
        associationData
      );

      logger.info(`Records associated successfully`);
    } catch (error) {
      logger.error(`Failed to associate records:`, error);
      throw error;
    }
  }

  /**
   * Disassociate two records
   */
  async disassociateRecords(request: DisassociateRecordsRequest): Promise<void> {
    try {
      logger.info(`Disassociating record ${request.id} from ${request.relatedId} via ${request.relationshipName}`);

      await this.httpClient.delete(
        `/${request.table}(${request.id})/${request.relationshipName}(${request.relatedId})/$ref`
      );

      logger.info(`Records disassociated successfully`);
    } catch (error) {
      logger.error(`Failed to disassociate records:`, error);
      throw error;
    }
  }

  /**
   * List all available tables
   */
  async listTables(): Promise<string[]> {
    try {
      logger.info('Retrieving list of available tables...');

      const response: AxiosResponse = await this.httpClient.get('');
      const tables = response.data.value
        .filter((item: any) => item.kind === 'EntitySet')
        .map((item: any) => item.name);

      logger.info(`Retrieved ${tables.length} tables`);
      return tables;
    } catch (error) {
      logger.error('Failed to retrieve table list:', error);
      throw error;
    }
  }

  /**
   * Get metadata for a specific table
   */
  async getTableMetadata(tableName: string): Promise<TableMetadata> {
    try {
      logger.info(`Retrieving metadata for table: ${tableName}`);

      const response: AxiosResponse<TableMetadata> = await this.httpClient.get(
        `$metadata/EntitySets(${tableName})/EntityType`
      );

      logger.info(`Metadata retrieved successfully for table: ${tableName}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to retrieve metadata for table ${tableName}:`, error);
      throw error;
    }
  }
} 