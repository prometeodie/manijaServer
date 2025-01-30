import * as fs from 'node:fs';
import * as crypto from 'crypto';
import * as path from 'path';
import * as sharp from 'sharp';
import { BadRequestException } from '@nestjs/common';

export const saveImage = (req, file, callback) => {
    const { section } = req.body; 
    const currDir = process.cwd();
    const {id} = req.params;

    if(file.originalname.includes('cardCover')){
        pathCreator(`${currDir}/upload/${section}/${id}/cardCover`)
        callback(null, `upload/${section}/${id}/cardCover`);
        return;
    }
    pathCreator(`${currDir}/upload/${section}/${id}`)
    callback(null, `upload/${section}/${id}`);
}

export const nameImg = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const ext = path.extname(file.originalname);
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileName = `${name}-${randomName}${ext}`;
    callback(null, fileName);
}

export const fileFilter = (req, file, callback) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)){
        console.error('Invalid format type. Valid extension formats are: JPG, JPEG, PNG, and GIF');  
        return callback(new BadRequestException('Invalid format type. Valid extension formats are: JPG, JPEG, PNG, and GIF'), false);
        
    }
    callback(null,true)
}

export const imgResizing =  (imageDirectory:string, originalFileUbication:string, fileName:string, size:number)=>{
    let path = `${originalFileUbication}/${imageDirectory}/${fileName}`;
    let ubication = `${originalFileUbication}`
    
    if(fileName.includes('cardCover')){
        pathCreator(`${originalFileUbication}/cardCover/${imageDirectory}`)
        path = `${originalFileUbication}/cardCover/${imageDirectory}/${fileName}`
        ubication = `${originalFileUbication}/cardCover`
    }
    pathCreator(`${originalFileUbication}/${imageDirectory}`)
    return sharp(`${ubication}/${fileName}`)
        .resize(size)
        .toFile(path)            
}

export const pathCreator = (path:string)=>{
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path,{ recursive: true });
    }
}

