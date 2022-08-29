import { IOperand } from "./functions/IParameter";
import { AtomicFunction } from "./functions/unscoped/AtomicFunction"
import { ComplexAtomicFunction } from "./functions/unscoped/ComplexAtomicFunction"
import { MainFunction } from "./functions/scoped/MainFunction";
import { ForFunction } from "./functions/scoped/conditional/loop/ForFunction";
import { IfFunction } from "./functions/scoped/conditional/IfFunction";
import { UnscopedFunction } from "./functions/unscoped/UnscopedFunction";
import { FunctionFunction } from "./functions/scoped/FunctionFunction";
import { CallerFunction } from "./functions/unscoped/CallerFunction";
import { BaseFunction } from "./functions/BaseFunction";
import { IStackable } from "./functions/IStackable";

function paramC(v: any): IOperand {
    return { type: "c", value: v }
}
function paramV(v: any): IOperand {
    return { type: "v", value: v }
}
function paramT(v: any): IOperand {
    return { type: "t", value: v }
}
function paramTU(): IOperand {
    return { type: "t", value: undefined }
}

class Program {
    private _mainFunction: MainFunction;
    private functions: FunctionFunction<any>[];
    private _global: UnscopedFunction<any>[];
    globalSize: number;
    private lastId: number;
    private raw: any;// JSON

    get mainFunction(): MainFunction {
        return this._mainFunction;
    }

    get global(): UnscopedFunction<any>[] {
        return this._global;
    }

    private jsonToObj(json: any): BaseFunction<any> {
        let children: BaseFunction<any>[] = [];
        let condition: true | UnscopedFunction<boolean>;
        switch (json.typeee) {
            case "UnrealRepresenter":
                let isComplex = false;
                for (let param of json.parameters) {
                    if (param.type === 't' && param.value) {
                        isComplex = true;
                        break;
                    }
                }
                if (isComplex) {
                    let params: IOperand[] = [];
                    for (let param of json.parameters) {
                        if (param.type === 't' && param.value) {
                            params.push(paramT(this.jsonToObj(param.value)));
                        } else {
                            params.push(param);
                        }
                    }
                    return new ComplexAtomicFunction(json.id, json.lineFrom, json.columnFrom, json.lineTo, json.columnTo, json.command, params)
                }
                return new AtomicFunction(json.id, json.lineFrom, json.columnFrom, json.lineTo, json.columnTo, json.command, json.parameters);
            case "NormalFunctionRepresenter":

                for (let c of json.children) {
                    children.push(this.jsonToObj(c));
                }
                return new FunctionFunction(json.id, json.lineFrom, json.columnFrom, json.lineTo, json.columnTo, json.name, json.parentId, children, json.variableSize);
            case "ForRepresenter":
                for (let c of json.children) {
                    children.push(this.jsonToObj(c));
                }
                condition = json.condition === true ? true : <UnscopedFunction<boolean>>this.jsonToObj(json.condition);
                let init: UnscopedFunction<any>[] = [];
                for (let c of json.init) {
                    init.push(<UnscopedFunction<any>>this.jsonToObj(c));
                }
                let increment: UnscopedFunction<any> = <UnscopedFunction<any>>this.jsonToObj(json.increment);
                return new ForFunction(json.id, json.lineFrom, json.columnFrom, json.lineTo, json.columnTo, json.parentId, children, json.variableSize, condition,
                    init.reduce((o, e) => {
                        o.params.push(paramT(e)); return o;
                    },
                        new ComplexAtomicFunction(this.lastId++, 0, 0, 0, 0, "none", [])), increment);
            case "IfRepresenter":
                for (let c of json.children) {
                    children.push(this.jsonToObj(c));
                }
                let elseList: BaseFunction<any>[] = [];
                if (json.elseList) {
                    for (let c of json.elseList) {
                        elseList.push(this.jsonToObj(c));
                    }
                }
                condition = json.condition === true ? true : <UnscopedFunction<boolean>>this.jsonToObj(json.condition);
                return new IfFunction(json.id, json.lineFrom, json.columnFrom, json.lineTo, json.columnTo, json.parentId, children, json.variableSize, condition, elseList);
            case "CallRepresenter":
                let func = this.getFunctionByName(json.called);
                let initFunctions: (IStackable<any> | AtomicFunction<any>)[] = [];
                let jsonFunc = this.getJsonFuncByName(json.called);
                for (let i = 0; i < jsonFunc.initVarDecl.length; ++i) {
                    initFunctions.push(<AtomicFunction<any> | IStackable<any>>this.jsonToObj(jsonFunc.initVarDecl[i]));
                    initFunctions.push(new AtomicFunction(this.lastId++, jsonFunc.initVarDecl[i].lineFrom, jsonFunc.initVarDecl[i].columnFrom, jsonFunc.initVarDecl[i].lineTo, jsonFunc.initVarDecl[i].columnTo,
                        "assignVar", [paramV(jsonFunc.initVarDecl[i].parameters[0].value), paramV(json.initVars[i].value + ":old")]))
                }
                return new CallerFunction(json.id, json.lineFrom, json.columnFrom, json.lineTo, json.columnTo, json.parentId, func, initFunctions);
            default:
                throw "Can not process this type: " + json.typeee;
        }
    }

    constructor(data: any) {
        this.raw = data;
        this.lastId = data.lastId;
        this.globalSize = data.globalSize;
        this._global = [];
        for (let g of data.global) {
            this.global.push(<UnscopedFunction<any>>this.jsonToObj(g));
        }
        this.functions = [];
        for (let g of data.functions) {
            this.functions.push(<FunctionFunction<any>>this.jsonToObj(g));
        }
        this._mainFunction = <MainFunction>this.jsonToObj(data.mainFunction);

        /*this.functions = [
            new NormalFunction(100, 6, 0, 10, 1, "swap", undefined, [
                new AtomicFunction(27, 7, 4, 7, 12, "deffineVar", [
                    paramC("temp"),
                    paramC("int")
                ]),
                new ComplexAtomicFunction(28, 7, 8, 7, 26, "assignVar", [
                    paramV("temp"),
                    paramT(new AtomicFunction(29, 7, 15, 7, 26, "getVarFromArray", [
                        paramTU(),
                        paramV("list"),
                        paramV("index")
                    ]))
                ]),
                new ComplexAtomicFunction(29, 8, 4, 8, 33, "assignVar", [
                    paramT(new AtomicFunction(30, 8, 4, 8, 16, "getVarFromArray", [
                        paramTU(),
                        paramV("list"),
                        paramV("index")
                    ])),
                    paramT(new AtomicFunction(31, 8, 18, 8, 33, "getVarFromArray", [
                        paramTU(),
                        paramV("list"),
                        paramV("nextIndex")
                    ]))
                ]),
                new ComplexAtomicFunction(32, 9, 4, 9, 26, "assignVar", [
                    paramT(new AtomicFunction(33, 9, 4, 9, 19, "getVarFromArray", [
                        paramTU(),
                        paramV("list"),
                        paramV("nextIndex")
                    ])),
                    paramV("temp")
                ])
            ], 3)
        ];
        this._global = [
            new AtomicFunction(1, 3, 0, 3, 12, "deffineVar", [
                paramC("list"),
                paramC("int[]"),
                paramC(10)
            ]),
            new AtomicFunction(2, 3, 4, 3, 50, "assignArray", [paramV("list"), paramC([0, 5, 13, 9, 2, 6, 7, 15, 20, 1])]),
            new AtomicFunction(3, 4, 0, 4, 5, "deffineVar", [
                paramC("n"),
                paramC("int")
            ]),
            new AtomicFunction(4, 4, 4, 4, 10, "assignVar", [
                paramV("n"),
                paramC(10)
            ])
        ];
        this.globalSize = 11;
        this._mainFunction = new MainFunction([
            new ForFunction(5, 13, 4, 13, 5, 0,
                [
                    new ForFunction(12, 14, 8, 14, 9, 5,
                        [
                            new AtomicFunction(20, 15, 12, 15, 25, "deffineVar", [
                                paramC("nextIndex"),
                                paramC("int")
                            ]),
                            new ComplexAtomicFunction(21, 15, 16, 15, 37, "assignVar", [
                                paramV("nextIndex"),
                                paramT(new AtomicFunction(22, 15, 28, 15, 37, "addVars", [
                                    paramTU(),
                                    paramV("index"),
                                    paramC(1)
                                ]))
                            ]),
                            new IfFunction(23, 16, 12, 16, 13, 12,
                                [
                                    new NormalCallerFunction(200, 17, 16, 17, 38, 23, this.getFunction(100), [
                                        new AtomicFunction(201, 6, 10, 6, 19, "deffineVar", [
                                            paramC("index"),
                                            paramC("int")
                                        ]),
                                        new AtomicFunction(202, 6, 10, 6, 19, "assignVar", [
                                            paramV("index"),
                                            paramV("index:old")
                                        ]),
                                        new AtomicFunction(203, 6, 21, 6, 34, "deffineVar", [
                                            paramC("nextIndex"),
                                            paramC("int")
                                        ]),
                                        new AtomicFunction(204, 6, 21, 6, 34, "assignVar", [
                                            paramV("nextIndex"),
                                            paramV("nextIndex:old")
                                        ])
                                    ])
                                ],
                                0,
                                new ComplexAtomicFunction(24, 16, 16, 16, 45, "greaterThan",
                                    [
                                        paramTU(),
                                        paramT(new AtomicFunction(25, 16, 16, 16, 27, "getVarFromArray", [
                                            paramTU(),
                                            paramV("list"),
                                            paramV("index")
                                        ])),
                                        paramT(new ComplexAtomicFunction(26, 16, 30, 16, 45, "getVarFromArray",
                                            [
                                                paramTU(),
                                                paramV("list"),
                                                paramV("nextIndex")
                                            ]
                                        ))
                                    ]
                                ),
                                []
                            )
                        ],
                        2,
                        new ComplexAtomicFunction(13, 14, 28, 14, 49, "lessThan",
                            [
                                paramTU(),
                                paramV("index"),
                                paramT(new ComplexAtomicFunction(16, 14, 36, 14, 49, "subVars",
                                    [
                                        paramTU(),
                                        paramT(new AtomicFunction(17, 14, 36, 14, 45, "subVars", [
                                            paramTU(),
                                            paramV("n"),
                                            paramV("round")
                                        ])),
                                        paramC(1)
                                    ]
                                ))
                            ]),
                        new ComplexAtomicFunction(14, 14, 13, 14, 26, "none", [
                            paramT(new AtomicFunction(18, 14, 13, 14, 22, "deffineVar", [
                                paramC("index"),
                                paramC("int")
                            ])),
                            paramT(new AtomicFunction(19, 14, 17, 14, 26, "assignVar", [
                                paramV("index"),
                                paramC(0)
                            ]))
                        ]),
                        new AtomicFunction(15, 14, 51, 14, 58, "increment", [
                            paramV("index")
                        ])
                    )
                ],
                1,
                new ComplexAtomicFunction(6, 13, 24, 13, 37, "lessThan",
                    [
                        paramTU(),
                        paramV("round"),
                        paramT(new AtomicFunction(9, 13, 32, 13, 37, "subVars", [
                            paramTU(),
                            paramV("n"),
                            paramC(1)
                        ]))
                    ]),
                new ComplexAtomicFunction(7, 13, 9, 13, 22, "none", [
                    paramT(new AtomicFunction(10, 13, 9, 13, 18, "deffineVar", [
                        paramC("round"),
                        paramC("int")
                    ])),
                    paramT(new AtomicFunction(11, 13, 13, 13, 22, "assignVar", [
                        paramV("round"),
                        paramC(0)
                    ]))
                ]),
                new AtomicFunction(8, 13, 39, 13, 47, "increment", [
                    paramV("round")
                ])
            )
        ], 0);*/
    }

    private getFunction(id: number): FunctionFunction<any> {
        for (let i: number = 0; i < this.functions.length; ++i) {
            if (this.functions[i].id == id) {
                return this.functions[i];
            }
        }
        throw "Function with id(" + id + ") was not found!";
    }

    private getFunctionByName(name: string): FunctionFunction<any> {
        for (let i: number = 0; i < this.functions.length; ++i) {
            if (this.functions[i].name == name) {
                return this.functions[i];
            }
        }
        throw "Function with name(" + name + ") was not found!";
    }

    private getJsonFuncByName(name: string): any {
        for (let i: number = 0; i < this.raw.functions.length; ++i) {
            if (this.raw.functions[i].name == name) {
                return this.raw.functions[i];
            }
        }
        throw "Function with name(" + name + ") was not found!";
    }
}

export { Program }