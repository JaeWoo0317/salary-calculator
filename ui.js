'use strict';
const fmt = n => Math.round(n).toLocaleString('ko-KR');
function readMoney(id) {
  const value = document.getElementById(id).value.trim().replaceAll(',', '');
  if (!/^\d+$/.test(value)) throw new Error('연봉과 비과세액은 원 단위의 0 이상 정수로 입력하세요.');
  return Number(value);
}
function calc() {
  const ids = ['pension', 'health', 'longcare', 'employ', 'incomeTax', 'localTax', 'totalDeduction'];
  try {
    const annual = readMoney('salaryInput'), taxFree = readMoney('taxFree');
    const dependents = Number(document.getElementById('dependents').value), children = Number(document.getElementById('children').value);
    const r = SalaryCalculator.calculate(annual, dependents, children, taxFree);
    document.getElementById('inputError').textContent = '';
    document.getElementById('monthlyNet').textContent = fmt(r.net) + '원';
    document.getElementById('annualNet').textContent = '연간 추정 순수령액: ' + fmt(r.annualNet) + '원';
    const values = [r.pension, r.health, r.longcare, r.employment, r.incomeTax, r.localTax, r.totalDeduction];
    ids.forEach((id, i) => document.getElementById(id).textContent = '-' + fmt(values[i]) + '원');
    document.getElementById('taxSteps').textContent = '연간 과세급여 ' + fmt(r.gross) + '원 → 근로소득공제 ' + fmt(r.deduction) + '원 → 인적공제·보험료 공제 후 과세표준 ' + fmt(r.taxBase) + '원 → 산출세액 ' + fmt(r.assessed) + '원 → 근로소득·자녀 세액공제 후 연간 추정 소득세 ' + fmt(r.annualTax) + '원';
    const items = [{v:r.net,c:'#3366FF'},{v:r.pension,c:'#6C5CE7'},{v:r.health,c:'#00B894'},{v:r.longcare,c:'#00CEC9'},{v:r.employment,c:'#FDCB6E'},{v:r.incomeTax,c:'#E34040'},{v:r.localTax,c:'#E17055'}];
    document.getElementById('chartBar').innerHTML = r.monthlyGross ? items.map(i => '<div class="chart-bar-segment" style="width:' + Math.max(0,i.v/r.monthlyGross*100).toFixed(2) + '%;background:' + i.c + '"></div>').join('') : '';
    const salaries = [...new Set([24000000,30000000,36000000,40000000,45000000,50000000,60000000,70000000,80000000,100000000,150000000,annual])].filter(x=>x>0).sort((a,b)=>a-b);
    document.getElementById('salaryTableBody').innerHTML = salaries.map(s => {
      if (taxFree > s/12) return '<tr><td>'+fmt(s/10000)+'만원</td><td colspan="3">비과세액이 월급을 초과합니다.</td></tr>';
      const item = SalaryCalculator.calculate(s,dependents,children,taxFree);
      return '<tr class="'+(s===annual?'highlight':'')+'"><td>'+fmt(s/10000)+'만원</td><td>'+fmt(item.monthlyGross)+'</td><td>'+fmt(item.totalDeduction)+'</td><td>'+fmt(item.net)+'</td></tr>';
    }).join('');
  } catch (e) {
    document.getElementById('inputError').textContent = e.message;
    ['monthlyNet','annualNet',...ids].forEach(id=>document.getElementById(id).textContent='-');
    ['chartBar','salaryTableBody','taxSteps'].forEach(id=>document.getElementById(id).textContent='');
  }
}
function setQuick(value) {
  document.getElementById('salaryInput').value = fmt(value);
  document.querySelectorAll('.quick-btn').forEach(b => b.classList.toggle('active',b.getAttribute('onclick')==='setQuick('+value+')'));
  calc();
}
function toggleFaq(el) { const open = el.parentElement.classList.toggle("open"); el.setAttribute("aria-expanded", String(open)); }
['salaryInput','taxFree'].forEach(id=>document.getElementById(id).addEventListener('input',calc));
['dependents','children'].forEach(id=>document.getElementById(id).addEventListener('change',calc));
const salaryParam = new URLSearchParams(window.location.search).get('salary');
if (salaryParam !== null) document.getElementById('salaryInput').value = salaryParam;
calc();
