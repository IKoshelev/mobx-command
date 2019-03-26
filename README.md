# mobx-command

This is an implementation of Command pattern for MobX. It takes two functions, `execute` and `canExecute`, 
both can return a promise that will be used for tracking purposes.

Available via NPM:

`npm install mobx-command`

Tests sumarize the api well, here is short version:

```typescript
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
        canExecute: () => userServiceClient.isAdminCurrentUser()
    });
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
