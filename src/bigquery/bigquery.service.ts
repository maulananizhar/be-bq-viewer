import { Injectable } from '@nestjs/common';
import { BigQuery, BigQueryOptions } from '@google-cloud/bigquery';

export interface GcpCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  token_url: string;
}

@Injectable()
export class BigqueryService {
  createClient(projectId: string, creds: GcpCredentials): BigQuery {
    const options: BigQueryOptions = {
      projectId,
      credentials: {
        ...creds,
        private_key: creds.private_key?.replace(/\\n/g, '\n'),
      },
    };
    return new BigQuery(options);
  }

  async executeQuery(projectId: string, creds: GcpCredentials, query: string): Promise<any> {
    const bq = this.createClient(projectId, creds);
    const [job] = await bq.createQueryJob({ query });
    const [rows] = await job.getQueryResults();
    return rows;
  }

  async executeQueryWithSchema(
    projectId: string,
    creds: GcpCredentials,
    query: string,
  ): Promise<{ rows: any[]; schema: any }> {
    const bq = this.createClient(projectId, creds);
    const [job] = await bq.createQueryJob({ query });
    const [rows] = await job.getQueryResults();
    const schema = job.metadata?.statistics?.query?.statementType
      ? { statementType: job.metadata.statistics.query.statementType }
      : {};
    return { rows, schema };
  }

  async listDatasets(projectId: string, creds: GcpCredentials): Promise<{ id: string; name: string }[]> {
    const bq = this.createClient(projectId, creds);
    const [datasets] = await bq.getDatasets();
    return datasets.map((ds) => ({
      id: ds.id || '',
      name: `\`${ds.metadata?.datasetReference?.datasetId || ds.id}\``,
    }));
  }

  async listTables(
    projectId: string,
    creds: GcpCredentials,
    datasetId: string,
  ): Promise<{ id: string; name: string; type: string }[]> {
    const bq = this.createClient(projectId, creds);
    const dataset = bq.dataset(datasetId);
    const [tables] = await dataset.getTables();
    return tables.map((t) => ({
      id: t.id || '',
      name: t.id || '',
      type: t.metadata?.type || 'TABLE',
    }));
  }

  async getTableColumns(
    projectId: string,
    creds: GcpCredentials,
    datasetId: string,
    tableId: string,
  ): Promise<{ name: string; type: string }[]> {
    const bq = this.createClient(projectId, creds);
    const dataset = bq.dataset(datasetId);
    const table = dataset.table(tableId);
    const [metadata] = await table.getMetadata();
    return (metadata.schema?.fields || []).map((field: any) => ({
      name: field.name,
      type: field.type,
    }));
  }
}
