import { Schema, Document } from 'mongoose';

export class BaseSchema extends Schema {
  constructor(definition: any, options: any) {
    super(
      {
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        deletedAt: {
          type: Date,
          default: null,
        },
        ...definition,
      },
      {
        ...options,
        _id: false, // Jangan gunakan _id di dokumen ini
      },
    );
  }
}

export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
