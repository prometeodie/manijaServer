
import * as fs from 'node:fs';

export const saveImage = (req, file, callaback) => {
    const { section, itemName } = req.body;
    const name = file.originalname.split('.')[0];
    const fileName = file.originalname;
    const currDir = process.cwd();

    if (!fs.existsSync(`${currDir}/upload/images/${section}/${itemName}`)) {
        fs.mkdirSync(`${currDir}/upload/images/${section}/${itemName}`);
    }
    const randomName = 'test'   
    // TODO:sascar randomname
    callaback(null, `${section}/${itemName}/${name}-${randomName}${fileName}`);
}

export const fileFilter = (req, file, callback) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
        return callback(new Error('Invalid format type'), false)
    }
    callback(null,true)
}
// TODO: debo ver como subir muchas imagenes y en cuestion de eso ponerle el numero en el nombre
// TODO:debo ver que nombre generico ponerle a las imagenes segun el titulo,lo ideal seria numeros.
// TODO: debo hacee el get para debolver la imagen
// TODO:debo aveiguar con shave o share bajarle peso y que envie la iumagen de menor targetModulesByContainer;o segun si es mobile o desktop
