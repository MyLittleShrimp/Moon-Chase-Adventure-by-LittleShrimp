import test from 'node:test';
import assert from 'node:assert/strict';
import{QUIZ_BANK,QUIZ_ROUND_SIZE,createQuizRun,answerQuiz,nextQuizQuestion}from '../dist/quiz.js';
const rng=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
test('question bank has unique IDs, four distinct choices, explanations and sources',()=>{
 assert.equal(QUIZ_BANK.length,48);assert.equal(new Set(QUIZ_BANK.map(q=>q.id)).size,48);
 for(const q of QUIZ_BANK){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.ok(q.choices[q.answer]);assert.ok(q.explanation&&q.source.title);assert.ok(q.source.url.startsWith('https://'));}
});
test('random rounds cover three themes, avoid repeats and retain correct answers after shuffling',()=>{
 let previous=[];const answerPositions=new Set(),firstQuestions=new Set();
 for(let seed=1;seed<=40;seed++){const run=createQuizRun(previous,rng(seed)),ids=run.questions.map(q=>q.id);assert.equal(ids.length,QUIZ_ROUND_SIZE);assert.equal(new Set(ids).size,QUIZ_ROUND_SIZE);assert.equal(new Set(run.questions.map(q=>q.category)).size,3);assert.ok(ids.every(id=>!previous.includes(id)));for(const q of run.questions){const original=QUIZ_BANK.find(v=>v.id===q.id);assert.equal(q.choices[q.answer],original.choices[original.answer]);answerPositions.add(q.answer);}firstQuestions.add(ids[0]);previous=ids;}
 assert.equal(answerPositions.size,4);assert.ok(firstQuestions.size>5);
});
test('three correct answers pass even after two errors; questions cannot score twice',()=>{
 let run=createQuizRun([],rng(2));assert.equal(nextQuizQuestion(run),run);assert.equal(answerQuiz(run,-1),run);
 for(let i=0;i<5;i++){const answer=run.questions[run.index].answer;run=answerQuiz(run,i<2?(answer+1)%4:answer);const scored=run;assert.equal(answerQuiz(run,answer),scored);assert.equal(run.won,i===4);if(i<4)run=nextQuizQuestion(run);}
 assert.equal(run.correct,3);assert.equal(run.attempts,5);assert.equal(run.finished,true);assert.equal(nextQuizQuestion(run),run);
});
test('three correct answers end early; fewer than three of five never unlock the door',()=>{
 let perfect=createQuizRun([],rng(3));for(let i=0;i<3;i++){perfect=answerQuiz(perfect,perfect.questions[perfect.index].answer);if(!perfect.finished)perfect=nextQuizQuestion(perfect);}assert.equal(perfect.won,true);assert.equal(perfect.attempts,3);
 let failed=createQuizRun([],rng(4));for(let i=0;i<5;i++){failed=answerQuiz(failed,(failed.questions[failed.index].answer+1)%4);if(!failed.finished)failed=nextQuizQuestion(failed);}assert.equal(failed.won,false);assert.equal(failed.finished,true);assert.equal(failed.correct,0);assert.equal(answerQuiz(failed,0),failed);
});
