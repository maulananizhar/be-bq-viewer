import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Connection, ConnectionDocument } from './connection.entity';
import { EncryptionService } from '../common/encryption.service';

@Injectable()
export class ConnectionsService {
  constructor(
    @InjectModel(Connection.name)
    private readonly model: Model<ConnectionDocument>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async findAll(): Promise<Connection[]> {
    const conns = await this.model.find().sort({ createdAt: -1 }).exec();
    return conns.map((c) => this.decryptFields(c));
  }

  async findOne(id: string): Promise<Connection> {
    const conn = await this.model.findById(id).exec();
    if (!conn) throw new NotFoundException('Connection not found');
    return this.decryptFields(conn);
  }

  async create(data: Partial<Connection>): Promise<Connection> {
    const encrypted = this.encryptFields(data);
    return this.model.create(encrypted);
  }

  async update(id: string, data: Partial<Connection>): Promise<Connection> {
    const conn = await this.model.findById(id).exec();
    if (!conn) throw new NotFoundException('Connection not found');

    const encrypted = this.encryptFields(data);
    Object.assign(conn, encrypted);
    const saved = await conn.save();
    return this.decryptFields(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Connection not found');
  }

  /* ---- private helpers ---- */

  private encryptFields(data: Partial<Connection>): Partial<Connection> {
    const result = { ...data };
    if (result.private_key) {
      result.private_key = this.encryptionService.encrypt(result.private_key);
    }
    if (result.private_key_id) {
      result.private_key_id = this.encryptionService.encrypt(result.private_key_id);
    }
    return result;
  }

  private decryptFields<T extends Connection>(doc: T): T {
    const d = doc as any;
    if (d.private_key) {
      d.private_key = this.encryptionService.decrypt(d.private_key);
    }
    if (d.private_key_id) {
      d.private_key_id = this.encryptionService.decrypt(d.private_key_id);
    }
    return doc;
  }
}
