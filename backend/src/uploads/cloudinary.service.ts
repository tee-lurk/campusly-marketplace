import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload a buffer to Cloudinary.
   * @param buffer  Raw file bytes (from multer MemoryStorage).
   * @param folder  Cloudinary folder to organise uploads.
   * @returns       The secure HTTPS URL of the uploaded resource.
   */
  async uploadBuffer(buffer: Buffer, folder = 'campusly'): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(
              new BadRequestException(
                `Cloudinary upload failed: ${error.message}`,
              ),
            );
            return;
          }
          if (!result) {
            reject(new BadRequestException('Cloudinary returned no result.'));
            return;
          }
          resolve(result.secure_url);
        },
      );

      // Pipe the buffer into Cloudinary's upload stream
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}
