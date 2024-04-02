import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Section } from "src/helpers/section.enum";

@Schema()
export class AboutSection {
    
    @Prop({required: true})
    text: string;

    @Prop({required: true})
    section:Section; 

    @Prop({required: true})
    creationDate:Date;

    @Prop({required: true})
    imgName:string;

    @Prop({required: true})
    publish:boolean;

}


export const AboutSchema = SchemaFactory.createForClass(AboutSection)