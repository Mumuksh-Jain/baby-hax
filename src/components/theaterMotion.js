// Stage-space choreography. Every hand-off starts at the previous scene's endpoint.
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const smooth = n => { const t=clamp(n); return t*t*(3-2*t); };
const blend = (a,b,t) => ({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const curve = (a,b,c,d,t) => ({x:(1-t)**3*a.x+3*(1-t)**2*t*b.x+3*(1-t)*t*t*c.x+t**3*d.x,y:(1-t)**3*a.y+3*(1-t)**2*t*b.y+3*(1-t)*t*t*c.y+t**3*d.y});

export function theaterStarPoses(time,width,height,reduced=false){
  const cx=width/2,cy=height*.52,rx=Math.min(width*.32,235),ry=Math.min(height*.23,155);
  const size=width<600?.76:1;
  const home=[{x:cx-rx,y:cy-ry*.45},{x:cx+rx,y:cy-ry*.45},{x:cx,y:cy-ry*1.55}];
  const starts=[{x:-90,y:cy+ry*.3},{x:cx,y:-90},{x:width+90,y:cy+ry*.5}];
  const angles=[Math.PI,0,-Math.PI/2],entry=[2,2.8,3.6];
  const orbit=(i,u)=>({x:cx+Math.cos(angles[i]+u*Math.PI*2)*rx,y:cy-ry*.45+Math.sin(angles[i]+u*Math.PI*2)*ry*.75});
  const scenes=[home,[{x:cx-rx,y:cy-ry*.25},{x:cx+rx,y:cy-ry*.25},{x:cx+rx*.48,y:cy-ry*1.6}],[{x:cx-rx*.9,y:cy-ry*.8},{x:cx+rx*.9,y:cy-ry*.8},{x:cx,y:cy-ry*1.7}],[{x:cx-rx*.72,y:cy-ry*.9},{x:cx+rx*.72,y:cy-ry*.9},{x:cx,y:cy-ry*1.75}],home];
  return home.map((rest,i)=>{
    let point=rest,rot=0,pulse=1;
    if(time<4.6){const t=smooth((time-entry[i])/1);point=curve(starts[i],{x:starts[i].x,y:rest.y-ry},{x:rest.x,y:rest.y-ry*.5},rest,t);rot=(1-t)*[-24,20,24][i];}
    else if(time<7.5){const t=smooth((time-4.6)/2.9);point=blend(rest,orbit(i,t),smooth((time-4.6)/.35));rot=Math.sin(t*Math.PI*2+angles[i])*12;}
    else if(time<8.8){point=blend(orbit(i,1),rest,smooth((time-7.5)/1.3));}
    else {
      const scene=time<14.5?0:time<19?1:time<24?2:time<30?3:4;
      const begin=[8.8,14.5,19,24,30][scene];
      point=scene?blend(scenes[scene-1][i],scenes[scene][i],smooth((time-begin)/1.2)):rest;
      const breath=smooth((time-begin)/1.2)*Math.sin((time-begin)*1.5+i*1.8);
      point={x:point.x+breath*3,y:point.y+breath*4};rot=breath*4;pulse=1+breath*.045;
    }
    if(reduced){point=rest;rot=0;pulse=1;}
    return {x:clamp(point.x,38,width-38),y:clamp(point.y,60,height-45),rot,scale:size*pulse,visible:time>=entry[i]};
  });
}
