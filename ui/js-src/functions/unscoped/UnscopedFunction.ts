import { IOperand } from "../IParameter";
import { BaseFunction } from "../BaseFunction";

abstract class UnscopedFunction<R> extends BaseFunction<R> {
    command: string;
    params: IOperand[];

    constructor(id: number, lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, command: string) {
        super(id, lineFrom, columnFrom, lineTo, columnTo);
        this.command = command;
    }
}

export { UnscopedFunction }