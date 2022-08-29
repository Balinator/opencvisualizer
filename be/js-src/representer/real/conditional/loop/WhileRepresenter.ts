import { BaseRepresenter } from "../../../BaseRepresenter";
import { UnrealRepresenter } from "../../../UnrealRepresenter";
import { LoopRepresenter } from "./LoopRepresenter";

export class WhileRepresenter extends LoopRepresenter {
    constructor(lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, children: BaseRepresenter[], variableSize: number, condition: UnrealRepresenter | true) {
        super(lineFrom, columnFrom, lineTo, columnTo, children, variableSize, condition);
    }
}
