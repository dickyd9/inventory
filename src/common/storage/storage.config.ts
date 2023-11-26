import { ConfigService } from '@nestjs/config';

export class StorageConfig {
  private projectId: string;
  private privateKey: string;
  private clientEmail: string;
  private mediaBucket: string;

  constructor(private readonly configService: ConfigService) {
    this.projectId = this.configService.get<string>('PROJECT_ID');
    this.privateKey = this.configService.get<string>('PRIVATE_KEY');
    this.clientEmail = this.configService.get<string>('CLIENT_EMAIL');
    this.mediaBucket = this.configService.get<string>('STORAGE_MEDIA_BUCKET');
  }

  getStorageConfig(): any {
    return {
      projectId: this.projectId,
      private_key: this.privateKey,
      client_email: this.clientEmail,
      mediaBucket: this.mediaBucket,
    };
  }
}
