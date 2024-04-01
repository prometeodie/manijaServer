import { PartialType } from '@nestjs/mapped-types';
import { CreateContactDto } from './create-contact.dto';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateContactDto extends PartialType(CreateContactDto) {

    @IsBoolean()
    @IsNotEmpty()
    hasBeenReaded: boolean;
}
