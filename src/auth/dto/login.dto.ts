import { IsEmail, IsNotEmpty, IsStrongPassword, MinLength } from 'class-validator';



export class LoginDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsStrongPassword()
    @IsNotEmpty()
    password: string;

}