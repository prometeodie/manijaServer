import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";


export class CreateBlogsManijaDto {

    @IsString()
    @IsNotEmpty()
    title: string;
    
    @IsString()
    @IsNotEmpty()
    subTitle: string;
    
    @IsString()
    @IsNotEmpty()
    writedBy:string;
    
    @IsString()
    @MinLength(20)
    blogContent:string;

    @IsString()
    @IsOptional()
    imgUrl:string;
}
