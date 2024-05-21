import { SetMetadata } from "@nestjs/common";
import { ROLES_KEY } from "../utils/key-decorator";
import { Roles } from "src/utils/roles.enum";



export const RolesAccess = (...roles: Roles[]) => SetMetadata(ROLES_KEY,roles)