import { observable, autorun, action, runInAction } from 'mobx';

declare global {
    interface Promise<T> {
        finally<U>(onFinally?: () => U | PromiseLike<U>): Promise<T>;
    }
}

if (!Promise.prototype.finally) {
    throw new Error("mobx command relies on Promise.finally method, which was not detected. " +
        "You can shim it with packages like 'promise.prototype.finally' and '@types/promise.prototype.finally'.");
}

/**
*  controlls when canExecute function will be ran for the first time
*/
export enum CanExecuteStartMode {
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

export type canExecuteResult = boolean | Promise<boolean>;

export interface ICommand<T extends (...args: any[]) => unknown> {
    readonly canExecuteCombined: boolean,
    readonly isExecuting: boolean,
    readonly canExecuteFromFn: boolean,
    readonly isCanExecuteAsyncRunning: boolean,
    readonly canExecuteAsyncRejectReason: any,

    canExecuteFromFnRaw: canExecuteResult,
    executeForced: T
    executeIfCan: (...p: Parameters<T>) => ReturnType<T> | undefined,

    forceInitCanExecuteTracking(): void
}

export interface ICommandOptions<T extends (...args: any[]) => unknown> {
    canExecute?: () => canExecuteResult,
    canExecuteStartMode?: CanExecuteStartMode
    execute: T
}

function isPromise<T>(target: T | Promise<T>): target is Promise<T> {
    if (target
        && typeof target === "object"
        && "then" in target
        && "finally" in target) {
        return true;
    }
    return false;
}

function normaliseOptions<T extends (...args: any[]) =>unknown,>(optionsOrFunc: T | ICommandOptions<T>) {

    var options = <ICommandOptions<T>>{};

    let cast = <ICommandOptions<T>>optionsOrFunc;

    options.execute = cast.execute || optionsOrFunc;

    options.canExecute = cast.canExecute || (() => true);

    options.canExecuteStartMode = cast.canExecuteStartMode || CanExecuteStartMode.AsyncInsideCommandFunction;

    return options;
}

function setIsExecutingToFalse(
    resultOrResultPromise: any | Promise<any>,
    commandState: { isExecuting: boolean }) {

    if (isPromise(resultOrResultPromise)) {

        resultOrResultPromise.finally(() => {
            runInAction(()=> {
                commandState.isExecuting = false;
                });
            });
        return;
    }

    commandState.isExecuting = false;
}

export const command = function <T extends (...args: any[]) => unknown>(optionsOrFunc: T | ICommandOptions<T>) {

    var options = normaliseOptions(optionsOrFunc);

    const commandState = observable.object({
        canExecuteFromFn: false,
        isExecuting: false,
        isCanExecuteAsyncRunning: false,
        canExecuteAsyncRejectReason: undefined
    });

    var command = <ICommand<T>>{
        get canExecuteFromFn() {
            initIfModeOnFirstCheck();
            return commandState.canExecuteFromFn;
        },
        get isExecuting() {
            initIfModeOnFirstCheck();         
            return commandState.isExecuting;
        },
        get isCanExecuteAsyncRunning() {
            initIfModeOnFirstCheck();          
            return commandState.isCanExecuteAsyncRunning;
        },
        get canExecuteAsyncRejectReason() {
            initIfModeOnFirstCheck();            
            return commandState.canExecuteAsyncRejectReason;
        },
        get canExecuteCombined() { 
            initIfModeOnFirstCheck();        
            return !commandState.isExecuting && commandState.canExecuteFromFn;
        },
        get canExecuteFromFnRaw() {
            initIfModeOnFirstCheck();        
            let resultOrResultPromise = (<() => canExecuteResult>options.canExecute)();
            return resultOrResultPromise;
        }
    }

    command.executeForced = action(<T>function () {
        commandState.isExecuting = true;
        var resultOrResultPromise = options.execute.apply(undefined, <any>arguments);
        setIsExecutingToFalse(resultOrResultPromise, commandState);
        return resultOrResultPromise;
    });

    command.executeIfCan = <(...p: Parameters<T>) => ReturnType<T> | undefined>function () {
        if (command.canExecuteCombined === false) {
            return
        }
        return command.executeForced();
    }

    let initDone = false;
    const initIfNotYet = () => {
        if (initDone) {
            return;
        }
        initDone = true;
        autorun(() => {
            let resultOrResultPromise = command.canExecuteFromFnRaw;

            runInAction(() => {
                commandState.canExecuteAsyncRejectReason = undefined;

                if (isPromise(resultOrResultPromise)) {
                    commandState.canExecuteFromFn = false;
                    commandState.isCanExecuteAsyncRunning = true;
                    resultOrResultPromise
                        .then((result) => runInAction(() => commandState.canExecuteFromFn = result),
                            (reason) => runInAction(() => {
                                commandState.canExecuteAsyncRejectReason = reason;
                                return Promise.reject(reason);
                            }))
                        .finally(() => runInAction(() => commandState.isCanExecuteAsyncRunning = false));

                    return;
                }

                commandState.canExecuteFromFn = !!resultOrResultPromise;
                commandState.isCanExecuteAsyncRunning = false;
            });
        });
    };

    function initIfModeOnFirstCheck(){
        if (initDone) {
            return;
        }
        switch(options.canExecuteStartMode){

            case CanExecuteStartMode.OnFirstCheck:
            initIfNotYet();
            break;
    
            case CanExecuteStartMode.AsyncOnFirstCheck:
            setTimeout(initIfNotYet, 0);
            break;
    
            default:
            break;        
        }
    }

    switch(options.canExecuteStartMode){

        case CanExecuteStartMode.InsideCommandFunction:
        initIfNotYet();
        break;

        case CanExecuteStartMode.AsyncInsideCommandFunction:
        setTimeout(initIfNotYet, 0);
        break;

        default:
        break;        
    }

    command.forceInitCanExecuteTracking = initIfNotYet;

    return <ICommand<T>>command;
};