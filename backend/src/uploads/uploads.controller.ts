import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from './cloudinary.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/** Allow only image/* MIME types. */
function imageFileFilter(
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (!file.mimetype.startsWith('image/')) {
    cb(
      new BadRequestException(
        'Only image files are allowed (JPEG, PNG, WEBP, etc.).',
      ),
      false,
    );
    return;
  }
  cb(null, true);
}

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * POST /uploads/image
   * Accepts multipart/form-data with field name "file".
   * Returns { url: string } — the Cloudinary secure URL.
   */
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // keep file in memory as a Buffer
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: imageFileFilter,
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided. Send a "file" field in multipart/form-data.');
    }

    try {
      const url = await this.cloudinaryService.uploadBuffer(file.buffer);
      return { url };
    } catch (err: any) {
      // Re-throw known NestJS exceptions unchanged; wrap anything else
      if (err?.status) throw err;
      throw new InternalServerErrorException(
        `Image upload failed: ${err?.message ?? 'unknown error'}`,
      );
    }
  }

  /**
   * POST /uploads/file
   * Accepts multipart/form-data with field name "file".
   * Returns { url: string } — the Cloudinary secure URL.
   */
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided. Send a "file" field in multipart/form-data.');
    }

    try {
      const url = await this.cloudinaryService.uploadBuffer(file.buffer);
      return { url };
    } catch (err: any) {
      if (err?.status) throw err;
      throw new InternalServerErrorException(
        `File upload failed: ${err?.message ?? 'unknown error'}`,
      );
    }
  }
}
