
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Section } from "src/helpers/section.enum";

@Schema()
export class ManijaEvent {

    @Prop({required: true})
    title: string;

    @Prop({required: true})
    eventDate: Date;
    
    @Prop({required: false})
    alternativeTxtEventDate: string;

    @Prop({required: true})
    startTime: string;

    @Prop({required: true})
    finishTime: string;

    @Prop({required: true})
    eventPlace: string;

    @Prop({required: false})
    imgName: string;

    @Prop({required: true})
    eventColor: string;

    @Prop({required: false})
    url: string;

    @Prop({required: true})
    creationDate: Date;

    @Prop({required: true})
    section: Section;

    @Prop({required: true})
    publish: boolean;

    @Prop({required: true})
    mustBeAutomaticallyDeleted: boolean;

}

export const EventSchema = SchemaFactory.createForClass(ManijaEvent)
