import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Log } from './log.schema';
import { Model } from 'mongoose';

@Injectable()
export class LogService {
  constructor(@InjectModel('Log') private logModel: Model<Log>) {}

  async createLog(logData: Partial<Log>): Promise<Log> {
    const createdLog = new this.logModel(logData);
    return createdLog.save();
  }
}
