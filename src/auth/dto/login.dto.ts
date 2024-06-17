import { IsEmail, IsNotEmpty, IsStrongPassword, Matches, MaxLength, MinLength } from 'class-validator';



export class LoginDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsStrongPassword()
    @IsNotEmpty()
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+$/, { message: 'no se permiten espacios en blancos, revisa que el caracter sea valido' })
    password: string;

}