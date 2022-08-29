export class Stack<T> {
    private stack: T[] = [];

    pop(): T {
        return <T>this.stack.pop();
    }

    push(element: T): void {
        this.stack.push(element);
    }

    top(): T {
        return this.stack[this.stack.length - 1];
    }
}
