declare global {
    interface Promise<T> {
        finally<U>(onFinally?: () => U | PromiseLike<U>): Promise<T>;
    }
}
export declare type canExecuteResult = boolean | Promise<boolean>;
export interface ICommand<TReturn, T extends (...args: any[]) => TReturn> {
    readonly canExecuteCombined: boolean;
    readonly isExecuting: boolean;
    readonly canExecuteFromFn: boolean;
    readonly isCanExecuteAsyncRunning: boolean;
    readonly canExecuteAsyncRejectReason: any;
    canExecuteFromFnRaw: canExecuteResult;
    executeForced: T;
    executeIfCan: (...p: Parameters<T>) => ReturnType<T> | undefined;
}
export interface ICommandOptions<TReturn, T extends (...args: any[]) => TReturn> {
    canExecute?: () => canExecuteResult;
    evaluateCanExecuteImmediately?: boolean;
    execute: T;
}
export declare const command: <TReturn, T extends (...args: any[]) => TReturn>(optionsOrFunc: T | ICommandOptions<TReturn, T>) => ICommand<TReturn, T>;
