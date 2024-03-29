
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class ManijaEvent {

    @Prop({required: true})
    title: string;

    @Prop({required: true})
    eventDate: Date;

    @Prop({required: true})
    schedule: string;

    @Prop({required: true})
    eventPlace: string;

    @Prop({required: true})
    imgName: string;

    @Prop({required: true})
    eventColor: string;

    @Prop({required: true})
    creationDate: Date;

    @Prop({required: true})
    category: string;

    @Prop({required: true})
    publish: boolean;

    @Prop({required: true})
    mustBeAutomaticallyDeleted: boolean;

}

export const EventSchema = SchemaFactory.createForClass(ManijaEvent)
