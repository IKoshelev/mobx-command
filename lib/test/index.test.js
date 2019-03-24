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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
        com.execute();
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
        com.execute();
        chai_1.expect(counter).to.equal(1);
    });
    it('should pass parameters to original function', function () {
        var com = index_1.command(function (d, e) {
            chai_1.expect(d).to.equal(1);
            chai_1.expect(e).to.equal(2);
            return true;
        });
        com.execute(1, 2);
    });
    it('when canExecute is not passed, default is always true', function () {
        var com = index_1.command(function () {
            return true;
        });
        chai_1.expect(com.canExecuteFromFn).to.equal(true);
        chai_1.expect(com.canExecuteCombined).to.equal(true);
        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
    });
    it('when canExecute function is passed, it is used', function () {
        var com = index_1.command({
            execute: function () {
                return true;
            },
            canExecute: function () { return false; }
        });
        chai_1.expect(com.canExecuteFromFn).to.equal(false);
        chai_1.expect(com.canExecuteCombined).to.equal(false);
        chai_1.expect(com.isCanExecuteAsyncRunning).to.equal(false);
    });
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
        var prom, promisesRejectedCounter, incrementPromiseRejectionCounter, com, ex_1;
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
                    ex_1 = _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    process.removeListener('unhandledRejection', incrementPromiseRejectionCounter);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); });
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
                    chai_1.expect(com.canExecuteCombined).to.equal(true);
                    chai_1.expect(com.canExecuteFromFn).to.equal(true);
                    com.execute();
                    chai_1.expect(com.isExecuting).to.equal(true);
                    chai_1.expect(com.canExecuteCombined).to.equal(false);
                    chai_1.expect(com.canExecuteFromFn).to.equal(true);
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
});
//# sourceMappingURL=index.test.js.map