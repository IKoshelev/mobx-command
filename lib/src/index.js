"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
if (!Promise.prototype.finally) {
    throw new Error("mobx command relies on Promise.finally method, which was not detected. " +
        "You can shim it with packages like 'promise.prototype.finally' and '@types/promise.prototype.finally'.");
}
/**
*  controlls when canExecute function will be ran for the first time
*/
var CanExecuteStartMode;
(function (CanExecuteStartMode) {
    /**
    *  run canExecute synchronously inside command
    */
    CanExecuteStartMode[CanExecuteStartMode["InsideCommandFunction"] = 1] = "InsideCommandFunction";
    /**
    *  DEFAULT, run canExecute via setTimeout(...,0) inside command
    */
    CanExecuteStartMode[CanExecuteStartMode["AsyncInsideCommandFunction"] = 2] = "AsyncInsideCommandFunction";
    /**
    *  canExecute will be run when one of relevant properties of command is accessed
    *  Observers do not like this mode, since it is likely to alters state
    */
    CanExecuteStartMode[CanExecuteStartMode["OnFirstCheck"] = 3] = "OnFirstCheck";
    /**
    *  canExecute will be run via setTimeout(...,0) when one of relevant properties of command is accessed
    *  Observers do not like this mode, since it is likely to alters state
    */
    CanExecuteStartMode[CanExecuteStartMode["AsyncOnFirstCheck"] = 4] = "AsyncOnFirstCheck";
    /**
    *  command does not start tracking canExecute (assuming false),
    *  untill forceInitCanExecuteTracking is called
    */
    CanExecuteStartMode[CanExecuteStartMode["Manual"] = 5] = "Manual";
})(CanExecuteStartMode = exports.CanExecuteStartMode || (exports.CanExecuteStartMode = {}));
function isPromise(target) {
    if (target
        && typeof target === "object"
        && "then" in target
        && "finally" in target) {
        return true;
    }
    return false;
}
function normaliseOptions(optionsOrFunc) {
    var options = {};
    var cast = optionsOrFunc;
    options.execute = cast.execute || optionsOrFunc;
    options.canExecute = cast.canExecute || (function () { return true; });
    options.canExecuteStartMode = cast.canExecuteStartMode || CanExecuteStartMode.AsyncInsideCommandFunction;
    return options;
}
function setIsExecutingToFalse(resultOrResultPromise, commandState) {
    if (isPromise(resultOrResultPromise)) {
        resultOrResultPromise.finally(function () {
            mobx_1.runInAction(function () {
                commandState.isExecuting = false;
            });
        });
        return;
    }
    commandState.isExecuting = false;
}
exports.command = function (optionsOrFunc) {
    var options = normaliseOptions(optionsOrFunc);
    var commandState = mobx_1.observable.object({
        canExecuteFromFn: false,
        isExecuting: false,
        isCanExecuteAsyncRunning: false,
        canExecuteAsyncRejectReason: undefined
    });
    var command = {
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
            var resultOrResultPromise = options.canExecute();
            return resultOrResultPromise;
        }
    };
    command.executeForced = mobx_1.action(function () {
        commandState.isExecuting = true;
        var resultOrResultPromise = options.execute.apply(undefined, arguments);
        setIsExecutingToFalse(resultOrResultPromise, commandState);
        return resultOrResultPromise;
    });
    command.executeIfCan = function () {
        if (command.canExecuteCombined === false) {
            return;
        }
        return command.executeForced();
    };
    var initDone = false;
    var initIfNotYet = function () {
        if (initDone) {
            return;
        }
        initDone = true;
        mobx_1.autorun(function () {
            var resultOrResultPromise = command.canExecuteFromFnRaw;
            mobx_1.runInAction(function () {
                commandState.canExecuteAsyncRejectReason = undefined;
                if (isPromise(resultOrResultPromise)) {
                    commandState.canExecuteFromFn = false;
                    commandState.isCanExecuteAsyncRunning = true;
                    resultOrResultPromise
                        .then(function (result) { return mobx_1.runInAction(function () { return commandState.canExecuteFromFn = result; }); }, function (reason) { return mobx_1.runInAction(function () {
                        commandState.canExecuteAsyncRejectReason = reason;
                        return Promise.reject(reason);
                    }); })
                        .finally(function () { return mobx_1.runInAction(function () { return commandState.isCanExecuteAsyncRunning = false; }); });
                    return;
                }
                commandState.canExecuteFromFn = !!resultOrResultPromise;
                commandState.isCanExecuteAsyncRunning = false;
            });
        });
    };
    function initIfModeOnFirstCheck() {
        if (initDone) {
            return;
        }
        switch (options.canExecuteStartMode) {
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
    switch (options.canExecuteStartMode) {
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
    return command;
};
//# sourceMappingURL=index.js.map