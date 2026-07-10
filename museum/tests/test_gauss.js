/* test_gauss.js — E1 순수 로직 단언 (node test_gauss.js)
   HTML의 <script id="gauss-pure"> 블록을 추출해 로드하고 단언한다.
   순수 블록 바이트 불변(동결) 확인용 sha256도 출력. */
'use strict';
var fs = require('fs'), crypto = require('crypto'), path = require('path');

var html = fs.readFileSync(path.join(__dirname,'..','math','ex01_gauss.html'),'utf8');
var m = html.match(/<script id="gauss-pure">([\s\S]*?)<\/script>/);
if(!m){ console.error('FAIL: gauss-pure 블록 없음'); process.exit(1); }
var pureSrc = m[1];
var hash = crypto.createHash('sha256').update(pureSrc,'utf8').digest('hex').slice(0,16);

var moduleObj = { exports:{} };
new Function('module','exports', pureSrc)(moduleObj, moduleObj.exports);
var G = moduleObj.exports;

var pass=0, fail=0;
function ok(name,cond){ if(cond){pass++;} else {fail++; console.error('  ✗ '+name);} }

// gaussSum
ok('gaussSum(100)===5050', G.gaussSum(100)===5050);
ok('gaussSum(1)===1', G.gaussSum(1)===1);
ok('gaussSum(2)===3', G.gaussSum(2)===3);
ok('gaussSum(10000) 정수', G.gaussSum(10000)===50005000);

// pairs(100): 50쌍, 전쌍 합 101
var p100=G.pairs(100);
ok('pairs(100).length===50', p100.length===50);
ok('pairs(100) 전쌍 합 101', p100.every(function(p){ return p.b!==null && (p.a+p.b)===101; }));

// pairValue
ok('pairValue(100)===101', G.pairValue(100)===101);
ok('pairValue(7)===8', G.pairValue(7)===8);

// pairs(7): 중앙 half
var p7=G.pairs(7);
ok('pairs(7) 마지막 half', p7[p7.length-1].half===true && p7[p7.length-1].b===null);
ok('pairs(7) 중앙값 a===4', p7[p7.length-1].a===4);
ok('pairs(7) 앞 3쌍 합 8', p7.slice(0,3).every(function(p){return (p.a+p.b)===8;}));

// 경계 pairs(1), pairs(2)
var p1=G.pairs(1);
ok('pairs(1) 길이1·half', p1.length===1 && p1[0].half===true);
var p2=G.pairs(2);
ok('pairs(2) 1쌍 합3', p2.length===1 && (p2[0].a+p2[0].b)===3);

// partial 순서 무관
ok('partial([3,1,2])===6', G.partial([3,1,2])===6);
ok('partial([])===0', G.partial([])===0);

// oddSquare(100): odds 50개, side 50, total 2500
var os=G.oddSquare(100);
ok('oddSquare(100).odds.length===50', os.odds.length===50);
ok('oddSquare(100).side===50', os.side===50);
ok('oddSquare(100).total===2500', os.total===2500);
ok('oddSquare(100).ok===true', os.ok===true);
ok('oddSquare(99).side===50', G.oddSquare(99).side===50);  // 홀수 1..99 = 50개
ok('oddSquare(9).side===5·total25', (function(){var o=G.oddSquare(9);return o.side===5&&o.total===25;})());

console.log('─ E1 순수 로직: '+pass+' pass / '+fail+' fail');
console.log('─ gauss-pure sha256[16] = '+hash+'  (동결 기준)');
process.exit(fail?1:0);
