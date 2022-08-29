import { BaseFunction } from "../BaseFunction";
import { IGlobal } from "../IGlobal";
import { IStackable } from "../IStackable";
import { IPushable } from "../IPushable";

abstract class ScopedFunction<R> extends BaseFunction<R> implements IStackable<R>, IPushable {
    parent: IStackable<any> | undefined;
    parentId: number | undefined;
    variableSize: number;
    
    children: BaseFunction<any>[];

    global: IGlobal[] = [{}];
    pushLevel: number = 0;

    constructor(id: number, lineFrom: number, columnFrom: number, lineTo: number, columnTo: number,
        parentId: number | undefined, children: BaseFunction<any>[], variableSize: number) {
        super(id, lineFrom, columnFrom, lineTo, columnTo);
        this.parentId = parentId;
        this.children = children;
        this.variableSize = variableSize;
    }
}

export { ScopedFunction }