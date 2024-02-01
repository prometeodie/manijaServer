


export const renameImage = (req, file, callaback) =>{

    const name = file.originalname.split('.')[0];
    const fileName = file.originalname;
    const randomName = Array(4)
    .fill(null)
    .map(()=> Math.round(Math.random() * 16).toString(16))
    .join('');

    callaback(null, `${name}-${randomName}${fileName}`);
}