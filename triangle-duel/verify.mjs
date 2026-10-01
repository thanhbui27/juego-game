import assert from 'node:assert/strict';
import {points,key,valid,moves,triangles} from './dist/engine.mjs';
let edges=new Map(),claimed=new Map();
const add=(a,b)=>{assert(valid(a,b,edges));edges.set(key(a,b),{a,b});const ts=triangles(a,b,edges,claimed);ts.forEach(ids=>claimed.set(ids.join('-'),ids));return ts};
add(0,1);add(1,4);assert.equal(add(4,0).length,1);assert(!valid(0,1,edges));assert(!valid(0,0,edges));assert(!valid(-1,4,edges));
edges=new Map();claimed=new Map();add(0,5);assert(!valid(1,4,edges),'crossing diagonal rejected');
for(let run=0;run<30;run++){edges=new Map();claimed=new Map();while(moves(edges)){const candidates=[];for(let a=0;a<points.length;a++)for(let b=a+1;b<points.length;b++)if(valid(a,b,edges))candidates.push([a,b]);const [a,b]=candidates[Math.floor(Math.random()*candidates.length)];add(a,b)}assert.equal(claimed.size,edges.size-points.length+1,'every final bounded face counted once');assert(edges.size<60)}
console.log('PASS: crossing, duplicate, invalid IDs, triangle capture and 30 complete simulated games.');
