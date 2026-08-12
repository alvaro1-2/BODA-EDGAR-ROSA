const weddingDate = new Date('2026-09-27T09:30:00-05:00').getTime();

function updateCountdown() {
  const left = Math.max(0, weddingDate - Date.now());
  const parts = {
    days: Math.floor(left / 86400000),
    hours: Math.floor((left % 86400000) / 3600000),
    minutes: Math.floor((left % 3600000) / 60000),
    seconds: Math.floor((left % 60000) / 1000)
  };
  Object.entries(parts).forEach(([id, value]) => {
    document.getElementById(id).textContent = String(value).padStart(2, '0');
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-image').forEach((element) => revealObserver.observe(element));

const song = document.getElementById('wedding-song');
const audioControls = [...document.querySelectorAll('[data-audio-control]')];
const floatingPlayer = document.querySelector('.floating-player');
const progressBars = [...document.querySelectorAll('.song-progress i')];

function setAudioInterface() {
  const isPlaying = !song.paused;
  document.body.classList.toggle('song-is-playing', isPlaying);
  audioControls.forEach((control) => {
    control.setAttribute('aria-pressed', String(isPlaying));
    control.setAttribute('aria-label', isPlaying ? 'Pausar nuestra canción' : 'Reproducir nuestra canción');
  });
}

async function toggleSong() {
  try {
    if (song.paused) {
      await song.play();
    } else {
      song.pause();
    }
  } catch {
    document.body.classList.remove('song-is-playing');
  }
}

audioControls.forEach((control) => control.addEventListener('click', toggleSong));
song.addEventListener('play', setAudioInterface);
song.addEventListener('pause', setAudioInterface);
song.addEventListener('ended', setAudioInterface);
song.addEventListener('timeupdate', () => {
  const progress = song.duration ? song.currentTime / song.duration : 0;
  progressBars.forEach((bar) => { bar.style.transform = `scaleX(${progress})`; });
});

function updateFloatingPlayer() {
  floatingPlayer.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.76);
}

window.addEventListener('scroll', updateFloatingPlayer, { passive: true });
updateFloatingPlayer();

const hero = document.querySelector('.hero');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion) {
  hero.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 8;
    const y = (event.clientY / window.innerHeight - 0.5) * 8;
    hero.querySelector('.hero-image').style.transform = `scale(1.045) translate(${x}px, ${y}px)`;
  });
  hero.addEventListener('pointerleave', () => {
    hero.querySelector('.hero-image').style.transform = '';
  });
}

const rsvpForm = document.getElementById('rsvp-form');
const formStatus = rsvpForm.querySelector('.form-status');
const submitButton = rsvpForm.querySelector('button[type="submit"]');
const googleFormEndpoint = 'https://docs.google.com/forms/d/e/1FAIpQLSfpEpraz_5UfUCMrLPwOHywhaXIryeidfeR85h3fo0g3SVvgw/formResponse';

rsvpForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!rsvpForm.reportValidity()) return;

  const values = new FormData(rsvpForm);
  const payload = new URLSearchParams({
    'entry.2057616867': values.get('guest-name'),
    'entry.1377491211': values.get('attendance')
  });

  submitButton.disabled = true;
  formStatus.textContent = 'Enviando tu confirmación…';

  try {
    await fetch(googleFormEndpoint, { method: 'POST', mode: 'no-cors', body: payload });
    rsvpForm.reset();
    formStatus.textContent = '¡Gracias! Tu confirmación fue enviada a Rosa y Edgar.';
  } catch {
    formStatus.textContent = 'No pudimos enviarla. Por favor, inténtalo otra vez.';
  } finally {
    submitButton.disabled = false;
  }
});
