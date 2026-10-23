import React,{useState,useEffect,useRef,useMemo,useLayoutEffect,memo} from 'react';
import {KW} from './engine.js';
export const cx=(...a)=>a.filter(Boolean).join(' ');
export const STORE_KEY='keywise.v1';
export const VIEWS=[['test','Test'],['report','Report'],['practice','Practice'],['progress','Progress'],['settings','Settings']];
export const SIZES={s:'1.2rem',m:'1.55rem',l:'1.95rem'};
export const DEFAULTS={v:1,
  settings:{theme:'system',size:'m',caret:'block',live:true,goalMin:10,target:40},
  cfg:{mode:'time',duration:30,words:25,difficulty:'medium',type:'words'},
  history:[]};
export function loadStore(){
  try{
    const raw=localStorage.getItem(STORE_KEY);
    if(raw){const o=JSON.parse(raw);
      return {v:1,settings:{...DEFAULTS.settings,...(o.settings||{})},cfg:{...DEFAULTS.cfg,...(o.cfg||{})},history:Array.isArray(o.history)?o.history:[]};}
  }catch(e){}
  return JSON.parse(JSON.stringify(DEFAULTS));
}
export const fmtDur=ms=>{const s=Math.floor(ms/1000);return s<60?s+'s':Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
export const fmtDate=ts=>new Date(ts).toLocaleDateString(undefined,{day:'numeric',month:'short'})+' '+new Date(ts).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
export const shortDate=ts=>new Date(ts).toLocaleDateString(undefined,{day:'numeric',month:'short'});
export const testLabel=r=>r.exercise?r.exercise.name:((r.mode==='time'?r.duration+'s':r.words+' words')+' · '+r.type+' · '+r.difficulty);
export const pct=n=>Math.round(n)+'%';

export function useWidth(){
  const ref=useRef(null);const [w,setW]=useState(600);
  useLayoutEffect(()=>{
    const el=ref.current;if(!el)return;
    const set=()=>setW(Math.max(240,Math.floor(el.clientWidth)));set();
    if(typeof ResizeObserver!=='undefined'){const ro=new ResizeObserver(set);ro.observe(el);return()=>ro.disconnect();}
    window.addEventListener('resize',set);return()=>window.removeEventListener('resize',set);
  },[]);
  return [ref,w];
}

export function Tile({label,value,sub,tone}){
  return (<div className={cx('stat',tone)}><div className="l">{label}</div><div className="v">{value}</div>{sub?(<div className="s">{sub}</div>):null}</div>);
}

export function SpeedChart({series}){
  const [ref,w]=useWidth();const H=250,L=40,R=14,T=14,B=32;
  if(!series||!series.length)return (<p className="muted">No time data for this test.</p>);
  const xMax=Math.max(series[series.length-1][0],1);
  const maxY=Math.max(10,...series.map(p=>Math.max(p[1],p[2])));
  const step=KW.niceStep(maxY/4),yMax=Math.ceil(maxY/step)*step;
  const x=t=>L+(t/xMax)*(w-L-R),y=v=>T+(1-v/yMax)*(H-T-B);
  const path=i=>series.map((p,j)=>(j?'L':'M')+x(p[0]).toFixed(1)+' '+y(p[i]).toFixed(1)).join('');
  const yt=[];for(let v=0;v<=yMax+1e-9;v+=step)yt.push(v);
  const xs=KW.niceStep(xMax/Math.max(3,Math.floor(w/90)));const xt=[];for(let t=0;t<=xMax+1e-9;t+=xs)xt.push(t);
  const last=series[series.length-1];
  return (<div className="chart" ref={ref}><svg width={w} height={H} viewBox={'0 0 '+w+' '+H} role="img" aria-label={'Typing speed over time, ending at '+Math.round(last[1])+' words per minute'}>
    {yt.map(v=>(<g key={'y'+v}><line x1={L} x2={w-R} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" strokeDasharray={v===0?'':'3 4'}/><text x={L-8} y={y(v)+4} textAnchor="end">{v}</text></g>))}
    {xt.map(t=>(<text key={'x'+t} x={x(t)} y={H-10} textAnchor="middle">{t}s</text>))}
    <path d={path(2)} fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeOpacity=".7" strokeLinejoin="round"/>
    <path d={path(1)} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
    {series.filter(p=>p[3]>0).map(p=>(<circle key={'e'+p[0]} cx={x(p[0])} cy={H-B-9} r={2.5+Math.min(p[3],4)*.7} fill="var(--bad)"><title>{p[3]+' mistake'+(p[3]>1?'s':'')+' at '+p[0]+'s'}</title></circle>))}
    <circle cx={x(last[0])} cy={y(last[1])} r="5" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2"><title>{'Final '+last[1]+' WPM'}</title></circle>
  </svg></div>);
}

export function TrendChart({points,fmt,mode,refLine}){
  const [ref,w]=useWidth();const H=210,L=40,R=18,T=22,B=28;
  if(!points.length)return (<p className="muted">No data yet.</p>);
  const vals=points.map(p=>p.y);let lo=0,hi;
  if(mode==='pct'){hi=100;lo=Math.max(0,Math.floor(Math.min(...vals,95)/5)*5-5);}
  else{const mx=Math.max(10,...vals,refLine?refLine.value:0);const st=KW.niceStep(mx/4);hi=Math.ceil(mx/st)*st;}
  const n=points.length;
  const x=i=>n===1?(L+(w-L-R)/2):L+(i/(n-1))*(w-L-R),y=v=>T+(1-(v-lo)/(hi-lo))*(H-T-B);
  const line=points.map((p,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(p.y).toFixed(1)).join('');
  const area=n>1?line+'L'+x(n-1).toFixed(1)+' '+y(lo)+'L'+x(0).toFixed(1)+' '+y(lo)+'Z':'';
  const yt=[];const st2=(hi-lo)/4;for(let i=0;i<=4;i++)yt.push(lo+st2*i);
  const lastP=points[n-1];
  return (<div className="chart" ref={ref}><svg width={w} height={H} viewBox={'0 0 '+w+' '+H} role="img" aria-label={'Trend over '+n+' tests, latest '+fmt(lastP.y)}>
    {yt.map(v=>(<g key={'t'+v}><line x1={L} x2={w-R} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray={v===lo?'':'3 4'}/><text x={L-8} y={y(v)+4} textAnchor="end">{Math.round(v)}</text></g>))}
    {refLine&&refLine.value>=lo&&refLine.value<=hi?(<g><line x1={L} x2={w-R} y1={y(refLine.value)} y2={y(refLine.value)} stroke="var(--good)" strokeWidth="1.5" strokeDasharray="6 4"/><text x={w-R} y={y(refLine.value)-5} textAnchor="end" style={{fill:'var(--good)'}}>{refLine.label}</text></g>):null}
    {area?(<path d={area} fill="var(--accent)" fillOpacity=".12"/>):null}
    <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round"/>
    {points.map((p,i)=>(<circle key={i} cx={x(i)} cy={y(p.y)} r={i===n-1?5:3} fill="var(--accent)" stroke="var(--surface)" strokeWidth="1.5"><title>{p.label+': '+fmt(p.y)}</title></circle>))}
    <text x={Math.min(x(n-1),w-R-6)} y={y(lastP.y)-10} textAnchor="end" style={{fill:'var(--ink)',fontWeight:700}}>{fmt(lastP.y)}</text>
    <text x={L} y={H-8} textAnchor="start">{points[0].label}</text>
    {n>1?(<text x={w-R} y={H-8} textAnchor="end">{lastP.label}</text>):null}
  </svg></div>);
}

export function BarChart({days,goal}){
  const [ref,w]=useWidth();const H=190,L=34,R=10,T=14,B=26;
  const mx=Math.max(goal*1.25,...days.map(d=>d.min),5);const st=KW.niceStep(mx/3),hi=Math.ceil(mx/st)*st;
  const n=days.length,slot=(w-L-R)/n,bw=Math.max(6,slot*.62);
  const y=v=>T+(1-v/hi)*(H-T-B);
  const yt=[];for(let v=0;v<=hi+1e-9;v+=st)yt.push(v);
  const every=w<520?2:1;
  return (<div className="chart" ref={ref}><svg width={w} height={H} viewBox={'0 0 '+w+' '+H} role="img" aria-label="Minutes practised per day for the last 14 days">
    {yt.map(v=>(<g key={'b'+v}><line x1={L} x2={w-R} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray={v===0?'':'3 4'}/><text x={L-6} y={y(v)+4} textAnchor="end">{v}</text></g>))}
    {days.map((d,i)=>{const cxp=L+slot*i+slot/2;const met=d.min>=goal;
      return (<g key={d.key}><rect x={cxp-bw/2} y={y(d.min)} width={bw} height={Math.max(0,y(0)-y(d.min))} rx="3" fill="var(--accent)" fillOpacity={met?1:.4}><title>{d.label+': '+d.min.toFixed(1)+' min'}</title></rect>
        {(n-1-i)%every===0?(<text x={cxp} y={H-8} textAnchor="middle" style={d.today?{fill:'var(--ink)',fontWeight:700}:null}>{d.short}</text>):null}</g>);})}
    <line x1={L} x2={w-R} y1={y(goal)} y2={y(goal)} stroke="var(--good)" strokeWidth="1.5" strokeDasharray="6 4"/>
    <text x={w-R} y={y(goal)-5} textAnchor="end" style={{fill:'var(--good)'}}>{'goal '+goal+' min'}</text>
  </svg></div>);
}

export const KB_ROWS=['1234567890-','qwertyuiop','asdfghjkl;\'','zxcvbnm,./'];
export function Keyboard({agg}){
  const cell=k=>{
    const d=agg.keys[k];let bg='transparent',color='var(--ghost)',title=KW.keyLabel(k)+': no data';
    if(d){const h=d[0],m=d[1],tot=h+m;const rate=m/tot;
      if(m===0){bg='color-mix(in srgb, var(--good) 20%, var(--surface2))';color='var(--ink)';}
      else{const t=Math.min(1,rate/0.2);bg='color-mix(in srgb, var(--bad) '+Math.round(20+t*70)+'%, var(--surface2))';color=t>.5?'#fff':'var(--ink)';}
      title=KW.keyLabel(k)+': '+m+' missed of '+tot+' ('+Math.round((1-rate)*100)+'% accurate)';}
    return {bg,color,title};
  };
  return (<div><div className="kb">
    {KB_ROWS.map((row,ri)=>(<div className={cx('r',ri>0&&'c')} key={ri} style={{paddingLeft:ri===0?0:ri*6}}>{row.split('').map(k=>{const c=cell(k);return (<div className="k" key={k} title={c.title} style={{background:c.bg,color:c.color}}>{k.toUpperCase()}</div>);})}</div>))}
    <div className="r c">{(()=>{const c=cell(' ');return (<div className="k space" title={c.title} style={{background:c.bg,color:c.color}}>SPACE</div>);})()}</div>
  </div>
  <div className="legend" style={{marginTop:12}}>
    <span><i style={{background:'transparent'}}></i>No data</span>
    <span><i style={{background:'color-mix(in srgb, var(--good) 20%, var(--surface2))'}}></i>Clean</span>
    <span><i style={{background:'color-mix(in srgb, var(--bad) 55%, var(--surface2))'}}></i>Some misses</span>
    <span><i style={{background:'color-mix(in srgb, var(--bad) 90%, var(--surface2))'}}></i>Many misses</span>
  </div></div>);
}

export function RecCard({rec,onStart}){
  return (<div className="rec item"><h3>{rec.title}</h3><p className="muted">{rec.reason}</p>
    <div><button className="btn primary sm" onClick={()=>onStart(rec.ex,rec.params)}>Start drill</button></div></div>);
}

export function Seg({value,options,onChange,disabled,label}){
  return (<div className="seg" role="group" aria-label={label}>{options.map(o=>(<button key={o[0]} disabled={disabled} aria-pressed={value===o[0]} className={value===o[0]?'on':''} onClick={()=>onChange(o[0])}>{o[1]}</button>))}</div>);
}

