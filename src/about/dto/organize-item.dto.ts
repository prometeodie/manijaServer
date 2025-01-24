import { IsOptional, IsString } from 'class-validator';

export class UpdateAboutItemsOrderDto{
    @IsString()
    @IsOptional()
    _id:string;
}
