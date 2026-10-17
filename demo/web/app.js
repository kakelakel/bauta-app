// Kopia av appens webbläge (app/src/main/assets/web/app.js), byggd av tools/build_web_demo.py.
// Bauta webbläge (WEB1). Allt sparas direkt i telefonen via /api; inget lagras i webbläsaren.
// Texter kommer från appen (/api/texts) och sätts alltid som text, aldrig som HTML.
'use strict';

let T = {};
let LANG = 'en';
const GROUPS = {
  nutrition: { icon: 'restaurant', tabs: ['profiles', 'meals', 'tasks'] },
  training: { icon: 'fitness', tabs: ['workouts', 'programs', 'exercises'] },
};
const S = {
  loggedIn: false,
  tab: 'profiles',
  schedule: null,
  training: null,
  view: null,          // null = fliken; annars {kind: 'meal'|'task'|'workout', ...}
  offline: false,
};

// ---------- Ikoner: appens egna (Material Symbols Rounded, Apache 2.0) ----------

const ICONS = {
  restaurant: 'M280-600v-240q0-17 11.5-28.5T320-880q17 0 28.5 11.5T360-840v240h40v-240q0-17 11.5-28.5T440-880q17 0 28.5 11.5T480-840v240q0 56-34.5 98T360-446v326q0 17-11.5 28.5T320-80q-17 0-28.5-11.5T280-120v-326q-51-14-85.5-56T160-600v-240q0-17 11.5-28.5T200-880q17 0 28.5 11.5T240-840v240h40Zm400 200h-80q-17 0-28.5-11.5T560-440v-240q0-70 51.5-135T718-880q18 0 30 14t12 33v713q0 17-11.5 28.5T720-80q-17 0-28.5-11.5T680-120v-280Z',
  fitness: 'M282-622 168-508q-11 11-27.5 11.5T112-508q-11-11-11.5-27.5T111-564l29-30-28-28q-12-12-12-28t12-28l56-56-29-30q-11-11-11-27.5t12-28.5q11-11 27.5-11.5T196-821l30 29 56-56q12-12 28-12t28 12l28 28 30-29q11-11 27.5-11t28.5 12q11 11 11 28t-11 28L338-678l340 340 114-114q11-11 27.5-11.5T848-452q11 11 11.5 27.5T849-396l-29 30 28 28q12 12 12 28t-12 28l-56 56 29 30q11 11 11 27.5T820-140q-11 11-27.5 11.5T764-139l-30-29-56 56q-12 12-28 12t-28-12l-28-28-30 29q-11 11-27.5 11T508-112q-11-11-11-28t11-28l114-114-340-340Z',
  add: 'M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z',
  delete: 'M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM400-280q17 0 28.5-11.5T440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280Zm160 0q17 0 28.5-11.5T600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280ZM280-720v520-520Z',
  chevron: 'M504-480 348-636q-11-11-11-28t11-28q11-11 28-11t28 11l184 184q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L404-268q-11 11-28 11t-28-11q-11-11-11-28t11-28l156-156Z',
  back: 'm313-440 196 196q12 12 11.5 28T508-188q-12 11-28 11.5T452-188L188-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l264-264q11-11 27.5-11t28.5 11q12 12 12 28.5T508-715L313-520h447q17 0 28.5 11.5T800-480q0 17-11.5 28.5T760-440H313Z',
  edit: 'M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z',
  search: 'M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z',
  check: 'M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z',
};
const SVG = 'http://www.w3.org/2000/svg';
function icon(name, rotate) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 -960 960 960');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', ICONS[name]);
  if (rotate) path.setAttribute('transform', 'rotate(' + rotate + ' 480 -480)');
  svg.appendChild(path);
  return svg;
}

// ---------- Hjälpare ----------

function t(key, ...args) {
  let s = T[key] !== undefined ? T[key] : key;
  args.forEach((a, i) => { s = s.split('%' + (i + 1) + '$s').join(String(a)); });
  return s;
}

function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'value') el.value = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  const add = (c) => {
    if (c === null || c === undefined || c === false) return;
    if (Array.isArray(c)) c.forEach(add);
    else if (c instanceof Node) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  };
  children.forEach(add);
  return el;
}

/** Ikonknapp med tooltip och skärmläsartext. */
function iconBtn(name, label, onclick, { danger = false, disabled = false, rotate = 0 } = {}) {
  return h('button', {
    class: 'icon-btn' + (danger ? ' danger' : ''), type: 'button', title: label, 'aria-label': label, disabled,
    onclick: (e) => { e.stopPropagation(); onclick(e); },
  }, icon(name, rotate));
}

function btn(label, onclick, kind = 'text', iconName) {
  return h('button', { class: 'btn ' + kind, type: 'button', onclick }, iconName ? icon(iconName) : null, label);
}

function snackbar(text) {
  document.querySelectorAll('.snackbar').forEach((e) => e.remove());
  const el = h('div', { class: 'snackbar', role: 'status' }, text);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4500);
}

/** Dialog i appens stil. Med [input] returneras texten (eller null), annars true/false. */
function dialog({ title, text, input, confirm, danger }) {
  return new Promise((resolve) => {
    const field = input !== undefined ? h('input', { value: input, maxlength: '200', 'aria-label': title }) : null;
    const done = (value) => { dlg.close(); dlg.remove(); resolve(value); };
    const ok = () => {
      if (field) {
        const v = field.value.trim();
        if (v) done(v);
      } else done(true);
    };
    const dlg = h('dialog', { class: 'dlg' },
      h('form', { method: 'dialog', onsubmit: (e) => { e.preventDefault(); ok(); } },
        h('h2', {}, title),
        text ? h('p', {}, text) : null,
        field,
        h('div', { class: 'actions-bar' },
          h('button', { class: 'btn text', type: 'button', onclick: () => done(field ? null : false) }, t('cancel')),
          h('button', { class: 'btn ' + (danger ? 'text danger' : 'filled'), type: 'submit' }, confirm || t('ok')))));
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); done(field ? null : false); });
    document.body.appendChild(dlg);
    dlg.showModal();
    if (field) { field.focus(); field.select(); }
  });
}
const askName = (title, initial) => dialog({ title, input: initial || '', confirm: t('save') });
const confirmDelete = (name, text) => dialog({ title: t('confirm_delete', name), text, confirm: t('delete'), danger: true });

async function api(method, path, body) {
  const opts = { method, headers: { 'X-Bauta': '1' }, credentials: 'same-origin' };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch('/api/' + path, opts);
  } catch (e) {
    S.offline = true;
    render();
    throw e;
  }
  if (S.offline) { S.offline = false; }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== 'login') {
    S.loggedIn = false;
    render();
  }
  if (!res.ok) {
    const err = new Error(data.error || 'error');
    err.status = res.status;
    throw err;
  }
  return data;
}

/** Gör en ändring, läser in datan på nytt och ritar om. */
async function act(method, path, body, { closeView = false } = {}) {
  try {
    const result = await api(method, path, body);
    await loadAll();
    if (closeView) S.view = null;
    render();
    return result;
  } catch (e) {
    if (e.status === 409 && e.message === 'profile_has_days') snackbar(t('profile_has_days'));
    else if (e.status === 502) snackbar(t('food_unavailable'));
    else if (e.status && e.status !== 401) snackbar(t('error_generic'));
    return null;
  }
}

async function loadAll() {
  const [schedule, training] = await Promise.all([api('GET', 'schedule'), api('GET', 'training')]);
  S.schedule = schedule;
  S.training = training;
}

const pad = (n) => String(n).padStart(2, '0');
const hhmm = (minutes) => pad(Math.floor(minutes / 60)) + ':' + pad(minutes % 60);
function parseTime(text) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(text || '');
  if (!m) return null;
  const v = Number(m[1]) * 60 + Number(m[2]);
  return v < 24 * 60 ? v : null;
}
function parseNumber(text) {
  if (text === null || text === undefined) return null;
  const s = String(text).trim().replace(',', '.');
  if (s === '') return null;
  const v = Number(s);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
}
function fmt(v, decimals = 0) {
  return new Intl.NumberFormat(LANG, { maximumFractionDigits: decimals }).format(v);
}
/** Tal i ett inmatningsfält: utan tusentalsavgränsare, så att det går att läsa tillbaka. */
function fmtInput(v, decimals) {
  return new Intl.NumberFormat(LANG, { maximumFractionDigits: decimals, useGrouping: false }).format(v);
}
function weekdayName(day) {
  // 2024-01-01 var en måndag; day 1 = måndag (ISO).
  return new Intl.DateTimeFormat(LANG, { weekday: 'short' }).format(new Date(2024, 0, day)).replace('.', '');
}
const DAYS = [1, 2, 3, 4, 5, 6, 7];
function byName(a, b) { return a.name.localeCompare(b.name, LANG); }
function timeInput(minutes, onchange, label) {
  return h('input', { type: 'time', class: 'time', value: hhmm(minutes), 'aria-label': label || t('time'), onchange: (e) => {
    const v = parseTime(e.target.value);
    if (v !== null) onchange(v);
  } });
}
function chip(label, on, onclick) {
  return h('button', { class: 'chip' + (on ? ' on' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false', onclick },
    on ? icon('check') : null, label);
}
function field(label, control, extraClass) {
  return h('label', { class: 'field' + (extraClass ? ' ' + extraClass : '') }, h('span', {}, label), control);
}
function pageHead(title, help, action) {
  return h('div', { class: 'page-head' },
    h('div', { class: 'titles' }, h('h1', {}, title), help ? h('p', { class: 'help' }, help) : null),
    action || null);
}
function fab(label, onclick) {
  return h('button', { class: 'fab', type: 'button', onclick }, icon('add'), label);
}
function editorHead(title) {
  return h('div', { class: 'page-head editor' },
    iconBtn('back', t('back'), () => { S.view = null; render(); }),
    h('h1', {}, title));
}
/** Klickbar rad i en lista. */
function item(onopen, ...content) {
  return h('div', {
    class: 'item', role: 'button', tabindex: '0', onclick: onopen,
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onopen(); } },
  }, content, h('span', { class: 'chev' }, icon('chevron')));
}

// ---------- Ritning ----------

function groupOf(tab) { return Object.keys(GROUPS).find((g) => GROUPS[g].tabs.includes(tab)); }

function render() {
  const app = document.getElementById('app');
  const scroll = window.scrollY;
  app.replaceChildren();
  if (!S.loggedIn) { app.appendChild(loginView()); return; }
  const group = groupOf(S.tab);
  app.appendChild(h('header', {},
    h('div', { class: 'bar' },
      h('div', { class: 'brand' }, h('img', { src: 'icon.svg', alt: '' }), h('span', {}, 'Bauta')),
      h('nav', { class: 'groups', 'aria-label': 'Bauta' }, Object.keys(GROUPS).map((g) => h('button', {
        class: 'group' + (g === group ? ' on' : ''), type: 'button', 'aria-current': g === group ? 'page' : null,
        onclick: () => { if (g !== group) { S.tab = GROUPS[g].tabs[0]; S.view = null; render(); refresh(); } },
      }, icon(GROUPS[g].icon), t('group_' + g)))),
      h('button', { class: 'btn text', type: 'button', onclick: logout }, t('logout'))),
    h('nav', { class: 'tabs' }, GROUPS[group].tabs.map((tab) => h('button', {
      class: 'tab' + (S.tab === tab ? ' on' : ''), type: 'button', 'aria-current': S.tab === tab ? 'page' : null,
      onclick: () => { S.tab = tab; S.view = null; render(); refresh(); },
    }, t('tab_' + tab))))));
  const main = h('main', {});
  if (S.offline) main.appendChild(h('div', { class: 'banner offline', role: 'alert' }, t('offline')));
  if (!S.schedule || !S.training) {
    main.appendChild(h('p', { class: 'muted' }, t('loading')));
  } else if (S.view && S.view.kind === 'meal') {
    main.appendChild(mealEditor());
  } else if (S.view && S.view.kind === 'task') {
    main.appendChild(taskEditor());
  } else if (S.view && S.view.kind === 'workout') {
    main.appendChild(workoutEditor());
  } else if (S.view && S.view.kind === 'exercise') {
    main.appendChild(exerciseEditor());
  } else {
    const views = { profiles: profilesView, meals: mealsView, tasks: tasksView, workouts: workoutsView, programs: programsView, exercises: exercisesView };
    main.appendChild(views[S.tab]());
  }
  main.appendChild(h('p', { class: 'footnote' }, t('saved_note')));
  app.appendChild(main);
  window.scrollTo(0, scroll);
}

function openView(view) {
  S.view = view;
  render();
  window.scrollTo(0, 0);
}

async function refresh() {
  try { await loadAll(); render(); } catch (e) { /* visas redan */ }
}

// ---------- Inloggning ----------

function loginView() {
  const error = h('p', { class: 'error-text hidden', role: 'alert' }, t('login_wrong'));
  const input = h('input', { inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '6', 'aria-label': t('login_code'), placeholder: '••••••' });
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('POST', 'login', { code: input.value.replace(/\s/g, '') });
      S.loggedIn = true;
      render();
      refresh();
    } catch (err) {
      const message = err.status === 429 ? t('login_wait') : err.status === 403 ? t('login_closed') : t('login_wrong');
      if (err.status === 401 || err.status === 429 || err.status === 403) {
        error.textContent = message;
        error.classList.remove('hidden'); input.value = ''; input.focus();
      }
    }
  };
  setTimeout(() => input.focus(), 0);
  return h('div', { class: 'login-wrap' },
    h('form', { class: 'login', onsubmit: submit },
      h('div', { class: 'brand' }, h('img', { src: 'icon.svg', alt: '' }), h('span', {}, 'Bauta')),
      h('h1', {}, t('login_title')),
      h('p', { class: 'help' }, t('login_text')),
      input,
      error,
      h('button', { class: 'btn filled', type: 'submit' }, t('login_button'))));
}

async function logout() {
  try { await api('POST', 'logout'); } catch (e) { /* stängd redan */ }
  S.loggedIn = false;
  S.schedule = null;
  S.training = null;
  render();
}

// ---------- Dagprofiler ----------

function mealById(id) { return S.schedule.meals.find((m) => m.id === id); }

function profilesView() {
  const sch = S.schedule;
  const wrap = h('div', {}, pageHead(t('tab_profiles'), t('profiles_help'), fab(t('profile_new'), async () => {
    const name = await askName(t('profile_new'));
    if (name) act('POST', 'profiles', { name });
  })));
  sch.profiles.forEach((p) => {
    const items = sch.items.filter((i) => i.profileId === p.id).sort((a, b) => a.time - b.time);
    let kcal = 0;
    let protein = 0;
    items.forEach((i) => {
      const m = mealById(i.mealId);
      if (m && m.kcal) kcal += m.kcal;
      if (m && m.protein) protein += m.protein;
    });
    const mealSelect = h('select', { 'aria-label': t('profile_add_meal') },
      h('option', { value: '' }, t('choose')),
      [...sch.meals].sort(byName).map((m) => h('option', { value: m.id }, m.name)));
    let addTime = 12 * 60;
    wrap.appendChild(h('section', { class: 'card' },
      h('div', { class: 'card-head' },
        h('div', { class: 'titles' },
          h('h2', {}, p.name),
          p.weekdays.length ? null : h('div', { class: 'sub' }, t('profile_no_days'))),
        h('div', { class: 'actions' },
          iconBtn('edit', t('rename'), async () => {
            const name = await askName(t('rename'), p.name);
            if (name) act('PUT', 'profiles/' + p.id, { name });
          }),
          iconBtn('delete', t('delete'), async () => {
            if (p.weekdays.length) { snackbar(t('profile_has_days')); return; }
            if (await confirmDelete(p.name)) act('DELETE', 'profiles/' + p.id);
          }, { danger: true }))),
      h('div', { class: 'chips section' }, DAYS.map((d) => chip(weekdayName(d), p.weekdays.includes(d), () => {
        if (!p.weekdays.includes(d)) act('POST', 'profiles/' + p.id + '/weekday', { day: d });
      }))),
      items.length ? h('ul', { class: 'rows section' }, items.map((i) => {
        const m = mealById(i.mealId);
        return h('li', {},
          timeInput(i.time, (v) => act('PUT', 'plan-items/' + i.id, { time: v })),
          h('span', { class: 'grow' }, m ? m.name : '?'),
          h('span', { class: 'meta' }, m && m.kcal !== null ? fmt(m.kcal) + ' kcal' : t('meal_no_kcal')),
          iconBtn('delete', t('profile_remove_meal'), () => act('DELETE', 'plan-items/' + i.id)));
      })) : h('p', { class: 'empty section' }, t('profile_empty')),
      items.length ? h('p', { class: 'total' }, t('profile_total', fmt(kcal), fmt(protein))) : null,
      h('div', { class: 'add-row' },
        mealSelect,
        timeInput(addTime, (v) => { addTime = v; }),
        btn(t('profile_add_meal'), () => {
          if (mealSelect.value) act('POST', 'plan-items', { profileId: p.id, mealId: mealSelect.value, time: addTime });
          else mealSelect.focus();
        }, 'tonal', 'add'))));
  });
  return wrap;
}

// ---------- Måltider ----------

function mealsView() {
  const sch = S.schedule;
  const meals = [...sch.meals].sort(byName);
  return h('div', {},
    pageHead(t('tab_meals'), t('meals_help'), fab(t('meal_new'), () => openMeal(null))),
    h('div', { class: 'list' }, meals.map((m) => {
      const used = [...new Set(sch.items.filter((i) => i.mealId === m.id)
        .map((i) => (sch.profiles.find((p) => p.id === i.profileId) || {}).name).filter(Boolean))];
      const macros = (m.kcal !== null ? fmt(m.kcal) + ' kcal' : t('meal_no_kcal')) +
        (m.protein !== null ? ' · ' + fmt(m.protein) + ' g protein' : '');
      return item(() => openMeal(m),
        h('div', { class: 'grow' },
          h('div', { class: 'name' }, m.name),
          h('div', { class: 'line' }, macros + (m.ingredients.length ? ' · ' + m.ingredients.length + ' ' + t('meal_ingredients').toLowerCase() : '')),
          h('div', { class: 'line' }, used.length ? t('meal_used_in', used.join(', ')) : t('meal_unused'))));
    }), meals.length ? null : h('p', { class: 'empty' }, '–')));
}

function openMeal(m) {
  openView({
    kind: 'meal',
    draft: m ? JSON.parse(JSON.stringify(m)) : { id: null, name: '', description: '', kcal: null, protein: null, fat: null, carbs: null, ingredients: [] },
  });
}

function ingredientTotals(ingredients) {
  const sum = (key) => {
    let any = false;
    let total = 0;
    ingredients.forEach((i) => {
      const v = i.per100 && i.per100[key];
      if (v !== null && v !== undefined) { any = true; total += v * i.grams / 100; }
    });
    return any ? Math.round(total) : null;
  };
  return { kcal: sum('kcal'), protein: sum('proteinG'), fat: sum('fatG'), carbs: sum('carbsG') };
}

function mealEditor() {
  const d = S.view.draft;
  const totals = h('p', { class: 'total' });
  const showTotals = () => {
    const x = ingredientTotals(d.ingredients);
    const v = (n) => (n === null ? '–' : fmt(n));
    totals.textContent = t('meal_totals', v(x.kcal), v(x.protein), v(x.fat), v(x.carbs));
  };
  const textInput = (key, attrs = {}) => h('input', Object.assign({ value: d[key] === null ? '' : d[key], oninput: (e) => { d[key] = e.target.value; } }, attrs));

  const ingredients = d.ingredients.length ? h('ul', { class: 'rows' }, d.ingredients.map((ing, index) => {
    const kcal = h('span', { class: 'meta' });
    const showKcal = () => {
      kcal.textContent = ing.per100 && ing.per100.kcal !== null ? fmt(Math.round(ing.per100.kcal * ing.grams / 100)) + ' kcal' : '';
    };
    showKcal();
    return h('li', {},
      h('span', { class: 'grow' }, ing.name),
      h('span', { class: 'inline' },
        h('input', { class: 'num', inputmode: 'decimal', value: fmtInput(ing.grams, 1), 'aria-label': t('meal_grams') + ' – ' + ing.name, oninput: (e) => {
          const g = parseNumber(e.target.value);
          if (g && g > 0) { ing.grams = g; showKcal(); showTotals(); }
        } }),
        h('span', { class: 'muted' }, 'g')),
      kcal,
      iconBtn('delete', t('delete'), () => { d.ingredients.splice(index, 1); render(); }));
  })) : null;

  const results = h('div', {});
  let timer = null;
  const search = h('input', { type: 'search', placeholder: t('meal_search_hint'), 'aria-label': t('meal_search_hint'), oninput: (e) => {
    clearTimeout(timer);
    const q = e.target.value.trim();
    if (q.length < 2) { results.replaceChildren(); return; }
    timer = setTimeout(async () => {
      results.replaceChildren(h('div', { class: 'results' }, h('div', { class: 'hint' }, t('loading'))));
      try {
        const found = await api('GET', 'food/search?q=' + encodeURIComponent(q));
        results.replaceChildren(h('div', { class: 'results' }, found.length
          ? found.map((f) => h('button', { type: 'button', onclick: () => addFood(f) }, h('span', {}, f.name), icon('add')))
          : h('div', { class: 'hint' }, t('food_no_results'))));
      } catch (err) {
        results.replaceChildren(h('div', { class: 'results' }, h('div', { class: 'hint error-text' }, err.status === 502 ? t('food_unavailable') : t('error_generic'))));
      }
    }, 350);
  } });
  async function addFood(f) {
    try {
      const per100 = await api('GET', 'food/' + f.number);
      d.ingredients.push({ foodNumber: f.number, name: f.name, grams: 100, per100 });
      render();
    } catch (err) {
      snackbar(err.status === 502 ? t('food_unavailable') : t('error_generic'));
    }
  }

  async function save() {
    const body = { id: d.id, name: (d.name || '').trim(), description: (d.description || '').trim(), ingredients: d.ingredients };
    if (!body.name) { snackbar(t('error_generic')); return; }
    if (!d.ingredients.length) {
      for (const key of ['kcal', 'protein', 'fat', 'carbs']) {
        const v = parseNumber(d[key]);
        if (Number.isNaN(v)) { snackbar(t('error_generic')); return; }
        body[key] = v === null ? null : Math.round(v);
      }
    }
    await act('PUT', 'meals', body, { closeView: true });
  }

  if (d.ingredients.length) showTotals();
  return h('div', {},
    editorHead(d.id ? d.name : t('meal_new')),
    h('section', { class: 'card' },
      h('div', { class: 'form-grid' },
        field(t('name'), textInput('name', { maxlength: '200' }), 'wide'),
        field(t('meal_description'), h('textarea', { oninput: (e) => { d.description = e.target.value; } }, d.description || ''), 'wide'))),
    h('section', { class: 'card' },
      h('h3', {}, t('meal_ingredients')),
      h('p', { class: 'muted small' }, t('meal_ingredients_help')),
      ingredients,
      d.ingredients.length ? totals : h('div', { class: 'form-grid section' },
        field(t('meal_kcal'), textInput('kcal', { inputmode: 'numeric' })),
        field(t('meal_protein'), textInput('protein', { inputmode: 'numeric' })),
        field(t('meal_fat'), textInput('fat', { inputmode: 'numeric' })),
        field(t('meal_carbs'), textInput('carbs', { inputmode: 'numeric' }))),
      h('div', { class: 'section' }, h('div', { class: 'search' }, icon('search'), search), results),
      h('p', { class: 'muted small' }, t('food_source'))),
    h('div', { class: 'actions-bar' },
      d.id ? btn(t('delete'), async () => {
        if (await confirmDelete(d.name, t('meal_delete_text'))) act('DELETE', 'meals/' + d.id, undefined, { closeView: true });
      }, 'text danger', 'delete') : null,
      h('span', { class: 'spacer' }),
      btn(t('cancel'), () => { S.view = null; render(); }),
      btn(t('save'), save, 'filled')));
}

// ---------- Uppgifter ----------

function taskSummary(task) {
  const days = task.weekdays.map(weekdayName).join(', ');
  const kind = task.recurrence === 'EVERY_N_DAYS' ? t('task_every_n_days') + ' (' + task.interval + ')'
    : task.recurrence === 'RELATIVE' ? t('task_evening_before') + ': ' + days
      : days + (task.interval > 1 ? ' (' + task.interval + ')' : '');
  return hhmm(task.time) + ' · ' + kind;
}

function tasksView() {
  const tasks = [...S.schedule.tasks].sort((a, b) => a.time - b.time);
  return h('div', {},
    pageHead(t('tab_tasks'), t('tasks_help'), fab(t('task_new'), () => openTask(null))),
    h('div', { class: 'list' }, tasks.map((task) => item(() => openTask(task),
      h('div', { class: 'grow' }, h('div', { class: 'name' }, task.title), h('div', { class: 'line' }, taskSummary(task))))),
    tasks.length ? null : h('p', { class: 'empty' }, '–')));
}

function openTask(task) {
  openView({
    kind: 'task',
    draft: task ? JSON.parse(JSON.stringify(task))
      : { id: null, title: '', notes: '', recurrence: 'WEEKLY', weekdays: [], interval: 1, time: 20 * 60, measurementTypes: '' },
  });
}

function taskEditor() {
  const d = S.view.draft;
  const measures = () => (d.measurementTypes ? d.measurementTypes.split(',').filter(Boolean) : []);
  const radio = (value, label) => h('label', { class: 'option' },
    h('input', { type: 'radio', name: 'rec', checked: d.recurrence === value, onchange: () => { d.recurrence = value; render(); } }),
    label);
  const usesDays = d.recurrence !== 'EVERY_N_DAYS';
  async function save() {
    if (!d.title.trim()) { snackbar(t('error_generic')); return; }
    if (usesDays && !d.weekdays.length) { snackbar(t('task_weekdays_required')); return; }
    await act('PUT', 'tasks', {
      id: d.id, title: d.title.trim(), notes: d.notes.trim(), recurrence: d.recurrence,
      weekdays: d.weekdays, interval: Number(d.interval) || 1, time: d.time, measurementTypes: d.measurementTypes,
    }, { closeView: true });
  }
  return h('div', {},
    editorHead(d.id ? d.title : t('task_new')),
    h('section', { class: 'card' },
      h('div', { class: 'form-grid' },
        field(t('task_title'), h('input', { value: d.title, maxlength: '200', oninput: (e) => { d.title = e.target.value; } }), 'wide'),
        field(t('task_notes'), h('textarea', { oninput: (e) => { d.notes = e.target.value; } }, d.notes), 'wide'))),
    h('section', { class: 'card stack' },
      h('h3', {}, t('task_repeat')),
      h('div', { class: 'options' },
        radio('WEEKLY', t('task_weekly')),
        radio('EVERY_N_DAYS', t('task_every_n_days')),
        radio('RELATIVE', t('task_evening_before'))),
      usesDays ? h('div', { class: 'chips' }, DAYS.map((day) => chip(weekdayName(day), d.weekdays.includes(day), () => {
        d.weekdays = d.weekdays.includes(day) ? d.weekdays.filter((x) => x !== day) : [...d.weekdays, day].sort();
        render();
      }))) : null,
      h('div', { class: 'inline' },
        d.recurrence !== 'RELATIVE' ? field(d.recurrence === 'EVERY_N_DAYS' ? t('task_interval_days') : t('task_interval_weeks'),
          h('input', { type: 'number', class: 'num', min: '1', max: d.recurrence === 'EVERY_N_DAYS' ? '30' : '8', value: d.interval,
            oninput: (e) => { d.interval = e.target.value; } })) : null,
        field(t('time'), timeInput(d.time, (v) => { d.time = v; })))),
    h('section', { class: 'card' },
      h('h3', {}, t('task_measure')),
      h('p', { class: 'muted small' }, t('task_measure_help')),
      h('div', { class: 'chips' }, S.schedule.measurementTypes.map((m) => {
        const on = measures().includes(m.key);
        return chip(m.name, on, () => {
          const set = new Set(measures());
          if (on) set.delete(m.key); else set.add(m.key);
          d.measurementTypes = S.schedule.measurementTypes.map((x) => x.key).filter((k) => set.has(k)).join(',');
          render();
        });
      }))),
    h('div', { class: 'actions-bar' },
      d.id ? btn(t('delete'), async () => {
        if (await confirmDelete(d.title)) act('DELETE', 'tasks/' + d.id, undefined, { closeView: true });
      }, 'text danger', 'delete') : null,
      h('span', { class: 'spacer' }),
      btn(t('cancel'), () => { S.view = null; render(); }),
      btn(t('save'), save, 'filled')));
}

// ---------- Pass ----------

function workoutById(id) { return S.training.workouts.find((w) => w.id === id); }
function exerciseById(id) { return S.training.exercises.find((e) => e.id === id); }
function openWorkout(id) { openView({ kind: 'workout', id, drafts: {} }); }

function workoutsView() {
  const library = S.training.workouts.filter((w) => !w.programId);
  return h('div', {},
    pageHead(t('tab_workouts'), t('workouts_help'), fab(t('workout_new'), async () => {
      const name = await askName(t('workout_new'));
      if (!name) return;
      const result = await act('POST', 'workouts', { name });
      if (result && result.id) openWorkout(result.id);
    })),
    h('div', { class: 'list' }, library.map((w, index) => item(() => openWorkout(w.id),
      h('div', { class: 'grow' },
        h('div', { class: 'name' }, w.name),
        h('div', { class: 'line' }, w.exercises.map((x) => (exerciseById(x.exerciseId) || {}).name).filter(Boolean).join(', ') || t('workout_empty')),
        w.places.length ? h('div', { class: 'line' }, t('workout_also_in', w.places.join(', '))) : null),
      iconBtn('chevron', t('move_up'), () => act('POST', 'workouts/' + w.id + '/move', { delta: -1 }), { disabled: index === 0, rotate: -90 }),
      iconBtn('chevron', t('move_down'), () => act('POST', 'workouts/' + w.id + '/move', { delta: 1 }), { disabled: index === library.length - 1, rotate: 90 }))),
    library.length ? null : h('p', { class: 'empty' }, '–')));
}

function setsToRows(sets) {
  return sets.map((s) => ({
    id: s.id,
    type: s.type,
    reps: s.reps === null ? '' : String(s.reps),
    weight: s.weight === null ? '' : fmtInput(s.weight, 2),
    time: s.seconds === null ? '' : Math.floor(s.seconds / 60) + ':' + pad(s.seconds % 60),
    distance: s.distanceMeters === null ? '' : fmtInput(s.distanceMeters / 1000, 2),
  }));
}

function parseDuration(text) {
  const s = (text || '').trim();
  if (!s) return null;
  const m = /^(\d+)(?::(\d{1,2}))?$/.exec(s);
  if (!m) return NaN;
  return m[2] === undefined ? Number(m[1]) * 60 : Number(m[1]) * 60 + Number(m[2]);
}

function workoutEditor() {
  const w = workoutById(S.view.id);
  if (!w) return editorHead('');
  const drafts = S.view.drafts;
  const program = w.programId ? S.training.programs.find((p) => p.id === w.programId) : null;

  const exerciseResults = h('div', {});
  const exerciseSearch = h('input', { type: 'search', placeholder: t('workout_find_exercise'), 'aria-label': t('workout_find_exercise'), oninput: (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) { exerciseResults.replaceChildren(); return; }
    const found = S.training.exercises.filter((x) => x.name.toLowerCase().includes(q)).slice(0, 30);
    const typed = e.target.value.trim();
    exerciseResults.replaceChildren(h('div', { class: 'results' },
      found.map((x) => h('button', {
        type: 'button', onclick: () => act('POST', 'workouts/' + w.id + '/exercises', { exerciseId: x.id }),
      }, h('span', {}, x.name, x.muscle ? h('span', { class: 'muted' }, ' · ' + x.muscle) : null), icon('add'))),
      h('button', { type: 'button', class: 'create', onclick: () => openExercise(null, { name: typed, addTo: w.id, back: S.view }) },
        h('span', {}, t('exercise_create_named', typed)), icon('edit'))));
  } });

  return h('div', {},
    h('div', { class: 'page-head editor' },
      iconBtn('back', t('back'), () => { S.view = null; render(); }),
      h('div', { class: 'titles', style: null }, h('h1', {}, w.name), program ? h('div', { class: 'sub' }, program.name) : null),
      h('span', { class: 'spacer grow' }),
      iconBtn('edit', t('rename'), async () => {
        const name = await askName(t('rename'), w.name);
        if (name) act('PUT', 'workouts/' + w.id, { name });
      }),
      iconBtn('delete', t('delete'), async () => {
        const extra = w.programId ? t('workout_delete_program') : t('workout_delete_library');
        if (await confirmDelete(w.name, extra)) act('DELETE', 'workouts/' + w.id, undefined, { closeView: true });
      }, { danger: true })),
    w.differs ? h('div', { class: 'banner' },
      h('span', {}, t('workout_differs', w.places.join(', '))),
      btn(t('workout_save_everywhere'), () => act('POST', 'workouts/' + w.id + '/save-everywhere')))
      : (w.places.length ? h('p', { class: 'muted' }, t('workout_also_in', w.places.join(', '))) : null),
    w.exercises.length ? null : h('section', { class: 'card' }, h('p', { class: 'empty' }, t('workout_empty'))),
    // Superset (SS1): övningar efter varandra med samma grupp visas i en ram.
    supersetBlocks(w.exercises).map((block) => block.length > 1
      ? h('div', { class: 'superset' }, h('div', { class: 'superset-label' }, t('superset_label')),
          block.map((it) => exerciseCard(w, it, w.exercises.indexOf(it), drafts)))
      : exerciseCard(w, block[0], w.exercises.indexOf(block[0]), drafts)),
    h('section', { class: 'card' },
      h('h3', {}, t('workout_add_exercise')),
      h('div', { class: 'search' }, icon('search'), exerciseSearch),
      exerciseResults));
}

/** Superset med nästa / Ta ur superset för en övning (SS1). */
function supersetButtons(w, it, index) {
  const next = w.exercises[index + 1];
  const prev = w.exercises[index - 1];
  const linkedNext = it.superset && next && next.superset === it.superset;
  const inSuperset = it.superset && (linkedNext || (prev && prev.superset === it.superset));
  return [
    next && !linkedNext ? btn(t('superset_link'), () => act('POST', 'workout-exercises/' + it.id + '/superset', { link: true }), 'text') : null,
    inSuperset ? btn(t('superset_unlink'), () => act('POST', 'workout-exercises/' + it.id + '/superset', { link: false }), 'text') : null,
  ];
}

/** Övningarna i block: samma supersetgrupp efter varandra blir ett block (SS1). */
function supersetBlocks(exercises) {
  const blocks = [];
  exercises.forEach((it, i) => {
    const prev = exercises[i - 1];
    if (it.superset && prev && prev.superset === it.superset) blocks[blocks.length - 1].push(it);
    else blocks.push([it]);
  });
  return blocks;
}

function exerciseCard(w, it, index, drafts) {
  const ex = exerciseById(it.exerciseId) || { name: '?', mode: 'WEIGHT_REPS', muscle: '' };
  if (!drafts[it.id]) drafts[it.id] = setsToRows(it.sets);
  const rows = drafts[it.id];
  const mode = ex.mode;
  const unit = S.training.unit;
  const input = (row, key, attrs) => h('input', Object.assign({ value: row[key], oninput: (e) => { row[key] = e.target.value; } }, attrs));

  const cols = ['110px'];
  const head = [h('span', { class: 'head' }, '')];
  if (mode !== 'TIME') { cols.push('96px'); head.push(h('span', { class: 'head' }, t('set_reps'))); }
  if (mode === 'WEIGHT_REPS') { cols.push('110px'); head.push(h('span', { class: 'head' }, t('set_weight', unit))); }
  if (mode === 'TIME') {
    cols.push('120px', '110px');
    head.push(h('span', { class: 'head' }, t('set_time')), h('span', { class: 'head' }, t('set_distance')));
  }
  cols.push('40px');
  head.push(h('span', {}));

  const ordered = [...rows.filter((r) => r.type === 'WARMUP'), ...rows.filter((r) => r.type !== 'WARMUP')];
  let work = 0;
  const cells = ordered.flatMap((row) => {
    const warm = row.type === 'WARMUP';
    if (!warm) work += 1;
    const out = [h('span', { class: 'kind' + (warm ? ' warm' : '') }, warm ? t('set_warmup') : t('set_work') + ' ' + work)];
    if (mode !== 'TIME') out.push(input(row, 'reps', { inputmode: 'numeric', 'aria-label': t('set_reps') }));
    if (mode === 'WEIGHT_REPS') out.push(input(row, 'weight', { inputmode: 'decimal', 'aria-label': t('set_weight', unit) }));
    if (mode === 'TIME') {
      out.push(input(row, 'time', { 'aria-label': t('set_time') }));
      out.push(input(row, 'distance', { inputmode: 'decimal', 'aria-label': t('set_distance') }));
    }
    out.push(iconBtn('delete', t('set_remove'), () => { rows.splice(rows.indexOf(row), 1); render(); }));
    return out;
  });
  const grid = h('div', { class: 'sets' }, head, cells);
  grid.style.gridTemplateColumns = cols.join(' ');

  async function saveSets() {
    const sets = [];
    for (const row of ordered) {
      const reps = parseNumber(row.reps);
      const weight = parseNumber(row.weight);
      const seconds = parseDuration(row.time);
      const km = parseNumber(row.distance);
      if ([reps, weight, seconds, km].some(Number.isNaN)) { snackbar(t('error_generic')); return; }
      sets.push({
        id: row.id || null,
        type: row.type,
        reps: mode !== 'TIME' && reps !== null ? Math.round(reps) : null,
        weight: mode === 'WEIGHT_REPS' ? weight : null,
        seconds: mode === 'TIME' ? seconds : null,
        distanceMeters: mode === 'TIME' && km !== null ? Math.round(km * 1000) : null,
      });
    }
    if (!sets.some((s) => s.type === 'WORK')) { snackbar(t('sets_need_work')); return; }
    delete drafts[it.id];
    await act('PUT', 'workout-exercises/' + it.id + '/sets', { sets });
  }

  const blank = (type) => ({ id: null, type, reps: '', weight: '', time: '', distance: '' });
  return h('section', { class: 'card' },
    h('div', { class: 'card-head' },
      h('div', { class: 'titles' }, h('h2', {}, ex.name), ex.muscle ? h('div', { class: 'muted small' }, ex.muscle) : null),
      h('div', { class: 'actions' },
        iconBtn('chevron', t('move_up'), () => act('POST', 'workout-exercises/' + it.id + '/move', { delta: -1 }), { disabled: index === 0, rotate: -90 }),
        iconBtn('chevron', t('move_down'), () => act('POST', 'workout-exercises/' + it.id + '/move', { delta: 1 }), { disabled: index === w.exercises.length - 1, rotate: 90 }),
        iconBtn('delete', t('delete'), async () => {
          if (await confirmDelete(ex.name)) { delete drafts[it.id]; act('DELETE', 'workout-exercises/' + it.id); }
        }, { danger: true }))),
    grid,
    h('div', { class: 'btn-row section' },
      btn(t('set_add'), () => {
        const workRows = rows.filter((r) => r.type !== 'WARMUP');
        const last = workRows[workRows.length - 1];
        rows.push(last ? Object.assign({}, last, { id: null }) : blank('WORK'));
        render();
      }, 'text', 'add'),
      btn(t('set_add_warmup'), () => { rows.unshift(blank('WARMUP')); render(); }, 'text', 'add'),
      supersetButtons(w, it, index),
      h('span', { class: 'spacer' }),
      btn(t('sets_save'), saveSets, 'tonal')));
}

// ---------- Övningar ----------

function optionName(list, key) { return (list.find((x) => x.key === key) || {}).name || ''; }
function exerciseLine(x) {
  return [x.muscle, optionName(S.training.equipment, x.equipment), optionName(S.training.modes, x.mode)].filter(Boolean).join(' · ');
}

function exercisesView() {
  const f = S.exerciseFilter || (S.exerciseFilter = { q: '', group: null });
  const list = h('div', { class: 'list' });
  const fill = () => {
    const q = f.q.trim().toLowerCase();
    const found = S.training.exercises.filter((x) => (!f.group || x.muscleGroup === f.group) && (!q || x.name.toLowerCase().includes(q)));
    list.replaceChildren(...found.map((x) => item(() => openExercise(x),
      h('div', { class: 'grow' },
        h('div', { class: 'name' }, x.name, x.builtIn ? null : h('span', { class: 'badge' }, t('exercise_custom'))),
        h('div', { class: 'line' }, exerciseLine(x))))));
    if (!found.length) list.appendChild(h('p', { class: 'empty' }, t('exercise_none_found')));
  };
  fill();
  return h('div', {},
    pageHead(t('tab_exercises'), t('exercises_help'), fab(t('exercise_new'), () => openExercise(null))),
    h('div', { class: 'filters' },
      h('div', { class: 'search' }, icon('search'),
        h('input', { type: 'search', value: f.q, placeholder: t('workout_find_exercise'), 'aria-label': t('workout_find_exercise'),
          oninput: (e) => { f.q = e.target.value; fill(); } })),
      h('div', { class: 'chips' },
        chip(t('exercise_all'), !f.group, () => { f.group = null; render(); }),
        S.training.muscleGroups.map((g) => chip(g.name, f.group === g.key, () => { f.group = f.group === g.key ? null : g.key; render(); })))),
    list);
}

/** Öppnar en övning. Inbyggda visas som läsvy, egna och nya som formulär. [addTo]: lägg in den nya övningen i passet. */
function openExercise(x, { name = '', addTo = null, back = null } = {}) {
  openView({
    kind: 'exercise',
    back,
    addTo,
    draft: x ? JSON.parse(JSON.stringify(x)) : {
      id: null, name, builtIn: false, instructions: '',
      muscleGroup: S.training.muscleGroups[0].key, equipment: S.training.equipment[0].key, mode: S.training.modes[0].key,
    },
  });
}

function leaveExercise() {
  S.view = S.view.back || null;
  render();
}

function exerciseEditor() {
  const v = S.view;
  const d = v.draft;
  const head = h('div', { class: 'page-head editor' },
    iconBtn('back', t('back'), leaveExercise),
    h('div', { class: 'titles' }, h('h1', {}, d.id ? d.name : t('exercise_new')), d.id ? h('div', { class: 'sub' }, exerciseLine(d)) : null));

  if (d.builtIn) {
    const steps = (d.instructions || '').split('\n').map((x) => x.trim()).filter(Boolean);
    return h('div', {},
      head,
      h('section', { class: 'card' },
        h('h3', {}, t('how_to')),
        steps.length ? h('ol', { class: 'steps' }, steps.map((x) => h('li', {}, x))) : h('p', { class: 'muted' }, t('no_instructions'))),
      h('div', { class: 'banner' },
        h('span', {}, t('exercise_builtin_note')),
        btn(t('exercise_new'), () => openView({
          kind: 'exercise', back: v.back, addTo: v.addTo,
          draft: Object.assign({}, d, { id: null, builtIn: false }),
        }), 'text', 'add')));
  }

  const select = (key, options) => h('select', { onchange: (e) => { d[key] = e.target.value; } },
    options.map((o) => h('option', { value: o.key, selected: o.key === d[key] }, o.name)));
  async function save() {
    if (!(d.name || '').trim()) { snackbar(t('error_generic')); return; }
    const result = await act('PUT', 'exercises', {
      id: d.id, name: d.name.trim(), muscleGroup: d.muscleGroup, equipment: d.equipment, mode: d.mode, instructions: (d.instructions || '').trim(),
    });
    if (!result) return;
    if (v.addTo && !d.id) await act('POST', 'workouts/' + v.addTo + '/exercises', { exerciseId: result.id });
    leaveExercise();
  }
  return h('div', {},
    head,
    h('section', { class: 'card' },
      h('div', { class: 'form-grid' },
        field(t('name'), h('input', { value: d.name, maxlength: '200', oninput: (e) => { d.name = e.target.value; } }), 'wide'),
        field(t('muscle_group'), select('muscleGroup', S.training.muscleGroups)),
        field(t('equipment'), select('equipment', S.training.equipment)),
        field(t('mode'), select('mode', S.training.modes)),
        field(t('instructions'), h('textarea', { rows: '5', oninput: (e) => { d.instructions = e.target.value; } }, d.instructions || ''), 'wide')),
      h('p', { class: 'muted small' }, t('instructions_help'))),
    h('div', { class: 'actions-bar' },
      d.id ? btn(t('delete'), async () => {
        if (await confirmDelete(d.name, t('exercise_delete_text'))) {
          const ok = await act('DELETE', 'exercises/' + d.id);
          if (ok) leaveExercise();
        }
      }, 'text danger', 'delete') : null,
      h('span', { class: 'spacer' }),
      btn(t('cancel'), leaveExercise),
      btn(t('save'), save, 'filled')));
}

// ---------- Program ----------

function programsView() {
  const tr = S.training;
  const library = tr.workouts.filter((w) => !w.programId);
  const wrap = h('div', {}, pageHead(t('tab_programs'), t('programs_help'), fab(t('program_new'), async () => {
    const name = await askName(t('program_new'));
    if (name) act('POST', 'programs', { name });
  })));
  tr.programs.forEach((p) => {
    const workouts = tr.workouts.filter((w) => w.programId === p.id);
    const byDays = p.scheduleMode === 'WEEKDAYS';
    const pick = h('select', { 'aria-label': t('program_add_workout') },
      h('option', { value: '' }, t('choose')),
      library.map((w) => h('option', { value: w.id }, w.name)));
    wrap.appendChild(h('section', { class: 'card' + (p.active ? ' active' : '') },
      h('div', { class: 'card-head' },
        h('div', { class: 'titles' },
          h('h2', {}, p.name),
          h('div', { class: 'sub' }, workouts.map((w) => w.name).join(byDays ? ', ' : ' → ') || t('program_empty'))),
        h('div', { class: 'actions' },
          p.active ? h('span', { class: 'label-active' }, t('program_active')) : null,
          iconBtn('edit', t('rename'), async () => {
            const name = await askName(t('rename'), p.name);
            if (name) act('PUT', 'programs/' + p.id, { name });
          }),
          iconBtn('delete', t('delete'), async () => {
            if (await confirmDelete(p.name, t('program_delete_text'))) act('DELETE', 'programs/' + p.id);
          }, { danger: true }))),
      h('div', { class: 'btn-row section' },
        h('div', { class: 'chips' }, ['ORDER', 'WEEKDAYS'].map((mode) => chip(
          mode === 'ORDER' ? t('program_mode_order') : t('program_mode_weekdays'), p.scheduleMode === mode,
          () => { if (p.scheduleMode !== mode) act('PUT', 'programs/' + p.id + '/mode', { mode }); }))),
        h('span', { class: 'spacer' }),
        btn(p.active ? t('program_deactivate') : t('program_activate'),
          () => act('POST', 'programs/' + p.id + '/active', { active: !p.active }), p.active ? 'outlined' : 'tonal')),
      workouts.length ? h('ul', { class: 'rows section' }, workouts.map((w, index) => h('li', {},
        h('div', { class: 'grow' },
          h('div', { class: 'strong' }, w.name),
          w.differs ? h('div', { class: 'small muted' }, t('workout_differs', w.places.join(', '))) : null,
          byDays ? h('div', { class: 'chips section' }, DAYS.map((d) => chip(weekdayName(d), w.weekdays.includes(d), () => {
            const days = w.weekdays.includes(d) ? w.weekdays.filter((x) => x !== d) : [...w.weekdays, d];
            act('PUT', 'workouts/' + w.id + '/weekdays', { weekdays: days });
          }))) : null),
        byDays ? null : iconBtn('chevron', t('move_up'), () => act('POST', 'workouts/' + w.id + '/move', { delta: -1 }), { disabled: index === 0, rotate: -90 }),
        byDays ? null : iconBtn('chevron', t('move_down'), () => act('POST', 'workouts/' + w.id + '/move', { delta: 1 }), { disabled: index === workouts.length - 1, rotate: 90 }),
        iconBtn('edit', t('edit'), () => openWorkout(w.id)),
        iconBtn('delete', t('delete'), async () => {
          if (await confirmDelete(w.name, t('workout_delete_program'))) act('DELETE', 'workouts/' + w.id);
        }, { danger: true })))) : null,
      h('div', { class: 'add-row' },
        pick,
        btn(t('program_add_workout'), () => {
          if (pick.value) act('POST', 'programs/' + p.id + '/workouts', { workoutId: pick.value });
          else pick.focus();
        }, 'tonal', 'add'))));
  });
  return wrap;
}

// ---------- Start ----------

async function start() {
  try {
    const res = await fetch('/api/texts');
    const data = await res.json();
    T = data.texts;
    LANG = data.lang;
    document.documentElement.lang = LANG;
    document.title = t('title');
  } catch (e) {
    S.offline = true;
  }
  try {
    await api('GET', 'session');
    S.loggedIn = true;
    render();
    await refresh();
  } catch (e) {
    render();
  }
}

// Ändringar gjorda i telefonen syns när man kommer tillbaka till fönstret.
window.addEventListener('focus', () => { if (S.loggedIn && !S.view && !document.querySelector('dialog[open]')) refresh(); });
start();
