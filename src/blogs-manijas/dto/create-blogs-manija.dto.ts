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
    writedBy: string;

    @IsString()
    @IsNotEmpty()
    category:string[]
    
    @IsString()
    @MinLength(20)
    blogContent: string;

    @IsString()
    @IsOptional()
<<<<<<< HEAD
    imgUrl:string;
=======
    imgUrl: string;
>>>>>>> cd61ab867d20d271232a3a23174fc5ed0da36ffa

    @IsString()
    @IsOptional()
    section: string; // juegos, blogs, eventos

    @IsString()
    @IsOptional()
    itemName: string; // if:juegos / zombiecide, brass, kinmo...
    // if:blog / blog1, blog2, ...
<<<<<<< HEAD
    // if:evento / event1, event2, .
    // TODO: debo mandar el titulo sin ningun espacio
=======
    // if:evento / event1, event2, ...
>>>>>>> cd61ab867d20d271232a3a23174fc5ed0da36ffa
}
