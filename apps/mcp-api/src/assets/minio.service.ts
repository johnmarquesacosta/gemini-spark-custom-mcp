import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;
  private readonly logger = new Logger(MinioService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.bucketName =
      this.configService.get<string>('MINIO_BUCKET') || 'assets';
    const endPoint =
      this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
    const port = this.configService.get<number>('MINIO_PORT') || 9000;
    const accessKey =
      this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin';
    const secretKey =
      this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin';
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket ${this.bucketName} created.`);
      }
    } catch (err) {
      this.logger.error(`Error checking/creating bucket: ${err.message}`);
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    objectName: string,
    mimeType: string,
  ): Promise<string> {
    try {
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        buffer,
        undefined,
        {
          'Content-Type': mimeType,
        },
      );

      // Construct public URL - assuming standard MinIO setup or proxy
      const protocol =
        this.configService.get<string>('MINIO_USE_SSL') === 'true'
          ? 'https'
          : 'http';
      const endPoint =
        this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
      const port = this.configService.get<number>('MINIO_PORT')
        ? `:${this.configService.get<number>('MINIO_PORT')}`
        : ':9000';
      const publicUrlBase =
        this.configService.get<string>('MINIO_PUBLIC_URL') ||
        `${protocol}://${endPoint}${port}`;

      return `${publicUrlBase}/${this.bucketName}/${objectName}`;
    } catch (error) {
      this.logger.error(`Error uploading to MinIO: ${error.message}`);
      throw error;
    }
  }
}
