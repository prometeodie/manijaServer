import * as fs from 'node:fs';
import * as crypto from 'crypto';
import * as path from 'path';
import * as sharp from 'sharp';

export const saveImage = (req, file, callback) => {
    const { section, itemName } = req.body; 
    const currDir = process.cwd();

    if(file.originalname.includes('cardCover')){
        pathCreator(`${currDir}/upload/${section}/${itemName}/cardCover`)
        callback(null, `upload/${section}/${itemName}/cardCover`);
        return;
    }
    pathCreator(`${currDir}/upload/${section}/${itemName}`)
    callback(null, `upload/${section}/${itemName}`);
}

export const nameImg = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const ext = path.extname(file.originalname);
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileName = `${name}-${randomName}${ext}`;
    callback(null, fileName);
}

export const fileFilter = (req, file, callback) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        console.error('Invalid format type. Valid extension formats are: JPG, JPEG, PNG, and GIF');  
        return callback(new Error('Invalid format type. Valid extension formats are: JPG, JPEG, PNG, and GIF'), false);
        
    }
    callback(null,true)
}

export const  imgResizing =  (filePath:string,fileName:string, size:number)=>{

    let path = `${filePath}/optimize/smallS-${fileName}`;
    let ubication = `${filePath}`

    if(fileName.includes('cardCover')){
        pathCreator(`${filePath}/cardCover/optimize`)
        path = `${filePath}/cardCover/optimize/smallS-${fileName}`
        ubication = `${filePath}/cardCover`
    }
    pathCreator(`${filePath}/optimize`)
    return sharp(`${ubication}/${fileName}`)
        .resize(size)
        .toFile(path)            
}

export const pathCreator = (path:string)=>{
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path,{ recursive: true });
    }
}

