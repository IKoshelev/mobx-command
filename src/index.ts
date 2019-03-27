import { observable, autorun, action, runInAction, configure } from 'mobx';
import { LiftReadonly } from './LiftReadonly';

configure({
    enforceActions: true
});

declare global {
    interface Promise<T> {
        finally<U>(onFinally?: () => U | PromiseLike<U>): Promise<T>;
    }
}

if (!Promise.prototype.finally) {
    throw new Error("mobx command relies on Promise.finally method, which was not detected. " +
        "You can shim it with packages like 'promise.prototype.finally' and '@types/promise.prototype.finally'.");
}

export type canExecuteResult = boolean | Promise<boolean>;

export interface ICommand<T extends (...args: any[]) => any> {
    readonly canExecuteCombined: boolean,
    readonly isExecuting: boolean,
    readonly canExecuteFromFn: boolean,
    readonly isCanExecuteAsyncRunning: boolean,
    readonly canExecuteAsyncRejectReason: any,

    canExecuteFromFnRaw: canExecuteResult,
    executeForced: T
    executeIfCan: (...p: Parameters<T>) => ReturnType<T> | undefined
}

export interface ICommandOptions<T extends (...args: any[]) => any> {
    canExecute?: () => canExecuteResult,
    evaluateCanExecuteImmediately?: boolean
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

function normaliseOptions<T extends (...args: any[]) => any>(optionsOrFunc: T | ICommandOptions<T>) {

    var options = <ICommandOptions<T>>{};

    let cast = <ICommandOptions<T>>optionsOrFunc;

    options.execute = cast.execute || optionsOrFunc;

    options.canExecute = cast.canExecute || (() => true);

    options.evaluateCanExecuteImmediately = cast.evaluateCanExecuteImmediately;

    return options;
}

function setIsExecutingToFalse(
    resultOrResultPromise: any | Promise<any>,
    commandState: { isExecuting: boolean }) {

    if (isPromise(resultOrResultPromise)) {

        resultOrResultPromise.finally(() => {
            commandState.isExecuting = false;
        });
        return;
    }

    commandState.isExecuting = false;
}

export const command = function <TReturn, T extends (...args: any[]) => TReturn>(optionsOrFunc: T | ICommandOptions<T>) {

    var options = normaliseOptions(optionsOrFunc);

    const commandState = observable.object({
        canExecuteFromFn: false,
        isExecuting: false,
        isCanExecuteAsyncRunning: false,
        canExecuteAsyncRejectReason: undefined
    });

    var command = <ICommand<T>>{
        get canExecuteFromFn() {
            initIfNotYet();
            return commandState.canExecuteFromFn;
        },
        get isExecuting() {            
            initIfNotYet();
            return commandState.isExecuting;
        },
        get isCanExecuteAsyncRunning() {           
            initIfNotYet();
            return commandState.isCanExecuteAsyncRunning;
        },
        get canExecuteAsyncRejectReason() {            
            initIfNotYet();
            return commandState.canExecuteAsyncRejectReason;
        },
        get canExecuteCombined() {          
            initIfNotYet();
            return !commandState.isExecuting && commandState.canExecuteFromFn;
        },
        get canExecuteFromFnRaw() {          
            initIfNotYet();
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
    };

    if(options.evaluateCanExecuteImmediately)
    {
        initIfNotYet();
    }

    return <ICommand<T>>command;
};