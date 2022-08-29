import { BaseFunction } from "../BaseFunction";
import { ScopedFunction } from "./ScopedFunction";
import { FunctionStateEnum } from "./FunctionStateEnum";

class FunctionFunction<R> extends ScopedFunction<R> {
    name: string;
    state: FunctionStateEnum = FunctionStateEnum.INIT;

    constructor(id: number, lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, name: string,
        parentId: number | undefined, children: BaseFunction<any>[], variableSize: number) {
        super(id, lineFrom, columnFrom, lineTo, columnTo, parentId, children, variableSize);
        this.name = name;
    }

}

export { FunctionFunction }