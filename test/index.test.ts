import * as mocha from 'mocha';
import { expect } from 'chai';
import { observable, runInAction, configure } from 'mobx';

import { command, CanExecuteStartMode } from './../src/index';

configure({
    enforceActions: true
});

const delay = (ms: number = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe('command ', () => {

    it('exists', async () => {
        expect(typeof command !== 'undefined').to.equal(true);
    });

    it('should accept a function', () => {

        var counter = 0;

        var com = command(() => {
            counter += 1;
            return true;
        });

        com.executeForced();

        expect(counter).to.equal(1);
    });

    it('should accept options', () => {

        var counter = 0;

        var com = command({
            execute: () => {
                counter += 1;
                return true;
            }
        });

        com.executeForced();

        expect(counter).to.equal(1);
    });

    it('execute can have void return type', () => {

        var counter = 0;

        var com = command({
            execute: () => {
                counter += 1;
            },
            canExecute: () => true
        });

        com.executeForced();

        expect(counter).to.equal(1);
    });

    it('should pass parameters to original function', () => {

        var com = command((d: number, e: number) => {
            expect(d).to.equal(1);
            expect(e).to.equal(2);
            return d + e;
        });

        let result = com.executeForced(1, 2);

        expect(result).to.equal(3);
    });

    it('has executeIfCan and executeForced functions that execute command with or without check', () => {

        var counter = 0;

        var trigger = observable({
            canExecute: false
        });

        var com = command({
            execute: () => {
                counter += 1;
                return true;
            },
            canExecute: () => {
                return trigger.canExecute;
            },
            canExecuteStartMode: CanExecuteStartMode.OnFirstCheck
        });

        expect(com.canExecuteCombined).to.equal(false);

        let res = com.executeIfCan();

        expect(counter).to.equal(0);
        expect(res).to.equal(undefined);

        res = com.executeForced();

        expect(counter).to.equal(1);
        expect(res).to.equal(true);

        runInAction(() => trigger.canExecute = true);

        expect(com.canExecuteCombined).to.equal(true);

        res = com.executeIfCan();

        expect(counter).to.equal(2);
        expect(res).to.equal(true);
    });

    it('both executeIfCan and executeForced are bound', () => {

        var counter = 0;

        var trigger = observable({
            canExecute: false
        });

        var com = command({
            execute: () => {
                counter += 1;
                return true;
            },
            canExecute: () => {
                return trigger.canExecute;
            },
            canExecuteStartMode: CanExecuteStartMode.OnFirstCheck
        });

        let executeIfCan = com.executeIfCan;
        let executeForced = com.executeForced;

        expect(com.canExecuteCombined).to.equal(false);

        let res = executeIfCan();

        expect(counter).to.equal(0);
        expect(res).to.equal(undefined);

        res = executeForced();

        expect(counter).to.equal(1);
        expect(res).to.equal(true);

        runInAction(() => trigger.canExecute = true);

        expect(com.canExecuteCombined).to.equal(true);

        res = executeIfCan();

        expect(counter).to.equal(2);
        expect(res).to.equal(true);
    });

    it('when canExecute is not passed, default is always true', () => {

        var com = command({
            execute: () => {
                return true;
            },
            canExecuteStartMode: CanExecuteStartMode.OnFirstCheck
        });

        expect(com.canExecuteFromFn).to.equal(true);
        expect(com.canExecuteCombined).to.equal(true);
        expect(com.isCanExecuteAsyncRunning).to.equal(false);
    });

    it('command function can return a promise, which will be used to track execution and set isExecuting', async () => {

        var resolver: any;
        var prom = new Promise<any>((resolve) => { resolver = resolve; });

        var com = command({
            execute: () => {
                return prom;
            }
        });

        expect(com.isExecuting).to.equal(false);
        expect(com.canExecuteCombined).to.equal(false);
        expect(com.canExecuteFromFn).to.equal(false);

        com.executeForced();

        expect(com.isExecuting).to.equal(true);
        expect(com.canExecuteCombined).to.equal(false);
        expect(com.canExecuteFromFn).to.equal(false);

        await delay();

        expect(com.isExecuting).to.equal(true);
        expect(com.canExecuteCombined).to.equal(false);
        expect(com.canExecuteFromFn).to.equal(true);

        resolver({});

        await delay();

        expect(com.isExecuting).to.equal(false);
        expect(com.canExecuteCombined).to.equal(true);
        expect(com.canExecuteFromFn).to.equal(true);
    });

    it('command function promise rejection is also used to track execution and set isExecuting', async () => {

        var rejector: any;
        var prom = new Promise<any>((resolve, reject) => { rejector = reject; });

        let promisesRejectedCounter = 0;
        const incrementPromiseRejectionCounter = () => promisesRejectedCounter += 1;
        process.on('unhandledRejection', incrementPromiseRejectionCounter);

        try {

            var com = command({
                execute: () => {
                    return prom;
                }
            });

            expect(com.isExecuting).to.equal(false);
            expect(com.canExecuteCombined).to.equal(true);
            expect(com.canExecuteFromFn).to.equal(true);

            com.executeForced();

            expect(com.isExecuting).to.equal(true);
            expect(com.canExecuteCombined).to.equal(false);
            expect(com.canExecuteFromFn).to.equal(true);

            await delay();

            expect(com.isExecuting).to.equal(true);
            expect(com.canExecuteCombined).to.equal(false);
            expect(com.canExecuteFromFn).to.equal(true);

            rejector({});

            await delay();

            expect(com.isExecuting).to.equal(false);
            expect(com.canExecuteCombined).to.equal(true);
            expect(com.canExecuteFromFn).to.equal(true);
        }
        catch (ex) {

        }
        finally {
            setTimeout(() => process.removeListener('unhandledRejection', incrementPromiseRejectionCounter), 0);
        }
    });

    it('canExecute function can return a Promise<boolean>', async () => {

        var resolver: any;
        var prom = new Promise<boolean>((resolve) => { resolver = resolve; });
        var counter = 0;

        var com = command({
            execute: () => {
                return true;
            },
            canExecute: () => { counter++; return prom; }
        });

        expect(counter).to.equal(0);

        expect(com.canExecuteFromFn).to.equal(false);
        expect(com.canExecuteCombined).to.equal(false);
        expect(com.isCanExecuteAsyncRunning).to.equal(false);

        await delay();

        expect(com.canExecuteFromFn).to.equal(false);
        expect(com.canExecuteCombined).to.equal(false);
        expect(com.isCanExecuteAsyncRunning).to.equal(true);

        resolver(true);

        await delay();

        expect(com.canExecuteFromFn).to.equal(true);
        expect(counter).to.equal(1);
        expect(com.isCanExecuteAsyncRunning).to.equal(false);
    });

    it('canExecute function, that returns a Promise<boolean>, can be set to execute immediately via canExecuteStartMode: CanExecuteStartMode.InsideCommandFunction', async () => {

        var resolver: any;
        var prom = new Promise<boolean>((resolve) => { resolver = resolve; });
        var counter = 0;

        var com = command({
            execute: () => {
                return true;
            },
            canExecute: () => { counter++; return prom; },
            canExecuteStartMode: CanExecuteStartMode.InsideCommandFunction,
        });

        expect(counter).to.equal(1);

        expect(com.canExecuteFromFn).to.equal(false);
        expect(com.canExecuteCombined).to.equal(false);
        expect(com.isCanExecuteAsyncRunning).to.equal(true);

        resolver(true);

        await delay();

        expect(com.canExecuteFromFn).to.equal(true);
        expect(counter).to.equal(1);
        expect(com.isCanExecuteAsyncRunning).to.equal(false);
    });

    it('when canExecute returned promise is rejected, canExecute stays false and sets canExecuteAsyncRejectReason', async () => {

        var prom = observable.object({
            res: Promise.resolve(false)
        });

        let promisesRejectedCounter = 0;
        const incrementPromiseRejectionCounter = () => promisesRejectedCounter += 1;
        process.on('unhandledRejection', incrementPromiseRejectionCounter);

        try {
            var com = command({
                execute: () => {
                    return true;
                },
                canExecute: () => prom.res
            });

            expect(com.canExecuteCombined).to.equal(false);
            expect(com.canExecuteFromFn).to.equal(false);
            expect(com.canExecuteAsyncRejectReason).to.equal(undefined);

            await delay();

            expect(com.canExecuteFromFn).to.equal(false);
            expect(com.canExecuteCombined).to.equal(false);
            expect(com.canExecuteAsyncRejectReason).to.equal(undefined);

            prom.res = Promise.reject(555);

            expect(com.canExecuteFromFn).to.equal(false);
            expect(com.canExecuteCombined).to.equal(false);
            expect(com.canExecuteAsyncRejectReason).to.equal(undefined);

            await delay();

            expect(com.canExecuteFromFn).to.equal(false);
            expect(com.canExecuteCombined).to.equal(false);
            expect(com.canExecuteAsyncRejectReason).to.equal(555);

            prom.res = Promise.resolve(true);

            await delay();

            expect(com.canExecuteFromFn).to.equal(true);
            expect(com.canExecuteCombined).to.equal(true);
            expect(com.canExecuteAsyncRejectReason).to.equal(undefined);

            expect(promisesRejectedCounter).to.equal(1);
        }
        catch (ex) {

        }
        finally {
            setTimeout(() => process.removeListener('unhandledRejection', incrementPromiseRejectionCounter), 0);
        }
    });

    describe('canExecuteStartMode can be passed to control, when canExecute function is first run and tracking starts;', () => {

        it('CanExecuteStartMode.InsideCommandFunction will run canExecute immediately inside "command" function', () => {

            let counter = 0;

            var com = command({
                canExecuteStartMode: CanExecuteStartMode.InsideCommandFunction,
                execute: () => {
                    return true;
                },
                canExecute: () => {
                    counter += 1;
                    return false;
                }
            });

            expect(counter).to.equal(1);

            expect(com.canExecuteFromFn).to.equal(false);

            expect(counter).to.equal(1);

            expect(com.canExecuteCombined).to.equal(false);

            expect(counter).to.equal(1);

            expect(com.isCanExecuteAsyncRunning).to.equal(false);

            expect(counter).to.equal(1);
        });

        it('CanExecuteStartMode.AsyncInsideCommandFunction will run canExecute in closest available event loop slot', async () => {

            let counter = 0;

            var com = command({
                canExecuteStartMode: CanExecuteStartMode.AsyncInsideCommandFunction,
                execute: () => {
                    return true;
                },
                canExecute: () => {
                    counter += 1;
                    return true;
                }
            });

            expect(counter).to.equal(0);
            expect(com.canExecuteFromFn).to.equal(false);
            expect(counter).to.equal(0);
            expect(com.canExecuteCombined).to.equal(false);
            expect(counter).to.equal(0);
            expect(com.isCanExecuteAsyncRunning).to.equal(false);
            expect(counter).to.equal(0);

            await delay();

            expect(counter).to.equal(1);
            expect(com.canExecuteFromFn).to.equal(true);
            expect(counter).to.equal(1);
            expect(com.canExecuteCombined).to.equal(true);
            expect(counter).to.equal(1);
            expect(com.isCanExecuteAsyncRunning).to.equal(false);
            expect(counter).to.equal(1);
        });

        it('CanExecuteStartMode.AsyncInsideCommandFunction is default', async () => {

            let counter = 0;

            var com = command({
                execute: () => {
                    return true;
                },
                canExecute: () => {
                    counter += 1;
                    return true;
                }
            });

            expect(counter).to.equal(0);
            expect(com.canExecuteFromFn).to.equal(false);
            expect(counter).to.equal(0);
            expect(com.canExecuteCombined).to.equal(false);
            expect(counter).to.equal(0);
            expect(com.isCanExecuteAsyncRunning).to.equal(false);
            expect(counter).to.equal(0);

            await delay();

            expect(counter).to.equal(1);
            expect(com.canExecuteFromFn).to.equal(true);
            expect(counter).to.equal(1);
            expect(com.canExecuteCombined).to.equal(true);
            expect(counter).to.equal(1);
            expect(com.isCanExecuteAsyncRunning).to.equal(false);
            expect(counter).to.equal(1);
        });

        it('CanExecuteStartMode.OnFirstCheck will run canExecute when one of the relevant properties is accessed', () => {

            let counter = 0;

            var com = command({
                execute: () => {
                    return true;
                },
                canExecute: () => {
                    counter += 1;
                    return false;
                },
                canExecuteStartMode: CanExecuteStartMode.OnFirstCheck
            });

            expect(counter).to.equal(0);

            expect(com.canExecuteFromFn).to.equal(false);

            expect(counter).to.equal(1);

            expect(com.canExecuteCombined).to.equal(false);

            expect(counter).to.equal(1);

            expect(com.isCanExecuteAsyncRunning).to.equal(false);

            expect(counter).to.equal(1);
        });

        it('CanExecuteStartMode.AsyncOnFirstCheck will run canExecute on first access of a relevant property in closest available event loop slot', async () => {

            let counter = 0;

            var com = command({
                canExecuteStartMode: CanExecuteStartMode.AsyncOnFirstCheck,
                execute: () => {
                    return true;
                },
                canExecute: () => {
                    counter += 1;
                    return true;
                }
            });

            expect(counter).to.equal(0);

            await delay();

            expect(counter).to.equal(0);
            expect(com.canExecuteFromFn).to.equal(false);
            expect(counter).to.equal(0);
            expect(com.canExecuteCombined).to.equal(false);
            expect(counter).to.equal(0);
            expect(com.isCanExecuteAsyncRunning).to.equal(false);
            expect(counter).to.equal(0);

            await delay();

            expect(counter).to.equal(1);
            expect(com.canExecuteFromFn).to.equal(true);
            expect(counter).to.equal(1);
            expect(com.canExecuteCombined).to.equal(true);
            expect(counter).to.equal(1);
            expect(com.isCanExecuteAsyncRunning).to.equal(false);
            expect(counter).to.equal(1);
        });

        it('CanExecuteStartMode.Manual will keep canExecuteFromFn false and canExecute wont run untill ' +
            'commandInstance.forceInitCanExecuteTracking is called', async () => {

                var resolver: any;
                var prom = new Promise<boolean>((resolve) => { resolver = resolve; });
                var counter = 0;

                var com = command({
                    execute: () => {
                        return true;
                    },
                    canExecute: () => { counter++; return prom; },
                    canExecuteStartMode: CanExecuteStartMode.Manual,
                });

                expect(counter).to.equal(0);
                expect(com.canExecuteFromFn).to.equal(false);
                expect(counter).to.equal(0);
                expect(com.canExecuteCombined).to.equal(false);
                expect(counter).to.equal(0);
                expect(com.isCanExecuteAsyncRunning).to.equal(false);
                expect(counter).to.equal(0);

                await delay();

                expect(counter).to.equal(0);
                expect(com.canExecuteFromFn).to.equal(false);
                expect(counter).to.equal(0);
                expect(com.canExecuteCombined).to.equal(false);
                expect(counter).to.equal(0);
                expect(com.isCanExecuteAsyncRunning).to.equal(false);
                expect(counter).to.equal(0);

                com.forceInitCanExecuteTracking();

                expect(counter).to.equal(1);
                expect(com.canExecuteFromFn).to.equal(false);
                expect(counter).to.equal(1);
                expect(com.canExecuteCombined).to.equal(false);
                expect(counter).to.equal(1);
                expect(com.isCanExecuteAsyncRunning).to.equal(true);
                expect(counter).to.equal(1);

                resolver(true);

                await delay();

                expect(counter).to.equal(1);
                expect(com.canExecuteFromFn).to.equal(true);
                expect(counter).to.equal(1);
                expect(com.canExecuteCombined).to.equal(true);
                expect(counter).to.equal(1);
                expect(com.isCanExecuteAsyncRunning).to.equal(false);
                expect(counter).to.equal(1);
            });
    });
});