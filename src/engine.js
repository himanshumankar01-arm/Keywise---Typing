const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);const t=a[i];a[i]=a[j];a[j]=t;}return a;};
const words=s=>s.trim().split(/\s+/);
const lines=s=>s.split('\n').map(x=>x.trim()).filter(Boolean);
const r1=n=>Math.round(n*10)/10;

const POOLS={
easy:words(`the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us`),
medium:words(`people because between important through another thought family without before again great little world school never really together system night always something morning question animal answer children country example follow friend garden happen house letter minute number paper picture place point reason river simple stand story study table travel under watch water window winter wonder young bridge button camera carpet change circle coffee corner dinner engine finger flower forest guitar island jacket kitchen ladder market metal mirror music orange pencil planet pocket rabbit season shadow silver spring summer ticket tomato valley yellow`),
hard:words(`accommodate architecture bureaucracy characteristic consciousness deliberately development environment extraordinary fundamental government independence infrastructure jurisdiction knowledgeable legislation maintenance mischievous necessarily opportunity parliament phenomenon questionnaire refrigerator responsibility simultaneously sophisticated temperature unfortunately vocabulary wholesome xylophone yesterday zealous algorithm analysis approximately atmosphere biodegradable catastrophe chronological circumstance communication concentration controversial correspondence demonstration disappointment electromagnetic enthusiastic entrepreneur exaggeration hypothetical imagination inconsistent interpretation laboratory manufacturing mathematical misunderstanding neighborhood occasionally pharmaceutical psychological qualification rehearsal strategically thoroughly unprecedented`)
};
const EXTRA=words(`quick jazz fox zebra jumps lazy wax box zinc maze quiz buzz fizz jinx vex wizard zero zone puzzle jacket jungle junior journey juice jewel jolly vixen oxygen taxi exact examine expert extra explain exercise fix mix six next text complex relax excuse excellent exit axis annex index vortex convex cavern vivid verve vacuum vault vanish vendor venture verify vessel victory village violet visual vital voice volume voyage zigzag zipper zombie zodiac zesty quartz quarter question quiet quilt quote queen quest quality quantity bubble banana border brave breeze bright broken brother bundle cabin cable canvas cancel candle carbon cargo castle cattle cinema cobalt combine common compass concrete copper cotton crystal curtain cushion mango marble master matter medium member memory method middle mineral monitor monkey mountain muscle normal notice novel nuclear nurse`);
const ALL=Array.from(new Set([].concat(POOLS.easy,POOLS.medium,POOLS.hard,EXTRA)));

const SENT={
easy:lines(`The cat sat on the mat and looked at the sun.
We can go to the park after we eat lunch.
My dog likes to run in the green grass.
She put the red book on the top of the desk.
Open the door and let the cool air come in.
He had a big smile when he saw his old friend.
The bus will stop at the end of this road.
I like warm soup when it is cold outside.
They played a game of cards until it got dark.
Please keep the light on while we wait for mom.
A small bird sat on the fence and sang a song.
Do you want to take a walk down by the lake?
Our team won the game by one point today.
Put the milk back in the box when you are done.`),
medium:lines(`Learning to type quickly takes patience, steady practice, and a relaxed pair of hands.
The morning train arrived late, so everyone waited quietly under the old station clock.
She wrote a short letter to her friend about the garden and the winter weather.
Good habits are built slowly, one small step at a time, until they feel natural.
After dinner, we walked along the river and watched the lights come on across the bridge.
He carried a heavy camera, two spare batteries, and a thermos of hot coffee.
A clear question often leads to a better answer than a long explanation.
The market opens at seven, and the best tomatoes are usually gone by nine.
Keep your wrists level, your shoulders loose, and your eyes on the screen instead of the keys.
They planned the trip together, packed light, and left before the sun came up.
The library is quiet in the afternoon, which makes it perfect for reading.
Small mistakes are easy to fix when you notice them early and stay calm.
Our neighbor grows yellow flowers beside the fence every spring and shares them with everyone.
The pencil rolled off the table, bounced twice, and disappeared under the carpet.`),
hard:lines(`Unfortunately, the committee's comprehensive evaluation was postponed until the infrastructure assessment is complete.
Consistent, deliberate repetition develops muscle memory far more reliably than occasional bursts of frantic effort.
The laboratory's temperature fluctuated unpredictably, which complicated the researchers' meticulous measurements.
Her extraordinary vocabulary and sophisticated reasoning impressed the entire jury; nobody questioned her qualifications.
Environmental regulations, although controversial, have significantly reduced atmospheric pollution in numerous metropolitan areas.
"Accuracy first," the instructor repeated, "and speed will inevitably follow."
Approximately 87% of participants improved their performance after three weeks of structured practice.
Whether you're drafting a report or debugging code, rhythm matters more than raw velocity.
The entrepreneur's hypothetical scenario assumed that manufacturing costs would decrease by 15% annually.
Misunderstandings occasionally arise when correspondence is written hastily and reviewed carelessly.
Pharmaceutical researchers collaborated internationally to analyze the phenomenon's chronological progression.
Imagination, discipline, and thorough rehearsal separate competent performers from truly exceptional ones.`)
};
const PARA={
easy:lines(`I wake up early and make a hot cup of tea. The sun comes up over the hill and the birds start to sing. After a short walk with my dog, I sit at the desk and read for a while. It is a calm and happy way to start the day.
Our town has a small park with a pond in the middle. On warm days, kids ride bikes around the path and families sit on the grass. A man sells ice cream from a little cart near the gate. It is my favorite place to spend a free afternoon.
To bake bread, you need flour, water, salt, and some yeast. Mix them in a big bowl and let the dough rest for an hour. Then shape it, put it in the oven, and wait. The smell of fresh bread will fill the whole house.`),
medium:lines(`Typing is a skill that improves with regular practice rather than long, tiring sessions. Ten focused minutes each day will teach your fingers more than one exhausting hour on the weekend. Pay attention to accuracy first, because speed grows naturally once your hands know where every key belongs.
The old bridge across the river was built more than a century ago, and people still cross it every morning on their way to work. Its stone arches have survived floods, storms, and several winters of heavy snow. Local volunteers repaint the railings every spring, which keeps the town proud of its history.
When planning a long trip, it helps to write down the things you cannot forget: tickets, passports, chargers, and a small first aid kit. Pack your bag the night before so the morning is calm. A relaxed start often makes the whole journey easier, even when the train is late.`),
hard:lines(`Effective communication requires more than a broad vocabulary; it demands clarity, empathy, and deliberate organization. Whether you're composing a technical specification or a brief message to a colleague, consider the reader's perspective first. Unnecessary complexity, although tempting, rarely improves comprehension or persuades anyone.
The expedition's meteorologist documented extraordinary fluctuations in atmospheric pressure throughout the twelve-day journey. Despite unpredictable conditions, the team maintained meticulous records, calibrated every instrument twice daily, and transmitted their findings to the laboratory at precisely 06:00 each morning.
Cognitive scientists suggest that expertise develops through deliberate practice: focused repetition, immediate feedback, and gradual increases in difficulty. In typing, this means identifying your weakest keys, isolating them in short drills, and resisting the urge to rush; 95% accuracy at a moderate pace beats 80% accuracy at a frantic one.`)
};
function sentPool(d){const base=SENT[d].slice();PARA[d].forEach(p=>{(p.match(/[^.!?]+[.!?]+/g)||[]).forEach(s=>base.push(s.trim()));});return base;}

function genWords(d,n){
  const pool=POOLS[d]||POOLS.medium;const out=[];let last='';
  while(out.length<n){let w=pick(pool);if(w===last)continue;last=w;
    if(d==='hard'){if(Math.random()<.15)w=w[0].toUpperCase()+w.slice(1);if(Math.random()<.12)w+=pick([',','.',';']);}
    out.push(w);}
  return out.join(' ');
}
function deckFrom(pool){let deck=[];return()=>{if(!deck.length)deck=shuffle(pool);return deck.pop();};}
function genSentences(d,n){const next=deckFrom(sentPool(d));const w=[];while(w.length<n)w.push.apply(w,next().split(' '));return w.slice(0,n).join(' ');}
function genParagraphs(d,n){
  const w=[];shuffle(PARA[d]).forEach(p=>{if(w.length<n)w.push.apply(w,p.split(' '));});
  const next=deckFrom(sentPool(d));while(w.length<n)w.push.apply(w,next().split(' '));
  return w.slice(0,n).join(' ');
}
function digits(len){let s='';for(let i=0;i<len;i++)s+=rnd(10);return s;}
function genNumbers(d,n){
  const out=[];
  for(let i=0;i<n;i++){let t;
    if(d==='easy')t=digits(1+rnd(3));
    else if(d==='medium')t=digits(3+rnd(3));
    else{const r=rnd(8);
      t=r===0?digits(2)+'.'+digits(2):r===1?(10+rnd(13))+':'+digits(2):r===2?'$'+digits(1+rnd(3))+'.'+digits(2):r===3?(1+rnd(9))+'/'+(2+rnd(8)):r===4?digits(2)+'-'+digits(2):r===5?digits(2)+'%':r===6?'('+digits(3)+')':digits(4+rnd(3));}
    out.push(t);}
  return out.join(' ');
}
function decorate(w,level){
  const r=Math.random();
  if(level==='easy')return r<.4?w+pick([',','.','!','?']):w;
  if(level==='medium'){
    if(r<.25)return w+pick([',','.',';',':','?','!']);
    if(r<.4)return '"'+w+'"';if(r<.5)return '('+w+')';
    if(r<.6)return w+'-'+pick(POOLS.easy);
    if(r<.7)return pick(["don't","it's","can't","we're","they'll","isn't"]);
    return w;}
  if(r<.1)return '@'+w;if(r<.2)return '#'+w;if(r<.28)return w+'%';
  if(r<.38)return '('+w+')';if(r<.46)return '['+w+']';if(r<.52)return '{'+w+'}';
  if(r<.6)return w+'&'+pick(POOLS.easy);if(r<.67)return '$'+digits(1+rnd(3));
  if(r<.75)return w+pick([';',':']);if(r<.83)return '"'+w+',"';
  if(r<.9)return w+'/'+pick(POOLS.easy);if(r<.95)return w+'+'+pick(POOLS.easy);
  return w+'=';
}
function genPunct(d,n){const pool=POOLS[d]||POOLS.medium;const out=[];for(let i=0;i<n;i++)out.push(decorate(pick(pool),d));return out.join(' ');}
function generate(cfg,n){
  const count=n||(cfg.mode==='words'?cfg.words:Math.max(60,Math.round(cfg.duration*3.5)));
  const d=cfg.difficulty;
  switch(cfg.type){
    case 'sentences':return genSentences(d,count);
    case 'paragraphs':return genParagraphs(d,count);
    case 'numbers':return genNumbers(d,count);
    case 'punctuation':return genPunct(d,count);
    default:return genWords(d,count);}
}
function more(cfg){return generate(cfg,50);}

/* ---------- keys, categories ---------- */
const SHIFT={'!':'1','@':'2','#':'3','$':'4','%':'5','^':'6','&':'7','*':'8','(':'9',')':'0','_':'-','+':'=',':':';','"':"'",'<':',','>':'.','?':'/','~':'`','{':'[','}':']','|':'\\'};
function normKey(c){if(c===' ')return ' ';const l=c.toLowerCase();if(l!==c.toUpperCase())return l;return SHIFT[c]||c;}
const ROWS={top:'qwertyuiop',home:'asdfghjkl',bottom:'zxcvbnm'};
function catOf(c){
  if(c===' ')return 'space';if(/[A-Z]/.test(c))return 'capitals';if(/[0-9]/.test(c))return 'numbers';
  const l=c.toLowerCase();
  if(/[a-z]/.test(l)){for(const r in ROWS)if(ROWS[r].indexOf(l)>=0)return r;}
  return 'punctuation';
}
const CAT_LABEL={top:'Top row',home:'Home row',bottom:'Bottom row',numbers:'Number keys',capitals:'Capital letters',punctuation:'Punctuation and symbols',space:'Space bar'};
function keyLabel(k){return k===' '?'Space':(k.length===1&&k.toLowerCase()!==k.toUpperCase()?k.toUpperCase():k);}

function countCorrect(text,typed){let c=0;for(let i=0;i<typed.length;i++)if(typed[i]===text[i])c++;return c;}
function wordAt(text,i){let a=i;while(a>0&&text[a-1]!==' ')a--;let b=i;while(b<text.length&&text[b]!==' ')b++;return text.slice(a,b);}
function record(e,i,ch,nowMs){
  const exp=e.text[i],k=normKey(exp),ok=ch===exp,log=e.log;
  const tgt=ok?log.hits:log.misses;tgt[k]=(tgt[k]||0)+1;
  const c=catOf(exp);const cc=log.cats[c]||(log.cats[c]=[0,0]);cc[ok?0:1]++;
  log.total++;if(ok)log.correct++;
  else{const ck=k+'>'+normKey(ch);log.conf[ck]=(log.conf[ck]||0)+1;const w=wordAt(e.text,i);if(w)log.bad[w]=(log.bad[w]||0)+1;}
  const s=Math.floor(nowMs/1000);const b=e.buckets[s]||(e.buckets[s]={c:0,e:0});b.c++;if(!ok)b.e++;
}
function consistency(vals){
  if(vals.length<3)return null;
  const m=vals.reduce((a,b)=>a+b,0)/vals.length;if(m===0)return 0;
  const sd=Math.sqrt(vals.reduce((a,b)=>a+(b-m)*(b-m),0)/vals.length);const cv=sd/m;
  const x=cv+Math.pow(cv,3)/3+Math.pow(cv,5)/5;
  return Math.max(0,Math.min(100,100*(1-Math.tanh(x))));
}
function topEntries(o,n){return Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n);}
function buildResult(o){
  const text=o.text,typed=o.typed,ms=o.ms,log=o.log,cp=o.cp,buckets=o.buckets;
  const correct=countCorrect(text,typed),typedLen=typed.length,incorrect=typedLen-correct;
  const mins=Math.max(ms,500)/60000;
  const wpm=correct/5/mins,raw=typedLen/5/mins;
  const acc=log.total?log.correct/log.total*100:100;
  const secs=Math.floor(ms/1000);const series=[];let lastC=0;
  for(let s=1;s<=secs;s++){const c=cp[s]!==undefined?cp[s]:lastC;lastC=c;const b=buckets[s-1]||{c:0,e:0};
    series.push([s,r1(c/5/(s/60)),Math.round(b.c*12),b.e]);}
  const cons=consistency(series.map(p=>p[2]));
  if(ms/1000-secs>=0.4||secs===0)series.push([r1(ms/1000),r1(wpm),series.length?series[series.length-1][2]:Math.round(raw),0]);
  const keys={};
  Object.keys(log.hits).forEach(k=>{(keys[k]||(keys[k]=[0,0]))[0]=log.hits[k];});
  Object.keys(log.misses).forEach(k=>{(keys[k]||(keys[k]=[0,0]))[1]=log.misses[k];});
  return {wpm:r1(wpm),raw:r1(raw),acc:r1(acc),err:r1(100-acc),cons:cons==null?null:r1(cons),
    correct:correct,incorrect:incorrect,typedLen:typedLen,keystrokes:log.total,mistakes:log.total-log.correct,
    backspaces:log.backspaces,seconds:r1(ms/1000),series:series,keys:keys,cats:log.cats,
    conf:Object.fromEntries(topEntries(log.conf,20)),bad:Object.fromEntries(topEntries(log.bad,15))};
}

/* ---------- analysis ---------- */
function aggregate(list){
  const A={keys:{},cats:{},conf:{},bad:{},tests:list.length};
  list.forEach(r=>{
    for(const k in (r.keys||{})){const x=A.keys[k]||(A.keys[k]=[0,0]);x[0]+=r.keys[k][0];x[1]+=r.keys[k][1];}
    for(const c in (r.cats||{})){const x=A.cats[c]||(A.cats[c]=[0,0]);x[0]+=r.cats[c][0];x[1]+=r.cats[c][1];}
    for(const c in (r.conf||{}))A.conf[c]=(A.conf[c]||0)+r.conf[c];
    for(const w in (r.bad||{}))A.bad[w]=(A.bad[w]||0)+r.bad[w];
  });
  return A;
}
function weakKeys(A){
  const out=[];
  for(const k in A.keys){
    const h=A.keys[k][0],m=A.keys[k][1];if(m<1)continue;
    const rate=m/(h+m);if(!(m>=2||rate>=0.12))continue;
    let inst='',best=0;
    for(const c in A.conf){if(c[0]===k&&c[1]==='>'&&A.conf[c]>best){best=A.conf[c];inst=c.slice(2);}}
    out.push({k:k,h:h,m:m,rate:rate,inst:inst});
  }
  return out.sort((a,b)=>b.m-a.m||b.rate-a.rate);
}
const ZONE_EX={top:'top',home:'home',bottom:'bottom',numbers:'numbers',capitals:'caps',punctuation:'punct',space:'accuracy'};
function recommend(history,latest,target,max){
  const recent=history.filter(r=>r&&r.keys).slice(0,15);
  const recs=[];if(!recent.length)return recs;
  const A=aggregate(recent),wk=weakKeys(A).slice(0,5),tests=recent.length;
  const scope=tests===1?'this test':'your last '+tests+' tests';
  if(wk.length)recs.push({ex:'weakkeys',params:{keys:wk.map(x=>x.k)},title:'Drill your weak keys',reason:'Most missed: '+wk.map(x=>keyLabel(x.k)+' ('+x.m+')').join(', ')+' across '+scope+'.'});
  const cf=topEntries(A.conf,1)[0];
  if(cf&&cf[1]>=2){const exp=cf[0][0],typed=cf[0].slice(2);
    recs.push({ex:'confuse',params:{keys:[exp,typed]},title:'Separate '+keyLabel(exp)+' and '+keyLabel(typed),reason:'You pressed '+keyLabel(typed)+' instead of '+keyLabel(exp)+' '+cf[1]+' times.'});}
  const bw=topEntries(A.bad,10).filter(e=>e[0].length>1);
  if(bw.length>=3||(bw.length&&bw[0][1]>=2))recs.push({ex:'mistakes',params:{words:bw.map(e=>e[0])},title:'Retype the words you missed',reason:'You tripped on '+bw.slice(0,4).map(e=>e[0]).join(', ')+(bw.length>4?' and others':'')+'.'});
  let tm=0,tk=0;for(const c in A.cats){tm+=A.cats[c][1];tk+=A.cats[c][0]+A.cats[c][1];}
  let best=null;
  for(const c in A.cats){const h=A.cats[c][0],m=A.cats[c][1];if(m<3||!tm)continue;
    const ms=m/tm,hs=(h+m)/tk,ratio=ms/hs;if(ms>=0.25&&ratio>=1.5&&(!best||ratio>best.ratio))best={c:c,ms:ms,hs:hs,ratio:ratio};}
  if(best)recs.push({ex:ZONE_EX[best.c],params:{},title:CAT_LABEL[best.c]+' practice',reason:Math.round(best.ms*100)+'% of your mistakes came from '+CAT_LABEL[best.c].toLowerCase()+', which is '+Math.round(best.hs*100)+'% of what you typed.'});
  const add=(r)=>{if(!recs.some(x=>x.ex===r.ex&&!r.params.keys))recs.push(r);};
  if(latest){
    if(latest.acc<92)add({ex:'accuracy',params:{},title:'Accuracy builder',reason:'Accuracy was '+latest.acc+'%. Slow down until you reach 95% before pushing speed.'});
    else if(latest.cons!=null&&latest.cons<65)add({ex:'rhythm',params:{},title:'Steady rhythm',reason:'Consistency was '+Math.round(latest.cons)+'%. Your pace swings from second to second.'});
    if(latest.acc>=96&&(!target||latest.wpm>=target*0.9))add({ex:'levelup',params:{},title:'Level up',reason:latest.acc+'% accuracy at '+Math.round(latest.wpm)+' WPM. Time for harder text.'});
    else if(target&&latest.wpm<target)add({ex:'burst',params:{},title:'Speed burst',reason:'Below your '+target+' WPM target. Short easy words build raw speed.'});
  }
  if(recs.length<2){add({ex:'levelup',params:{},title:'Level up',reason:'No recurring weak spots yet. Try longer, harder sentences.'});add({ex:'pairs',params:{},title:'Common letter pairs',reason:'Frequent pairs like th, er and in make up much of everyday typing.'});}
  return recs.slice(0,max||4);
}

/* ---------- exercises ---------- */
const HOME=words('dad sad fad lad ask ash gas gash flash flask salad shall half hall fall glad glass hash lash dash slash flag all add had has gag lag sag jag sash lass alfalfa');
const TOP=words('type pretty quiet power tower write proper report tree true retire your pepper otter router quote equity pottery repeat writer pewter outer euro queer');
const BOTTOM=words('can man van ban cab nab mix box zinc vex next excuse examine exam became become number member climb comb bomb zoom zone maze mince convex complex vacuum cabin cinema combine common');
const PAIRS=words('other another weather together mother brother either rather further nothing thing thinking interesting english international attention nation station question information mention reaction there three through then them these thought');
const NAMES=words('Alice Brian Carlos Diana Edward Fiona George Hannah Isaac Julia Kevin Laura Martin Nadia Oliver Priya Quentin Rachel Samuel Teresa Umar Violet Walter Ximena Yusuf Zara London Paris Tokyo Mumbai Delhi Pune Chennai Kolkata Cairo Lima Oslo Rome Sydney Berlin Madrid');
function fromList(list,n){
  const uniq=new Set(list).size>1;const next=deckFrom(list);const o=[];let last='';let guard=0;
  while(o.length<n&&guard++<n*20){const w=next();if(uniq&&w===last)continue;last=w;o.push(w);}
  return o.join(' ');
}
const PUNCT_WORDS={"'":["don't","it's","can't","we're","they'll","isn't"]};
function tokenFor(k){
  if(/[a-z]/.test(k)){
    const cand=ALL.filter(w=>w.indexOf(k)>=0).sort((a,b)=>b.split(k).length-a.split(k).length||a.length-b.length).slice(0,40);
    return cand.length?pick(cand):k+k+k;}
  if(/[0-9]/.test(k)){const len=3+rnd(3);const a=digits(len).split('');a[rnd(len)]=k;a[rnd(len)]=k;return a.join('');}
  if(k===' ')return pick(POOLS.easy);
  const w=pick(POOLS.easy);
  if(PUNCT_WORDS[k])return pick(PUNCT_WORDS[k]);
  if(k==='"')return '"'+w+'"';if(k==='('||k===')')return '('+w+')';if(k==='-')return w+'-'+pick(POOLS.easy);
  if(k==='/')return w+'/'+pick(POOLS.easy);if(k===','||k==='.'||k===';')return w+k;
  return k+w;
}
function wordsForKeys(keys,n){const o=[];let last='';let guard=0;while(o.length<n&&guard++<n*10){const t=tokenFor(keys[o.length%keys.length]);if(t===last)continue;last=t;o.push(t);}return o.join(' ');}
function capsText(n){const o=[];for(let i=0;i<n;i++){const r=Math.random();o.push(r<.5?pick(NAMES):(()=>{const w=pick(POOLS.medium);return w[0].toUpperCase()+w.slice(1);})());}return o.join(' ');}
function rhythmText(n){const base=shuffle(POOLS.easy.filter(w=>w.length<=4)).slice(0,3);const o=[];for(let i=0;i<n;i++)o.push(base[i%base.length]);return o.join(' ');}
const EXD={
  home:{group:'zones',name:'Home row',desc:'A S D F and J K L. Your fingers rest here, so every error here costs rhythm.',make:()=>fromList(HOME,30)},
  top:{group:'zones',name:'Top row',desc:'Q W E R T Y U I O P. Reach up without lifting your wrists.',make:()=>fromList(TOP,30)},
  bottom:{group:'zones',name:'Bottom row',desc:'Z X C V B N M. Words rich in the hardest reach for most typists.',make:()=>fromList(BOTTOM,30)},
  numbers:{group:'zones',name:'Number row',desc:'Digit strings of three to five numbers.',make:()=>genNumbers('medium',24)},
  caps:{group:'zones',name:'Capitals and Shift',desc:'Names and capitalised words to train the Shift keys.',make:()=>capsText(30)},
  punct:{group:'zones',name:'Punctuation',desc:'Commas, quotes, brackets, hyphens and apostrophes in running text.',make:()=>genPunct('medium',30)},
  pairs:{group:'skills',name:'Common letter pairs',desc:'Words built on th, er, in, an and other frequent pairs.',make:()=>fromList(PAIRS,30)},
  accuracy:{group:'skills',name:'Accuracy builder',desc:'Easy words. Go slow and aim for 98% or better.',make:()=>genWords('easy',25)},
  rhythm:{group:'skills',name:'Steady rhythm',desc:'Three short words on repeat. Keep an even beat.',make:()=>rhythmText(40)},
  burst:{group:'skills',name:'Speed burst',desc:'Fifty short, easy words. Push your raw speed.',make:()=>genWords('easy',50)},
  levelup:{group:'skills',name:'Level up',desc:'Long, hard sentences with punctuation and capitals.',make:()=>genSentences('hard',40)}
};
const EXLIST=Object.keys(EXD).map(id=>({id:id,name:EXD[id].name,desc:EXD[id].desc,group:EXD[id].group}));
function exercise(id,params){
  params=params||{};
  if(id==='weakkeys'){const ks=params.keys&&params.keys.length?params.keys:['e'];return{name:'Weak keys: '+ks.map(keyLabel).join(' '),desc:'Words and tokens built around the keys you miss most.',make:()=>wordsForKeys(ks,36)};}
  if(id==='confuse'){const ks=params.keys||['e','r'];return{name:'Confusable keys: '+ks.map(keyLabel).join(' / '),desc:'Alternates the two keys you tend to mix up.',make:()=>wordsForKeys(ks,36)};}
  if(id==='mistakes'){const ws=params.words&&params.words.length?params.words:['the'];return{name:'Missed words',desc:'The words you stumbled on, shuffled and repeated.',make:()=>fromList(ws.length<2?ws.concat(ws):ws,30)};}
  const d=EXD[id]||EXD.accuracy;return{name:d.name,desc:d.desc,make:d.make};
}

/* ---------- dates and goals ---------- */
function dayKey(ts){const d=new Date(ts);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function dayMinutes(history){const m={};history.forEach(r=>{const k=dayKey(r.ts);m[k]=(m[k]||0)+(r.seconds||0)/60;});return m;}
function streak(history,goal,now){
  const m=dayMinutes(history);let d=new Date(now||Date.now());
  if((m[dayKey(d)]||0)<goal)d.setDate(d.getDate()-1);
  let n=0;while((m[dayKey(d)]||0)>=goal){n++;d.setDate(d.getDate()-1);}
  return n;
}
function niceStep(x){if(!(x>0))return 1;const p=Math.pow(10,Math.floor(Math.log10(x)));const f=x/p;return(f<=1?1:f<=2?2:f<=5?5:10)*p;}

export const KW={generate,more,normKey,catOf,CAT_LABEL,keyLabel,countCorrect,record,buildResult,aggregate,weakKeys,recommend,exercise,EXLIST,dayKey,dayMinutes,streak,niceStep,consistency};
