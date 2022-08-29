export let idGenerator = 0;

export abstract class BaseRepresenter {
    id: number;
    lineFrom: number;
    lineTo: number;
    columnFrom: number;
    columnTo: number;
    typeee: string;
    constructor(lineFrom: number, columnFrom: number, lineTo: number, columnTo: number) {
        this.id = idGenerator++;
        this.lineFrom = lineFrom;
        this.columnFrom = columnFrom;
        this.lineTo = lineTo;
        this.columnTo = columnTo;
        this.typeee = this.constructor.name;
    }
}
