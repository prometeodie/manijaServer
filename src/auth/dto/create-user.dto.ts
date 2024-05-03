import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Matches } from 'class-validator';



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

    @IsStrongPassword()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+$/, { message: 'no se permiten espacios en blancos, revisa que el caracter sea valido' })
    password: string;

}
