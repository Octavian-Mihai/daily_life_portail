const Homework = {
  filter: { status: 'open', subject: 'all' },
  PRIORITY: { 1: 'High', 2: 'Medium', 3: 'Low' },

  edit(task) {
    const isNew = !task;
    openForm({
      title: isNew ? 'New assignment' : 'Edit assignment',
      fields: [
        { name: 'title', label: 'Title', value: task?.title, required: true },
        { name: 'subject', label: 'Subject', value: task?.subject, placeholder: 'e.g. Math' },
        { name: 'due', label: 'Due date', type: 'date', value: task?.due || todayStr(), required: true },
        { name: 'priority', label: 'Priority', type: 'select', value: task?.priority || 2, options: [[1, 'High'], [2, 'Medium'], [3, 'Low']] },
      ],
      onSubmit: (v) => {
        const rec = { title: v.title.trim(), subject: v.subject.trim(), due: v.due, priority: Number(v.priority) };
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

  row(task) {
    const overdue = !task.done && task.due < todayStr();
    return h('div', { class: 'row-item' + (task.done ? ' done' : '') },
      h('button', {
        class: 'check' + (task.done ? ' on' : ''),
        onclick: () => { task.done = !task.done; commit(); },
      }, task.done ? '✓' : ''),
      h('div', { class: 'grow', onclick: () => this.edit(task) },
        h('div', { class: 'title' }, task.title),
        h('div', { class: 'meta' },
          task.subject && h('span', { class: 'tag' }, task.subject), ' ',
          h('span', { class: overdue ? 'overdue' : '' }, (overdue ? 'Overdue · ' : 'Due ') + prettyDate(task.due)))),
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
    list.sort((a, b) => a.due.localeCompare(b.due) || a.priority - b.priority);

    const sel = (value, opts, key) => h('select', {
      class: 'inline-select',
      onchange: (e) => { this.filter[key] = e.target.value; rerender(); },
    }, opts.map(([v, l]) => h('option', { value: v, selected: v === value }, l)));

    return h('section', {},
      pageHeader('Homework', 'What\'s due, and when.', [
        sel(this.filter.status, [['open', 'Open'], ['done', 'Done'], ['all', 'All']], 'status'),
        sel(this.filter.subject, [['all', 'All subjects'], ...subjects.map((s) => [s, s])], 'subject'),
        h('button', { class: 'btn primary', onclick: () => this.edit() }, '+ New assignment'),
      ]),
      list.length === 0 ? emptyNote('Nothing here. Enjoy the free time.') :
        h('div', { class: 'card list' }, list.map((t) => this.row(t))));
  },
};
