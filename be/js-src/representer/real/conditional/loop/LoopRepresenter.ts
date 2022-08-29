import { BaseRepresenter } from "../../../BaseRepresenter";
import { UnrealRepresenter } from "../../../UnrealRepresenter";
import { ConditionalRepresenter } from "./../ConditionalRepresenter";

export abstract class LoopRepresenter extends ConditionalRepresenter {
    constructor(lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, children: BaseRepresenter[], variableSize: number, condition: UnrealRepresenter | true) {
        super(lineFrom, columnFrom, lineTo, columnTo, children, variableSize, condition);
    }
}
