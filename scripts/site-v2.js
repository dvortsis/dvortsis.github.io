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
