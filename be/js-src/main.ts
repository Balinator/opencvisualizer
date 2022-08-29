import { exec } from "child_process";
import * as fs from "fs";
import { promisify } from "util";
import { Program } from "./Program";
import { CallRepresenter } from "./representer/real/CallRepresenter";
import { NormalFunctionRepresenter } from "./representer/real/NormalFunctionRepresenter";
import { WhileRepresenter } from "./representer/real/conditional/loop/WhileRepresenter";
import { ForRepresenter } from "./representer/real/conditional/loop/ForRepresenter";
import { IfRepresenter } from "./representer/real/conditional/IfRepresenter";
import { UnrealRepresenter } from "./representer/UnrealRepresenter";
import { idGenerator, BaseRepresenter } from "./representer/BaseRepresenter";
import { ParameterRepresenter } from "./representer/ParameterRepresenter";

let execute = promisify(exec)

export async function main(code: string): Promise<string> {
    fs.writeFileSync("resources/c-files/source.c", code);
    return execute('python parseingScrypt.py resources/c-files/source.c').then(({ stdout, stderr }) => {
        fs.writeFileSync("resources/out.json", stdout);
        return stdout;
    }).then((result) => {
        return JSON.parse(result)
    }).then(jsonAST => {
        let ret = JSON.stringify(processAST(jsonAST));
        fs.writeFileSync("resources/done.json", ret);
        return ret;
    }).catch((err) => {
        fs.writeFileSync("resources/err.out", err);
        return err;
    });
}

function processAST(jsonObject: JSON): Program {
    let ans = processObjs((<any>jsonObject).ext);

    let program: Program = new Program();
    for (let a of ans) {
        if (a instanceof NormalFunctionRepresenter) {
            if (a.name === "main") {
                program.mainFunction = a;
            } else {
                program.functions.push(a);
            }
        } else {
            program.global.push(a);
        }
    }
    program.globalSize = getFunctionVariableSize(program.global);
    program.lastId = idGenerator;
    return program;
}

function processObjs(jsonObject: any): BaseRepresenter[] {
    let ret: BaseRepresenter[] = [];
    for (let child of jsonObject) {
        if (child.coord.startsWith("resources/fake_libc_include")) {
            continue;
        }
        switch (child._nodetype) {
            case 'Decl':
                ret = ret.concat(processDeclaration(child));
                break;
            case 'FuncDef':
                ret.push(processNormalFunction(child));
                break;
            case 'BinaryOp':
                ret.push(processUnrealB(child));
                break;
            case 'UnaryOp':
                ret.push(processUnary(child))
                break;
            case 'Assignment':
                ret.push(processUnrealA(child));
                break;
            case 'If':
                ret.push(processIf(child));
                break;
            case 'For':
                ret.push(processFor(child));
                break;
            case 'While':
                ret.push(processWhile(child))
                break;
            case "FuncCall":
                ret.push(processCallFunction(child));
                break;
            default:
                throw "processObjs: Type not defined yet!" + child._nodetype;
        }
    }
    if (ret.length === 0) {
        throw "Can not process data!";
    }
    return ret;
}

function processObj(child: any): BaseRepresenter {
    switch (child._nodetype) {
        case 'FuncDef':
            return processNormalFunction(child);
        case 'BinaryOp':
            return processUnrealB(child);
        case 'Assignment':
            return processUnrealA(child);
        case 'UnaryOp':
            return processUnary(child);
        case 'ArrayRef':
            let coord = getCoord(child);
            return new UnrealRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo,
                "getVarFromArray",
                [
                    ParameterRepresenter.tu(),
                    processRLValue(child.name),
                    processRLValue(child.subscript)
                ]);
        default:
            throw "processObj: Type not defined yet!" + child._nodetype;
    }
}

function processCallFunction(child: any): CallRepresenter {
    let coord = getCoord(child);
    return new CallRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo,
        child.args.exprs.map((c: any) => processRLValue(c)), child.name.name);
}

function processWhile(child: any): WhileRepresenter {
    let children = processObjs(child.stmt.block_items);
    let size = getFunctionVariableSize(children);
    let coord = getCoord(child);
    return new WhileRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo,
        children, size, <UnrealRepresenter>processObj(child.cond));
}

function processFor(child: any): ForRepresenter {
    let children = processObjs(child.stmt.block_items);
    let init = <UnrealRepresenter[]>processObjs(child.init.decls);
    let size = getFunctionVariableSize(children) + getFunctionVariableSize(init);
    let coord = getCoord(child);
    return new ForRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo,
        children, size, <UnrealRepresenter>processObj(child.cond), init, <UnrealRepresenter>processObj(child.next));
}

function processIf(child: any): IfRepresenter {
    let iffalse: BaseRepresenter[] | IfRepresenter = [];
    let sizeF: number | undefined;
    if (child.iffalse) {
        if (child.iffalse._nodetype === "If") {
            iffalse = processIf(child.iffalse);
        } else {
            iffalse = processObjs(child.iffalse.block_items);
            sizeF = getFunctionVariableSize(iffalse)
        }
    }
    let children = processObjs(child.iftrue.block_items);
    let sizeT: number = getFunctionVariableSize(children)
    let coord = getCoord(child);
    return new IfRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo,
        children, sizeF && sizeT < sizeF ? sizeF : sizeT, <UnrealRepresenter>processObj(child.cond), iffalse);
}

function processUnary(child: any): UnrealRepresenter {
    let op: string;
    switch (child.op) {
        case '++':
            op = "increment";
            break;
        case '--':
            op = "decrement";
            break;
        case 'p++':
            op = "incrementAfter";
            break;
        case 'p--':
            op = "decrementAfter";
            break;
        default:
            throw "Unexpected operator!" + child.op;
    }
    let coord = getCoord(child);
    return new UnrealRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo, op, [processRLValue(child.expr)]);
}

function processUnreal(child: any): string {
    let op: string;
    switch (child.op) {
        case '=':
            op = "assignVar";
            break;
        case '-':
            op = "subVars";
            break;
        case '+':
            op = "addVars";
            break;
        case '<':
            op = "lessThan";
            break;
        case '>':
            op = "greaterThan";
            break;
        case '*':
            op = "multiply";
            break;
        case '/':
            op = "divison";
            break;
        case '%':
            op = "modulo";
            break;
        case '|':
            op = "binaryOr";
            break;
        case '&':
            op = "binaryAnd";
            break;
        case '||':
            op = "or";
            break;
        case '&&':
            op = "and";
            break;
        // case '[]':
        //     op = "getVarFromArray";
        //     break;
        case '==':
            op = "equals";
            break;
        case '!=':
            op = "notEquals";
            break;
        case '<=':
            op = "smallerOrEquals";
            break;
        case '>=':
            op = "graterOrEquals";
            break;
        default:
            throw "Unexpected operator!" + child.op;
    }
    return op;
}

function processUnrealA(child: any): BaseRepresenter {
    let coord = getCoord(child);
    let params = child.op !== '=' ? [ParameterRepresenter.tu()] : [];
    params.push(processRLValue(child.lvalue));
    params.push(processRLValue(child.rvalue));
    return new UnrealRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo,
        processUnreal(child), params);
}

function processUnrealB(child: any): BaseRepresenter {
    let coord = getCoord(child);
    let params = child.op !== '=' ? [ParameterRepresenter.tu()] : [];
    params.push(processRLValue(child.left));
    params.push(processRLValue(child.right));
    return new UnrealRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo,
        processUnreal(child), params);
}

function processRLValue(value: any): ParameterRepresenter {
    switch (value._nodetype) {
        case "ID":
            return ParameterRepresenter.v(value.name);
        case "Constant":
            return ParameterRepresenter.c(parseValue(value.value, value.type));
        case 'UnaryOp':
            return ParameterRepresenter.t(processObj(value));
        case "BinaryOp":
        case "ArrayRef":
            return ParameterRepresenter.t(processObj(value));
        default:
            throw "Type not supported! " + value._nodetype;
    }

}

function processDeclaration(child: any): BaseRepresenter[] {
    let variable: UnrealRepresenter;
    let assign: UnrealRepresenter | undefined = undefined;
    let typee = getType(child.type);
    let coord = getCoord(child);
    if (child.type._nodetype === 'ArrayDecl') {
        variable = new UnrealRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo,
            "deffineVar",
            [
                ParameterRepresenter.c(child.name),
                ParameterRepresenter.c(typee),
                ParameterRepresenter.c(parseValue(child.type.dim.value, 'int'))
            ]);
        if (child.init) {
            assign = new UnrealRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo,
                "assignArray",
                [
                    ParameterRepresenter.v(child.name),
                    ParameterRepresenter.c(child.init.exprs.map((v: any) => parseValue(v.value, typee)))
                ]);
        }
    } else {
        variable = new UnrealRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo,
            "deffineVar",
            [
                ParameterRepresenter.c(child.name),
                ParameterRepresenter.c(typee)
            ]);
        if (child.init) {
            let value: ParameterRepresenter;
            switch (child.init._nodetype) {
                case "BinaryOp":
                    value = ParameterRepresenter.t(processObj(child.init));
                    break;
                case "ArrayRef":
                    value = processRLValue(child.init);
                    break;
                default:
                    value = ParameterRepresenter.c(parseValue(child.init.value, typee));
            }
            assign = new UnrealRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo,
                "assignVar",
                [
                    ParameterRepresenter.v(child.name),
                    value
                ]);
        }
    }

    return assign ? [variable, assign] : [variable];
}

function parseValue(value: string, typee: string): any {
    switch (typee.replace("[]", "")) {
        case 'long':
        case 'short':
        case 'int':
            return parseInt(value);
        case 'double':
        case 'float':
            return parseFloat(value);
        case 'char':
            return textBetween(value, "'", "'");
        default:
            throw "unexpected type: " + typee;
    }
}

function getType(typee: any): string {
    if (typee._nodetype === 'ArrayDecl') {
        return (typee.names ? typee.names[0] : getType(typee.type)) + "[]";
    }
    return typee.names ? typee.names[0] : getType(typee.type);
}

function processNormalFunction(child: any): NormalFunctionRepresenter {
    let coord = getCoord(child);
    let func: NormalFunctionRepresenter = new NormalFunctionRepresenter(coord.lineFrom, coord.columnFrom, coord.lineTo, coord.columnTo,
        child.decl.name, [], 0, [], getType(child.decl.type));
    if (child.decl.type.args) {
        for (let param of child.decl.type.args.params) {
            let paramRet = processDeclaration(param);
            func.initVarDecl = func.initVarDecl.concat(paramRet);
            func.variableSize++;
        }
    }

    func.children = processObjs(child.body.block_items);
    let size = getFunctionVariableSize(func.children);
    func.variableSize += size;
    return func;
}

function getFunctionVariableSize(children: BaseRepresenter[]): number {
    return children.reduce((v: number, c) => {
        if (c instanceof UnrealRepresenter && c.command === 'deffineVar') {
            if (c.parameters.length === 3) {

                return v + c.parameters[2].value;
            }
            return v + 1;
        }
        return v;
    }, 0)
}

function getCoord(child: any): { lineFrom: number; lineTo: number; columnFrom: number; columnTo: number; } {
    let coord = child.coord.split(":");
    let lineFrom = parseInt(coord[1]);
    let columnFrom = parseInt(coord[2]);
    return {
        lineFrom: lineFrom - 1,
        lineTo: lineFrom,
        columnFrom: columnFrom,
        columnTo: columnFrom + 3,
    }
}

function textBetween(text: string, begintag: string, endtag: string, withtags?: boolean): string {
    let result = "";
    if (typeof text == "string") {
        let ixs = text.indexOf(begintag);
        if (ixs > -1) {
            ixs = ixs + begintag.length;
            let ixe = text.indexOf(endtag, ixs);
            if (ixe > -1) {
                result = text.substring(ixs, ixe);
            }
        }
    }
    if (withtags) {
        result = begintag + result + endtag;
    }
    return result;
}