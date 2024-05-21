import { IsNotEmpty, IsObject, IsString } from "class-validator";
import { ManijometroValues } from "../utils/manijometro-interfaces";

export class ManijometroPoolDto {

    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsObject()
    @IsNotEmpty()
    manijometroValuesPool: ManijometroValues;
}

// {
//     "title": "juego de prueba nuevo reel",
//     "categoryGame": "EUROGAME",
//     "categoryChips": [
//         "Categoria 1",
//         "Categoria 2"
//     ],
//     "minPlayers": 3,
//     "maxPlayers": 4,
//     "duration": 60,
//     "gameReview": "Revisión del juego",
//     "dificulty": "MEDIUM",
//     "replayability": "MEDIUM",
//     "howToPlayUrl": "URL de cómo jugar",
//     "reel": [{
//         "reelUrl": "asdjashgasvd.com",
//         "plataform": "tik-tok"
//     },{
//         "reelUrl": "asdasdasdas.com",
//         "plataform": "Instagram"
//     }],
//     "section": "BOARDGAMES",
//     "cardCoverImgName": "Nombre de la imagen de portada",
//     "imgName": [
//         "Nombre de la imagen 1",
//         "Nombre de la imagen 2"
//     ],
//     "publish": true
// }