import { BaseRepresenter } from "../BaseRepresenter";

export abstract class RealRepresenter extends BaseRepresenter {
    children: BaseRepresenter[];
    parentId: number | undefined;
    variableSize: number;
    constructor(lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, children: BaseRepresenter[], variableSize: number) {
        super(lineFrom, columnFrom, lineTo, columnTo);
        this.parentId = undefined;
        this.children = children;
        this.variableSize = variableSize;
    }
}
