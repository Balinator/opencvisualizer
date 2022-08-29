import { BaseRepresenter } from "../../BaseRepresenter";
import { UnrealRepresenter } from "../../UnrealRepresenter";
import { ConditionalRepresenter } from "./ConditionalRepresenter";

export class IfRepresenter extends ConditionalRepresenter {
    elseChildren: BaseRepresenter[] | IfRepresenter;
    constructor(lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, children: BaseRepresenter[], variableSize: number, condition: UnrealRepresenter | true, elseChildren: BaseRepresenter[] | IfRepresenter) {
        super(lineFrom, columnFrom, lineTo, columnTo, children, variableSize, condition);
        this.elseChildren = elseChildren;
    }
}
