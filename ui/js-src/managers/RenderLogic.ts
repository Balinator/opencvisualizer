import { VariableFunctions } from "./VariableFunctions";
import { Program } from "../Program";
import { BaseFunction } from "../functions/BaseFunction";
import { MasterMemoryManager } from "./memory/MasterMemoryManager";
import { Variable } from "../variables/Variable";
import { UnscopedFunction } from "../functions/unscoped/UnscopedFunction";
import { ComplexAtomicFunction } from "../functions/unscoped/ComplexAtomicFunction";
import { ScopedFunction } from "../functions/scoped/ScopedFunction";
import { AtomicFunction } from "../functions/unscoped/AtomicFunction";
import { ForFunction } from "../functions/scoped/conditional/loop/ForFunction";
import { IDrawOptions } from "../interfaces/IDrawOptions";
import { IAction } from "../interfaces/IAction";
import { LoopStateEnum } from "../functions/scoped/conditional/loop/LoopStateEnum";
import { Stack } from "../dataStructures/Stack";
import { IfFunction } from "../functions/scoped/conditional/IfFunction";
import { IfStateEnum } from "../functions/scoped/conditional/IfStateEnum";
import { TemporalVariable } from "../variables/TemporalVariable";
import { AbstactVariable } from "../variables/AbstractVariable";
import { ArrayVariable } from "../variables/ArrayVariable";
import { IOperand } from "../functions/IParameter";
import { IStackable } from "../functions/IStackable";
import { IPushable } from "./../functions/IPushable";
import { FunctionWithIndex } from "./FunctionWithIndex";
import { MainFunction } from "../functions/scoped/MainFunction";
import { TimeManager } from "./TimeManager";
import { FunctionStateEnum } from "../functions/scoped/FunctionStateEnum";
import { IBoundry } from "../interfaces/IBoundry";
import { CallerFunction } from "../functions/unscoped/CallerFunction";
import { stopTime, startTime } from "../main";
import { json } from "stream/consumers";

class RenderLogic {

    // MARK: properties

    private canvas: HTMLCanvasElement;

    private _context: CanvasRenderingContext2D;
    get context(): CanvasRenderingContext2D {
        return this._context;
    }
    set context(set: CanvasRenderingContext2D) {
        this._context = set;
    }

    private editor?: AceAjax.Editor;
    readonly drawOptions: IDrawOptions = {
        mX: 0,
        mY: 0,
        d: 0,
        radius: 0,
        fontSize: 0,
        animationTime: 1000.0,
    };

    get animationTime(): number {
        return (this._actionPoolNext || this.fastForward) ? 25 : this.drawOptions.animationTime;
    }

    private functionStack: Stack<FunctionWithIndex>;
    private currentFunction: FunctionWithIndex;
    private mainFunction: MainFunction;
    private isStarted: boolean = false;

    private globalFunctions: UnscopedFunction<any>[];
    private globalFunctionsIndex: number = 0;

    readonly actionPool: IAction[] = [];
    private actionPoolIndex: number = 0;
    private _actionPoolNext: boolean = false;
    private timeWasStopped: boolean = false;

    get actionPoolNext(): boolean {
        return this._actionPoolNext;
    }

    setActionPoolNext() {
        this._actionPoolNext = true;
        if (TimeManager.Instance.isTimeStopped) {
            startTime();
            this.timeWasStopped = true;
        }
    }

    private lastRow: number = -1;
    private fastForward: boolean = false;

    setFastForward() {
        startTime();
        this.fastForward = true;
    }

    memoryManager: MasterMemoryManager;

    private program: Program;

    // MARK: Singleton stuff

    private static _instance: RenderLogic;

    private constructor() { }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    // MARK: init stuff

    initData(): void {
        this.mainFunction = this.program.mainFunction;
        this.globalFunctions = this.program.global;

        this.functionStack = new Stack<FunctionWithIndex>();
    }

    initCanvas(): void {
        this.canvas = <HTMLCanvasElement>document.getElementById("myCanvas");
        this.canvas.width = window.innerWidth - 25;
        this.canvas.height = window.innerHeight;

        this.context = <CanvasRenderingContext2D>this.canvas.getContext("2d");
    }

    initDrawOptions(): void {
        let mX: number = this.canvas.width / 2;
        let mY: number = this.canvas.height / 2;
        let d: number = (mX < mY ? mX : mY) * 0.8;
        let r: number = Math.min(d * 0.2, 100);
        let fontSize: number = r * 0.4;

        this.drawOptions.mX = mX;
        this.drawOptions.mY = mY;
        this.drawOptions.d = d;
        this.drawOptions.radius = r;
        this.drawOptions.fontSize = fontSize;

        let top: number = 0;
        let bottom: number = this.canvas.height;
        let left: number = 0;
        let right: number = this.canvas.width;

        let boundry: IBoundry = {
            top: top,
            bottom: bottom,
            left: (right - left) / 2.0,
            right: right
        };
        this.drawOptions.mX = (boundry.left - left) / 2.0;
        this.drawOptions.mY = (bottom - top) / 2.0;

        this.memoryManager = new MasterMemoryManager(this.drawOptions.radius, boundry, this.program.globalSize);//TODO: set globalVariableSize
    }

    initEditor(): void {
        let editor: AceAjax.Editor = ace.edit("editor");
        editor.setTheme("ace/theme/textmate");
        editor.setReadOnly(false);
        editor.setHighlightSelectedWord(false);
        editor.setShowFoldWidgets(false);
        editor.session.setMode("ace/mode/c_cpp");

        editor.on("guttermousedown", function (e) {
            var target = e.domEvent.target;

            if (target.className.indexOf("ace_gutter-cell") == -1) {
                return;
            }

            if (!editor.isFocused()) {
                return;
            }

            if (e.clientX > 25 + target.getBoundingClientRect().left) {
                return;
            }

            var breakpoints = e.editor.session.getBreakpoints(row, 0);
            var row = e.getDocumentPosition().row;

            console.log(row, editor.session.getBreakpoints())

            // If there's a breakpoint already defined, it should be removed, offering the toggle feature
            if (typeof breakpoints[row] === typeof undefined) {
                e.editor.session.setBreakpoint(row, "breakpoint");
            } else {
                e.editor.session.clearBreakpoint(row);
            }

            e.stop();
        });

        this.editor = editor;
    }

    // MARK: main

    main(): void {
        fetch("http://aranos.go.ro/animate", { 
            method: 'POST',
            body: this.editor?.getValue(),
            headers: { 'Content-Type': 'text/plain' },
            mode: 'cors'
        }).then(async res => {
            let body: string = await res.text();
            console.log(body)
            this.program = new Program(JSON.parse(body));
            this.initCanvas();
            this.initDrawOptions();
            this.initData();
            this.editor?.setReadOnly(false);

            this.animate();
        });
    }

    // MARK: animate and draw

    private animate(): void {
        this.draw();
        this.processData();
        window.requestAnimationFrame(this.animate.bind(this));
    }

    private processData() {
        if (this.currentFunction) {
            if (this.actionPoolIndex < this.actionPool.length) {
                if (this.actionPool[this.actionPoolIndex].isActionCompleted()) {
                    if (++this.actionPoolIndex < this.actionPool.length) {
                        this.actionPool[this.actionPoolIndex].setAction();
                    }
                }
            } else {
                switch (this.currentFunction.func.constructor.name) {
                    case CallerFunction.name: {
                        this.processFunction(<CallerFunction<any>>this.currentFunction.func);
                        break;
                    }
                    case IfFunction.name: {
                        this.processIf(<IfFunction>this.currentFunction.func);
                        break;
                    }
                    case ForFunction.name: {
                        this.processFor(<ForFunction>this.currentFunction.func);
                        break;
                    }
                    case ComplexAtomicFunction.name: {
                        this.processComplexAtomic(<ComplexAtomicFunction<any>>this.currentFunction.func);
                        break;
                    }
                    default: {
                        let children = (<ScopedFunction<any>>this.currentFunction.func).children;
                        let nextChild = children[this.currentFunction.index++];

                        if (nextChild) {
                            this.processChild(nextChild);
                        } else {
                            this.popFunction();
                        }
                        break;
                    }
                }
            }
        } else {
            if (this.globalFunctionsIndex < this.globalFunctions.length) {
                if (this.actionPoolIndex < this.actionPool.length) {
                    if (this.actionPool[this.actionPoolIndex].isActionCompleted()) {
                        if (++this.actionPoolIndex < this.actionPool.length) {
                            this.actionPool[this.actionPoolIndex].setAction();
                        }
                    }
                } else {
                    let nextChild = this.globalFunctions[this.globalFunctionsIndex++];

                    if (nextChild) {
                        this.processChild(nextChild);
                    }
                }
            } else if (!this.isStarted) {
                this.isStarted = true;
                this.currentFunction = {
                    func: this.mainFunction,
                    index: 0
                }
                this.memoryManager.pushContext(this.mainFunction);
            }
        }
    }
    processFunction(currentFunction: CallerFunction<any>) {
        let nextChild;
        switch (currentFunction.calledFunction.state) {
            case FunctionStateEnum.INIT:
                nextChild = currentFunction.initFunctions[this.currentFunction.index++];
                if (nextChild) {
                    this.processChild(<BaseFunction<any>>nextChild);
                } else {
                    currentFunction.calledFunction.state = FunctionStateEnum.BODY;
                    this.currentFunction.index = 0;
                }
                break;
            case FunctionStateEnum.BODY:
                nextChild = currentFunction.calledFunction.children[this.currentFunction.index++];
                if (nextChild) {
                    this.processChild(nextChild);
                } else {
                    currentFunction.calledFunction.state = FunctionStateEnum.RETURN;
                }
                break
            case FunctionStateEnum.RETURN:
                this.popFunction();
                currentFunction.calledFunction.state = FunctionStateEnum.INIT;
                break
            default:
                throw "Unsupported state! (" + currentFunction.calledFunction.state + ")";
        }
    }

    // MARK: process functions

    private processIf(currentFunction: IfFunction) {
        switch (currentFunction.state) {
            case IfStateEnum.CONDITION_INIT:
                currentFunction.state = IfStateEnum.CONDITION_DONE;
                this.currentFunction.index = 0;
                if (currentFunction.condition !== undefined) {
                    this.processChild(<UnscopedFunction<any>>currentFunction.condition);
                }
                break;
            case IfStateEnum.CONDITION_DONE:
                let res = (<UnscopedFunction<any>>currentFunction.condition).result;
                if (typeof res !== "boolean") {
                    res = res.value;
                    VariableFunctions.Instance.recicleAuxiliary((<UnscopedFunction<any>>currentFunction.condition).result);
                }
                if (currentFunction.condition === true || res) {
                    currentFunction.state = IfStateEnum.THEN;
                } else {
                    currentFunction.state = IfStateEnum.ELSE;
                }
                break;
            case IfStateEnum.THEN:
                this.processIfChilds(currentFunction.children, currentFunction);
                break;
            case IfStateEnum.ELSE:
                let children = currentFunction.elseList;
                if (children instanceof IfFunction) {
                    this.processChild(children);
                } else {
                    this.processIfChilds(children, currentFunction);
                }
                break;
            case IfStateEnum.DONE:
                currentFunction.state = IfStateEnum.CONDITION_INIT;
                this.popFunction();
                break;
            default:
                throw "Unsupported state! (" + currentFunction.state + ")";
        }
    }

    private processIfChilds(children: BaseFunction<any>[], currentFunction: IfFunction) {
        let nextChild = children[this.currentFunction.index++];
        if (nextChild) {
            this.processChild(nextChild);
        } else {
            currentFunction.state = IfStateEnum.DONE;
        }
    }

    private processComplexAtomic(currentFunction: ComplexAtomicFunction<any>) {
        let children = currentFunction.params;
        let nextChild = children[this.currentFunction.index++];
        if (nextChild) {
            if (nextChild.type === "t" || nextChild.type === "f") {
                let val: UnscopedFunction<any> = <UnscopedFunction<any>>nextChild.value;
                if (val) {
                    this.processChild(val);
                }
            }
        } else {
            if (!currentFunction.done) {
                this.evalEvent(<UnscopedFunction<any>>currentFunction);
                currentFunction.done = true;
                if (this.actionPoolIndex < this.actionPool.length) {
                    this.actionPool[this.actionPoolIndex].setAction();
                }
            }
            else {
                currentFunction.done = false;
                this.popFunction();
            }
        }
    }

    private processFor(currentFunction: ForFunction) {
        switch (currentFunction.state) {
            case LoopStateEnum.INIT:
                currentFunction.state = LoopStateEnum.CONDITION_CHACK;
                if (currentFunction.init) {
                    this.processChild(currentFunction.init);
                }
                break;
            case LoopStateEnum.CONDITION_CHACK:
                currentFunction.state = LoopStateEnum.CONDITION_FINAL;
                this.currentFunction.index = 0;
                if (currentFunction.condition !== undefined) {
                    this.processChild(<UnscopedFunction<any>>currentFunction.condition);
                }
                break;
            case LoopStateEnum.CONDITION_FINAL:
                let res = (<UnscopedFunction<any>>currentFunction.condition).result;
                if (typeof res !== "boolean") {
                    res = res.value;
                    VariableFunctions.Instance.recicleAuxiliary((<UnscopedFunction<any>>currentFunction.condition).result);
                }
                if (currentFunction.condition === true || res) {
                    currentFunction.state = LoopStateEnum.BODY;
                    this.memoryManager.pushContext(<IPushable>currentFunction);
                } else {
                    currentFunction.state = LoopStateEnum.INIT;
                    this.popFunction();
                }
                break;
            case LoopStateEnum.BODY:
                let children = (<ScopedFunction<any>>this.currentFunction.func).children;
                let nextChild = children[this.currentFunction.index++];
                if (nextChild) {
                    this.processChild(nextChild);
                }
                else {
                    this.memoryManager.popContext();
                    currentFunction.state = LoopStateEnum.INCREMENT;
                }
                break;
            case LoopStateEnum.INCREMENT:
                currentFunction.state = LoopStateEnum.CONDITION_CHACK;
                if (currentFunction.increment) {
                    this.processChild(currentFunction.increment);
                }
                break;
            default:
                throw "Unsupported state! (" + currentFunction.state + ")";
        }
    }

    private processChild(nextChild: BaseFunction<any>): void {
        switch (nextChild.constructor.name) {
            case ForFunction.name:
                this.pushFunction(<ForFunction>nextChild)
                break;
            case IfFunction.name:
                this.pushFunction(<IfFunction>nextChild)
                break;
            case CallerFunction.name:
                this.pushFunction(<CallerFunction<any>>nextChild);
                break;
            case ComplexAtomicFunction.name:
                this.pushFunction(<ComplexAtomicFunction<any>>nextChild);
                break;
            case AtomicFunction.name:
                this.evalEvent(<AtomicFunction<any>>nextChild);
                if (this.actionPoolIndex < this.actionPool.length) {
                    this.actionPool[this.actionPoolIndex].setAction();
                }
                break;
            default:
                throw "Next move is unidentifiable! (" + nextChild + ")";
        }
    }

    // MARK: function stack

    private pushFunction(children: IStackable<any>): void {
        this.functionStack.push(this.currentFunction);
        this.currentFunction = {
            func: children,
            index: 0
        }
        if (children && (<unknown>children as IPushable).global) {
            this.memoryManager.pushContext(<IPushable><unknown>children);
        }
    }

    private popFunction(): void {
        if (!(this.currentFunction.func instanceof MainFunction) && this.currentFunction.func && (<unknown>this.currentFunction.func as IPushable).global) {
            this.memoryManager.popContext();
        }
        this.currentFunction = this.functionStack.pop();
    }

    // MARK: main draw call

    private draw(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i: number = 0; i < this.memoryManager.auxiliaryObjects.length; ++i) {
            let ao: TemporalVariable = this.memoryManager.auxiliaryObjects[i];
            ao.apply(false);
        }

        this.memoryManager.applyVariables();
    }

    // MARK: eval

    static replaceAll(str: string, a: string, b: string): string {
        let s = <any>str;
        if (typeof s.replaceAll === 'function') {
            return s.replaceAll(a, b);
        }
        let lastindex = -1;
        let index = str.indexOf(a, lastindex);
        while (index > -1) {
            str = str.replace(a, b);
            lastindex = index + b.length;
            index = str.indexOf(a, lastindex);
        }
        return str;
    }

    selectEvent(event: UnscopedFunction<any>) {
        let editor: AceAjax.Editor = <AceAjax.Editor>this.editor;
        editor.clearSelection();
        editor.gotoLine(event.lineFrom, 0);
        editor.selection.selectTo(event.lineTo, 0);

        let text = editor.getSession().doc.getTextRange(editor.selection.getRange());

        const joinstr = '([^;]*?)';

        let parameters: IOperand[] = JSON.parse(JSON.stringify(event.params));

        if (event.command == "deffineVar" && parameters.length > 1) {
            let t = parameters[1];
            parameters[1] = parameters[0];
            parameters[0] = t;
        }

        let regextext = RenderLogic.getRegexText(parameters, joinstr, event.command);

        let regex = new RegExp(regextext, 'g')

        let matches = text.match(regex);

        console.log({ text, event, regextext, matches });

        if (matches == null || matches?.length == 0) {
            this.defaultSelection(editor, event);
            return;
        }
        matches = RenderLogic.Distinct(matches);

        let shortest: string[];
        let wasswitch: boolean;
        do {
            shortest = []
            wasswitch = false;
            for (let match of matches) {
                let matches2 = match.substring(1).match(regex);
                if (matches2 == null || matches2.length == 0) {
                    shortest.push(match)
                } else {
                    shortest.push.apply(shortest, matches2)
                    wasswitch = true;
                }
            }
            matches = shortest;
        } while (wasswitch);


        if (matches.length == 1) {
            let match = matches[0];
            let exactmatch = text.indexOf(match);

            this.exactSelection(editor, event, exactmatch, match, text);
            return;
        }

        switch (event.command) {
            case "getVarFromArray": {
                let assign = matches.filter(s => {
                    let splitted = s.split("");
                    return splitted.filter(s => s == "[").length == 1 ? true : splitted.filter(s => s == "]").length == 1
                });
                if (assign.length == 1) {
                    let match = assign[0];
                    let exactmatch = text.indexOf(match);

                    this.exactSelection(editor, event, exactmatch, match, text);
                    return;
                }
            }

        }
        this.defaultSelection(editor, event);
    }

    private static getRegexText(parameters: IOperand[], basejoinstr: string, command: string): string {
        let operand = null
        switch (command) {
            case "assignVar": {
                operand = "=";
                break;
            }
            case "addVars": {
                operand = "\\+";
                break;
            }
            case "subVars": {
                operand = "\\-";
                break;
            }
            case "lessThan": {
                operand = "<";
                break;
            }
            case "greaterThan": {
                operand = ">";
                break;
            }
            case "multiply": {
                operand = "\\*";
                break;
            }
            case "divison": {
                operand = "\\/";
                break;
            }
            case "modulo": {
                operand = "%";
                break;
            }
            case "binaryOr": {
                operand = "\\|";
                break;
            }
            case "binaryAnd": {
                operand = "&";
                break;
            }
            case "or": {
                operand = "\\|\\|";
                break;
            }
            case "and": {
                operand = "&&";
                break;
            }
            case "equals": {
                operand = "==";
                break;
            }
            case "notEquals": {
                operand = "!=";
                break;
            }
            case "graterOrEquals": {
                operand = ">=";
                break;
            }
            case "smallerOrEquals": {
                operand = "<=";
                break;
            }
        }
        let joinstr = basejoinstr;
        if (operand != null) {
            joinstr = joinstr + operand + joinstr;
        }

        let params = parameters.filter(m => {
            if (m.value == null || m.value == undefined) {
                return false;
            }
            switch (typeof (m.value)) {
                case "string": {
                    if (m.value.indexOf(":old") != -1) {
                        return false;
                    }
                }
            }
            return true;
        });

        let handeledparams = params.map(m => {
            switch (typeof (m.value)) {
                case "string":
                    return RenderLogic.replaceAll(m.value, "[]", "");
                case "number":
                    return m.value.toString();
                case "object": {
                    if (Array.isArray(m.value)) {
                        return m.value
                            .map(s => {
                                return RenderLogic.handleObject(s, basejoinstr);
                            })
                            .join(joinstr);
                    }
                    let s = m.value;
                    return RenderLogic.handleObject(s, basejoinstr)
                }
                default:
                    return "";
            }
        });

        let str = handeledparams.join(joinstr);
        if (command == "getVarFromArray") {
            str = handeledparams[0] + joinstr + "\\[" + joinstr + handeledparams[1] + joinstr + "\\]";
        }

        while (str.startsWith(joinstr)) {
            str = str.substring(joinstr.length)
        }
        while (str.endsWith(joinstr)) {
            str = str.substring(0, str.length - joinstr.length)
        }

        switch (command) {
            case "increment": {
                return "\\+\\+" + basejoinstr + str;
            }
            case "incrementAfter": {
                return str + basejoinstr + "\\+\\+";
            }
        }

        return str;
    }

    public static Distinct(arr: any[]) {
        return arr.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
    }

    private static handleObject(s: any, joinstr: string): string {
        if (Array.isArray(s?.params)) {
            if (s.params.length == 0) {
                return "";
            }
            //let fst = s.params[0];
            return RenderLogic.getRegexText(s.params, joinstr, s.command)
        }
        return s?.toString() ?? "";
    }

    private exactSelection(editor: AceAjax.Editor, event: UnscopedFunction<any>, exactmatch: number, match: string, text: string) {
        let tabcount = text.substring(0, exactmatch).match(/ {4}/g)?.length ?? 0;
        exactmatch -= tabcount * 3;
        editor.clearSelection();
        editor.gotoLine(event.lineFrom, 0);
        for (let i = 0; i < exactmatch; ++i) {
            editor.selection.moveCursorRight();
        }
        for (let i = 0; i < match.length; ++i) {
            editor.selection.selectRight();
        }
    }

    private defaultSelection(editor: AceAjax.Editor, event: UnscopedFunction<any>) {
        if (event.command == "none") {
            editor.clearSelection();
            return;
        }

        editor.clearSelection();
        editor.gotoLine(event.lineFrom, event.columnFrom);
        editor.selection.selectTo(event.lineTo - 1, event.columnTo);
    }

    evalEvent(event: UnscopedFunction<any>): void {
        let editor: AceAjax.Editor = <AceAjax.Editor>this.editor;
        this.selectEvent(event);

        let breakpoints: number[] = editor.session.getBreakpoints();

        if (this.lastRow !== event.lineFrom) {
            this.lastRow = -1;
        }

        if (breakpoints[event.lineFrom - 1] && this.lastRow !== event.lineFrom) {
            this.lastRow = event.lineFrom;
            this.fastForward = false;
            stopTime();
        }

        let dest: Variable;
        let var1: Variable;
        let var2: Variable;
        let arr: ArrayVariable;
        switch (event.command) {
            case "deffineVar":
                let others: any[] = [];
                for (let i = 2; event.params.length > i; ++i) {
                    others.push(event.params[i].value)
                }
                VariableFunctions.Instance.deffineVar(<string>event.params[0].value, <string>event.params[1].value, others);
                break;
            case "assignVar":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                VariableFunctions.Instance.assignVar(dest, var1);
                break;
            case "assignArray":
                arr = <ArrayVariable>this.parameterToVariable(event, 0);
                VariableFunctions.Instance.assignArray(arr, <any[]>event.params[1].value);
                break;
            case "addVars":
                dest = <Variable>this.parameterToVariable(event, 0);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.addVars(dest, <Variable>this.parameterToVariable(event, 1), <Variable>this.parameterToVariable(event, 2));
                break;
            case "subVars":
                dest = <Variable>this.parameterToVariable(event, 0);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.subVars(dest, <Variable>this.parameterToVariable(event, 1), <Variable>this.parameterToVariable(event, 2));
                break;
            case "increment":
                VariableFunctions.Instance.incrementVar(<Variable>this.parameterToVariable(event, 0));
                break;
            case "incrementAfter":
                dest = <Variable>this.parameterToVariable(event, 0);
                let old = VariableFunctions.Instance.getAuxiliary();
                old._notype = true;
                old.value = dest.value;
                event.result = old;
                //Object.assign(Object.create(dest), dest);
                VariableFunctions.Instance.incrementVar(dest);
                break;
            case "lessThan":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.lessThan(dest, var1, var2);
                break;
            case "greaterThan":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.greaterThan(dest, var1, var2);
                break;
            case "multiply":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.multiply(dest, var1, var2);
                break;
            case "divison":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.divison(dest, var1, var2);
                break;
            case "modulo":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.modulo(dest, var1, var2);
                break;
            case "binaryOr":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.binaryOr(dest, var1, var2);
                break;
            case "getVarFromArray":
                dest = <Variable>this.parameterToVariable(event, 0);
                dest._notype = true;
                arr = <ArrayVariable>this.parameterToVariable(event, 1);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.getVarFromArray(dest, arr, <Variable>this.parameterToVariable(event, 2));
                break;
            case "binaryAnd":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.binaryAnd(dest, var1, var2);
                break;
            case "or":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.or(dest, var1, var2);
                break;
            case "and":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.and(dest, var1, var2);
                break;
            case "equals":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.equals(dest, var1, var2);
                break;
            case "notEquals":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.notEquals(dest, var1, var2);
                break;
            case "graterOrEquals":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.graterOrEquals(dest, var1, var2);
                break;
            case "smallerOrEquals":
                dest = <Variable>this.parameterToVariable(event, 0);
                var1 = <Variable>this.parameterToVariable(event, 1);
                var2 = <Variable>this.parameterToVariable(event, 2);
                if (dest.value === undefined) {
                    event.result = dest;
                }
                VariableFunctions.Instance.lessOrEquals(dest, var1, var2);
                break;
            case "none":
                break;
            default:
                throw "Command not suported! (" + event.command + ")";
        }
        VariableFunctions.Instance.extraAction({
            isActionCompleted: () => true,
            setAction: function (): void {
                if (var1 instanceof TemporalVariable) {
                    VariableFunctions.Instance.recicleAuxiliary(var1);
                }
                if (var2 instanceof TemporalVariable) {
                    VariableFunctions.Instance.recicleAuxiliary(var2);
                }

                if (RenderLogic.Instance.timeWasStopped) {
                    RenderLogic.Instance.timeWasStopped = false;
                    stopTime();
                }
                RenderLogic.Instance._actionPoolNext = false;
            }
        });
    }

    private parameterToVariable(parent: UnscopedFunction<any>, index: number): AbstactVariable {
        let res = this.operandToVariableHelper(parent, index);

        if (res instanceof Variable) {
            let r: Variable = res;
            while (r.value instanceof Variable) {
                r = r.value;
            }
            res = r;
        }

        return res;
    }

    public static getDefaultType(val: any): string {
        if (val == undefined || val == null) {
            return '';
        }
        let num = Number(val);
        if (!isNaN(num)) {
            if (Number.isInteger(num)) {
                return 'int';
            }
            return 'double';
        }
        let str = val as string;
        if (str != null) {
            if (str.endsWith("f")) {
                if (!isNaN(Number(str.substring(0, str.length - 1)))) {
                    return 'float';
                }
            }
            if (str.length == 1) {
                return 'char';
            }
        }
        throw `No initial type found to '${val}'`;
    }

    private operandToVariableHelper(parent: UnscopedFunction<any>, index: number): AbstactVariable {
        let operand: IOperand = parent.params[index];
        switch (operand.type) {
            case "v":
                return this.memoryManager.getVariableStrict(<string>operand.value);
            case "c":
                let temp: TemporalVariable = VariableFunctions.Instance.getAuxiliary();
                temp.type = RenderLogic.getDefaultType(operand.value);
                temp.value = operand.value;
                return temp;
            case "t":
                if (operand.value instanceof BaseFunction) {
                    let res = operand.value.result;
                    return res;
                } else {
                    let v = VariableFunctions.Instance.getAuxiliary();
                    v._notype = true;
                    return v;
                }
            default:
                throw "Unsoported operand type! (" + operand.type + ")";
        }
    }
}

export { RenderLogic };