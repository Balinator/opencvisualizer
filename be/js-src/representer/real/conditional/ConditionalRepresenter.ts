import { BaseRepresenter } from "../../BaseRepresenter";
import { UnrealRepresenter } from "../../UnrealRepresenter";
import { RealRepresenter } from "../RealRepresenter";

export abstract class ConditionalRepresenter extends RealRepresenter {
    condition: UnrealRepresenter | true;
    constructor(lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, children: BaseRepresenter[], variableSize: number, condition: UnrealRepresenter | true) {
        super(lineFrom, columnFrom, lineTo, columnTo, children, variableSize);
        this.condition = condition;
    }
}
