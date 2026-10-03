const Homework = {
  filter: { status: 'open', subject: 'all' },
  PRIORITY: { 1: 'High', 2: 'Medium', 3: 'Low' },

  // Imports a Pomodoro Logger JSON export; tasks already imported (same source card id) are skipped.
  async importFile(file) {
    try {
      const tasks = PomodoroImport.parse(JSON.parse(await file.text()));
      const known = new Set(Store.data.homework.map((x) => x.sourceId).filter(Boolean));
      const fresh = tasks.filter((t) => !known.has(t.sourceId));
      for (const t of fresh) Store.data.homework.push({ id: Store.id(), ...t });
      const subjects = new Set(fresh.map((t) => t.subject).filter(Boolean));
      commit();
      openNotice('Import complete', [
        `Added ${fresh.length} assignment${fresh.length === 1 ? '' : 's'}` + (subjects.size ? ` from ${[...subjects].join(', ')}.` : '.'),
        tasks.length > fresh.length ? `Skipped ${tasks.length - fresh.length} already imported.` : null,
      ].filter(Boolean));
    } catch (e) {
      openNotice('Import failed', [e instanceof SyntaxError ? 'That file is not valid JSON.' : e.message]);
    }
  },

  edit(task) {
    const isNew = !task;
    openForm({
      title: isNew ? 'New assignment' : 'Edit assignment',
      fields: [
        { name: 'title', label: 'Title', value: task?.title, required: true },
        { name: 'subject', label: 'Subject', value: task?.subject, placeholder: 'e.g. Math' },
        { name: 'due', label: 'Due date', type: 'date', value: isNew ? todayStr() : task.due },
        { name: 'priority', label: 'Priority', type: 'select', value: task?.priority || 2, options: [[1, 'High'], [2, 'Medium'], [3, 'Low']] },
        { name: 'notes', label: 'Notes / checklist', type: 'textarea', value: task?.notes, placeholder: '[ ] first step\n[x] finished step' },
      ],
      onSubmit: (v) => {
        const rec = { title: v.title.trim(), subject: v.subject.trim(), due: v.due, priority: Number(v.priority), notes: v.notes.trim() };
        if (isNew) Store.data.homework.push({ id: Store.id(), done: false, ...rec });
        else Object.assign(task, rec);
        commit();
      },
      onDelete: isNew ? null : () => {
        Store.data.homework = Store.data.homework.filter((x) => x !== task);
        commit();
      },
      submitLabel: isNew ? 'Add' : 'Save',
    });
  },

  checklist(notes) {
    const lines = (notes || '').split('\n').filter((l) => /^\s*\[[ xX]?\]/.test(l));
    return { total: lines.length, done: lines.filter((l) => /^\s*\[[xX]\]/.test(l)).length };
  },

  row(task) {
    const overdue = !task.done && task.due && task.due < todayStr();
    const cl = this.checklist(task.notes);
    return h('div', { class: 'row-item' + (task.done ? ' done' : '') },
      h('button', {
        class: 'check' + (task.done ? ' on' : ''),
        onclick: () => { task.done = !task.done; commit(); },
      }, task.done ? '✓' : ''),
      h('div', { class: 'grow', onclick: () => this.edit(task) },
        h('div', { class: 'title' }, task.title),
        h('div', { class: 'meta' },
          task.subject && h('span', { class: 'tag' }, task.subject), ' ',
          h('span', { class: overdue ? 'overdue' : '' }, !task.due ? 'No due date' : (overdue ? 'Overdue · ' : 'Due ') + prettyDate(task.due)),
          cl.total ? ` · ${cl.done}/${cl.total} done` : '')),
      h('span', { class: 'prio p' + task.priority }, this.PRIORITY[task.priority]));
  },

  render() {
    const all = Store.data.homework;
    const subjects = [...new Set(all.map((x) => x.subject).filter(Boolean))].sort();
    if (this.filter.subject !== 'all' && !subjects.includes(this.filter.subject)) this.filter.subject = 'all';
    let list = all.filter((x) => {
      if (this.filter.status === 'open' && x.done) return false;
      if (this.filter.status === 'done' && !x.done) return false;
      return this.filter.subject === 'all' || x.subject === this.filter.subject;
    });
    list.sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999') || a.priority - b.priority);

    const sel = (value, opts, key) => h('select', {
      class: 'inline-select',
      onchange: (e) => { this.filter[key] = e.target.value; rerender(); },
    }, opts.map(([v, l]) => h('option', { value: v, selected: v === value }, l)));

    return h('section', {},
      pageHeader('Homework', 'What\'s due, and when.', [
        sel(this.filter.status, [['open', 'Open'], ['done', 'Done'], ['all', 'All']], 'status'),
        sel(this.filter.subject, [['all', 'All subjects'], ...subjects.map((s) => [s, s])], 'subject'),
        h('button', { class: 'btn ghost', onclick: () => document.getElementById('importFile').click() }, 'Import…'),
        h('button', { class: 'btn primary', onclick: () => this.edit() }, '+ New assignment'),
      ]),
      list.length === 0 ? emptyNote('Nothing here. Enjoy the free time.') :
        h('div', { class: 'card list' }, list.map((t) => this.row(t))));
  },
};
