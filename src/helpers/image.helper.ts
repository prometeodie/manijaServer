import * as sharp from 'sharp';
import { BadRequestException } from '@nestjs/common';


export const fileFilter = (req, file, callback) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)){
        console.error('Invalid format type. Valid extension formats are: JPG, JPEG, PNG, and GIF');  
        return callback(new BadRequestException('Invalid format type. Valid extension formats are: JPG, JPEG, PNG, and GIF'), false);
    }
    callback(null,true)
}

export const imgResizing = async (file: Express.Multer.File, size: number): Promise<Buffer> => {
    return await sharp(file.buffer)
      .resize(size)
      .jpeg({ quality: 85 })
      .toBuffer();
  };
  
  export const extractFileName = (filePath: string) =>{
    return filePath.replace(/^uploads\/mobile-?|^uploads\//, '').split('\\').pop()!.split('/').pop()!;
  }
