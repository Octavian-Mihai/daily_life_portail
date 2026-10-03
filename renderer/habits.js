const Habits = {
  scheduled(habit, dateStr) {
    if (!habit.days || habit.days.length === 0) return true;
    return habit.days.includes(parseYmd(dateStr).getDay());
  },

  done(habit, dateStr) {
    return (Store.data.habitLog[dateStr] || []).includes(habit.id);
  },

  toggle(habit, dateStr) {
    const log = Store.data.habitLog;
    const list = log[dateStr] || (log[dateStr] = []);
    const i = list.indexOf(habit.id);
    if (i >= 0) list.splice(i, 1);
    else list.push(habit.id);
    if (!list.length) delete log[dateStr];
    commit();
  },

  active() {
    return Store.data.habits.filter((x) => !x.archived);
  },

  streaks(habit) {
    const t = todayStr();
    // current: walk back over scheduled days; today may still be pending
    let current = 0;
    let d = t;
    for (let i = 0; i < 3660; i++) {
      if (this.scheduled(habit, d)) {
        if (this.done(habit, d)) current++;
        else if (d !== t) break;
      }
      d = addDays(d, -1);
    }
    // best: scan from earliest log date
    const dates = Object.keys(Store.data.habitLog).sort();
    let best = 0;
    if (dates.length) {
      let run = 0;
      for (let day = dates[0]; day <= t; day = addDays(day, 1)) {
        if (!this.scheduled(habit, day)) continue;
        if (this.done(habit, day)) { run++; best = Math.max(best, run); }
        else run = 0;
      }
    }
    return { current, best: Math.max(best, current) };
  },

  heatmap(habit) {
    const t = todayStr();
    const weeks = 12;
    // end on this week's Saturday, start 12 weeks earlier on Sunday
    const end = addDays(t, 6 - parseYmd(t).getDay());
    const start = addDays(end, -(weeks * 7 - 1));
    const cols = [];
    for (let w = 0; w < weeks; w++) {
      const col = h('div', { class: 'hm-col' });
      for (let i = 0; i < 7; i++) {
        const day = addDays(start, w * 7 + i);
        const cls = ['hm-cell'];
        if (day > t) cls.push('future');
        else if (!this.scheduled(habit, day)) cls.push('off');
        else if (this.done(habit, day)) cls.push('on');
        col.append(h('div', { class: cls.join(' '), title: prettyDate(day) }));
      }
      cols.push(col);
    }
    return h('div', { class: 'heatmap' }, cols);
  },

  edit(habit) {
    const isNew = !habit;
    const wd = habit ? habit.days : [];
    openForm({
      title: isNew ? 'New habit' : 'Edit habit',
      fields: [
        { name: 'name', label: 'Name', value: habit?.name, required: true, placeholder: 'e.g. Stretch for 10 minutes' },
        { name: 'emoji', label: 'Emoji', value: habit?.emoji || '✦' },
        { name: 'days', label: 'Days', type: 'select', value: wd.length === 0 ? 'all' : wd.join(','),
          options: [['all', 'Every day'], ['1,2,3,4,5', 'Weekdays'], ['0,6', 'Weekends'], ['1,3,5', 'Mon / Wed / Fri'], ['2,4', 'Tue / Thu']] },
      ],
      onSubmit: (v) => {
        const days = v.days === 'all' ? [] : v.days.split(',').map(Number);
        if (isNew) Store.data.habits.push({ id: Store.id(), name: v.name.trim(), emoji: v.emoji.trim() || '✦', days, archived: false });
        else Object.assign(habit, { name: v.name.trim(), emoji: v.emoji.trim() || '✦', days });
        commit();
      },
      onDelete: isNew ? null : () => {
        habit.archived = true;
        commit();
      },
      submitLabel: isNew ? 'Add' : 'Save',
    });
  },

  render() {
    const t = todayStr();
    const list = this.active();
    return h('section', {},
      pageHeader('Habits', 'Small things, done daily.', h('button', { class: 'btn primary', onclick: () => this.edit() }, '+ New habit')),
      list.length === 0 ? emptyNote('No habits yet. Add one to start a streak.') :
        h('div', { class: 'stack' }, list.map((hb) => {
          const s = this.streaks(hb);
          const sched = this.scheduled(hb, t);
          return h('div', { class: 'card habit-card' },
            h('div', { class: 'habit-top' },
              h('button', {
                class: 'check big' + (this.done(hb, t) ? ' on' : ''),
                disabled: !sched,
                title: sched ? 'Toggle today' : 'Not scheduled today',
                onclick: () => this.toggle(hb, t),
              }, this.done(hb, t) ? '✓' : ''),
              h('div', { class: 'grow' },
                h('div', { class: 'habit-name' }, `${hb.emoji} ${hb.name}`),
                h('div', { class: 'meta' }, `${hb.days.length ? hb.days.map((d) => WEEKDAYS[d]).join(' · ') : 'Every day'}`)),
              h('div', { class: 'streak' }, h('b', {}, s.current), ' day streak', h('small', {}, `best ${s.best}`)),
              h('button', { class: 'btn ghost small', onclick: () => this.edit(hb) }, 'Edit')),
            this.heatmap(hb));
        })));
  },
};
