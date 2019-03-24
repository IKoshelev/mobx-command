import * as mocha from 'mocha';
import { expect } from 'chai';

import { add } from  './../src/index';

//todo typescript couldn't find setTimeout?
declare function setTimeout(a:any, b:any ):void;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('', () => {

        it('', async ()=> {
            let res = add(1,2);
           
            expect(res).to.equal(3);

        });

});