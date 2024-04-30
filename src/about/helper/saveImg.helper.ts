import { pathCreator } from "src/helpers/image.helper";

export const aboutSaveImage = (req, file, callback) => {
    
    const currDir = process.cwd();
    
    pathCreator(`${currDir}/upload/ABOUT`)

    callback(null, `upload/ABOUT`);
}
