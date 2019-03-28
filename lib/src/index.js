"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mobx_1 = require("mobx");
if (!Promise.prototype.finally) {
    throw new Error("mobx command relies on Promise.finally method, which was not detected. " +
        "You can shim it with packages like 'promise.prototype.finally' and '@types/promise.prototype.finally'.");
}
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
    options.evaluateCanExecuteImmediately = cast.evaluateCanExecuteImmediately;
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
    if (options.evaluateCanExecuteImmediately) {
        initIfNotYet();
    }
    return command;
};
//# sourceMappingURL=index.js.map