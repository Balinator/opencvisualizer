export class ParameterRepresenter {
    value: any;
    type: string;
    private constructor(value: any, type: string) {
        this.value = value;
        this.type = type;
    }
    static c(value: any) {
        return new ParameterRepresenter(value, "c");
    }
    static t(value: any) {
        return new ParameterRepresenter(value, "t");
    }
    static v(value: any) {
        return new ParameterRepresenter(value, "v");
    }
    static tu() {
        return new ParameterRepresenter(undefined, "t");
    }
}
