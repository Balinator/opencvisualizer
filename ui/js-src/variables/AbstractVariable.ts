abstract class AbstactVariable {
    protected _name: string;
    protected _type: string;
    protected _color: string;

    get color() {
        return this._color;
    }
    set color(val: string) {
        this._color = val;
    }

    get name() {
        return this._name;
    }
    set name(val: string) {
        this._name = val;
    }

    get type() {
        return this._type;
    }
    set type(val: string) {
        this._type = val;
    }

    constructor(name: string, type: string, color: string) {
        this.name = name;
        this._type = type;
        this._color = color;
    }
}

export { AbstactVariable };