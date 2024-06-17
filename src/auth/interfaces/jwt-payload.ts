import { Roles } from "src/utils/roles.enum";


export interface JwtPayload {

    id: string;
    name: string;
    surname: string;
    roles: Roles[];
    iat?: number;
    exp?: number;

}

