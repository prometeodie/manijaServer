import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Section } from "src/helpers/section.enum";

@Schema()
export class Contact {
    @Prop({required: true})
    fullName:string;

    @Prop({required: true})
    email:string; 

    @Prop({required: true})
    subject:string; 

    @Prop({required: true})
    message:string; 

    @Prop({required: true})
    hasBeenReaded: boolean;

    @Prop({required: true})
    section:Section; 

    @Prop({required: true})
    creationDate:Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact)