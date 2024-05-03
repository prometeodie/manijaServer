import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsEnum, IsOptional, IsString, IsStrongPassword, Matches } from 'class-validator';
import { Roles } from '../utils/roles.enum';

export class UpdateAuthDto extends PartialType(CreateUserDto) {

    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    surname: string;

    @IsString()
    @IsOptional()
    nickname: string;

    @IsStrongPassword()
    @IsOptional()
    @Matches(/^[a-zA-Z0-9!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+$/, { message: 'Blank character(s) are not allowed, Check that the special character(s) are valid' })
    password: string;

    @IsString()
    @IsEnum([Roles.USER, Roles.ADMIN, Roles.MASTER],{
        message:'Valid Role value Requiered'
    })
    roles: Roles[];

}