import { Roles } from "src/utils/roles.enum";


export interface JwtPayload {

    id: string;
    roles: Roles[];
    iat?: number;
    exp?: number;

}

