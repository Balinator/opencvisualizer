import { BaseRepresenter } from "./BaseRepresenter";

export class UnrealRepresenter extends BaseRepresenter {
    command: string;
    parameters: any[];
    constructor(lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, command: string, parameters: any[]) {
        super(lineFrom, columnFrom, lineTo, columnTo);
        this.command = command;
        this.parameters = parameters;
    }
}
