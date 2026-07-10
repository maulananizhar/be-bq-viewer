import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { QueryHistoryService } from './query-history.service';

@Controller('query-history')
export class QueryHistoryController {
  constructor(private readonly service: QueryHistoryService) {}

  @Get(':connectionId')
  async findByConnection(@Param('connectionId') connectionId: string) {
    return this.service.findByConnection(connectionId);
  }

  @Post()
  async create(@Body() data: { connection_id: string; query: string }) {
    return this.service.create(data.connection_id, data.query);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true };
  }

  @Delete('connection/:connectionId')
  async removeByConnection(@Param('connectionId') connectionId: string) {
    await this.service.removeByConnection(connectionId);
    return { success: true };
  }
}
