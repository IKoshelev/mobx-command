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
    options.execute = optionsOrFunc.execute || optionsOrFunc;
    options.canExecute = optionsOrFunc.canExecute || (function () { return true; });
    return options;
}
function setIsExecutingToFalse(resultOrResultPromise, command) {
    if (isPromise(resultOrResultPromise)) {
        resultOrResultPromise.finally(function () {
            command.isExecuting = false;
        });
        return;
    }
    command.isExecuting = false;
}
exports.command = function (optionsOrFunc) {
    var options = normaliseOptions(optionsOrFunc);
    var command = mobx_1.observable.object({
        canExecuteFromFn: true,
        isExecuting: false,
        isCanExecuteAsyncRunning: false,
        canExecuteAsyncRejectReason: undefined,
        get canExecuteCombined() {
            return !this.isExecuting && this.canExecuteFromFn;
        },
        execute: function () {
            command.isExecuting = true;
            var resultOrResultPromise = options.execute.apply(this, arguments);
            setIsExecutingToFalse(resultOrResultPromise, command);
            return resultOrResultPromise;
        },
        get canExecuteFromFnRaw() {
            var resultOrResultPromise = options.canExecute();
            return resultOrResultPromise;
        }
    });
    mobx_1.autorun(function () {
        var resultOrResultPromise = command.canExecuteFromFnRaw;
        command.canExecuteAsyncRejectReason = undefined;
        if (isPromise(resultOrResultPromise)) {
            command.canExecuteFromFn = false;
            command.isCanExecuteAsyncRunning = true;
            resultOrResultPromise
                .then(function (result) { return mobx_1.runInAction(function () { return command.canExecuteFromFn = result; }); }, function (reason) { return mobx_1.runInAction(function () {
                command.canExecuteAsyncRejectReason = reason;
                return Promise.reject(reason);
            }); })
                .finally(function () { return mobx_1.runInAction(function () { return command.isCanExecuteAsyncRunning = false; }); });
            return;
        }
        command.canExecuteFromFn = resultOrResultPromise;
        command.isCanExecuteAsyncRunning = false;
    });
    return command;
};
//# sourceMappingURL=index.js.map