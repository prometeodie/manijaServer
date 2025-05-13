import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
    private s3: S3;
    private bucketName: string;
  
    constructor(private readonly configService: ConfigService) {
      this.s3 = new S3({
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
        region: this.configService.get<string>('AWS_REGION'),
      });
  
      this.bucketName = this.configService.get<string>('AWS_S3_BUCKET');
    }
  
    async uploadFile(buffer: Buffer, fileName:string): Promise<string> {
      try{const uploadParams: S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: `uploads/${fileName}`,
        Body: buffer,
        ContentType: 'image/jpeg',
      };
  
      const result = await this.s3.upload(uploadParams).promise();
      
      return result.Key;
    }catch(error){
        throw new Error('Error uploading file from S3');
      }
    }

    async getSignedUrl(fileKey: string): Promise<string> {
      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        Expires: 3600, 
      };
    
      return this.s3.getSignedUrlPromise('getObject', params);
    }

    async deleteFile(fileKey: string): Promise<void> {
      const params: S3.DeleteObjectRequest = {
        Bucket: this.bucketName,
        Key: fileKey,
      };
      try {
        if (!fileKey) {
          throw new Error('File key is required to delete the file');
        }
        await this.s3.deleteObject(params).promise();
      } catch (error) {
        console.error('Error deleting file from S3', error);
        throw new Error('Error deleting file from S3');
      }
    }
}