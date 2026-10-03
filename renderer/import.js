// Import for Pomodoro Logger exports ({boards, lists, cards, ...}).
// Board -> subject, card -> homework task, card in the board's doneList -> done.
// Pure functions (no DOM) so they can also run under node.
const PomodoroImport = {
  isExport(json) {
    return !!json && typeof json === 'object' && json.boards && json.lists && json.cards;
  },

  localYmd(ms) {
    const d = new Date(ms);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  },

  // Returns [{sourceId, title, subject, due, priority, done, notes}]
  parse(json) {
    if (!this.isExport(json)) throw new Error('This file is not a Pomodoro Logger export.');
    const tasks = [];
    const seen = new Set();

    for (const board of Object.values(json.boards)) {
      for (const listId of board.lists || []) {
        const list = json.lists[listId];
        if (!list) continue;
        for (const cardId of list.cards || []) {
          const card = json.cards[cardId];
          if (!card || seen.has(cardId)) continue;
          seen.add(cardId);
          tasks.push(this.toTask(card, board.name || '', listId === board.doneList));
        }
      }
    }
    // cards that sit in no list
    for (const card of Object.values(json.cards)) {
      if (!seen.has(card._id)) tasks.push(this.toTask(card, '', false));
    }
    return tasks;
  },

  toTask(card, subject, inDoneList) {
    const notes = (card.content || '').trim();
    const lines = notes.split('\n').filter((l) => /^\s*\[[ xX]?\]/.test(l));
    const allChecked = lines.length > 0 && lines.every((l) => /^\s*\[[xX]\]/.test(l));
    return {
      sourceId: card._id,
      title: (card.title || 'Untitled').trim(),
      subject: subject.trim(),
      due: card.dueTime ? this.localYmd(card.dueTime) : '',
      priority: 2,
      done: inDoneList || allChecked,
      notes,
    };
  },
};

if (typeof module !== 'undefined') module.exports = PomodoroImport;
