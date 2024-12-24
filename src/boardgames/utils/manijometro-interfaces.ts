
export interface ManijometroPoolEntity {
    userId: string;
    manijometroValuesPool: ManijometroValues;
    totalManijometroUserValue: number;
}


export interface ManijometroValues {
    priceQuality:number;
    gameplay:number;
    replayability:number;
    gameSystemExplanation:number;
}