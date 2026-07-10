import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { QueryService } from './query.service';

@Controller('query')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async runQuery(@Body() body: { query: string; connection_id: string }) {
    if (!body.query || typeof body.query !== 'string' || body.query.trim() === '') {
      return { error: 'Query is required' };
    }
    if (!body.connection_id) {
      return { error: 'connection_id is required' };
    }
    return this.queryService.runQuery(body.query, body.connection_id);
  }
}
