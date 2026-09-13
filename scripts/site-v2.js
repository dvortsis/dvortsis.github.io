const menu = document.querySelector('.menu');
const links = document.querySelector('.navlinks');
function closeMenu() {
  links?.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
  const label = menu?.querySelector('.sr-only');
  if (label) label.textContent = 'Open navigation';
}
menu?.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.querySelector('.sr-only').textContent = open ? 'Close navigation' : 'Open navigation';
});
links?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && links?.classList.contains('open')) {
    closeMenu();
    menu.focus();
  }
});
document.addEventListener('click', e => {
  if (!e.target.closest('.nav')) closeMenu();
});
matchMedia('(min-width:1024px)').addEventListener('change', e => {
  if (e.matches) closeMenu();
});
const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

// Fallback IntersectionObserver for scroll reveals (Safari, Firefox)
if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0
  });

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });
}

// One quiet, run-once progression for the operating model.
const operatingModel = document.querySelector('[data-operating-model]');
if (operatingModel) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    operatingModel.classList.add('is-visible');
  } else {
    const operatingObserver = new IntersectionObserver((entries, observer) => {
      if (entries[0]?.isIntersecting) {
        operatingModel.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    operatingObserver.observe(operatingModel);
  }
}

// Persistent process motion runs only while a study is visible.
const processStudies = document.querySelectorAll('.process-study');
const processMotion = matchMedia('(prefers-reduced-motion: reduce)');
const visibleStudies = new Set();
function syncProcessMotion() {
  processStudies.forEach(study => study.classList.toggle('process-running',
    visibleStudies.has(study) && !processMotion.matches && !document.hidden));
}
if ('IntersectionObserver' in window) {
  const processObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visibleStudies.add(entry.target);
      else visibleStudies.delete(entry.target);
    });
    syncProcessMotion();
  }, { threshold: 0.15 });
  processStudies.forEach(study => processObserver.observe(study));
}
processMotion.addEventListener('change', syncProcessMotion);
document.addEventListener('visibilitychange', syncProcessMotion);


// Magwai uses one clock; all eight frames are drawn from one loaded image.
(() => {
  const canvas = document.querySelector('.magwai-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const image = new Image();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let sheet, visible = false, elapsed = 0, last = 0, raf = 0;
  function interpolate(t, points) {
    for (let i = 1; i < points.length; i++) {
      if (t <= points[i][0]) {
        const [a,x,y] = points[i-1], [b,u,v] = points[i];
        const k = Math.max(0, (t-a)/(b-a));
        return [x+(u-x)*k,y+(v-y)*k];
      }
    }
    return points[points.length-1].slice(1);
  }
  function ball(x,y) {
    ctx.save();ctx.translate(x,y);
    ctx.fillStyle='#ddec45';ctx.strokeStyle='#afc32d';ctx.lineWidth=.7;
    ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#fffde2';ctx.lineWidth=1.4;ctx.beginPath();
    ctx.moveTo(-6,-6);ctx.bezierCurveTo(4,-3,4,3,-6,6);ctx.stroke();ctx.restore();
  }
  function draw(seconds) {
    const t = seconds % 10;
    ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,520,205);
    ctx.strokeStyle='rgba(109,164,203,.2)';ctx.lineWidth=.7;
    ctx.beginPath();ctx.moveTo(16,178);ctx.lineTo(504,178);ctx.stroke();
    const pickup = t >= 6;
    let frame = Math.floor(t*10)%4;
    if (pickup) frame = t < 6.45 ? 4 : t < 6.9 ? 5 : t < 7.35 ? 6 : 7;
    const [x] = interpolate(t, [[0,-170,0],[.6,-170,0],[1.5,30,0],[3.4,245,0],[4.3,245,0],[5.8,135,0],[7.5,135,0],[9.7,-180,0],[10,-180,0]]);
    const left = t >= 4.3;
    let y=20;
    if ((t>.6 && t<3.3)||(t>4.3 && t<5.8)||(t>7.5 && t<9.7)) y-=Math.abs(Math.sin(t*Math.PI*5))*6;
    if(t>=3.3 && t<4.1) y-=Math.sin((t-3.3)/.8*Math.PI)*25;
    ctx.save();ctx.translate(x,y);
    if(left){ctx.translate(160,0);ctx.scale(-1,1);}
    const cw=sheet.width/4,ch=sheet.height/2;
    ctx.drawImage(sheet,(frame%4)*cw,Math.floor(frame/4)*ch,cw,ch,0,0,160,160);
    ctx.restore();
    // The grounded ball becomes part of the pickup frames at exact contact.
    if(!pickup){
      const [bx,by]=interpolate(t,[[0,-20,32],[1,155,66],[1.8,275,169],[2.4,323,126],[3,356,169],[3.5,376,156],[4.1,390,169],[4.3,390,169],[4.9,280,139],[5.5,190,153],[6,157,148]]);
      ball(bx,by);
    }
  }
  function tick(now) {
    raf=0;
    if(!visible || document.hidden || reduced.matches || !sheet){last=0;return;}
    if(last) elapsed += Math.min(now-last,100);
    last=now;draw(elapsed/1000);raf=requestAnimationFrame(tick);
  }
  function sync() {
    if(raf) cancelAnimationFrame(raf);
    raf=0;last=0;
    if(!sheet)return;
    if(reduced.matches){draw(7.4);return;}
    if(visible&&!document.hidden)raf=requestAnimationFrame(tick);
  }
  image.onload = () => {
    sheet=document.createElement('canvas');sheet.width=image.naturalWidth;sheet.height=image.naturalHeight;
    const sctx=sheet.getContext('2d',{willReadFrequently:true});sctx.drawImage(image,0,0);
    const pixels=sctx.getImageData(0,0,sheet.width,sheet.height),d=pixels.data;
    for(let i=0;i<d.length;i+=4){
      const blue=d[i+2]-d[i];
      d[i+3]=Math.round(d[i+3]*(1-Math.max(0,Math.min(1,20*blue/255-.4))));
    }
    sctx.putImageData(pixels,0,0);draw(0);sync();
  };
  image.src='/assets/about/magwai-fetch-sprites.png';
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05}).observe(canvas);
  }else{visible=true;}
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
})();
