// iPad / TV presentation support: fullscreen via two-finger tap (no on-screen UI)
(function(){
  const d=document, el=d.documentElement;
  const isFs=()=>!!(d.fullscreenElement||d.webkitFullscreenElement);
  function enter(){ try{
      if(el.requestFullscreen){ const p=el.requestFullscreen({navigationUI:'hide'}); if(p&&p.catch) p.catch(()=>{ if(el.webkitRequestFullscreen) el.webkitRequestFullscreen(); }); }
      else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if(el.webkitRequestFullScreen) el.webkitRequestFullScreen();
    }catch(e){} window.scrollTo(window.scrollX,window.scrollY); }
  function exit(){ try{ (d.exitFullscreen||d.webkitExitFullscreen||d.webkitCancelFullScreen||function(){}).call(d); }catch(e){} }
  window.toggleFs=()=>isFs()?exit():enter();
  // two-finger tap toggles fullscreen; suppress nav for any multi-touch gesture
  let maxT=0, multi=false, t0=0, moved=false, sx=[];
  addEventListener('touchstart',e=>{ if(e.touches.length===1){maxT=0;multi=false;moved=false;t0=Date.now();}
    maxT=Math.max(maxT,e.touches.length); if(maxT>1){multi=true; e.stopImmediatePropagation();}
    if(e.touches.length>1) e.preventDefault(); },{capture:true,passive:false});
  addEventListener('touchmove',e=>{ if(multi) moved=true; },{capture:true,passive:true});
  addEventListener('touchend',e=>{ if(!multi) return; e.stopImmediatePropagation(); e.preventDefault();
    if(e.touches.length===0){ if(maxT===2&&!moved&&Date.now()-t0<700) window.toggleFs(); multi=false; maxT=0; window.__lastMulti=Date.now(); } },{capture:true,passive:false});
  addEventListener('click',e=>{ if(Date.now()-(window.__lastMulti||0)<800){ e.stopImmediatePropagation(); e.preventDefault(); } },{capture:true});
  // block pinch / gesture zoom and double-tap zoom on iPad WebKit
  ['gesturestart','gesturechange','gestureend'].forEach(t=>addEventListener(t,e=>e.preventDefault(),{passive:false}));
  addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
  addEventListener('contextmenu',e=>{ if(!e.target.closest('a')) e.preventDefault(); });
})();
