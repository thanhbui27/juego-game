import {points,key,valid,moves,triangles} from './engine.mjs';
import {chooseMove} from './bot.mjs';
let generation=0;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const $=id=>document.getElementById(id), colors=['#ff7894','#75f2cd'],names=['Bạn','Máy'],symbols=['♥','✦'];
let edges=new Map(),claimed=new Map(),player=0,remaining=0,selected=null,round=1,rolling=false,over=false,scores=[0,0],timer;
const snapshot=()=>({player:names[player],remaining,round,scores:[...scores],over,rolling,points,edges:[...edges.values()]});
function render(){document.documentElement.style.setProperty('--accent',colors[player]);for(let i=0;i<2;i++){$('p'+i).classList.toggle('active',player===i);$('score'+i).textContent=scores[i];$('tag'+i).textContent=over?'Kết thúc':player===i?'Đang chơi':'Chờ lượt'}$('round').textContent='LƯỢT '+String(round).padStart(2,'0');$('turn').textContent=over?'Ván đấu kết thúc':'Lượt của '+names[player];$('budget').textContent=remaining?remaining+' nét còn lại':'Chưa tung';$('roll').disabled=remaining>0||rolling||over||player===1;$('roll-label').textContent=rolling?'Đang tung…':player===1?'Chờ máy đi…':remaining?'Chạm hai chấm để nối':'Tung xúc xắc';$('roll').classList.toggle('rolling',rolling);let html='';for(const {ids,owner}of claimed.values()){const ps=ids.map(id=>points[id]);html+=`<g class="owned"><polygon points="${ps.map(p=>p.x+','+p.y).join(' ')}" fill="${colors[owner]}" fill-opacity=".13"/><text class="mark" x="${ps.reduce((s,p)=>s+p.x,0)/3}" y="${ps.reduce((s,p)=>s+p.y,0)/3}" fill="${colors[owner]}">${symbols[owner]}</text></g>`}for(const e of edges.values())html+=`<line class="edge" x1="${points[e.a].x}" y1="${points[e.a].y}" x2="${points[e.b].x}" y2="${points[e.b].y}" stroke="${colors[e.owner]}"/>`;for(const p of points){const cls=selected===p.id?'selected':selected!==null&&valid(selected,p.id,edges)?'available':'';html+=`<g class="point ${cls}" data-id="${p.id}" role="button" tabindex="0" aria-label="Chấm ${p.id+1}" aria-pressed="${selected===p.id}"><circle cx="${p.x}" cy="${p.y}" r="22" fill="transparent"/><circle class="ring" cx="${p.x}" cy="${p.y}" r="15"/><circle class="core" cx="${p.x}" cy="${p.y}" r="6.5" fill="${selected===p.id?colors[player]:'#d7e0ee'}"/></g>`}$('board').innerHTML=html}
function hint(s){$('hint').textContent=s}
function finish(){over=true;remaining=0;selected=null;render();const win=scores[0]===scores[1]?-1:scores[0]>scores[1]?0:1;$('winner').textContent=win===-1?'Một ván hòa!':names[win]+' chiến thắng!';$('final-score').textContent=`Bạn ${scores[0]} — ${scores[1]} Máy · Không còn nét hợp lệ.`;$('result').showModal();hint('Hết chỗ nối. Chơi ván mới để tái đấu!')}
function connect(a,b,asBot=false){if(player===1&&!asBot)throw Error('Đợi máy hoàn thành lượt nhé.');if(over||rolling||remaining===0)throw Error('Hãy tung xúc xắc trước.');if(!valid(a,b,edges))throw Error('Nét không hợp lệ: không cắt nét, nối trùng hoặc đi xuyên chấm.');edges.set(key(a,b),{a,b,owner:player});const gained=triangles(a,b,edges,claimed);for(const ids of gained){claimed.set(ids.join('-'),{ids,owner:player});scores[player]++}remaining--;selected=null;if(gained.length){$('claim').textContent='+'+gained.length+' '+symbols[player];$('claim').classList.remove('pop');void $('claim').offsetWidth;$('claim').classList.add('pop');navigator.vibrate?.(35)}if(moves(edges)===0){finish();return snapshot()}if(remaining===0){player=1-player;round++;hint((gained.length?'+'+gained.length+' điểm! ':'')+(player===1?'Máy chuẩn bị tung xúc xắc…':'Đến lượt bạn. Tung xúc xắc nhé!'))}else hint(gained.length?'Chiếm được '+gained.length+' ô! Còn '+remaining+' nét.':'Chọn hai chấm để nối nét tiếp theo.');render();if(player===1&&remaining===0)void botTurn(generation);return snapshot()}
function choose(id){if(over||rolling||player===1)return;if(!remaining){hint('Tung xúc xắc trước khi nối chấm nhé.');return}if(selected===id){selected=null;hint('Chọn một chấm để bắt đầu.');render();return}if(selected===null){selected=id;hint('Chọn chấm thứ hai. Chạm lại để bỏ chọn.');render();return}try{connect(selected,id)}catch(e){hint(e.message);navigator.vibrate?.([20,30,20])}}
function face(value){
 const patterns={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
 $('big-die').innerHTML=Array.from({length:9},(_,i)=>`<span class="pip ${patterns[value].includes(i)?'on':''}"></span>`).join('');
 $('big-die').setAttribute('aria-label','Xúc xắc '+value);
}
async function roll(asBot=false){
 if(player===1&&!asBot)throw Error('Máy tự tung trong lượt của mình.');
 if(over||rolling||remaining)throw Error('Chưa thể tung lúc này.');
 const token=generation;rolling=true;selected=null;render();
 const layer=$('dice-overlay');layer.hidden=false;layer.classList.remove('leaving');
 $('dice-owner').textContent=player===0?'BẠN TUNG XÚC XẮC':'MÁY TUNG XÚC XẮC';
 $('dice-result').textContent='Đang tung…';$('big-die').classList.add('tumbling');hint('Xúc xắc đang lăn…');
 for(let i=0;i<9;i++){face(Math.floor(Math.random()*6)+1);await sleep(90);if(token!==generation)return snapshot()}
 const random=new Uint32Array(1);crypto.getRandomValues(random);const value=random[0]%6+1;
 face(value);$('big-die').classList.remove('tumbling');$('dice-result').textContent=value+' nét để nối';navigator.vibrate?.(25);
 await sleep(850);if(token!==generation)return snapshot();
 layer.classList.add('leaving');await sleep(220);if(token!==generation)return snapshot();
 layer.hidden=true;rolling=false;remaining=value;$('die').textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][value-1];
 hint(player===1?'Máy được '+value+' nét. Đang chọn nước đi…':'Được '+value+' nét! Chạm hai chấm để nối.');render();return snapshot();
}
async function botTurn(token){
 await sleep(550);if(token!==generation||over||player!==1)return;
 await roll(true);
 while(token===generation&&!over&&player===1&&remaining>0){
  await sleep(420);if(token!==generation||over||player!==1)return;
  if(document.querySelector('dialog[open]'))continue;
  const move=chooseMove(edges,claimed,remaining);if(!move){finish();return}
  selected=move.a;render();await sleep(300);
  if(token!==generation||over||player!==1)return;
  connect(move.a,move.b,true);
 }
}
function reset(){generation++;$('dice-overlay').hidden=true;$('dice-overlay').classList.remove('leaving');clearTimeout(timer);edges=new Map();claimed=new Map();player=0;remaining=0;selected=null;round=1;rolling=false;over=false;scores=[0,0];document.querySelectorAll('dialog[open]').forEach(d=>d.close());$('die').textContent='⚄';hint('Tung xúc xắc để biết số nét được nối.');render()}
$('board').addEventListener('click',e=>{const dot=e.target.closest('[data-id]');if(dot)choose(Number(dot.dataset.id))});$('board').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const dot=e.target.closest('[data-id]');if(dot){e.preventDefault();choose(Number(dot.dataset.id))}}});$('roll').onclick=()=>roll().catch(e=>hint(e.message));$('help').onclick=()=>$('rules').showModal();$('close-rules').onclick=()=>$('rules').close();$('restart').onclick=()=>$('confirm').showModal();$('cancel-reset').onclick=()=>$('confirm').close();$('confirm-reset').onclick=reset;$('again').onclick=reset;
reset();
if(document.modelContext?.registerTool){for(const tool of [{name:'read_game',description:'Read the current triangle game and dot coordinates.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>snapshot()},{name:'roll_dice',description:'Roll the dice for the current player, only before drawing.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:()=>roll()},{name:'connect_dots',description:'Commit one line between two zero-based dot IDs in the current turn.',inputSchema:{type:'object',properties:{a:{type:'integer'},b:{type:'integer'}},required:['a','b'],additionalProperties:false},annotations:{readOnlyHint:false},execute:({a,b})=>connect(a,b)}]){try{Promise.resolve(document.modelContext.registerTool(tool)).catch(()=>{})}catch{}}}
