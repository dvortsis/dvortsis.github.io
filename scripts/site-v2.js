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
