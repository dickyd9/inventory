import { Injectable } from '@nestjs/common';
import { DownloadResponse, Storage } from '@google-cloud/storage';
import { StorageFile } from './storage.file';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.storage = new Storage({
      projectId: this.getStorageConfig().projectId,
      credentials: {
        client_email: this.getStorageConfig().client_email,
        private_key: this.getStorageConfig().private_key,
      },
    });

    this.bucket = this.getStorageConfig().mediaBucket;
  }

  getStorageConfig(): any {
    return {
      projectId: this.configService.get<string>('PROJECT_ID'),
      private_key: this.configService.get<string>('PRIVATE_KEY'),
      client_email: this.configService.get<string>('CLIENT_EMAIL'),
      mediaBucket: this.configService.get<string>('STORAGE_MEDIA_BUCKET'),
    };
  }

  async save(
    path: string,
    contentType: string,
    media: Buffer,
    metadata: { [key: string]: string }[],
  ) {
    const object = metadata.reduce((obj, item) => Object.assign(obj, item), {});
    const file = this.storage.bucket(this.bucket).file(path);
    const stream = file.createWriteStream();
    stream.on('finish', async () => {
      return await file.setMetadata({
        metadata: object,
      });
    });
    stream.end(media);
  }

  async delete(path: string) {
    await this.storage
      .bucket(this.bucket)
      .file(path)
      .delete({ ignoreNotFound: true });
  }

  async get(path: string): Promise<StorageFile> {
    const fileResponse: DownloadResponse = await this.storage
      .bucket(this.bucket)
      .file(path)
      .download();
    const [buffer] = fileResponse;
    const storageFile = new StorageFile();
    storageFile.buffer = buffer;
    storageFile.metadata = new Map<string, string>();
    return storageFile;
  }

  async getWithMetaData(path: string): Promise<StorageFile> {
    const [metadata] = await this.storage
      .bucket(this.bucket)
      .file(path)
      .getMetadata();
    const fileResponse: DownloadResponse = await this.storage
      .bucket(this.bucket)
      .file(path)
      .download();
    const [buffer] = fileResponse;

    const storageFile = new StorageFile();
    storageFile.buffer = buffer;
    const metadataEntries: [string, string][] = [];
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        metadataEntries.push([key, value]);
      }
    }
    const metadataMap = new Map<string, string>(metadataEntries);
    storageFile.metadata = metadataMap;
    storageFile.contentType = storageFile.metadata.get('contentType');
    return storageFile;
  }
}
