import { CloudinaryService } from './cloudinary.service';
export declare class UploadsController {
    private readonly cloudinaryService;
    constructor(cloudinaryService: CloudinaryService);
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadFile(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
