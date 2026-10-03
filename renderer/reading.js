const Reading = {
  pagesToday() {
    return Store.data.readingLog[todayStr()] || 0;
  },

  // Adds pages to today's log; if bookId given, advances that book too
  logPages(n, book) {
    if (!(n > 0)) return;
    const log = Store.data.readingLog;
    const t = todayStr();
    log[t] = (log[t] || 0) + n;
    if (book) {
      book.current = Math.min(book.pages || Infinity, book.current + n);
      if (book.pages && book.current >= book.pages) book.status = 'finished';
      else if (book.status === 'to-read') book.status = 'reading';
    }
    commit();
  },

  quickLog() {
    const reading = Store.data.books.filter((b) => b.status === 'reading');
    openForm({
      title: 'Log reading',
      fields: [
        { name: 'pages', label: 'Pages read', type: 'number', value: 10, min: 1, required: true },
        { name: 'book', label: 'Book', type: 'select', value: reading[0]?.id || '', options: [['', '(no book)'], ...reading.map((b) => [b.id, b.title])] },
      ],
      onSubmit: (v) => this.logPages(Number(v.pages), Store.data.books.find((b) => b.id === v.book)),
      submitLabel: 'Log',
    });
  },

  edit(book) {
    const isNew = !book;
    openForm({
      title: isNew ? 'New book' : 'Edit book',
      fields: [
        { name: 'title', label: 'Title', value: book?.title, required: true },
        { name: 'author', label: 'Author', value: book?.author },
        { name: 'pages', label: 'Total pages', type: 'number', value: book?.pages || '', min: 1 },
        { name: 'current', label: 'Current page', type: 'number', value: book?.current || 0, min: 0 },
        { name: 'status', label: 'Status', type: 'select', value: book?.status || 'reading', options: [['reading', 'Reading'], ['to-read', 'To read'], ['finished', 'Finished']] },
      ],
      onSubmit: (v) => {
        const pages = Number(v.pages) || 0;
        let current = Number(v.current) || 0;
        if (pages) current = Math.min(current, pages);
        const rec = { title: v.title.trim(), author: v.author.trim(), pages, current, status: v.status };
        if (rec.status === 'finished' && pages) rec.current = pages;
        if (isNew) Store.data.books.push({ id: Store.id(), ...rec });
        else Object.assign(book, rec);
        commit();
      },
      onDelete: isNew ? null : () => {
        Store.data.books = Store.data.books.filter((x) => x !== book);
        commit();
      },
      submitLabel: isNew ? 'Add' : 'Save',
    });
  },

  goalCard() {
    const goal = Store.data.settings.readingGoal;
    const done = this.pagesToday();
    const pct = Math.min(100, goal ? Math.round((done / goal) * 100) : 0);
    return h('div', { class: 'goal' },
      h('div', { class: 'bar' }, h('i', { style: { width: pct + '%' } })),
      h('div', { class: 'meta' }, `${done} / ${goal} pages today`));
  },

  bookCard(b) {
    const pct = b.pages ? Math.round((b.current / b.pages) * 100) : 0;
    return h('div', { class: 'card book' },
      h('div', { class: 'book-top' },
        h('div', { class: 'grow' }, h('div', { class: 'title' }, b.title), h('div', { class: 'meta' }, b.author || '—')),
        h('button', { class: 'btn ghost small', onclick: () => this.edit(b) }, 'Edit')),
      h('div', { class: 'bar' }, h('i', { style: { width: pct + '%' } })),
      h('div', { class: 'meta' }, b.pages ? `${b.current} / ${b.pages} pages · ${pct}%` : `Page ${b.current}`));
  },

  render() {
    const books = Store.data.books;
    const group = (status, label) => {
      const list = books.filter((b) => b.status === status);
      return list.length ? h('div', {}, h('h3', { class: 'group' }, `${label} · ${list.length}`), h('div', { class: 'book-grid' }, list.map((b) => this.bookCard(b)))) : null;
    };
    return h('section', {},
      pageHeader('Reading', 'A few pages a day.', [
        h('button', { class: 'btn ghost', onclick: () => this.quickLog() }, 'Log pages'),
        h('button', { class: 'btn primary', onclick: () => this.edit() }, '+ New book'),
      ]),
      h('div', { class: 'card' },
        h('div', { class: 'row-between' },
          h('h3', {}, 'Daily goal'),
          h('button', { class: 'btn ghost small', onclick: () => openForm({
            title: 'Daily reading goal',
            fields: [{ name: 'goal', label: 'Pages per day', type: 'number', value: Store.data.settings.readingGoal, min: 1, required: true }],
            onSubmit: (v) => { Store.data.settings.readingGoal = Number(v.goal) || 20; commit(); },
          }) }, 'Change')),
        this.goalCard()),
      books.length === 0 ? emptyNote('No books yet. Add what you\'re reading.') : null,
      group('reading', 'Reading now'), group('to-read', 'To read'), group('finished', 'Finished'));
  },
};
