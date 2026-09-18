const {test}=require('node:test');
const assert=require('node:assert/strict');
const {calculate,earnedDeduction,earnedCredit,assessedTax}=require('./calculator.js');
test('NTS earned deduction worked example and boundaries',()=>{
 assert.equal(earnedDeduction(33800000),10320000);
 for(const [gross,deduction] of [[0,0],[5000000,3500000],[15000000,7500000],[45000000,12000000],[100000000,14750000],[400000000,20000000]])assert.equal(earnedDeduction(gross),deduction);
});
test('NTS earned credit and caps',()=>{
 assert.equal(earnedCredit(30000000,1000000),550000);
 assert.equal(earnedCredit(33000000,3000000),740000);
 assert.equal(earnedCredit(40000000,3000000),684000);
 assert.equal(earnedCredit(70000000,3000000),660000);
 assert.equal(earnedCredit(71000000,3000000),500000);
 assert.equal(earnedCredit(121000000,3000000),200000);
 assert.equal(assessedTax(50000000),6240000);
});
test('published salary examples from itemized official formula',()=>{
 const a=calculate(40000000,1,0,200000),b=calculate(50000000,1,0,200000);
 assert.equal(a.net,2912429);assert.equal(a.totalDeduction,420904);
 assert.equal(b.pension,188385);assert.equal(b.health,142602);assert.equal(b.longcare,18738);assert.equal(b.employment,35700);
 assert.equal(b.deduction,12130000);assert.equal(b.taxBase,29344900);assert.equal(b.assessed,3141735);assert.equal(b.credit,660000);
 assert.equal(b.incomeTax,206811);assert.equal(b.localTax,20681);assert.equal(b.net,3553750);
 assert.equal(b.annualNet,50000000-b.totalDeduction*12);
});
test('zero, pension cap and eligible child credit',()=>{
 const z=calculate(0,1,0,0);for(const v of Object.values(z))assert.equal(v,0);
 assert.equal(calculate(100000000,1,0,0).pension,313025);
 assert.equal(calculate(80000000,4,3,200000).childCredit,950000);
 assert.ok(calculate(80000000,2,1,200000).net>calculate(80000000,2,0,200000).net);
});
test('unsupported and inconsistent input',()=>{
 for(const a of [[NaN,1,0,0],[-1,1,0,0],[100,1,0,0],[300000001,1,0,0],[40000000,1,1,0],[40000000,0,0,0],[40000000,1,0,4000000],[40000000,1,0,-1]])assert.throws(()=>calculate(...a),RangeError);
});
