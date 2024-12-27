import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsStrongPassword, Matches, MaxLength } from 'class-validator';


export class ChangePasswordDto extends PartialType(CreateUserDto) {

    @IsStrongPassword()
    @IsOptional()
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+$/, { message: 'Blank character(s) are not allowed, Check that the special character(s) are valid' })
    currentPassword: string;

    @IsStrongPassword()
    @IsOptional()
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+$/, { message: 'Blank character(s) are not allowed, Check that the special character(s) are valid' })
    newPassword: string;

}