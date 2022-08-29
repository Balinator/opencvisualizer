interface IStackable<T> {
    parent: IStackable<T> | undefined;
}


export { IStackable };