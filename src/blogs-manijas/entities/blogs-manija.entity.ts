import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Section } from "src/helpers/section.enum";
import { BlogsCategories } from "../utils/blogs-categories.enum";

@Schema()
export class BlogsManija {
    
    @Prop({required: true})
    title: string;
    
    @Prop({required: true})
    subTitle: string;
    
    @Prop({required: true})
    writedBy:string;
    
    @Prop({minlength:20, required: true})
    blogContent:string;

    @Prop({required: true})
    category:BlogsCategories[]

    @Prop({required:true})
    section:Section

    @Prop({required:false})
    imgName:string

    @Prop({required: true})
    creationDate:Date

    @Prop({required: true})
    publish:Boolean
    
}

export const BlogSchema = SchemaFactory.createForClass(BlogsManija);