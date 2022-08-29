import { BaseRepresenter } from "../BaseRepresenter";
import { RealRepresenter } from "./RealRepresenter";

export class CallRepresenter extends RealRepresenter {
    initVars: BaseRepresenter[];
    called: string;
    constructor(lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, initVars: BaseRepresenter[], called: string) {
        super(lineFrom, columnFrom, lineTo, columnTo, [], 0);
        this.initVars = initVars;
        this.called = called;
    }
}
