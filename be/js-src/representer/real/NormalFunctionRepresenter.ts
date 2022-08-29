import { BaseRepresenter } from "../BaseRepresenter";
import { RealRepresenter } from "./RealRepresenter";

export class NormalFunctionRepresenter extends RealRepresenter {
    name: string;
    initVarDecl: BaseRepresenter[];
    returnType: string;
    constructor(lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, name: string, children: BaseRepresenter[], variableSize: number, initVarDecl: BaseRepresenter[], returnType: string) {
        super(lineFrom, columnFrom, lineTo, columnTo, children, variableSize);
        this.name = name;
        this.initVarDecl = initVarDecl;
        this.returnType = returnType;
    }
}
