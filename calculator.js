(function (root) {
  'use strict';
  // NTS earned-income deduction and credits; this is not a withholding-table lookup.
  function earnedDeduction(gross) {
    const value = gross <= 5000000 ? gross * .7 : gross <= 15000000 ? 3500000 + (gross - 5000000) * .4 : gross <= 45000000 ? 7500000 + (gross - 15000000) * .15 : gross <= 100000000 ? 12000000 + (gross - 45000000) * .05 : 14750000 + (gross - 100000000) * .02;
    return Math.min(20000000, value);
  }
  function assessedTax(base) {
    const bands = [[14000000, .06, 0], [50000000, .15, 1260000], [88000000, .24, 5760000], [150000000, .35, 15440000], [300000000, .38, 19940000], [500000000, .40, 25940000], [1000000000, .42, 35940000], [Infinity, .45, 65940000]];
    const [, rate, deduction] = bands.find(([upper]) => base <= upper);
    return Math.max(0, base * rate - deduction);
  }
  function earnedCredit(gross, tax) {
    const credit = tax <= 1300000 ? tax * .55 : 715000 + (tax - 1300000) * .3;
    const limit = gross <= 33000000 ? 740000 : gross <= 70000000 ? Math.max(660000, 740000 - (gross - 33000000) * .008) : gross <= 120000000 ? Math.max(500000, 660000 - (gross - 70000000) * .5) : Math.max(200000, 500000 - (gross - 120000000) * .5);
    return Math.min(credit, limit);
  }
  function calculate(annual, dependents, children, taxFree) {
    if (!Number.isSafeInteger(annual) || annual < 0 || annual > 300000000 || (annual > 0 && annual < 4920000)) throw new RangeError('연봉은 0원 또는 492만원~3억원 범위의 정수로 입력하세요.');
    if (!Number.isInteger(dependents) || dependents < 1 || dependents > 20 || !Number.isInteger(children) || children < 0 || children >= dependents) throw new RangeError('공제대상 자녀는 본인을 제외한 부양가족 수 이하여야 합니다.');
    if (!Number.isSafeInteger(taxFree) || taxFree < 0 || taxFree > annual / 12) throw new RangeError('월 비과세액은 세전 월급 이하의 정수로 입력하세요.');
    const monthlyGross = annual / 12;
    const monthlyTaxable = monthlyGross - taxFree;
    const pensionBase = monthlyTaxable > 0 ? Math.min(6590000, Math.max(410000, Math.floor(monthlyTaxable / 1000) * 1000)) : 0;
    const pension = Math.round(pensionBase * .0475);
    const health = Math.round(monthlyTaxable * .03595);
    const longcare = Math.round(health * .1314);
    const employment = Math.round(monthlyTaxable * .009);
    const insurance = pension + health + longcare + employment;
    const gross = annual - taxFree * 12;
    const deduction = earnedDeduction(gross);
    const taxBase = Math.max(0, gross - deduction - dependents * 1500000 - insurance * 12);
    const assessed = assessedTax(taxBase);
    const credit = earnedCredit(gross, assessed);
    const childCredit = children === 0 ? 0 : children === 1 ? 250000 : 550000 + (children - 2) * 400000;
    const annualTax = Math.max(0, assessed - credit - childCredit);
    const incomeTax = Math.round(annualTax / 12);
    const localTax = Math.round(incomeTax * .1);
    const totalDeduction = insurance + incomeTax + localTax;
    const net = Math.round(monthlyGross) - totalDeduction;
    return {monthlyGross: Math.round(monthlyGross), pension, health, longcare, employment, insurance, gross, deduction, taxBase, assessed, credit, childCredit, annualTax, incomeTax, localTax, totalDeduction, net, annualNet: annual - totalDeduction * 12};
  }
  const api = {calculate, earnedDeduction, earnedCredit, assessedTax};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SalaryCalculator = api;
})(globalThis);
