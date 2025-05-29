# Dataverse MCP Server

A Model Context Protocol (MCP) server that provides comprehensive CRUD operations for Microsoft Dataverse. This server enables seamless integration with Dataverse environments, allowing you to create, read, update, delete, and query records using natural language through MCP-compatible clients like Claude.

## Features

- ✅ **Complete CRUD Operations**: Create, read, update, and delete records
- ✅ **Advanced Querying**: Support for OData filters, sorting, pagination, and expansion
- ✅ **Table Discovery**: List available tables and their metadata
- ✅ **Robust Authentication**: OAuth 2.0 client credentials flow with automatic token refresh
- ✅ **Comprehensive Logging**: Detailed logging for debugging and monitoring
- ✅ **Input Validation**: Thorough validation of all inputs and OData queries
- ✅ **Error Handling**: Graceful error handling with detailed error messages
- ✅ **Flexible Configuration**: Support for both environment variables and MCP configuration arguments

## Prerequisites

Before using this MCP server, you need:

1. **Microsoft Dataverse Environment**: Access to a Dataverse environment
2. **Azure AD App Registration**: An app registration with appropriate permissions
3. **Node.js**: Version 18 or higher

## Setup

### 1. Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App Registrations
2. Click "New registration"
3. Name your application (e.g., "Dataverse MCP Server")
4. Leave Redirect URI blank
5. Click "Register"
6. Note down the **Application (client) ID** and **Directory (tenant) ID**
7. Go to "Certificates & secrets" → "New client secret"
8. Create a secret and note down the **Client Secret Value**
9. Go to "API permissions" → "Add a permission" → "Dynamics CRM"
10. Add "user_impersonation" permission (Application permission)
11. Click "Grant admin consent"

### 2. Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

You can configure the Dataverse MCP server in two ways:

### Option 1: MCP Configuration Arguments (Recommended)

Pass credentials directly through the MCP configuration. This is the recommended approach as it keeps credentials secure within your MCP client configuration.

### Option 2: Environment Variables

Use environment variables for configuration (backward compatibility).

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Dataverse credentials in `.env`:
   ```env
   # Dataverse Authentication (Required)
   DATAVERSE_CLIENT_ID=your-client-id-here
   DATAVERSE_CLIENT_SECRET=your-client-secret-here
   DATAVERSE_TENANT_ID=your-tenant-id-here
   DATAVERSE_ENVIRONMENT_URL=https://yourorg.crm.dynamics.com

   # Optional Configuration
   LOG_LEVEL=info
   RATE_LIMIT_REQUESTS_PER_MINUTE=60
   ```

## MCP Configuration

### For Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dataverse": {
      "command": "node",
      "args": [
        "path/to/dataverse-mcp/build/src/index.js",
        "--clientId", "your-client-id-here",
        "--clientSecret", "your-client-secret-here", 
        "--tenantId", "your-tenant-id-here",
        "--environmentUrl", "https://yourorg.crm.dynamics.com"
      ]
    }
  }
}
```

### For Cursor

Add to your `.vscode/mcp.json`:

```json
{
  "servers": {
    "dataverse": {
      "type": "stdio",
      "command": "node",
      "args": [
        "./build/src/index.js",
        "--clientId", "your-client-id-here",
        "--clientSecret", "your-client-secret-here",
        "--tenantId", "your-tenant-id-here", 
        "--environmentUrl", "https://yourorg.crm.dynamics.com"
      ]
    }
  }
}
```

### For Cline

Add to your Cline MCP configuration file (`~/.cline/mcp_servers.json` on macOS/Linux or `%APPDATA%\.cline\mcp_servers.json` on Windows):

```json
{
  "mcpServers": {
    "dataverse": {
      "command": "node",
      "args": [
        "path/to/dataverse-mcp/build/src/index.js",
        "--clientId", "your-client-id-here",
        "--clientSecret", "your-client-secret-here",
        "--tenantId", "your-tenant-id-here",
        "--environmentUrl", "https://yourorg.crm.dynamics.com"
      ]
    }
  }
}
```

Alternatively, if using Cline in VS Code, you can configure it in your workspace settings (`.vscode/settings.json`):

```json
{
  "cline.mcpServers": {
    "dataverse": {
      "command": "node",
      "args": [
        "./build/src/index.js",
        "--clientId", "your-client-id-here",
        "--clientSecret", "your-client-secret-here",
        "--tenantId", "your-tenant-id-here",
        "--environmentUrl", "https://yourorg.crm.dynamics.com"
      ]
    }
  }
}
```

### Configuration Parameters

When using MCP configuration arguments, you can pass the following parameters:

- `--clientId`: Azure AD Application (client) ID
- `--clientSecret`: Azure AD Client Secret
- `--tenantId`: Azure AD Directory (tenant) ID  
- `--environmentUrl`: Dataverse environment URL (e.g., https://yourorg.crm.dynamics.com)
- `--logLevel`: Log level (error, warn, info, debug) - defaults to 'info'
- `--rateLimit`: Rate limit requests per minute - defaults to 60

### Legacy Environment Variable Configuration

If you prefer to use environment variables (or for backward compatibility), you can still configure using `.env` file or environment variables:

```json
{
  "mcpServers": {
    "dataverse": {
      "command": "node", 
      "args": ["path/to/dataverse-mcp/build/src/index.js"],
      "env": {
        "DATAVERSE_CLIENT_ID": "your-client-id-here",
        "DATAVERSE_CLIENT_SECRET": "your-client-secret-here",
        "DATAVERSE_TENANT_ID": "your-tenant-id-here",
        "DATAVERSE_ENVIRONMENT_URL": "https://yourorg.crm.dynamics.com"
      }
    }
  }
}
```

**Note**: CLI arguments take precedence over environment variables, so you can mix both approaches if needed.

## Available Tools

### 1. `dataverse_create_record`
Create a new record in a Dataverse table.

**Parameters:**
- `table` (string, required): Table name (e.g., "contacts", "accounts")
- `data` (object, required): Record data as key-value pairs

**Example:**
```json
{
  "table": "contacts",
  "data": {
    "firstname": "John",
    "lastname": "Doe",
    "emailaddress1": "john.doe@example.com"
  }
}
```

### 2. `dataverse_read_record`
Read a single record by ID.

**Parameters:**
- `table` (string, required): Table name
- `id` (string, required): Record GUID
- `select` (string, optional): Comma-separated columns to select
- `expand` (string, optional): Related entities to expand

**Example:**
```json
{
  "table": "contacts",
  "id": "12345678-1234-1234-1234-123456789012",
  "select": "firstname,lastname,emailaddress1"
}
```

### 3. `dataverse_query_records`
Query multiple records with OData filters.

**Parameters:**
- `table` (string, required): Table name
- `select` (string, optional): Columns to select
- `filter` (string, optional): OData filter expression
- `orderby` (string, optional): OData orderby expression
- `top` (number, optional): Maximum records to return
- `skip` (number, optional): Records to skip (pagination)
- `expand` (string, optional): Related entities to expand
- `count` (boolean, optional): Include total count

**Example:**
```json
{
  "table": "accounts",
  "select": "name,revenue,industrycode",
  "filter": "revenue gt 1000000",
  "orderby": "name asc",
  "top": 10
}
```

### 4. `dataverse_update_record`
Update an existing record.

**Parameters:**
- `table` (string, required): Table name
- `id` (string, required): Record GUID
- `data` (object, required): Data to update

**Example:**
```json
{
  "table": "contacts",
  "id": "12345678-1234-1234-1234-123456789012",
  "data": {
    "jobtitle": "Senior Developer",
    "telephone1": "555-0123"
  }
}
```

### 5. `dataverse_delete_record`
Delete a record.

**Parameters:**
- `table` (string, required): Table name
- `id` (string, required): Record GUID

**Example:**
```json
{
  "table": "contacts",
  "id": "12345678-1234-1234-1234-123456789012"
}
```

### 6. `dataverse_list_tables`
List all available tables in the environment.

**Parameters:** None

## Usage Examples

### Creating a Contact
```
Create a new contact with name "Jane Smith" and email "jane.smith@example.com"
```

### Querying Accounts
```
Find all accounts with revenue greater than $1 million, ordered by name
```

### Reading a Specific Record
```
Get the contact with ID 12345678-1234-1234-1234-123456789012, including their full name and email
```

### Updating a Record
```
Update the job title of contact 12345678-1234-1234-1234-123456789012 to "Senior Manager"
```

## OData Query Examples

### Filtering
- `firstname eq 'John'` - Exact match
- `revenue gt 1000000` - Greater than
- `createdon ge 2024-01-01T00:00:00Z` - Date comparison
- `contains(name, 'Microsoft')` - Contains text

### Ordering
- `name asc` - Ascending order
- `createdon desc` - Descending order
- `revenue desc, name asc` - Multiple fields

### Selecting Fields
- `firstname,lastname,emailaddress1` - Specific fields
- `*` - All fields (not recommended for performance)

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your client ID, secret, and tenant ID
   - Ensure admin consent was granted for API permissions
   - Check that the client secret hasn't expired

2. **Environment URL Invalid**
   - Ensure the URL format is correct: `https://yourorg.crm.dynamics.com`
   - Verify you have access to the Dataverse environment

3. **Table Not Found**
   - Use `dataverse_list_tables` to see available tables
   - Check table name spelling (case-sensitive)

4. **Permission Denied**
   - Verify your app registration has the correct permissions
   - Ensure the user/app has access to the specific table

### Logging

Set `--logLevel=debug` in your MCP configuration for detailed logging, or use environment variables:

```env
LOG_LEVEL=debug
```

## Security Considerations

- **Never commit your `.env` file** - It contains sensitive credentials
- **Use least privilege** - Only grant necessary permissions to your app registration
- **Rotate secrets regularly** - Update client secrets periodically
- **Monitor usage** - Keep track of API calls and unusual activity

## Development

### Building
```bash
npm run build
```

### Watching for Changes
```bash
npm run watch
```

### Testing with MCP Inspector
```bash
npm run inspector
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the [Microsoft Dataverse documentation](https://docs.microsoft.com/en-us/powerapps/developer/data-platform/)
3. Open an issue in this repository