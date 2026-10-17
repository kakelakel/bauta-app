/* Bauta – interaktiv demo av appen på webbsidan. Påhittad exempeldata; allt sker i webbläsaren och
   ingenting sparas eller skickas. Varje <div data-demo="sv|en"> blir en egen telefon, eller monteras med BautaDemo.mount(el, lang). */
(function () {
  'use strict';

  var T = {
    sv: {
      locale: 'sv-SE', today: 'Idag', workout: 'Pass', home: 'Bauta',
      kcal: 'Kcal', protein: 'Protein', week: 'Pass i veckan', of: 'av', water: 'Vatten', addWater: '+ 2,5 dl',
      done: 'Gjort', undo: 'Ångra', later: '+30 min', doneAt: 'Gjort', streak: function (n) { return n + ' dagar i rad'; },
      perfect: 'Perfekt dag! Serien växer till 17 dagar.', waterGoal: 'Vattenmålet är nått.',
      allMeals: function (d, t) { return d + ' av ' + t + ' klara'; }, moved: function (m, t) { return m + ' flyttad till ' + t + '.'; },
      reset: 'Börja om', next: 'Nästa i kosten', nextWorkout: 'Nästa pass', start: 'Starta pass',
      workoutName: 'Helkropp A', rest: 'Vila', skip: 'Hoppa över', set: 'Set', finish: 'Avsluta passet',
      finished: 'Bra jobbat! Veckomålet är nått: 2 av 2 pass.', restDone: 'Vilan är slut – nästa set.',
      ex: [['Knäböj', '60 kg', 3, 8], ['Bänkpress', '45 kg', 3, 8], ['Rodd med hantel', '20 kg', 3, 10]],
      meals: [['Frukost', 450, 480, 32, 'Havregrynsgröt med blåbär och kvarg'], ['Lunch', 720, 650, 48, 'Kyckling, ris och ugnsrostade grönsaker'],
        ['Mellanmål', 930, 290, 20, 'Kesella med banan'], ['Middag', 1110, 620, 40, 'Lax, potatis och broccoli']],
      gProt: 'g protein', label: 'Interaktiv demo av appen'
    },
    en: {
      locale: 'en-GB', today: 'Today', workout: 'Workout', home: 'Bauta',
      kcal: 'Kcal', protein: 'Protein', week: 'Workouts this week', of: 'of', water: 'Water', addWater: '+ 2.5 dl',
      done: 'Done', undo: 'Undo', later: '+30 min', doneAt: 'Done', streak: function (n) { return n + ' days in a row'; },
      perfect: 'Perfect day! The streak grows to 17 days.', waterGoal: 'Water goal reached.',
      allMeals: function (d, t) { return d + ' of ' + t + ' done'; }, moved: function (m, t) { return m + ' moved to ' + t + '.'; },
      reset: 'Start over', next: 'Next in nutrition', nextWorkout: 'Next workout', start: 'Start workout',
      workoutName: 'Full body A', rest: 'Rest', skip: 'Skip', set: 'Set', finish: 'Finish workout',
      finished: 'Well done! Weekly goal reached: 2 of 2 workouts.', restDone: 'Rest is over – next set.',
      ex: [['Squat', '60 kg', 3, 8], ['Bench press', '45 kg', 3, 8], ['Dumbbell row', '20 kg', 3, 10]],
      meals: [['Breakfast', 450, 480, 32, 'Oatmeal with blueberries and quark'], ['Lunch', 720, 650, 48, 'Chicken, rice and roasted vegetables'],
        ['Snack', 930, 290, 20, 'Cottage cheese with banana'], ['Dinner', 1110, 620, 40, 'Salmon, potatoes and broccoli']],
      gProt: 'g protein', label: 'Interactive demo of the app'
    }
  };
  var GOAL_KCAL = 2100, GOAL_PROT = 140, WATER_GOAL = 2000, REST = 90;

  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (attrs[k] == null) return;
      if (k === 'text') el.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  function hhmm(m) { m = ((m % 1440) + 1440) % 1440; return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2); }

  function ring(value, goal, label, sub, color) {
    var r = 26, c = 2 * Math.PI * r, p = Math.min(value / goal, 1);
    var svg = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="' + r + '" fill="none" stroke="#DCE7DA" stroke-width="7"/>' +
      '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="7" stroke-linecap="round" transform="rotate(-90 32 32)" ' +
      'stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - p)).toFixed(1) + '"/></svg>';
    var el = h('div', { class: 'd-ring' });
    el.innerHTML = svg;
    el.appendChild(h('div', { class: 'd-ring-val' }, [h('b', { text: value }), h('small', { text: sub })]));
    el.appendChild(h('div', { class: 'd-ring-lbl', text: label }));
    return el;
  }

  function Demo(root, forced) {
    var lang = (forced || root.getAttribute('data-demo')) === 'en' ? 'en' : 'sv';
    var t = T[lang], nf = new Intl.NumberFormat(t.locale);
    var s, timer = null;

    function fresh() {
      s = {
        tab: 'today', water: 1250, msg: '', workoutDone: false, rest: 0,
        meals: t.meals.map(function (m, i) { return { name: m[0], time: m[1], kcal: m[2], prot: m[3], desc: m[4], done: i === 0 ? 459 : null }; }),
        sets: t.ex.map(function (e) { return [false, false, false].slice(0, e[2]); })
      };
    }

    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } s.rest = 0; }
    function startRest() {
      stopTimer(); s.rest = REST;
      timer = setInterval(function () {
        s.rest -= 1;
        if (s.rest <= 0) { stopTimer(); s.msg = t.restDone; }
        render();
      }, 1000);
    }

    function eaten() { return s.meals.reduce(function (a, m) { return m.done != null ? [a[0] + m.kcal, a[1] + m.prot] : a; }, [0, 0]); }

    function todayView() {
      var e = eaten(), doneCount = s.meals.filter(function (m) { return m.done != null; }).length;
      var all = doneCount === s.meals.length;
      var date = new Date().toLocaleDateString(t.locale, { weekday: 'long', day: 'numeric', month: 'long' });
      var rings = h('div', { class: 'd-card' }, [
        h('div', { class: 'd-row d-small' }, [h('span', { class: 'd-green', text: t.allMeals(doneCount, s.meals.length) })]),
        h('div', { class: 'd-rings' }, [
          ring(nf.format(e[0]), GOAL_KCAL, t.kcal, t.of + ' ' + nf.format(GOAL_KCAL), '#2F6B3F'),
          ring(nf.format(e[1]), GOAL_PROT, t.protein, t.of + ' ' + GOAL_PROT, '#2F6B3F'),
          ring(s.workoutDone ? 2 : 1, 2, t.week, t.of + ' 2', '#3E6577')
        ]),
        h('div', { class: 'd-water' }, [
          h('div', { class: 'd-water-txt' }, [h('span', { text: t.water }), h('span', { class: 'd-small', text: nf.format(s.water / 1000) + ' ' + t.of + ' 2 l' })]),
          h('div', { class: 'd-bar' }, [h('i', { style: 'width:' + Math.min(100, s.water / WATER_GOAL * 100) + '%' })]),
          h('button', { class: 'd-tonal', type: 'button', text: t.addWater, onclick: function () {
            s.water = Math.min(s.water + 250, 4000); s.msg = s.water >= WATER_GOAL ? t.waterGoal : ''; render();
          } })
        ]),
        h('p', { class: 'd-flame', text: '🔥 ' + t.streak(all ? 17 : 16) })
      ]);
      var list = s.meals.slice().sort(function (a, b) { return a.time - b.time; }).map(function (m) {
        var actions = m.done != null
          ? [h('span', { class: 'd-green', text: '✓ ' + t.doneAt + ' ' + hhmm(m.done) }), h('button', { class: 'd-text', type: 'button', text: t.undo, onclick: function () { m.done = null; s.msg = ''; render(); } })]
          : [h('button', { class: 'd-text', type: 'button', text: t.later, onclick: function () { m.time += 30; s.msg = t.moved(m.name, hhmm(m.time)); render(); } }),
             h('button', { class: 'd-filled', type: 'button', text: t.done, onclick: function () {
               m.done = m.time + 7; var a = s.meals.every(function (x) { return x.done != null; }); s.msg = a ? t.perfect : ''; render();
             } })];
        return h('div', { class: 'd-card d-meal' + (m.done != null ? ' is-done' : '') }, [
          h('div', { class: 'd-meal-head' }, [h('span', { class: 'd-time', text: hhmm(m.time) }), h('div', {}, [
            h('b', { text: m.name }), h('div', { class: 'd-small', text: nf.format(m.kcal) + ' kcal · ' + m.prot + ' ' + t.gProt }),
            h('div', { class: 'd-small d-muted', text: m.desc })
          ])]),
          h('div', { class: 'd-actions' }, actions)
        ]);
      });
      return [h('h4', { class: 'd-date', text: date.charAt(0).toUpperCase() + date.slice(1) }), rings].concat(list);
    }

    function workoutView() {
      var kids = [h('h4', { class: 'd-date', text: t.workoutName })];
      if (s.rest > 0) {
        kids.push(h('div', { class: 'd-card d-rest' }, [
          h('div', { class: 'd-small', text: t.rest }), h('div', { class: 'd-big', text: Math.floor(s.rest / 60) + ':' + ('0' + s.rest % 60).slice(-2) }),
          h('button', { class: 'd-text', type: 'button', text: t.skip, onclick: function () { stopTimer(); render(); } })
        ]));
      }
      t.ex.forEach(function (e, i) {
        kids.push(h('div', { class: 'd-card' }, [h('b', { text: e[0] })].concat(s.sets[i].map(function (on, j) {
          return h('label', { class: 'd-set' + (on ? ' is-done' : '') }, [
            h('input', { type: 'checkbox', checked: on ? 'checked' : null, onchange: function () {
              s.sets[i][j] = !s.sets[i][j]; s.msg = '';
              if (s.sets[i][j]) startRest(); render();
            } }),
            h('span', { text: t.set + ' ' + (j + 1) }), h('span', { text: e[1] + ' × ' + e[3] })
          ]);
        }))));
      });
      var allSets = s.sets.every(function (x) { return x.every(Boolean); });
      kids.push(h('button', { class: 'd-filled d-wide', type: 'button', text: t.finish, disabled: allSets && !s.workoutDone ? null : 'disabled', onclick: function () {
        s.workoutDone = true; stopTimer(); s.msg = t.finished; render();
      } }));
      return kids;
    }

    var screen = h('div', { class: 'd-screen' }), status = h('p', { class: 'd-status', 'aria-live': 'polite' });
    var tabs = h('div', { class: 'd-tabs', role: 'tablist' });

    function render() {
      screen.innerHTML = '';
      screen.appendChild(h('div', { class: 'd-appbar' }, [h('span', { text: t.home })]));
      (s.tab === 'today' ? todayView() : workoutView()).forEach(function (k) { screen.appendChild(k); });
      status.textContent = s.msg;
      tabs.innerHTML = '';
      [['today', t.today], ['workout', t.workout]].forEach(function (x) {
        tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': s.tab === x[0] ? 'true' : 'false', class: s.tab === x[0] ? 'on' : '', text: x[1], onclick: function () {
          if (s.tab !== x[0]) { s.tab = x[0]; s.msg = ''; screen.scrollTop = 0; render(); }
        } }));
      });
    }

    fresh();
    root.setAttribute('aria-label', t.label);
    root.appendChild(h('div', { class: 'd-phone' }, [screen, tabs]));
    root.appendChild(status);
    root.appendChild(h('button', { class: 'd-reset', type: 'button', text: t.reset, onclick: function () { stopTimer(); fresh(); render(); } }));
    render();
    this.stop = stopTimer;
  }

  var current = null;
  window.BautaDemo = { mount: function (el, lang) {
    if (current) current.stop();
    el.innerHTML = '';
    current = new Demo(el, lang);
  } };
  document.querySelectorAll('[data-demo]').forEach(function (el) { new Demo(el); });
})();
