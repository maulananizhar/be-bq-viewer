import { Injectable, NotFoundException } from '@nestjs/common';
import { BigqueryService } from '../bigquery/bigquery.service';
import { ConnectionsService } from '../connections/connections.service';

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly bigqueryService: BigqueryService,
    private readonly connectionsService: ConnectionsService,
  ) {}

  async getDatasets(connectionId: string) {
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
  return this.bigqueryService.listDatasets(conn.project_id, credentials);
  }

  async getTables(connectionId: string, datasetId: string) {
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
    return this.bigqueryService.listTables(conn.project_id, credentials, datasetId);
  }

  async getTableColumns(connectionId: string, datasetId: string, tableId: string) {
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
    return this.bigqueryService.getTableColumns(conn.project_id, credentials, datasetId, tableId);
  }
}
