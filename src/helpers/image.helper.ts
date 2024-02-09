import * as fs from 'node:fs';

export const renameImage = (req, file, callaback) => {
    const { section, itemName } = req.body;
    const name = file.originalname.split('.')[0];
    const fileName = file.originalname;
    const currDir = process.cwd();
    if (!fs.existsSync(`${currDir}/upload/images/${section}/${itemName}`)) {
        fs.mkdirSync(`${currDir}/upload/images/${section}/${itemName}`);
    }
    const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');

    callaback(null, `${section}/${itemName}/${name}-${randomName}${fileName}`);
}