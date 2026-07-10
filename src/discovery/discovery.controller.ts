import { Controller, Get, Param } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get(':connectionId/datasets')
  async getDatasets(@Param('connectionId') connectionId: string) {
    return this.discoveryService.getDatasets(connectionId);
  }

  @Get(':connectionId/datasets/:datasetId/tables')
  async getTables(
    @Param('connectionId') connectionId: string,
    @Param('datasetId') datasetId: string,
  ) {
    return this.discoveryService.getTables(connectionId, datasetId);
  }

  @Get(':connectionId/datasets/:datasetId/tables/:tableId/columns')
  async getTableColumns(
    @Param('connectionId') connectionId: string,
    @Param('datasetId') datasetId: string,
    @Param('tableId') tableId: string,
  ) {
    return this.discoveryService.getTableColumns(connectionId, datasetId, tableId);
  }
}
