import { IStackable } from "../IStackable";
import { IOperand } from "../IParameter";
import { UnscopedFunction } from "./UnscopedFunction";

class ComplexAtomicFunction<R> extends UnscopedFunction<R> implements IStackable<R> {
    parent: IStackable<R> | undefined;
    done: boolean = false;

    constructor(id: number, lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, command: string,
        params: IOperand[]) {
        super(id, lineFrom, columnFrom, lineTo, columnTo, command);
        this.params = params;
    }

}

export { ComplexAtomicFunction }