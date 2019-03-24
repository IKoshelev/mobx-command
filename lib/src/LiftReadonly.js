"use strict";
//Below code leaves garbage in JS, which causes error in runtime, so it is moved to separate file
// sample of garbage:
//-readonly[P in keyof];
//T;
//T[P];
//;
Object.defineProperty(exports, "__esModule", { value: true });
-readonly[P in keyof];
T;
T[P];
;
//# sourceMappingURL=LiftReadonly.js.map