import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsStrongPassword, Matches } from 'class-validator';
import { Roles } from '../utils/roles.enum';

@Schema()
export class User {

    _id?: string;

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    surname: string;

    @Prop({ required: true })
    nickname: string;

    @Prop({ required: true })
    @IsStrongPassword()
    @Matches(/^[a-zA-Z0-9!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+$/, { message: 'no se permiten espacios en blancos, revisa que el caracter especial sea valido )' })
    password?: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: [String], default: [Roles.USER] })
    roles: Roles[];

}


export const UserSchema = SchemaFactory.createForClass( User );
