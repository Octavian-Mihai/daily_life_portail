const Today = {
  greeting() {
    const hr = new Date().getHours();
    return hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  },

  render() {
    const t = todayStr();
    const habits = Habits.active().filter((x) => Habits.scheduled(x, t));
    const habitsDone = habits.filter((x) => Habits.done(x, t)).length;
    const hw = Store.data.homework.filter((x) => !x.done && x.due && x.due <= t).sort((a, b) => a.due.localeCompare(b.due));
    const upcoming = Store.data.homework.filter((x) => !x.done && x.due > t && x.due <= addDays(t, 7)).sort((a, b) => a.due.localeCompare(b.due));
    const evs = Calendar.eventsOn(t);

    return h('section', {},
      pageHeader(this.greeting() + '.', longDate(t)),
      h('div', { class: 'today-grid' },
        h('div', { class: 'card' },
          h('div', { class: 'row-between' }, h('h3', {}, 'Habits'), h('span', { class: 'meta' }, habits.length ? `${habitsDone}/${habits.length}` : '')),
          habits.length === 0 ? emptyNote('No habits scheduled today.') :
            habits.map((hb) => h('div', { class: 'row-item' + (Habits.done(hb, t) ? ' done' : '') },
              h('button', { class: 'check' + (Habits.done(hb, t) ? ' on' : ''), onclick: () => Habits.toggle(hb, t) }, Habits.done(hb, t) ? '✓' : ''),
              h('div', { class: 'grow title' }, `${hb.emoji} ${hb.name}`),
              h('span', { class: 'meta' }, `🔥 ${Habits.streaks(hb).current}`)))),

        h('div', { class: 'card' },
          h('h3', {}, 'Homework'),
          hw.length === 0 ? emptyNote('Nothing due today.') : hw.map((x) => Homework.row(x)),
          upcoming.length ? h('div', {}, h('h4', {}, 'Next 7 days'), upcoming.map((x) => Homework.row(x))) : null),

        h('div', { class: 'card' },
          h('div', { class: 'row-between' }, h('h3', {}, 'Today\'s events'),
            h('button', { class: 'btn ghost small', onclick: () => Calendar.edit(null, t) }, '+ Add')),
          evs.length === 0 ? emptyNote('Nothing on the calendar.') :
            evs.map((e) => h('div', { class: 'ag-item', onclick: () => Calendar.edit(e) },
              h('i', { class: 'dot c-' + e.color }), h('span', { class: 'time' }, e.time || 'All day'), h('span', {}, e.title)))),

        h('div', { class: 'card' },
          h('div', { class: 'row-between' }, h('h3', {}, 'Reading'),
            h('button', { class: 'btn ghost small', onclick: () => Reading.quickLog() }, 'Log pages')),
          Reading.goalCard(),
          Store.data.books.filter((b) => b.status === 'reading').map((b) => h('div', { class: 'meta', style: { marginTop: '8px' } },
            `📖 ${b.title}` + (b.pages ? ` — ${b.current}/${b.pages}` : ''))))));
  },
};
