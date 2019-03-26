import { observable, autorun, runInAction } from 'mobx';
import { LiftReadonly } from './LiftReadonly';

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
    executeIfCan: (...p:Parameters<T>) => ReturnType<T>|undefined
}

export interface ICommandOptions<T extends Function> {
    canExecute?: () => canExecuteResult,
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

function normaliseOptions<T extends Function>(optionsOrFunc: T | ICommandOptions<T>) {

    var options = <ICommandOptions<T>>{};

    options.execute = (<ICommandOptions<T>>optionsOrFunc).execute || optionsOrFunc;

    options.canExecute = (<ICommandOptions<T>>optionsOrFunc).canExecute || (() => true);

    return options;
}

function setIsExecutingToFalse<TReturn, T extends (...args: any[]) => TReturn>(resultOrResultPromise: any | Promise<any>,
    command: LiftReadonly<ICommand<T>>) {

    if (isPromise(resultOrResultPromise)) {

        resultOrResultPromise.finally(() => {
            command.isExecuting = false;
        });
        return;
    }

    command.isExecuting = false;
}

export const command = function <TReturn, T extends (...args: any[]) => TReturn>(optionsOrFunc: T | ICommandOptions<T>) {

    var options = normaliseOptions(optionsOrFunc);

    var command:LiftReadonly<ICommand<T>> = observable.object(<LiftReadonly<ICommand<T>>>{
        canExecuteFromFn: true,
        isExecuting: false,
        isCanExecuteAsyncRunning: false,
        canExecuteAsyncRejectReason: undefined,
        get canExecuteCombined() {
            return !command.isExecuting && command.canExecuteFromFn;
        },

        executeForced() {
            command.isExecuting = true;
            var resultOrResultPromise = options.execute.apply(undefined, <any>arguments);
            setIsExecutingToFalse(resultOrResultPromise, command);
            return resultOrResultPromise;
        },

        executeIfCan() {
            if (command.canExecuteCombined === false) {
                return
            }
            return command.executeForced();
        },

        get canExecuteFromFnRaw() {
            let resultOrResultPromise = (<() => canExecuteResult>options.canExecute)();
            return resultOrResultPromise;
        }
    });

    autorun(() => {

        let resultOrResultPromise = command.canExecuteFromFnRaw;
        command.canExecuteAsyncRejectReason = undefined;

        if (isPromise(resultOrResultPromise)) {
            command.canExecuteFromFn = false;
            command.isCanExecuteAsyncRunning = true;
            resultOrResultPromise
                .then((result) => runInAction(() => command.canExecuteFromFn = result),
                    (reason) => runInAction(() => {
                        command.canExecuteAsyncRejectReason = reason;
                        return Promise.reject(reason);
                    }))
                .finally(() => runInAction(() => command.isCanExecuteAsyncRunning = false));

            return;
        }

        command.canExecuteFromFn = resultOrResultPromise;
        command.isCanExecuteAsyncRunning = false;
    });

    return <ICommand<T>>command;
};