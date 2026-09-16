(() => {
  'use strict';
  const data = window.AUTOAGENT;
  if (!data) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Reject executable URLs while allowing relative files, HTTPS, and local HTTP previews.
  const safeURL = value => {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed || /[\u0000-\u001f]/.test(trimmed)) return '';
    try {
      const url = new URL(trimmed, document.baseURI);
      return ['http:', 'https:', 'file:'].includes(url.protocol) ? trimmed : '';
    } catch { return ''; }
  };
  const icon = '<span class="placeholder-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/></svg></span>';

  function placeholder(slot, item, failed = false) {
    slot.replaceChildren();
    const poster = safeURL(item.poster);
    if (poster) {
      const img = document.createElement('img');
      img.src = poster; img.alt = ''; img.className = 'video-poster';
      img.loading = slot.closest('.hero-media') ? 'eager' : 'lazy';
      slot.append(img);
    }
    const shade = document.createElement('div'); shade.className = 'placeholder-shade';
    const content = document.createElement('div'); content.className = 'placeholder-content';
    content.innerHTML = `${icon}<span class="placeholder-label">${failed ? 'Video unavailable' : 'Video coming soon'}</span><span class="placeholder-title">${escapeHTML(item.title || 'Demonstration')}</span>`;
    slot.append(shade, content);
    slot.setAttribute('role', 'img');
    slot.setAttribute('aria-label', `${item.title}. ${failed ? 'Video unavailable.' : 'Video coming soon.'}${poster ? item.posterIsVideoFrame ? ' Background is a video frame.' : ' Background is a paper illustration.' : ''}`);
  }

  function mountVideo(container, item) {
    const slot = document.createElement('div'); slot.className = 'video-slot';
    container.append(slot);
    const src = safeURL(item.src);
    if (!src) { placeholder(slot, item); return; }
    const video = document.createElement('video');
    video.controls = true; video.playsInline = true; video.preload = 'metadata';
    video.setAttribute('aria-label', item.title);
    const poster = safeURL(item.poster); if (poster) video.poster = poster;
    video.addEventListener('error', () => placeholder(slot, item, true), { once: true });
    video.addEventListener('play', () => {
      $$('video').forEach(other => { if (other !== video) other.pause(); });
    });
    // Captions are optional; set captions to a local .vtt path in content.js.
    if (safeURL(item.captions)) {
      const track = document.createElement('track');
      track.kind = 'captions'; track.src = safeURL(item.captions);
      track.srclang = item.language || 'en'; track.label = item.captionLabel || 'English';
      video.append(track);
    }
    video.src = src; slot.append(video);
  }

  $('#authors').textContent = data.project.authors;
  $('#bibtex').textContent = data.project.citation;
  const publicURL = value => {
    if (typeof value !== 'string' || !/^https:\/\//i.test(value.trim())) return '';
    try {
      const url = new URL(value);
      if (/^(localhost|127\.|0\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[.*\])/.test(url.hostname)) return '';
      return url.href;
    } catch { return ''; }
  };
  ['paper', 'code'].forEach(key => {
    const url = publicURL(data.project[key]);
    if (!url) return;
    const button = $(`#${key}-link`);
    const link = document.createElement('a');
    link.id = button.id; link.className = button.className; link.innerHTML = button.innerHTML;
    link.href = url; link.target = '_blank'; link.rel = 'noopener';
    button.replaceWith(link);
  });
  if (publicURL(data.project.arxiv)) {
    const link = document.createElement('a');
    link.className = 'button'; link.href = publicURL(data.project.arxiv);
    link.textContent = 'arXiv ↗'; link.target = '_blank'; link.rel = 'noopener';
    $('.hero-links').append(link);
  }
  mountVideo($('#overview-video'), data.overview);
  $$('[data-seek]').forEach(button => button.addEventListener('click', () => {
    const video = $('#overview-video video');
    if (!video) return;
    const seekAndPlay = () => {
      video.currentTime = Number(button.dataset.seek);
      video.play().catch(() => { /* Native controls remain available if playback is blocked. */ });
    };
    if (video.readyState >= 1) seekAndPlay();
    else video.addEventListener('loadedmetadata', seekAndPlay, { once: true });
  }));

  let currentSplit = 'gen';
  let currentMetric = 0;
  const splitLabels = { gen: 'generalization', id: 'in-distribution', avg: 'average' };
  const metricLabels = ['driving score', 'success rate (%)', 'harmonic mean'];
  function drawChart() {
    const experts = data.results.filter(row => row.expert);
    const descriptions = [];
    $('#results-chart').innerHTML = experts.map(base => {
      const ours = data.results.find(row => row.name === `${base.name} + AutoAgent0`);
      const a = base[currentSplit][currentMetric]; const b = ours[currentSplit][currentMetric];
      const gain = b - a;
      descriptions.push(`${base.name}: ${a.toFixed(1)} standalone, ${b.toFixed(1)} with AutoAgent0`);
      return `<div class="chart-group"><div class="chart-label">${escapeHTML(base.name)}<small>+${gain.toFixed(1)} ${currentMetric === 1 ? 'pp' : 'points'}</small></div><div class="chart-bars"><div class="bar-line"><div class="bar-fill" style="--value:${a}%"><span>${a.toFixed(1)}</span></div></div><div class="bar-line"><div class="bar-fill ours" style="--value:${b}%"><span>${b.toFixed(1)}</span></div></div></div></div>`;
    }).join('') + '<div class="chart-axis" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>';
    $('#results-chart').setAttribute('aria-label', `${metricLabels[currentMetric]} on ${splitLabels[currentSplit]} routes. ${descriptions.join('. ')}.`);
    $('#chart-note').textContent = `${currentSplit === 'avg' ? 'Arithmetic mean of both splits' : currentSplit === 'gen' ? 'Matched routes with long-tail distribution shifts' : 'Matched in-distribution base routes'}. Gains are absolute ${currentMetric === 1 ? 'percentage points' : 'score points'} over each standalone expert.`;
  }
  $$('[data-split]').forEach(button => button.addEventListener('click', () => {
    currentSplit = button.dataset.split;
    $$('[data-split]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    drawChart();
  }));
  $('#metric').addEventListener('change', event => { currentMetric = Number(event.target.value); drawChart(); });
  drawChart();
  $('#benchmark-body').innerHTML = data.results.map((row, index) => {
    const base = row.ours ? data.results[index - 1] : null;
    const rgb = '<td class="sensor-cell" aria-label="RGB input: yes">✓</td>';
    const lidar = `<td class="sensor-cell" aria-label="LiDAR input: ${row.input.includes('LiDAR') ? 'yes' : 'no'}">${row.input.includes('LiDAR') ? '✓' : '—'}</td>`;
    const scores = [...row.id, ...row.gen].map(value => `<td>${value.toFixed(1)}</td>`).join('');
    const average = row.avg.map((value, metric) => `<td class="average-cell">${value.toFixed(1)}${base ? `<span class="table-gain">(+${(value - base.avg[metric]).toFixed(1)})</span>` : ''}</td>`).join('');
    return `<tr class="${row.ours ? 'ours-row' : row.expert ? 'expert-row' : ''}"><th scope="row">${escapeHTML(row.name)}</th>${rgb}${lidar}${scores}${average}</tr>`;
  }).join('');
  $('#navsafe-body').innerHTML = data.navsafe.map(row => `<tr class="${row[0].includes('AutoAgent0') ? 'ours-row' : ''}"><th scope="row">${escapeHTML(row[0])}</th>${row.slice(1).map(value => `<td>${value === null ? '<span aria-label="Result pending">—</span>' : value.toFixed(2)}</td>`).join('')}</tr>`).join('');

  const comparisonLabels = [
    { key: 'expert', title: 'Standalone expert', caption: 'Nominal execution by the frozen driving policy.' },
    { key: 'monitor', title: 'Conventional monitor', caption: 'A monitored baseline for the same driving episode.' },
    { key: 'ours', title: '+ AutoAgent0', caption: 'Scene refinement, verification, and agentic recovery.' }
  ];
  function videoCard(title, caption, item, ours = false) {
    const card = document.createElement('article');
    card.className = `video-card${ours ? ' ours-card' : ''}`;
    card.innerHTML = `<h4 class="video-card-heading" style="margin:0"><span aria-hidden="true"></span>${escapeHTML(title)}</h4>`;
    mountVideo(card, item);
    return card;
  }
  function showScenario(index) {
    const scenario = data.scenarios[index];
    $$('#scenario-videos video').forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
    $('#scenario-title').textContent = scenario.title;
    $('#scenario-counter').textContent = `${String(index + 1).padStart(2, '0')} / ${String(data.scenarios.length).padStart(2, '0')}`;
    $$('#scenario-tabs button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    $('#scenario-videos').replaceChildren(...comparisonLabels.map(label => {
      const configured = scenario.videos[label.key];
      const item = typeof configured === 'string' ? { src: configured } : configured || {};
      return videoCard(label.title, label.caption, { ...item, title: `${scenario.label} · ${label.title}` }, label.key === 'ours');
    }));
  }
  data.scenarios.forEach((scenario, index) => {
    const button = document.createElement('button'); button.type = 'button';
    button.textContent = scenario.label; button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => showScenario(index));
    $('#scenario-tabs').append(button);
  });
  if (data.scenarios.length) showScenario(0);
  data.methodVideos.forEach(item => $('#method-videos').append(videoCard(item.title, item.detail, item)));

  const stages = [
    { kicker: 'INDEPENDENT PERCEPTION', title: 'Build a better scene context.', text: 'Camera and LiDAR checks identify disagreements in detected objects. Semantic validation helps assess missed obstacles and unsupported boxes, refining the context supplied to verification and recovery.', image: 'assets/figures/detection.svg', alt: 'Initial detection compared with LiDAR and VLM refinement', chips: ['Camera + LiDAR', 'BridgeDrive', 'Semantic validation'] },
    { kicker: 'SHARED ADMISSION CRITERIA', title: 'Check the proposal before execution.', text: 'A PDMS-based verifier evaluates collision risk, drivable-area compliance, time to collision, lane keeping, and progress. Route-consistency and execution guards complement geometric checks.', image: 'assets/figures/framework.svg', alt: 'Nominal and recovery proposals checked by the shared rule-based verifier', chips: ['Collision', 'Drivable area', 'TTC', 'Progress'] },
    { kicker: 'AGENTIC PARAMETER SEARCH', title: 'Turn a rejection into a new plan.', text: 'When no nominal proposal is admitted, the agent selects an action primitive and bounded parameters. Verifier feedback guides changes in lateral displacement, speed, or duration—or selection of a different primitive.', image: 'assets/figures/recovery.svg', alt: 'Recovery primitive selection and verifier-guided trajectory refinement', chips: ['Brake / creep', 'Lateral bypass', 'Reverse', 'Parameter search'] },
    { kicker: 'OBSERVATION-CONDITIONED ADAPTATION', title: 'Keep recovering in a changing world.', text: 'New observations can motivate a revised maneuver during execution. Each replacement trajectory is verified before commitment. Nominal proposals are reassessed as the runtime works to restore regular driving.', image: 'assets/figures/figma-layout.svg', alt: 'Recovery execution with observation-conditioned adaptation', chips: ['Observe', 'Refine', 'Verify again', 'Return to nominal'] }
  ];
  function showStage(index) {
    const stage = stages[index];
    $('#method-kicker').textContent = stage.kicker; $('#method-title').textContent = stage.title;
    $('#method-text').textContent = stage.text; $('#method-image').src = stage.image;
    $('#method-image').alt = stage.alt;
    $('#method-image-button').dataset.image = stage.image;
    $('#method-image-button').dataset.caption = stage.title;
    $('#method-chips').innerHTML = stage.chips.map(chip => `<span>${escapeHTML(chip)}</span>`).join('');
    $$('[data-step]').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  $$('[data-step]').forEach(button => button.addEventListener('click', () => showStage(Number(button.dataset.step))));
  showStage(0);

  const dialog = $('#figure-dialog');
  let figureTrigger = null;
  $$('.zoomable').forEach(button => button.addEventListener('click', () => {
    figureTrigger = button;
    $('#enlarged-figure').src = button.dataset.image;
    $('#enlarged-figure').alt = $('img', button).alt;
    $('#figure-caption').textContent = button.dataset.caption;
    dialog.showModal(); document.body.style.overflow = 'hidden';
  }));
  $('#close-figure').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; if (figureTrigger) figureTrigger.focus(); });

  const themeButton = $('.theme-toggle');
  const darkPreference = window.matchMedia('(prefers-color-scheme: dark)');
  let explicitTheme = false;
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    $('meta[name="theme-color"]').content = theme === 'dark' ? '#101620' : '#fbfcfe';
  }
  try {
    const saved = localStorage.getItem('autoagent0-theme');
    explicitTheme = ['dark', 'light'].includes(saved);
    setTheme(explicitTheme ? saved : darkPreference.matches ? 'dark' : 'light');
  } catch { setTheme(darkPreference.matches ? 'dark' : 'light'); }
  themeButton.addEventListener('click', () => {
    explicitTheme = true;
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next); try { localStorage.setItem('autoagent0-theme', next); } catch { /* File previews may block storage. */ }
  });
  darkPreference.addEventListener('change', event => { if (!explicitTheme) setTheme(event.matches ? 'dark' : 'light'); });

  $('#copy-citation').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(data.project.citation);
      $('#copy-status').textContent = 'BibTeX copied to clipboard.';
    } catch {
      const selection = window.getSelection(); const range = document.createRange();
      range.selectNodeContents($('#bibtex')); selection.removeAllRanges(); selection.addRange(range);
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* Manual copy remains available. */ }
      $('#copy-status').textContent = copied ? 'BibTeX copied to clipboard.' : 'BibTeX selected. Press Ctrl+C (or ⌘C) to copy.';
    }
  });

  const sections = $$('.page > .section');
  const navLinks = $$('.contents nav a');
  let scrollScheduled = false;
  function updateScroll() {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    $('#reading-progress').style.width = `${height > 0 ? Math.min(100, Math.max(0, window.scrollY / height * 100)) : 0}%`;
    let current = '';
    sections.forEach(section => { if (section.getBoundingClientRect().top <= window.innerHeight * .35) current = section.id; });
    navLinks.forEach(link => {
      const active = link.hash === `#${current}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    scrollScheduled = false;
  }
  function scheduleScroll() { if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateScroll); } }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  document.addEventListener('toggle', scheduleScroll, true);
  window.addEventListener('load', updateScroll, { once: true });
  updateScroll();
})();
