import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

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
    creationDate:Date
    
    @Prop({required: true})
    imgUrl: string;
}

export const BlogSchema = SchemaFactory.createForClass(BlogsManija);