"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var mobx_1 = require("mobx");
var index_1 = require("./../src/index");
mobx_1.configure({
    enforceActions: true
});
var delay = function (ms) {
    if (ms === void 0) { ms = 0; }
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
describe('command ', function () {
    it('exists', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            chai_1.expect(typeof index_1.command !== 'undefined').to.equal(true);
            return [2 /*return*/];
        });
    }); });
    it('should accept a function', function () {
        var counter = 0;
        var com = index_1.command(function () {
            counter += 1;
            return true;
        });
        com.executeForced();
        chai_1.expect(counter).to.equal(1);
    });
    it('should accept options', function () {
        var counter = 0;
        var com = index_1.command({
            execute: function () {
                counter += 1;
                return true;
            }
        });
        com.executeForced();
        chai_1.expect(counter).to.equal(1);
    });
    it('execute can have void return type', function () {
        var counter = 0;
        var com = index_1.command({
            execute: function () {
                counter += 1;
            },
            canExecute: function () { return true; }
        });
        com.executeForced();
        chai_1.expect(counter).to.equal(1);
    });
    it('should pass parameters to original function', function () {
        var com = index_1.command(function (d, e) {
            chai_1.expect(d).to.equal(1);
            chai_1.expect(e).to.equal(2);
            return d + e;
        });
        var result = com.executeForced(1, 2);
        chai_1.expect(result).to.equal(3);
    });
    it('has executeIfCan and executeForced functions that execute command with or without check', function () {
        var counter = 0;
        var trigger = mobx_1.observable({
            canExecute: false
        });
        var com = index_1.command({
            execute: function () {
                counter += 1;
                return true;
            },
            canExecute: function () {
                return trigger.canExecute;
            },
            canExecuteStartMode: index_1.CanExecuteStartMode.OnFirstCheck
        });
        chai_1.expect(com.canExecuteCombined).to.equal(false);
        var res = com.executeIfCan();
        chai_1.expect(counter).to.equal(0);
        chai_1.expect(res).to.equal(undefined);
        res = com.executeForced();
        chai_1.expect(counter).to.equal(1);
        chai_1.expect(res).to.equal(true);
        mobx_1.runInAction(function () { return trigger.canExecute = true; });
        chai_1.expect(com.canExecuteCombined).to.equal(true);
        res = com.executeIfCan();
        chai_1.expect(counter).to.equal(2);
        chai_1.expect(res).to.equal(true);
    });
    it('both executeIfCan and executeForced are bound', function () {
        var counter = 0;
        var trigger = mobx_1.observable({
            canExecute: false
        });
        var com = index_1.command({
            execute: function () {
                counter += 1;
                return true;
            },
            canExecute: function () {
                return trigger.canExecute;
            },
            canExecuteStartMode: index_1.CanExecuteStartMode.OnFirstCheck
        });
        var executeIfCan = com.executeIfCan;
        var executeForced = com.executeForced;
        chai_1.expect(com.canExecuteCombined).to.equal(false);
        var res = executeIfCan();
        chai_1.expect(counter).to.equal(0);
        chai_1.expect(res).to.equal(undefined);
        res = executeForced();
        chai_1.expect(counter).to.equal(1);
        chai_1.expect(res).to.equal(true);
        mobx_1.runInAction(function () { return trigger.canExecute = true; });
        chai_1.expect(com.canExecuteCombined).to.equal(true);
        res = executeIfCan();
        chai_1.expect(counter).to.equal(2);
        chai_1.expect(res).to.equal(true);
    });
    it('when canExecute is not passed, default is always true', function () {
        var com = index_1.command({
            execute: function () {
                return true;
            },
            canExecuteStartMode: index_1.CanExecuteStartMode.OnFirstCheck
        });
        chai_1.expect(com.canExecuteFromFn).to.equal(true);
        chai_1.expect(com.canExecuteCombined).to.equal(true);
        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
    });
    it('command function can return a promise, which will be used to track execution and set isExecuting', function () { return __awaiter(_this, void 0, void 0, function () {
        var resolver, prom, com;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prom = new Promise(function (resolve) { resolver = resolve; });
                    com = index_1.command({
                        execute: function () {
                            return prom;
                        }
                    });
                    chai_1.expect(com.isExecuting).to.equal(false);
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.canExecuteFromFn).to.equal(false);
                    com.executeForced();
                    chai_1.expect(com.isExecuting).to.equal(true);
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.canExecuteFromFn).to.equal(false);
                    return [4 /*yield*/, delay()];
                case 1:
                    _a.sent();
                    chai_1.expect(com.isExecuting).to.equal(true);
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.canExecuteFromFn).to.equal(true);
                    resolver({});
                    return [4 /*yield*/, delay()];
                case 2:
                    _a.sent();
                    chai_1.expect(com.isExecuting).to.equal(false);
                    chai_1.expect(com.canExecuteCombined).to.equal(true);
                    chai_1.expect(com.canExecuteFromFn).to.equal(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('command function promise rejection is also used to track execution and set isExecuting', function () { return __awaiter(_this, void 0, void 0, function () {
        var rejector, prom, promisesRejectedCounter, incrementPromiseRejectionCounter, com, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prom = new Promise(function (resolve, reject) { rejector = reject; });
                    promisesRejectedCounter = 0;
                    incrementPromiseRejectionCounter = function () { return promisesRejectedCounter += 1; };
                    process.on('unhandledRejection', incrementPromiseRejectionCounter);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    com = index_1.command({
                        execute: function () {
                            return prom;
                        }
                    });
                    chai_1.expect(com.isExecuting).to.equal(false);
                    chai_1.expect(com.canExecuteCombined).to.equal(true);
                    chai_1.expect(com.canExecuteFromFn).to.equal(true);
                    com.executeForced();
                    chai_1.expect(com.isExecuting).to.equal(true);
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.canExecuteFromFn).to.equal(true);
                    return [4 /*yield*/, delay()];
                case 2:
                    _a.sent();
                    chai_1.expect(com.isExecuting).to.equal(true);
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.canExecuteFromFn).to.equal(true);
                    rejector({});
                    return [4 /*yield*/, delay()];
                case 3:
                    _a.sent();
                    chai_1.expect(com.isExecuting).to.equal(false);
                    chai_1.expect(com.canExecuteCombined).to.equal(true);
                    chai_1.expect(com.canExecuteFromFn).to.equal(true);
                    return [3 /*break*/, 6];
                case 4:
                    ex_1 = _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    setTimeout(function () { return process.removeListener('unhandledRejection', incrementPromiseRejectionCounter); }, 0);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    it('canExecute function can return a Promise<boolean>', function () { return __awaiter(_this, void 0, void 0, function () {
        var resolver, prom, counter, com;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prom = new Promise(function (resolve) { resolver = resolve; });
                    counter = 0;
                    com = index_1.command({
                        execute: function () {
                            return true;
                        },
                        canExecute: function () { counter++; return prom; }
                    });
                    chai_1.expect(counter).to.equal(0);
                    chai_1.expect(com.canExecuteFromFn).to.equal(false);
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
                    return [4 /*yield*/, delay()];
                case 1:
                    _a.sent();
                    chai_1.expect(com.canExecuteFromFn).to.equal(false);
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(true);
                    resolver(true);
                    return [4 /*yield*/, delay()];
                case 2:
                    _a.sent();
                    chai_1.expect(com.canExecuteFromFn).to.equal(true);
                    chai_1.expect(counter).to.equal(1);
                    chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
                    return [2 /*return*/];
            }
        });
    }); });
    it('canExecute function, that returns a Promise<boolean>, can be set to execute immediately via canExecuteStartMode: CanExecuteStartMode.InsideCommandFunction', function () { return __awaiter(_this, void 0, void 0, function () {
        var resolver, prom, counter, com;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prom = new Promise(function (resolve) { resolver = resolve; });
                    counter = 0;
                    com = index_1.command({
                        execute: function () {
                            return true;
                        },
                        canExecute: function () { counter++; return prom; },
                        canExecuteStartMode: index_1.CanExecuteStartMode.InsideCommandFunction,
                    });
                    chai_1.expect(counter).to.equal(1);
                    chai_1.expect(com.canExecuteFromFn).to.equal(false);
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(true);
                    resolver(true);
                    return [4 /*yield*/, delay()];
                case 1:
                    _a.sent();
                    chai_1.expect(com.canExecuteFromFn).to.equal(true);
                    chai_1.expect(counter).to.equal(1);
                    chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
                    return [2 /*return*/];
            }
        });
    }); });
    it('when canExecute returned promise is rejected, canExecute stays false and sets canExecuteAsyncRejectReason', function () { return __awaiter(_this, void 0, void 0, function () {
        var prom, promisesRejectedCounter, incrementPromiseRejectionCounter, com, ex_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prom = mobx_1.observable.object({
                        res: Promise.resolve(false)
                    });
                    promisesRejectedCounter = 0;
                    incrementPromiseRejectionCounter = function () { return promisesRejectedCounter += 1; };
                    process.on('unhandledRejection', incrementPromiseRejectionCounter);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    com = index_1.command({
                        execute: function () {
                            return true;
                        },
                        canExecute: function () { return prom.res; }
                    });
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.canExecuteFromFn).to.equal(false);
                    chai_1.expect(com.canExecuteAsyncRejectReason).to.equal(undefined);
                    return [4 /*yield*/, delay()];
                case 2:
                    _a.sent();
                    chai_1.expect(com.canExecuteFromFn).to.equal(false);
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.canExecuteAsyncRejectReason).to.equal(undefined);
                    prom.res = Promise.reject(555);
                    chai_1.expect(com.canExecuteFromFn).to.equal(false);
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.canExecuteAsyncRejectReason).to.equal(undefined);
                    return [4 /*yield*/, delay()];
                case 3:
                    _a.sent();
                    chai_1.expect(com.canExecuteFromFn).to.equal(false);
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.canExecuteAsyncRejectReason).to.equal(555);
                    prom.res = Promise.resolve(true);
                    return [4 /*yield*/, delay()];
                case 4:
                    _a.sent();
                    chai_1.expect(com.canExecuteFromFn).to.equal(true);
                    chai_1.expect(com.canExecuteCombined).to.equal(true);
                    chai_1.expect(com.canExecuteAsyncRejectReason).to.equal(undefined);
                    chai_1.expect(promisesRejectedCounter).to.equal(1);
                    return [3 /*break*/, 7];
                case 5:
                    ex_2 = _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    setTimeout(function () { return process.removeListener('unhandledRejection', incrementPromiseRejectionCounter); }, 0);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    describe('canExecuteStartMode can be passed to control, when canExecute function is first run and tracking starts;', function () {
        it('CanExecuteStartMode.InsideCommandFunction will run canExecute immediately inside "command" function', function () {
            var counter = 0;
            var com = index_1.command({
                canExecuteStartMode: index_1.CanExecuteStartMode.InsideCommandFunction,
                execute: function () {
                    return true;
                },
                canExecute: function () {
                    counter += 1;
                    return false;
                }
            });
            chai_1.expect(counter).to.equal(1);
            chai_1.expect(com.canExecuteFromFn).to.equal(false);
            chai_1.expect(counter).to.equal(1);
            chai_1.expect(com.canExecuteCombined).to.equal(false);
            chai_1.expect(counter).to.equal(1);
            chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
            chai_1.expect(counter).to.equal(1);
        });
        it('CanExecuteStartMode.AsyncInsideCommandFunction will run canExecute in closest available event loop slot', function () { return __awaiter(_this, void 0, void 0, function () {
            var counter, com;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        counter = 0;
                        com = index_1.command({
                            canExecuteStartMode: index_1.CanExecuteStartMode.AsyncInsideCommandFunction,
                            execute: function () {
                                return true;
                            },
                            canExecute: function () {
                                counter += 1;
                                return true;
                            }
                        });
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.canExecuteFromFn).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.canExecuteCombined).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        return [4 /*yield*/, delay()];
                    case 1:
                        _a.sent();
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.canExecuteFromFn).to.equal(true);
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.canExecuteCombined).to.equal(true);
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
                        chai_1.expect(counter).to.equal(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('CanExecuteStartMode.AsyncInsideCommandFunction is default', function () { return __awaiter(_this, void 0, void 0, function () {
            var counter, com;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        counter = 0;
                        com = index_1.command({
                            execute: function () {
                                return true;
                            },
                            canExecute: function () {
                                counter += 1;
                                return true;
                            }
                        });
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.canExecuteFromFn).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.canExecuteCombined).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        return [4 /*yield*/, delay()];
                    case 1:
                        _a.sent();
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.canExecuteFromFn).to.equal(true);
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.canExecuteCombined).to.equal(true);
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
                        chai_1.expect(counter).to.equal(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('CanExecuteStartMode.OnFirstCheck will run canExecute when one of the relevant properties is accessed', function () {
            var counter = 0;
            var com = index_1.command({
                execute: function () {
                    return true;
                },
                canExecute: function () {
                    counter += 1;
                    return false;
                },
                canExecuteStartMode: index_1.CanExecuteStartMode.OnFirstCheck
            });
            chai_1.expect(counter).to.equal(0);
            chai_1.expect(com.canExecuteFromFn).to.equal(false);
            chai_1.expect(counter).to.equal(1);
            chai_1.expect(com.canExecuteCombined).to.equal(false);
            chai_1.expect(counter).to.equal(1);
            chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
            chai_1.expect(counter).to.equal(1);
        });
        it('CanExecuteStartMode.AsyncOnFirstCheck will run canExecute on first access of a relevant property in closest available event loop slot', function () { return __awaiter(_this, void 0, void 0, function () {
            var counter, com;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        counter = 0;
                        com = index_1.command({
                            canExecuteStartMode: index_1.CanExecuteStartMode.AsyncOnFirstCheck,
                            execute: function () {
                                return true;
                            },
                            canExecute: function () {
                                counter += 1;
                                return true;
                            }
                        });
                        chai_1.expect(counter).to.equal(0);
                        return [4 /*yield*/, delay()];
                    case 1:
                        _a.sent();
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.canExecuteFromFn).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.canExecuteCombined).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        return [4 /*yield*/, delay()];
                    case 2:
                        _a.sent();
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.canExecuteFromFn).to.equal(true);
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.canExecuteCombined).to.equal(true);
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
                        chai_1.expect(counter).to.equal(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('CanExecuteStartMode.Manual will keep canExecuteFromFn false and canExecute wont run untill ' +
            'commandInstance.forceInitCanExecuteTracking is called', function () { return __awaiter(_this, void 0, void 0, function () {
            var resolver, prom, counter, com;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prom = new Promise(function (resolve) { resolver = resolve; });
                        counter = 0;
                        com = index_1.command({
                            execute: function () {
                                return true;
                            },
                            canExecute: function () { counter++; return prom; },
                            canExecuteStartMode: index_1.CanExecuteStartMode.Manual,
                        });
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.canExecuteFromFn).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.canExecuteCombined).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        return [4 /*yield*/, delay()];
                    case 1:
                        _a.sent();
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.canExecuteFromFn).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.canExecuteCombined).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
                        chai_1.expect(counter).to.equal(0);
                        com.forceInitCanExecuteTracking();
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.canExecuteFromFn).to.equal(false);
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.canExecuteCombined).to.equal(false);
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(true);
                        chai_1.expect(counter).to.equal(1);
                        resolver(true);
                        return [4 /*yield*/, delay()];
                    case 2:
                        _a.sent();
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.canExecuteFromFn).to.equal(true);
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.canExecuteCombined).to.equal(true);
                        chai_1.expect(counter).to.equal(1);
                        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
                        chai_1.expect(counter).to.equal(1);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=index.test.js.map