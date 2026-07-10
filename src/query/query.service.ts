import { Injectable } from '@nestjs/common';
import { BigqueryService } from '../bigquery/bigquery.service';
import { ConnectionsService } from '../connections/connections.service';
import { QueryHistoryService } from '../query-history/query-history.service';

@Injectable()
export class QueryService {
  constructor(
    private readonly bigqueryService: BigqueryService,
    private readonly connectionsService: ConnectionsService,
    private readonly queryHistoryService: QueryHistoryService,
  ) {}

  async runQuery(query: string, connectionId: string) {
    try {
      const conn = await this.connectionsService.findOne(connectionId);

      const credentials = {
        type: conn.type,
        project_id: conn.project_id,
        private_key_id: conn.private_key_id || '',
        private_key: conn.private_key,
        client_email: conn.client_email,
        client_id: conn.client_id || '',
        token_url: conn.token_url,
      };

      const { rows, schema } = await this.bigqueryService.executeQueryWithSchema(
        conn.project_id,
        credentials,
        query,
      );

      // If the query has a LIMIT clause, get the total count without limit
      let totalCount = rows.length;
      const queryWithoutLimit = this.stripLimit(query);
      if (queryWithoutLimit) {
        try {
          const countQuery = `SELECT COUNT(*) AS cnt FROM (\n${queryWithoutLimit}\n) _cnt`;
          const countRows = await this.bigqueryService.executeQuery(
            conn.project_id,
            credentials,
            countQuery,
          );
          totalCount = Number(countRows[0]?.cnt) ?? rows.length;
        } catch {
          // Fall back to returned rows count
          totalCount = rows.length;
        }
      }

      // Save to query history (async, don't block response)
      this.queryHistoryService.create(connectionId, query).catch(() => {});

      return {
        data: rows,
        totalRows: rows.length,
        totalCount,
        schema,
      };
    } catch (error) {
      return {
        error: error.message || 'An error occurred while executing the query',
      };
    }
  }

  /**
   * Strip the outermost LIMIT clause from a query to get the full result set.
   * Returns null if no LIMIT clause is found at the outer level.
   */
  private stripLimit(query: string): string | null {
    // Trim whitespace and trailing semicolons
    const trimmed = query.trim().replace(/;+$/, '').trimEnd();

    // Match LIMIT <number> (and optional OFFSET) at the end of the query
    const regex = /\bLIMIT\s+\d+(?:\s*,\s*\d+)?(?:\s+OFFSET\s+\d+)?\s*$/i;
    const match = trimmed.match(regex);

    if (!match) return null;

    // Return the query without the LIMIT clause
    return trimmed.slice(0, match.index).trimEnd();
  }
}
