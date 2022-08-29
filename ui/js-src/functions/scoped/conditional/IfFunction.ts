import { ConditionalFunction } from "./ConditionalFunction";
import { BaseFunction } from "../../BaseFunction";
import { UnscopedFunction } from "../../unscoped/UnscopedFunction";
import { IfStateEnum } from "./IfStateEnum";


class IfFunction extends ConditionalFunction {
    elseList: BaseFunction<any>[] | IfFunction;
    state: IfStateEnum;

    constructor(id: number, lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, 
        parentID: number | undefined, children: BaseFunction<any>[], variableSize: number, condition: UnscopedFunction<boolean> | true,
        elseList: BaseFunction<any>[] | IfFunction) {
        super(id, lineFrom, columnFrom, lineTo, columnTo, parentID, children, variableSize, condition);
        this.elseList = elseList;
        this.state = IfStateEnum.CONDITION_INIT;
    }
}

export { IfFunction };