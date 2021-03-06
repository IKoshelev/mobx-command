# mobx-command

This is an implementation of Command pattern for MobX. It takes two functions, `execute` and `canExecute`, 
both can return a promise that will be used for tracking purposes.

Available via NPM:

`npm install mobx-command`

Tests sumarize the api well, here is short version:

```typescript
import { command } from 'mobx-command';

class UserDetailsVm {

    public userId: number = 5;

    public resetPassword = command({
        execute: async (skipConfirmation: boolean = false) => {
            let confirmation = skipConfirmation || await confirmSensitiveAction("Are you sure?");
            if (!confirmation) {
                return 0;
            }
            let operationId = await userServiceClient.resetUserPasswrod(this.userId);
            return operationId;
        },
        canExecute: () => userServiceClient.isAdminCurrentUser(),
    });
    // canExecute is lazy
    // if you wan't to trigger it immediately, pass evaluateCanExecuteImmediately: true 
}

let userDetailsVm = new UserDetailsVm();

//Mobx computed, combines isExecuting and canExecuteFromFn,
//use this check for most cases, i.e. prevent fast clicks on same button on ui.
//It is up to the user to check this flag before calling execute
userDetailsVm.resetPassword.canExecuteCombined; 

//execute command if canExecuteCombined is true. 
let operationId1: number | undefined = userDetailsVm.resetPassword.executeIfCan(true);

//execute command. Does not perform checks, forces execution.
let operationId2: number = userDetailsVm.resetPassword.executeForced(true);

//more granular flags, all mobx observable or computed

//true while command is running, if it returns a promise to track this.
//Typically used to indicate busy on a ui button invoking the command
userDetailsVm.resetPassword.isExecuting;

//Result of canExecute function; 
//If canExecute returns Promise<boolean> - will be false while check is running
userDetailsVm.resetPassword.canExecuteFromFn;

//true while canExecute is running, if it returns a promise to track this
userDetailsVm.resetPassword.isCanExecuteAsyncRunning;

//If canExecute returned a promise that was ultimately rejected - 
//this will contain rejection reason
userDetailsVm.resetPassword.canExecuteAsyncRejectReason;

//Raw computed from canExecute function, so you can subscribe to its recalculations, if needed
userDetailsVm.resetPassword.canExecuteFromFnRaw;
```

By default, canExecute tracking is started via a `setTimeoue(...,0)` inside `command` function. 
Usually, commands are created inside a constructor, this avoids firing it while constructor is not finished.
If you need a different start mode - you can pass in `canExecuteStartMode` with one of the following values:

```typescript
/**
*  controlls when canExecute function will be ran for the first time
*/
export enum CanExecuteStartMode {
    /**
    *  run canExecute synchronously inside command
    */
    InsideCommandFunction = 1,
    /**
    *  DEFAULT, run canExecute via setTimeout(...,0) inside command
    */
    AsyncInsideCommandFunction = 2,
    /**
    *  canExecute will be run when one of relevant properties of command is accessed
    *  Observers do not like this mode, since it is likely to alters state 
    */
    OnFirstCheck = 3,
    /**
    *  canExecute will be run via setTimeout(...,0) when one of relevant properties of command is accessed
    *  Observers do not like this mode, since it is likely to alters state 
    */
   AsyncOnFirstCheck = 4,
    /**
    *  command does not start tracking canExecute (assuming false), 
    *  untill forceInitCanExecuteTracking is called
    */
    Manual = 5
}

//in manual mode, you will have to explicitly start tracking:
yourVm.commandInstance.forceInitCanExecuteTracking();
```
