import * as fs from 'node:fs';

<<<<<<< HEAD
import * as fs from 'node:fs';

export const saveImage = (req, file, callaback) => {
=======
export const renameImage = (req, file, callaback) => {
>>>>>>> cd61ab867d20d271232a3a23174fc5ed0da36ffa
    const { section, itemName } = req.body;
    const name = file.originalname.split('.')[0];
    const fileName = file.originalname;
    const currDir = process.cwd();
<<<<<<< HEAD

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
=======
    if (!fs.existsSync(`${currDir}/upload/images/${section}/${itemName}`)) {
        fs.mkdirSync(`${currDir}/upload/images/${section}/${itemName}`);
    }
    const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');

    callaback(null, `${section}/${itemName}/${name}-${randomName}${fileName}`);
}
>>>>>>> cd61ab867d20d271232a3a23174fc5ed0da36ffa
