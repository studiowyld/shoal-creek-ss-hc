gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
const N = 27; // steps 0..26
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
const ml=sh.querySelectorAll('.ml'),ms=sh.querySelectorAll('.ms'),sw=sh.querySelector('.sweep');
gsap.set(ms,{autoAlpha:0,y:60,rotationX:-80,filter:'blur(10px)'}); gsap.set(sh.querySelector('.ws'),{'--u':0});
tl.to(sh.querySelector('.kicker'),{autoAlpha:0,duration:.3},T(6));
// learn lifts and glows
tl.to(ml,{y:-26,color:'#FFB81C',textShadow:'0 0 28px rgba(255,184,28,.8)',duration:.15,stagger:.02},T(6));
// gold sweep passes through
tl.fromTo(sw,{left:'-40%',opacity:0},{left:'110%',opacity:1,duration:.4,ease:'power1.inOut'},T(6)+.1);
tl.to(sw,{opacity:0,duration:.1},T(6)+.45);
// learn letters float up and dissolve into light
tl.to(ml,{y:-140,autoAlpha:0,scale:1.3,filter:'blur(12px)',duration:.25,stagger:.03,ease:'power2.in'},T(6)+.15);
// share letters gather and settle
tl.to(ms,{autoAlpha:1,y:0,rotationX:0,filter:'blur(0px)',color:'#3B7893',duration:.25,stagger:.03,ease:'back.out(1.6)'},T(6)+.3);
tl.fromTo(ms,{textShadow:'0 0 30px rgba(255,184,28,.9)'},{textShadow:'0 0 0px rgba(255,184,28,0)',duration:.15,stagger:.03},T(6)+.45);
tl.fromTo(sh.querySelector('.ws'),{'--u':0},{'--u':1,duration:.15},T(6)+.62);
// cornerstone drops in
tl.fromTo('#s-corner .stone',{y:-500,rotation:-8},{y:0,rotation:0,ease:'bounce.out',duration:.7},T(13));
// path line grows with nodes
tl.to('#s-path .pathLine line',{strokeDashoffset:0,ease:'none',duration:4.6},T(17));
// close: underline draws
tl.fromTo('#s-close .gold-u',{'--u':0},{'--u':1,duration:.3},T(26)+.4);

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
  else if(k==='f'||k==='F'){ window.toggleFs(); }
  document.getElementById('hint')?.style.setProperty('opacity','0');
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
