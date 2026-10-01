import {points,key,valid,triangles} from './engine.mjs';
export function chooseMove(edges,claimed,remaining){
 let best=null,score=-Infinity;
 for(let a=0;a<points.length;a++)for(let b=a+1;b<points.length;b++){
  if(!valid(a,b,edges))continue;
  const next=new Map(edges);next.set(key(a,b),{a,b});
  const gain=triangles(a,b,next,claimed).length;let follow=0;
  for(let c=0;c<points.length;c++)for(let d=c+1;d<points.length;d++){
   if(!valid(c,d,next))continue;next.set(key(c,d),{a:c,b:d});follow=Math.max(follow,triangles(c,d,next,claimed).length);next.delete(key(c,d));
  }
  const value=gain*100+follow*(remaining>1?24:-45)-Math.hypot(points[a].x-points[b].x,points[a].y-points[b].y)*.012+Math.random()*2;
  if(value>score){score=value;best={a,b}}
 }
 return best;
}
