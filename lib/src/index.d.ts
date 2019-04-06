declare global {
    interface Promise<T> {
        finally<U>(onFinally?: () => U | PromiseLike<U>): Promise<T>;
    }
}
/**
*  controlls when canExecute function will be ran for the first time
*/
export declare enum CanExecuteStartMode {
    /**
    *  run canExecute synchronously inside command
    */
    InsideCommandFunction = 1,
    /**
    *  DEFAULT, run canExecute via setTimeout(...,0) inside command
    */
    AsyncInsideCommandFunction = 2,
    /**
    *  canExecute will be run when one of relevant properties of command is accessed
    *  Observers do not like this mode, since it is likely to alters state
    */
    OnFirstCheck = 3,
    /**
    *  canExecute will be run via setTimeout(...,0) when one of relevant properties of command is accessed
    *  Observers do not like this mode, since it is likely to alters state
    */
    AsyncOnFirstCheck = 4,
    /**
    *  command does not start tracking canExecute (assuming false),
    *  untill forceInitCanExecuteTracking is called
    */
    Manual = 5
}
export declare type canExecuteResult = boolean | Promise<boolean>;
export interface ICommand<T extends (...args: any[]) => unknown> {
    readonly canExecuteCombined: boolean;
    readonly isExecuting: boolean;
    readonly canExecuteFromFn: boolean;
    readonly isCanExecuteAsyncRunning: boolean;
    readonly canExecuteAsyncRejectReason: any;
    canExecuteFromFnRaw: canExecuteResult;
    executeForced: T;
    executeIfCan: (...p: Parameters<T>) => ReturnType<T> | undefined;
    forceInitCanExecuteTracking(): void;
}
export interface ICommandOptions<T extends (...args: any[]) => unknown> {
    canExecute?: () => canExecuteResult;
    canExecuteStartMode?: CanExecuteStartMode;
    execute: T;
}
export declare const command: <T extends (...args: any[]) => unknown>(optionsOrFunc: T | ICommandOptions<T>) => ICommand<T>;
