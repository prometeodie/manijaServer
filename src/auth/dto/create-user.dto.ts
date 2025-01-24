import { IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword, Matches, MaxLength, MinLength } from 'class-validator';
import { Roles } from 'src/utils/roles.enum';



export class CreateUserDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    surname: string;

    @IsString()
    @IsNotEmpty()
    nickname: string;

    @IsEnum([Roles.USER, Roles.ADMIN, Roles.MASTER],{
        message:'Valid Role value Requiered'
    })
    roles: Roles[];

    @IsStrongPassword()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+$/, { message: 'no se permiten espacios en blancos, revisa que el caracter sea valido' })
    password: string;

}
