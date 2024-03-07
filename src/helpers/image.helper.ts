import * as fs from 'node:fs';
import * as crypto from 'crypto';
import * as path from 'path';

export const saveImage = (req, file, callback) => {
    const { section, itemName } = req.body; 
    const currDir = process.cwd();
    
    if (!fs.existsSync(`${currDir}/upload/${section}/${itemName}`)) {
        fs.mkdirSync(`${currDir}/upload/${section}/${itemName}`);
    }
    
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
        return callback('Invalid format type. valid extension format JPG, JPEG, PNG y GIF', false);
    }
    callback(null,true)
}

// TODO:debo aveiguar con shave o share bajarle peso y que envie la iumagen de menor targetModulesByContainer;o segun si es mobile o desktop