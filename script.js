const root=document.documentElement;
const toggle=document.querySelector('.theme-toggle');
const systemDark=()=>matchMedia('(prefers-color-scheme: dark)').matches;
const current=()=>root.dataset.theme||(systemDark()?'dark':'light');
const updateLabel=()=>toggle?.setAttribute('aria-label',`Switch to ${current()==='dark'?'light':'dark'} mode`);
toggle?.addEventListener('click',()=>{const next=current()==='dark'?'light':'dark';root.dataset.theme=next;try{localStorage.setItem('theme',next)}catch(e){}updateLabel()});updateLabel();
const navToggle=document.querySelector('.nav-toggle');const nav=document.querySelector('.nav-links');
navToggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');navToggle.setAttribute('aria-expanded',String(open))});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');navToggle?.setAttribute('aria-expanded','false')}));
if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -45px'});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el))}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'))}
document.querySelector('[data-year]').textContent=new Date().getFullYear();
