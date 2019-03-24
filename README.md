# mobx-command

This is an implementation of Command pattern for MobX. It takes two functions, `execute` and `canExecute`, 
both can return a promise that will be used for tracking purposes.

Test sumarize the api well, here is shor version:

```typescript
class UserDetailsVm {

    public userId: number = 5;

    public resetPassword = command({
        execute: async (skipConfirmation: boolean = false) => {
            let confirmation = skipConfirmation || await confirmSensitiveAction("Are you sure?");
            if (!confirmation) {
                return;
            }
            let operationId = await userServiceClient.resetUserPasswrod(this.userId);
            return operationId;
        },
        canExecute: () => userServiceClient.isAdminCurrentUser()
    });
}

let userDetailsVm = new UserDetailsVm();

//mobx computed, combines isExecuting and canExecuteFromFn
//use this check for most cases, i.e. prevent fast clicks on same button on ui
userDetailsVm.resetPassword.canExecuteCombined; 

//execute command. Does not perform checks, forces execution
let operationId = userDetailsVm.resetPassword.execute(true);

//more granular flags, all mobx observable or computed

//true while command is running, if it returns a promise to track this
//typically used to indicate busy on a ui button invoking the command
userDetailsVm.resetPassword.isExecuting;

//result of canExecute function; If canExecute returns Promise<boolean> - will be false while check is running
userDetailsVm.resetPassword.canExecuteFromFn;

//true while canExecute is running,  if it returns a promise to track this
userDetailsVm.resetPassword.isCanExecuteAsyncRunning;

//if canExecute returned a promise that was ultimately rejected - this will contain rejection reason
userDetailsVm.resetPassword.canExecuteAsyncRejectReason;

//raw computed from canExecute function, so you can subscribe to its recalculations
userDetailsVm.resetPassword.canExecuteFromFnRaw;
```
