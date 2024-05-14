import { SetMetadata } from "@nestjs/common";
import { PUBLIC_KEY } from "../utils/key-decorator";

export const PublicAccess = () => SetMetadata(PUBLIC_KEY,true)