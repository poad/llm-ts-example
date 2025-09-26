import pg, { QueryResult } from 'pg';
import { z } from 'zod';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger();

const connectionString = process.env.POSTGRESQL_URL ?? 'postgres://postgres:postgres@localhost:15432/postgres';

const pool = new pg.Pool({
  connectionString,
});

const queryTool = {
  name: 'query',
  description: 'Execute a SQL query against the PostgreSQL database with optional parameter binding',
  annotations: {
    title: 'SQL Query Execution',
    openWorldHint: true,
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
  },
  parameters: z.object({
    sql: z.string().describe('The SQL query to execute'),
    params: z.array(z.any()).optional().describe('Optional parameters for parameterized queries'),
  }),
  timeoutMs: 30000, // 30 second timeout for long queries
  execute: async (args: {
    sql: string;
    params?: string[];
  }): Promise<{
    content: {
      type: 'text';
      text: string;
    }[];
  }> => {
    try {
      const { sql, params = [] } = args;

      logger.info(`Executing SQL query: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);

      if (params.length > 0) {
        logger.debug(`Query parameters: ${JSON.stringify(params)}`);
      }

      const result = await executeQuery(sql, params);

      logger.info(`Query executed successfully. Rows returned: ${result.rowCount}`);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            rowCount: result.rowCount,
            rows: result.rows,
            fields: result.fields.map(f => ({
              name: f.name,
              type: f.dataTypeID,
              size: f.dataTypeSize,
            })),
          }, null, 2),
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Query execution failed: ${errorMessage}`, { error });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
          }, null, 2),
        }],
      };
    }
  },
};

// List tables tool
const listTablesTool = {
  name: 'list_tables',
  description: 'List all tables in the specified database schema',
  annotations: {
    title: 'List Database Tables',
    openWorldHint: true,
    readOnlyHint: true,
  },
  parameters: z.object({
    schema: z.string().default('public').describe('Schema to filter tables (defaults to public)'),
  }),
  execute: async (args: {
    schema: string;
  }): Promise<{
    content: {
      type: 'text';
      text: string;
    }[];
  }> => {
    try {
      const { schema } = args;
      logger.info(`Listing tables in schema: ${schema}`);

      const tables = await listTables(schema);

      logger.info(`Found ${tables.length} tables in schema ${schema}`);
      logger.info(`Tables ${tables.map(t => t.table_name).join(', ')}`);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            schema: schema,
            tableCount: tables.length,
            tables,
          }, null, 2),
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to list tables: ${errorMessage} db: ${connectionString}`, { error });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
          }, null, 2),
        }],
      };
    }
  },
};

// Describe table tool
const describeTableTool = {
  name: 'describe_table',
  description: 'Get detailed column information and structure for a specific table',
  annotations: {
    title: 'Describe Table Structure',
    openWorldHint: true,
    readOnlyHint: true,
  },
  parameters: z.object({
    table_name: z.string().describe('Name of the table to describe'),
    schema: z.string().default('public').describe('Schema of the table (defaults to public)'),
  }),
  execute: async (args: {
    table_name: string;
    schema: string;
  }): Promise<{
    content: {
      type: 'text';
      text: string;
    }[];
  }> => {
    try {
      const { table_name, schema } = args;
      logger.info(`Describing table: ${schema}.${table_name}`);

      const columns = await describeTable(table_name, schema);

      if (columns.length === 0) {
        logger.warn(`Table ${schema}.${table_name} not found or has no columns`);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: `Table ${schema}.${table_name} not found`,
            }, null, 2),
          }],
        };
      }

      logger.info(`Table ${schema}.${table_name} has ${columns.length} columns`);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            table: `${schema}.${table_name}`,
            columnCount: columns.length,
            columns: columns,
          }, null, 2),
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to describe table: ${errorMessage}`, { error });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
          }, null, 2),
        }],
      };
    }
  },
};

// Execute stored procedure tool
const callProcedureTool = {
  name: 'call_procedure',
  description: 'Execute a stored procedure or function with parameters',
  annotations: {
    title: 'Call Stored Procedure',
    openWorldHint: true,
    readOnlyHint: false,
    destructiveHint: false,
  },
  parameters: z.object({
    procedure_name: z.string().describe('Name of the procedure/function to call'),
    params: z.array(z.any()).default([]).describe('Parameters for the procedure'),
    schema: z.string().default('public').describe('Schema of the procedure (defaults to public)'),
  }),
  timeoutMs: 60000, // 60 second timeout for procedures
  execute: async (args: {
    procedure_name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any[];
    schema: string;
  }): Promise<{
    content: {
      type: 'text';
      text: string;
    }[];
  }> => {
    try {
      const { procedure_name, params, schema } = args;

      logger.info(`Calling procedure: ${schema}.${procedure_name}`);
      if (params.length > 0) {
        logger.debug(`Procedure parameters: ${JSON.stringify(params)}`);
      }

      const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
      const sql = `SELECT ${schema}.${procedure_name}(${placeholders})`;

      const result = await executeQuery(sql, params);

      logger.info('Procedure executed successfully');

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            procedure: `${schema}.${procedure_name}`,
            result: result.rows,
          }, null, 2),
        }],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to call procedure: ${errorMessage}`, { error });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
          }, null, 2),
        }],
      };
    }
  },
};

// Database export tool
const exportSchemaTool = {
  name: 'export_schema',
  description: 'Export database schema information in a structured format',
  annotations: {
    title: 'Export Database Schema',
    openWorldHint: true,
    readOnlyHint: true,
    streamingHint: true,
  },
  parameters: z.object({
    schemas: z.array(z.string()).default(['public']).describe('List of schemas to export'),
    include_data: z.boolean().default(false).describe('Include sample data (first 5 rows per table)'),
  }),
  execute: async (args: {
    schemas: string[];
    include_data: boolean;
  }): Promise<{
    content: {
      type: 'text';
      text: string;
    }[];
  }> => {
    try {
      const { schemas, include_data } = args;

      // await context.streamContent({
      //   type: 'text',
      //   text: 'Starting schema export...\n',
      // });

      const exportData: {
        schemas: Record<string,
          {
            tables: Record<string,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { type: string; columns: string[]; sampleData?: any[]; sampleDataError?: string }>
          }>;
      } = { schemas: {} };

      for (const schema of schemas) {
        // await context.streamContent({
        //   type: 'text',
        //   text: `Exporting schema: ${schema}\n`,
        // });

        const tables = await listTables(schema);
        exportData.schemas[schema] = { tables: {} };

        for (const table of tables) {
          // await context.streamContent({
          //   type: 'text',
          //   text: `  Processing table: ${table.table_name}\n`,
          // });

          const columns = await describeTable(table.table_name, schema);
          exportData.schemas[schema].tables[table.table_name] = {
            type: table.table_type,
            columns: columns,
          };

          if (include_data) {
            try {
              const sampleData = await executeQuery(
                `SELECT * FROM ${schema}.${table.table_name} LIMIT 5`,
              );
              exportData.schemas[schema].tables[table.table_name].sampleData = sampleData.rows;
            } catch (error) {
              // Skip tables we can't read
              exportData.schemas[schema].tables[table.table_name].sampleDataError =
                error instanceof Error ? error.message : 'Unknown error';
            }
          }
        }
      }

      // await context.streamContent({
      //   type: 'text',
      //   text: 'Export completed!\n\n',
      // });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(exportData, null, 2),
        }],
      };
    } catch (error) {
      logger.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // await context.streamContent({
      //   type: 'text',
      //   text: `Export failed: ${errorMessage}\n`,
      // });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
          }, null, 2),
        }],
      };
    }
  },
};

// Database schema resource
const schemaResource = {
  uri: 'postgres://schema',
  name: 'Database Schema',
  description: 'Complete database schema information',
  mimeType: 'application/json',
  load: async () => {
    try {
      const tables = await listTables();
      const schema: Record<string, Record<string, string | string[]>> = {};

      for (const table of tables) {
        const columns = await describeTable(table.table_name, table.table_schema);
        const tableKey = `${table.table_schema}.${table.table_name}`;
        schema[tableKey] = {
          type: table.table_type,
          schema: table.table_schema,
          name: table.table_name,
          columns: columns,
        };
      }

      return {
        text: JSON.stringify({
          generated_at: new Date().toISOString(),
          table_count: tables.length,
          schema: schema,
        }, null, 2),
      };
    } catch (error) {
      logger.error(`Failed to load schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        text: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          generated_at: new Date().toISOString(),
        }, null, 2),
      };
    }
  },
};

// Connection status resource
const connectionStatusResource = {
  uri: 'postgres://status',
  name: 'Database Status',
  description: 'Real-time database connection status and statistics',
  mimeType: 'application/json',
  load: async () => {
    try {
      const client = await pool.connect();
      const result = await client.query(`
            SELECT
              version() as version,
              current_database() as database,
              current_user as user,
              now() as timestamp,
              pg_database_size(current_database()) as database_size_bytes
          `);
      client.release();

      return {
        text: JSON.stringify({
          connected: true,
          timestamp: new Date().toISOString(),
          database_info: {
            version: result.rows[0].version,
            database: result.rows[0].database,
            user: result.rows[0].user,
            server_time: result.rows[0].timestamp,
            size_bytes: result.rows[0].database_size_bytes,
          },
          connection_pool: {
            total_count: pool.totalCount,
            idle_count: pool.idleCount,
            waiting_count: pool.waitingCount,
          },
        }, null, 2),
      };
    } catch (error) {
      logger.error(`Failed to get connection status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        text: JSON.stringify({
          connected: false,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        }, null, 2),
      };
    }
  },
};

async function executeQuery(sql: string, params: string[] = []): Promise<QueryResult> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount ?? 0,
      fields: result.fields ?? [],
      command: result.command ?? '',
      oid: result.oid ?? 0,
    };
  } finally {
    client.release();
  }
}

async function listTables(schema = 'public'): Promise<Record<string, string>[]> {
  const sql = `
      SELECT table_name, table_schema, table_type
      FROM information_schema.tables
      WHERE table_schema = $1
      ORDER BY table_name
    `;
  const result = await executeQuery(sql, [schema]);
  return result.rows;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function describeTable(tableName: string, schema = 'public'): Promise<any[]> {
  const sql = `
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        ordinal_position
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = $2
      ORDER BY ordinal_position
    `;
  const result = await executeQuery(sql, [tableName, schema]);
  return result.rows;
}

export const pgMcp = {
  tools: {
    query: queryTool,
    'list-tables': listTablesTool,
    'describe-table': describeTableTool,
    'call-procedure': callProcedureTool,
    'export-schema': exportSchemaTool,
  },
  resources: {
    schema: schemaResource,
    status: connectionStatusResource,
  },
};
