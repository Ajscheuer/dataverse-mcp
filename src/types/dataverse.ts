// Dataverse API Types

export interface DataverseRecord {
  [key: string]: any;
}

export interface DataverseResponse<T = DataverseRecord> {
  '@odata.context': string;
  value?: T[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}

export interface DataverseSingleResponse<T = DataverseRecord> extends Omit<DataverseResponse<T>, 'value'> {
  [key: string]: any;
}

export interface DataverseError {
  error: {
    code: string;
    message: string;
    innererror?: {
      message: string;
      type: string;
      stacktrace: string;
    };
  };
}

export interface ODataQueryOptions {
  $select?: string;
  $filter?: string;
  $orderby?: string;
  $top?: number;
  $skip?: number;
  $expand?: string;
  $count?: boolean;
}

export interface CreateRecordRequest {
  table: string;
  data: DataverseRecord;
}

export interface ReadRecordRequest {
  table: string;
  id: string;
  select?: string;
  expand?: string;
}

export interface UpdateRecordRequest {
  table: string;
  id: string;
  data: DataverseRecord;
}

export interface DeleteRecordRequest {
  table: string;
  id: string;
}

export interface QueryRecordsRequest {
  table: string;
  select?: string;
  filter?: string;
  orderby?: string;
  top?: number;
  skip?: number;
  expand?: string;
  count?: boolean;
}

export interface AssociateRecordsRequest {
  table: string;
  id: string;
  relationshipName: string;
  relatedTable: string;
  relatedId: string;
}

export interface DisassociateRecordsRequest {
  table: string;
  id: string;
  relationshipName: string;
  relatedId: string;
}

export interface TableMetadata {
  LogicalName: string;
  DisplayName: {
    UserLocalizedLabel: {
      Label: string;
    };
  };
  Description?: {
    UserLocalizedLabel: {
      Label: string;
    };
  };
  Attributes: AttributeMetadata[];
}

export interface AttributeMetadata {
  LogicalName: string;
  DisplayName: {
    UserLocalizedLabel: {
      Label: string;
    };
  };
  AttributeType: string;
  IsPrimaryId: boolean;
  IsValidForCreate: boolean;
  IsValidForUpdate: boolean;
  RequiredLevel: {
    Value: string;
  };
}

export interface AccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_on: number;
} 