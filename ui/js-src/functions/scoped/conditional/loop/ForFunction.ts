import { LoopFunction } from "./LoopFunction";
import { BaseFunction } from "../../../BaseFunction";
import { UnscopedFunction } from "../../../unscoped/UnscopedFunction";
import { LoopStateEnum } from "./LoopStateEnum";

class ForFunction extends LoopFunction {
    init: UnscopedFunction<any> | undefined;
    increment: UnscopedFunction<any> | undefined;
    state: LoopStateEnum;

    constructor(id: number, lineFrom: number, columnFrom: number, lineTo: number, columnTo: number,
        parentId: number | undefined, children: BaseFunction<any>[], variableSize: number, condition: UnscopedFunction<boolean> | true,
        init: UnscopedFunction<any>, increment: UnscopedFunction<any>) {
        super(id, lineFrom, columnFrom, lineTo, columnTo, parentId, children, variableSize, condition);

        this.init = init;
        this.increment = increment;
        this.state = LoopStateEnum.INIT;
        this.global = [{},{}]
    }
}

export { ForFunction }