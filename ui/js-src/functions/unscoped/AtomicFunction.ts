import { UnscopedFunction } from "./UnscopedFunction";
import { IOperand } from "../IParameter";

class AtomicFunction<R> extends UnscopedFunction<R> {
    constructor(id: number, lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, command: string, params: IOperand[]) {
        super(id, lineFrom, columnFrom, lineTo, columnTo, command);
        this.params = params;
    }
}

export { AtomicFunction }