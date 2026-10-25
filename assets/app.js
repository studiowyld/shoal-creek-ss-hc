gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
const N = 25; // steps 0..24
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const stage = document.getElementById('stage');
function fit(){ const s=Math.min(innerWidth/1920, innerHeight/1080); stage.style.transform=`scale(${s})`; }
addEventListener('resize', fit); fit();

// split quotes into words for word-by-word reveal
document.querySelectorAll('.quote').forEach(q=>{ q.innerHTML=q.textContent.split(' ').map(w=>`<span class="w">${w}</span>`).join(' '); });

const tl = gsap.timeline({paused:true, defaults:{ease:'power2.inOut'}});
const T = k => Math.max(0, k-0.8);   // transition into step k
const D = 0.6;
const bgFor = s => s.classList.contains('dark') ? '#3B7893' : s.classList.contains('pale') ? '#B7D3DE' : '#FFFFFF';
const scenes=[...document.querySelectorAll('.scene')];
scenes.forEach((s,i)=>{
  const [a,b]=s.dataset.s.split('-').map(Number);
  if(a===0) gsap.set(s,{autoAlpha:1});
  else {
    tl.fromTo(s,{autoAlpha:0,y:120,scale:.94,filter:'blur(8px)'},{autoAlpha:1,y:0,scale:1,filter:'blur(0px)',duration:D},T(a));
    tl.to('#bg',{backgroundColor:bgFor(s),duration:D},T(a));
    const words=s.querySelectorAll('.quote .w');
    if(words.length) tl.fromTo(words,{opacity:0,y:40},{opacity:1,y:0,stagger:.04,duration:.3},T(a)+.2);
  }
  if(b<N-1) tl.to(s,{autoAlpha:0,y:-120,scale:1.04,filter:'blur(8px)',duration:D},b+0.2);
  s.querySelectorAll('.it').forEach(el=>{
    const k=+el.dataset.at;
    tl.fromTo(el,{autoAlpha:0,y:60},{autoAlpha:1,y:0,duration:D*0.8},k===a&&a>0?T(k)+0.25:T(k));
  });
});
// title: logo slides up as title arrives
tl.to('#s-title .logoWrap',{scale:.62,y:-30,duration:D},T(1));
tl.set('#s-title .it',{marginTop:-110},0);
// learn -> share morph
const sh=document.getElementById('s-shift');
gsap.set(sh.querySelector('.share'),{autoAlpha:0});
tl.to(sh.querySelector('.kicker'),{autoAlpha:0,duration:.3},T(4));
tl.to(sh.querySelector('.strike'),{scaleX:1,duration:.35},T(4));
tl.to(sh.querySelector('.swap h2:first-child'),{y:-170,opacity:.3,scale:.55,duration:.4},T(4)+.3);
tl.fromTo(sh.querySelector('.share'),{autoAlpha:0,y:120},{autoAlpha:1,y:40,duration:.4},T(4)+.3);
tl.fromTo(sh.querySelector('.share .gold-u'),{'--u':0},{'--u':1,duration:.25},T(4)+.45);
// cornerstone drops in
tl.fromTo('#s-corner .stone',{y:-500,rotation:-8},{y:0,rotation:0,ease:'bounce.out',duration:.7},T(12));
// path line grows with nodes
tl.to('#s-path .pathLine line',{strokeDashoffset:0,ease:'none',duration:4.6},T(16));
// close: underline draws
tl.fromTo('#s-close .gold-u',{'--u':0},{'--u':1,duration:.3},T(24)+.4);

const nodes=[...document.querySelectorAll('.node')];
const bar=document.querySelector('#progress i');
let cur=0;
const st=ScrollTrigger.create({start:0,end:'max',scrub:RM?true:0.6,animation:tl,
  snap:RM?undefined:{snapTo:1/(N-1),duration:{min:.3,max:.9},delay:.15,ease:'power2.inOut'},
  onUpdate(self){ const step=Math.round(self.progress*(N-1)); bar.style.transform=`scaleX(${self.progress})`;
    nodes.forEach(n=>n.classList.toggle('cur',+n.dataset.at===step)); if(!tweening) cur=step; }});
let tweening=false;
function go(k){
  k=Math.max(0,Math.min(N-1,k)); cur=k;
  const y=st.start+(st.end-st.start)*k/(N-1);
  if(RM){ gsap.fromTo('#stage',{opacity:0},{opacity:1,duration:.35}); window.scrollTo(0,y); return; }
  tweening=true;
  gsap.to(window,{scrollTo:{y,autoKill:false},duration:1.3,ease:'power2.inOut',overwrite:true,onComplete:()=>tweening=false});
}
addEventListener('keydown',e=>{
  const k=e.key;
  if(['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(k)){e.preventDefault();go(cur+1);}
  else if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(k)){e.preventDefault();go(cur-1);}
  else if(k==='Home'){e.preventDefault();go(0);} else if(k==='End'){e.preventDefault();go(N-1);}
  else if(k==='f'||k==='F'){ document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{}); }
  document.getElementById('hint').style.opacity=0;
});
// intro: wipe the real logo in (mask only)
if(!RM) gsap.fromTo('#logo',{clipPath:'inset(0 100% 0 0)',opacity:0},{clipPath:'inset(0 0% 0 0)',opacity:1,duration:1.8,ease:'power3.inOut',delay:.3});
// deep link ?s=N for testing
const q=new URLSearchParams(location.search).get('s'); if(q!==null){ requestAnimationFrame(()=>{ window.scrollTo(0,st.start+(st.end-st.start)*(+q)/(N-1)); cur=+q; }); }
// click / tap / swipe navigation
(function(){
  const back=x=>x<innerWidth*0.25;
  const skip=t=>t.closest('a,button,input,select,textarea,[data-nonav]');
  const hide=()=>{const h=document.getElementById('hint'); if(h) h.style.opacity=0;};
  let sx=0,sy=0,st0=0,lastTouch=0;
  addEventListener('touchstart',e=>{const t=e.changedTouches[0];sx=t.clientX;sy=t.clientY;st0=Date.now();},{passive:true});
  addEventListener('touchend',e=>{
    if(skip(e.target)) return;
    const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    lastTouch=Date.now();
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){e.preventDefault();go(cur+(dx<0?1:-1));hide();return;}
    if(Math.abs(dy)>40&&Math.abs(dy)>Math.abs(dx)){e.preventDefault();go(cur+(dy<0?1:-1));hide();return;}
    if(Math.abs(dx)<12&&Math.abs(dy)<12&&Date.now()-st0<600){e.preventDefault();go(back(t.clientX)?cur-1:cur+1);hide();}
  },{passive:false});
  addEventListener('touchmove',e=>{e.preventDefault();},{passive:false});
  addEventListener('click',e=>{
    if(Date.now()-lastTouch<800) return; // no double fire
    if(skip(e.target)||e.button!==0) return;
    go(back(e.clientX)?cur-1:cur+1);hide();
  });
  document.documentElement.style.touchAction='none';
  window.__step=()=>cur;
})();
