//Below code leaves garbage in JS, which causes error in runtime, so it is moved to separate file
// sample of garbage:
//-readonly[P in keyof];
//T;
//T[P];
//;

export type LiftReadonly<T> = { -readonly [P in keyof T]: T[P] };