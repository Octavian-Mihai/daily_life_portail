const Calendar = {
  month: (() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; })(),
  selected: todayStr(),
  COLORS: [['sage', 'Sage'], ['terracotta', 'Terracotta'], ['ink', 'Ink blue'], ['mustard', 'Mustard']],

  eventsOn(day) {
    return Store.data.events.filter((e) => e.date === day).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  },
  dueOn(day) {
    return Store.data.homework.filter((x) => x.due === day && !x.done);
  },

  edit(ev, date) {
    const isNew = !ev;
    openForm({
      title: isNew ? 'New event' : 'Edit event',
      fields: [
        { name: 'title', label: 'Title', value: ev?.title, required: true },
        { name: 'date', label: 'Date', type: 'date', value: ev?.date || date, required: true },
        { name: 'time', label: 'Time (optional)', type: 'time', value: ev?.time },
        { name: 'color', label: 'Color', type: 'select', value: ev?.color || 'sage', options: this.COLORS },
      ],
      onSubmit: (v) => {
        const rec = { title: v.title.trim(), date: v.date, time: v.time, color: v.color };
        if (isNew) Store.data.events.push({ id: Store.id(), ...rec });
        else Object.assign(ev, rec);
        this.selected = rec.date;
        commit();
      },
      onDelete: isNew ? null : () => {
        Store.data.events = Store.data.events.filter((x) => x !== ev);
        commit();
      },
      submitLabel: isNew ? 'Add' : 'Save',
    });
  },

  shift(delta) {
    let { y, m } = this.month;
    m += delta;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    this.month = { y, m };
    rerender();
  },

  grid() {
    const { y, m } = this.month;
    const first = new Date(y, m, 1);
    const start = addDays(ymd(first), -first.getDay());
    const t = todayStr();
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const day = addDays(start, i);
      const inMonth = parseYmd(day).getMonth() === m;
      const evs = this.eventsOn(day);
      const due = this.dueOn(day);
      cells.push(h('button', {
        class: ['cell', inMonth ? '' : 'dim', day === t ? 'today' : '', day === this.selected ? 'sel' : ''].join(' '),
        onclick: () => { this.selected = day; rerender(); },
      },
        h('span', { class: 'num' }, parseYmd(day).getDate()),
        h('div', { class: 'dots' },
          evs.slice(0, 4).map((e) => h('i', { class: 'dot c-' + e.color })),
          due.length ? h('i', { class: 'dot due' }) : null)));
    }
    return h('div', { class: 'cal-grid' },
      WEEKDAYS.map((d) => h('div', { class: 'cal-head' }, d)), cells);
  },

  agenda() {
    const day = this.selected;
    const evs = this.eventsOn(day);
    const due = this.dueOn(day);
    return h('div', { class: 'card agenda' },
      h('h3', {}, longDate(day)),
      evs.length === 0 && due.length === 0 ? emptyNote('Nothing planned.') : null,
      evs.map((e) => h('div', { class: 'ag-item', onclick: () => this.edit(e) },
        h('i', { class: 'dot c-' + e.color }),
        h('span', { class: 'time' }, e.time || 'All day'),
        h('span', {}, e.title))),
      due.map((x) => h('div', { class: 'ag-item' },
        h('i', { class: 'dot due' }), h('span', { class: 'time' }, 'Due'), h('span', {}, x.title + (x.subject ? ` · ${x.subject}` : '')))),
      h('button', { class: 'btn primary', style: { marginTop: '12px' }, onclick: () => this.edit(null, day) }, '+ Add event'));
  },

  render() {
    const { y, m } = this.month;
    return h('section', {},
      pageHeader('Calendar', `${MONTHS[m]} ${y}`, [
        h('button', { class: 'btn ghost', onclick: () => this.shift(-1) }, '‹'),
        h('button', { class: 'btn ghost', onclick: () => { const d = new Date(); this.month = { y: d.getFullYear(), m: d.getMonth() }; this.selected = todayStr(); rerender(); } }, 'Today'),
        h('button', { class: 'btn ghost', onclick: () => this.shift(1) }, '›'),
      ]),
      h('div', { class: 'cal-layout' }, h('div', { class: 'card' }, this.grid()), this.agenda()));
  },
};
