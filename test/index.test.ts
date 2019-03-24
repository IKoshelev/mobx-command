import * as mocha from 'mocha';
import { expect } from 'chai';
import { observable } from 'mobx';

import { command } from './../src/index';

//todo typescript couldn't find setTimeout?
declare function setTimeout(a: any, b: any): void;

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

        com.execute();

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

        com.execute();

        expect(counter).to.equal(1);
    });

    it('should pass parameters to original function', () => {

        var com = command((d, e) => {
            expect(d).to.equal(1);
            expect(e).to.equal(2);
            return true;
        });

        com.execute(1, 2);
    });

    it('when canExecute is not passed, default is always true', () => {

        var com = command(() => {
            return true;
        });

        expect(com.canExecuteFromFn).to.equal(true);
        expect(com.canExecuteCombined).to.equal(true);
        expect(com.isCanExecuteAsyncRunning).to.equal(false);
    });

    it('when canExecute function is passed, it is used', () => {

        var com = command({
            execute: () => {
                return true;
            },
            canExecute: () => false
        });

        expect(com.canExecuteFromFn).to.equal(false);
        expect(com.canExecuteCombined).to.equal(false);
        expect(com.isCanExecuteAsyncRunning).to.equal(false);
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
            process.removeListener('unhandledRejection', incrementPromiseRejectionCounter);
        }
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
        expect(com.canExecuteCombined).to.equal(true);
        expect(com.canExecuteFromFn).to.equal(true);

        com.execute();

        expect(com.isExecuting).to.equal(true);
        expect(com.canExecuteCombined).to.equal(false);
        expect(com.canExecuteFromFn).to.equal(true);

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

});