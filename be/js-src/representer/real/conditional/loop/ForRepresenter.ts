import { BaseRepresenter } from "../../../BaseRepresenter";
import { UnrealRepresenter } from "../../../UnrealRepresenter";
import { LoopRepresenter } from "./LoopRepresenter";

export class ForRepresenter extends LoopRepresenter {
    init: UnrealRepresenter[];
    increment: UnrealRepresenter | undefined;
    constructor(lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, children: BaseRepresenter[], variableSize: number, condition: UnrealRepresenter | true, init: UnrealRepresenter[], increment: UnrealRepresenter | undefined) {
        super(lineFrom, columnFrom, lineTo, columnTo, children, variableSize, condition);
        this.init = init;
        this.increment = increment;
    }
}
