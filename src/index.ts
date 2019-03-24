import { observable, autorun, runInAction } from 'mobx';
import { LiftReadonly } from './LiftReadonly';

declare global {
    interface Promise<T> {
        finally<U>(onFinally?: () => U | PromiseLike<U>): Promise<T>;
    }
}

export type canExecuteResult = boolean|Promise<boolean>;

export interface ICommand<T extends (...args: any[]) => any>  {
    readonly canExecuteCombined: boolean,
    readonly isExecuting: boolean,   
    readonly canExecuteFromFn: boolean,
    readonly isCanExecuteAsyncRunning: boolean,
    readonly canExecuteAsyncRejectReason: any,

    canExecuteFromFnRaw: canExecuteResult,  
	execute:(...p: Parameters<T>) => ReturnType<T>
}

export interface ICommandOptions<T extends (...args: any[]) => any> {
	canExecute?: () => canExecuteResult,
	execute:(...p: Parameters<T>) => ReturnType<T>
}

function isPromise<T>(target: T|Promise<T>): target is Promise<T>{
    if(target
        && typeof target === "object"
        && "then" in target
        && "finally" in target){
        return true;
    }
    return false;
}
	
	function normaliseOptions<T extends (...args: any[]) => any>(optionsOrFunc: T | ICommandOptions<T>) {
 
        var options = <ICommandOptions<T>>{};
    
        options.execute = (<ICommandOptions<T>>optionsOrFunc).execute || optionsOrFunc;
 
        options.canExecute = (<ICommandOptions<T>>optionsOrFunc).canExecute || (() => true);
 
        return options;
    }
 
    function setIsExecutingToFalse<T extends (...args: any[]) => any>(resultOrResultPromise: any|Promise<any>, 
									command: LiftReadonly<ICommand<T>>) {
 
        if (isPromise(resultOrResultPromise)) {

            resultOrResultPromise.finally(() => {
                command.isExecuting = false;
            });
            return;
        }
 
        command.isExecuting = false;
    }
  
 export const command = function<T extends (...args: any[]) => any>(optionsOrFunc: T | ICommandOptions<T>) {
 
        var options = normaliseOptions(optionsOrFunc);
 
        var command = observable.object(<LiftReadonly<ICommand<T>>>{
            canExecuteFromFn: true, 
            isExecuting: false,
            isCanExecuteAsyncRunning: false,
            canExecuteAsyncRejectReason: undefined,
            get canExecuteCombined(){
                return !this.isExecuting && this.canExecuteFromFn;
            },

            execute: function () {
                command.isExecuting = true;
                var resultOrResultPromise = options.execute.apply(this, <any>arguments);
                setIsExecutingToFalse(resultOrResultPromise, command);
                return resultOrResultPromise;
            },
           
            get canExecuteFromFnRaw(){
                let resultOrResultPromise = (<()=>canExecuteResult>options.canExecute)();
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
                    .then(  (result) => runInAction(() => command.canExecuteFromFn = result),
                            (reason) => runInAction(() =>  {
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