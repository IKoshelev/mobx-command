declare global  {
    interface Promise<T> {
        finally<U>(onFinally?: () => U | PromiseLike<U>): Promise<T>;
    }
}
export declare type canExecuteResult = boolean | Promise<boolean>;
export interface ICommand<T extends Function> {
    readonly canExecuteCombined: boolean;
    readonly isExecuting: boolean;
    readonly canExecuteFromFn: boolean;
    readonly isCanExecuteAsyncRunning: boolean;
    readonly canExecuteAsyncRejectReason: any;
    canExecuteFromFnRaw: canExecuteResult;
    execute: T;
}
export interface ICommandOptions<T extends Function> {
    canExecute?: () => canExecuteResult;
    execute: T;
}
export declare const command: <TReturn, T extends (...args: any[]) => TReturn>(optionsOrFunc: T | ICommandOptions<T>) => ICommand<T>;
