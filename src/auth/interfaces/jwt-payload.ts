import { Roles } from "src/utils/roles.enum";


export interface JwtPayload {

    _id: string;
    name: string;
    surname: string;
    nickname: string;
    roles: Roles[];
    iat?: number;
    exp?: number;

}

