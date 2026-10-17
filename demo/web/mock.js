/* Webbläges-demo: svarar på appens /api i webbläsaren i stället för telefonen. Samma regler som WebApi.kt,
   förenklat. Påhittad exempeldata (data-sv.json / data-en.json, byggda av tools/build_web_demo.py).
   Ingenting sparas eller skickas – laddar man om sidan börjar demon om. Handskriven; skrivs inte över av bygget. */
(function () {
  'use strict';
  var LANG = /[?&]lang=en\b/.test(location.search) ? 'en' : 'sv';
  var realFetch = window.fetch.bind(window);
  var data = null, loggedIn = true, seq = 0;
  var NOTE = {
    sv: 'Det här är en demo med påhittad data. Ändringarna sparas bara tills du laddar om sidan – i appen sparas de direkt i telefonen.',
    en: 'This is a demo with made-up data. Changes are kept only until you reload the page – in the app they are saved straight to the phone.'
  };
  var ready = realFetch('data-' + LANG + '.json').then(function (r) { return r.json(); }).then(function (d) {
    d.texts.saved_note = NOTE[LANG];
    data = d;
  });

  function id(p) { seq += 1; return p + 'd' + seq; }
  function S() { return data.schedule; }
  function Tr() { return data.training; }
  function find(list, x) { return list.filter(function (e) { return e.id === x; })[0]; }
  function remove(list, x) { var i = list.findIndex(function (e) { return e.id === x; }); if (i >= 0) list.splice(i, 1); }
  function txt(v) { v = typeof v === 'string' ? v.trim() : ''; if (!v || v.length > 200) throw err(400, 'text'); return v; }
  function time(b) { var v = b.time; if (!(v >= 0 && v < 1440)) throw err(400, 'time'); return Math.floor(v); }
  function days(b) { return (b.weekdays || []).filter(function (d) { return d >= 1 && d <= 7; }).sort(); }
  function num(v) { return typeof v === 'number' && v >= 0 && v <= 100000 ? Math.round(v) : null; }
  function err(status, code) { var e = new Error(code); e.status = status; return e; }
  function move(list, item, delta) {
    var i = list.indexOf(item), j = i + (delta > 0 ? 1 : -1);
    if (i < 0 || j < 0 || j >= list.length) return;
    list[i] = list[j]; list[j] = item;
  }
  function workoutOf(itemId) { return Tr().workouts.filter(function (w) { return w.exercises.some(function (e) { return e.id === itemId; }); })[0]; }
  function exercise(x) { return find(Tr().exercises, x); }
  /** Supersetgrupper som bara har en övning kvar tas bort, som i appen (Supersets.normalize). */
  function normalize(w) {
    var count = {};
    w.exercises.forEach(function (e) { if (e.superset) count[e.superset] = (count[e.superset] || 0) + 1; });
    w.exercises.forEach(function (e) { if (e.superset && count[e.superset] < 2) e.superset = null; });
  }
  /** Som "spara överallt" i appen (B97): kopiorna av ett pass i biblioteket och programmen följer med. */
  function sync(w) {
    if (!w || !w.group) return;
    Tr().workouts.forEach(function (o) {
      if (o === w || o.group !== w.group) return;
      o.name = w.name;
      o.exercises = JSON.parse(JSON.stringify(w.exercises));
      o.exercises.forEach(function (e) { e.id = id('we'); e.sets.forEach(function (set) { set.id = id('s'); }); });
    });
  }
  /** "Finns även i": de andra platserna där passet finns. */
  function withPlaces(tr) {
    tr.workouts.forEach(function (w) {
      var names = [];
      tr.workouts.forEach(function (o) {
        if (o === w || !w.group || o.group !== w.group) return;
        var n = o.programId ? ((find(tr.programs, o.programId) || {}).name || '') : tr.libraryTitle;
        if (names.indexOf(n) < 0) names.push(n);
      });
      w.places = names; w.differs = false;
    });
    return tr;
  }
  function initialSets(ex) {
    return [0, 1, 2].map(function () {
      return { id: id('s'), type: 'WORK', reps: ex.mode === 'TIME' ? null : (ex.mode === 'REPS' ? 10 : 8), weight: null,
        seconds: ex.mode === 'TIME' ? 30 : null, distanceMeters: null };
    });
  }

  function handle(method, path, query, b) {
    var s = path.split('/');
    var k = method + ' ' + s[0] + (s.length > 1 ? '/:id' : '') + (s.length > 2 ? '/' + s[2] : '');
    if (k === 'GET texts') return { lang: data.lang, texts: data.texts };
    if (k === 'POST login') { if (!String(b.code || '').trim()) throw err(401, 'wrong'); loggedIn = true; return {}; }
    if (k === 'POST logout') { loggedIn = false; return {}; }
    if (!loggedIn) throw err(401, 'login');
    var sch = S(), tr = Tr(), x, w, it;
    switch (k) {
      case 'GET session': return {};
      case 'GET schedule': return sch;
      case 'GET training': return withPlaces(tr);
      // Dagprofiler
      case 'POST profiles': sch.profiles.push({ id: id('p'), name: txt(b.name), weekdays: [] }); return {};
      case 'PUT profiles/:id': find(sch.profiles, s[1]).name = txt(b.name); return {};
      case 'POST profiles/:id/weekday':
        if (!(b.day >= 1 && b.day <= 7)) throw err(400, 'day');
        sch.profiles.forEach(function (p) { p.weekdays = p.weekdays.filter(function (d) { return d !== b.day; }); });
        x = find(sch.profiles, s[1]); x.weekdays.push(b.day); x.weekdays.sort(); return {};
      case 'DELETE profiles/:id':
        x = find(sch.profiles, s[1]);
        if (x && x.weekdays.length) throw err(409, 'profile_has_days');
        remove(sch.profiles, s[1]); sch.items = sch.items.filter(function (i) { return i.profileId !== s[1]; }); return {};
      // Måltider i dagtyper
      case 'POST plan-items': sch.items.push({ id: id('i'), profileId: txt(b.profileId), mealId: txt(b.mealId), time: time(b) }); return {};
      case 'PUT plan-items/:id': find(sch.items, s[1]).time = time(b); return {};
      case 'DELETE plan-items/:id': remove(sch.items, s[1]); return {};
      // Måltider
      case 'PUT meals':
        var ing = (b.ingredients || []).map(function (i) { return { foodNumber: i.foodNumber, name: txt(i.name), grams: i.grams, per100: i.per100 || {} }; });
        var tot = function (key) {
          var any = false, sum = ing.reduce(function (a, i) { var v = i.per100[key]; if (v != null) any = true; return a + (v || 0) * i.grams / 100; }, 0);
          return any ? Math.round(sum) : null;
        };
        var m = b.id ? find(sch.meals, b.id) : null;
        if (!m) { m = { id: id('m') }; sch.meals.push(m); }
        m.name = txt(b.name); m.description = (b.description || '').trim(); m.ingredients = ing;
        if (ing.length) { m.kcal = tot('kcal'); m.protein = tot('proteinG'); m.fat = tot('fatG'); m.carbs = tot('carbsG'); }
        else { m.kcal = num(b.kcal); m.protein = num(b.protein); m.fat = num(b.fat); m.carbs = num(b.carbs); }
        return { id: m.id };
      case 'DELETE meals/:id': remove(sch.meals, s[1]); sch.items = sch.items.filter(function (i) { return i.mealId !== s[1]; }); return {};
      // Uppgifter
      case 'PUT tasks':
        var rec = b.recurrence, wd = days(b);
        if (rec !== 'EVERY_N_DAYS' && !wd.length) throw err(400, 'weekdays');
        var task = b.id ? find(sch.tasks, b.id) : null;
        if (!task) { task = { id: id('t') }; sch.tasks.push(task); }
        task.title = txt(b.title); task.notes = (b.notes || '').trim(); task.recurrence = rec;
        task.weekdays = rec === 'EVERY_N_DAYS' ? [] : wd; task.time = time(b);
        task.interval = rec === 'RELATIVE' ? 1 : Math.min(Math.max(b.interval || 1, 1), rec === 'EVERY_N_DAYS' ? 30 : 8);
        task.measurementTypes = b.measurementTypes || ''; return {};
      case 'DELETE tasks/:id': remove(sch.tasks, s[1]); return {};
      // Livsmedel: några exempelvärden (appen hämtar Livsmedelsverkets data)
      case 'GET food/:id':
        if (s[1] === 'search') {
          var q = (query.get('q') || '').trim().toLowerCase();
          return data.foods.filter(function (f) { return q && f.name.toLowerCase().indexOf(q) > -1; }).map(function (f) { return { number: f.number, name: f.name }; });
        }
        x = data.foods.filter(function (f) { return String(f.number) === s[1]; })[0];
        if (!x) throw err(404, 'food'); return x.per100;
      // Pass
      case 'POST workouts':
        x = { id: id('w'), programId: null, name: txt(b.name), weekdays: [], differs: false, places: [], exercises: [] };
        tr.workouts.push(x); return { id: x.id };
      case 'PUT workouts/:id': w = find(tr.workouts, s[1]); w.name = txt(b.name); sync(w); return {};
      case 'DELETE workouts/:id': remove(tr.workouts, s[1]); return {};
      case 'POST workouts/:id/move':
        w = find(tr.workouts, s[1]);
        var group = tr.workouts.filter(function (o) { return o.programId === w.programId; });
        var j = group.indexOf(w) + (b.delta > 0 ? 1 : -1);
        if (j >= 0 && j < group.length) { var a = tr.workouts.indexOf(w), c = tr.workouts.indexOf(group[j]); tr.workouts[a] = group[j]; tr.workouts[c] = w; }
        return {};
      case 'PUT workouts/:id/weekdays': find(tr.workouts, s[1]).weekdays = days(b); return {};
      case 'POST workouts/:id/save-everywhere': return {};
      case 'POST workouts/:id/exercises':
        x = exercise(b.exerciseId); if (!x) throw err(404, 'exercise');
        w = find(tr.workouts, s[1]); w.exercises.push({ id: id('we'), exerciseId: x.id, superset: null, sets: initialSets(x) }); sync(w); return {};
      case 'PUT workout-exercises/:id/sets':
        var sets = (b.sets || []).map(function (o) {
          return { id: o.id || id('s'), type: o.type === 'WARMUP' ? 'WARMUP' : 'WORK', reps: o.reps == null ? null : o.reps,
            weight: o.weight == null ? null : o.weight, seconds: o.seconds == null ? null : o.seconds, distanceMeters: o.distanceMeters == null ? null : o.distanceMeters };
        });
        if (!sets.some(function (o) { return o.type === 'WORK'; })) throw err(400, 'sets');
        sets.sort(function (p, q2) { return (p.type === 'WARMUP' ? 0 : 1) - (q2.type === 'WARMUP' ? 0 : 1); });
        w = workoutOf(s[1]); find(w.exercises, s[1]).sets = sets; sync(w); return {};
      case 'POST workout-exercises/:id/move':
        w = workoutOf(s[1]); move(w.exercises, find(w.exercises, s[1]), b.delta); normalize(w); sync(w); return {};
      case 'POST workout-exercises/:id/superset':
        w = workoutOf(s[1]); it = find(w.exercises, s[1]);
        if (b.link) {
          var next = w.exercises[w.exercises.indexOf(it) + 1];
          if (next) { var g = it.superset || next.superset || id('g'); it.superset = g; next.superset = g; }
        } else it.superset = null;
        normalize(w); sync(w); return {};
      case 'DELETE workout-exercises/:id': w = workoutOf(s[1]); remove(w.exercises, s[1]); normalize(w); sync(w); return {};
      // Egna övningar
      case 'PUT exercises':
        x = b.id ? exercise(b.id) : null;
        if (x && x.builtIn) throw err(409, 'built_in');
        if (!x) { x = { id: id('x'), builtIn: false }; tr.exercises.push(x); }
        x.name = txt(b.name); x.muscleGroup = b.muscleGroup; x.equipment = b.equipment; x.mode = b.mode;
        x.instructions = (b.instructions || '').slice(0, 4000);
        x.muscle = (tr.muscleGroups.filter(function (g2) { return g2.key === b.muscleGroup; })[0] || {}).name || '';
        tr.exercises.sort(function (p, q2) { return p.name.localeCompare(q2.name, LANG); });
        return { id: x.id };
      case 'DELETE exercises/:id':
        x = exercise(s[1]); if (x && x.builtIn) throw err(409, 'built_in'); remove(tr.exercises, s[1]); return {};
      // Program
      case 'POST programs': x = { id: id('pr'), name: txt(b.name), active: false, scheduleMode: 'ORDER' }; tr.programs.push(x); return { id: x.id };
      case 'PUT programs/:id': find(tr.programs, s[1]).name = txt(b.name); return {};
      case 'DELETE programs/:id':
        remove(tr.programs, s[1]); tr.workouts = tr.workouts.filter(function (o) { return o.programId !== s[1]; }); return {};
      case 'POST programs/:id/active': tr.programs.forEach(function (p) { p.active = !!b.active && p.id === s[1]; }); return {};
      case 'PUT programs/:id/mode': find(tr.programs, s[1]).scheduleMode = b.mode; return {};
      case 'POST programs/:id/workouts':
        w = find(tr.workouts, b.workoutId); if (!w) throw err(404, 'workout');
        var copy = JSON.parse(JSON.stringify(w));
        if (!w.group) w.group = id('grp');
        copy.id = id('w'); copy.programId = s[1]; copy.weekdays = []; copy.group = w.group;
        copy.exercises.forEach(function (e) { e.id = id('we'); e.sets.forEach(function (set) { set.id = id('s'); }); });
        tr.workouts.push(copy); return {};
    }
    throw err(404, 'not_found');
  }

  window.fetch = function (input, opts) {
    var url = new URL(typeof input === 'string' ? input : input.url, location.href);
    var i = url.pathname.indexOf('/api/');
    if (i < 0) return realFetch(input, opts);
    var path = url.pathname.slice(i + 5), method = (opts && opts.method) || 'GET';
    return ready.then(function () {
      var status = 200, body;
      try {
        body = handle(method, path, url.searchParams, opts && opts.body ? JSON.parse(opts.body) : {});
      } catch (e) {
        status = e.status || 500; body = { error: e.message };
      }
      // En liten fördröjning så att det känns som ett riktigt anrop.
      return new Promise(function (r) { setTimeout(r, 60); }).then(function () {
        return new Response(JSON.stringify(body), { status: status, headers: { 'Content-Type': 'application/json' } });
      });
    });
  };
})();
