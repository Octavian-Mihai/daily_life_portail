const DEFAULTS = () => ({
  habits: [],
  habitLog: {},
  homework: [],
  events: [],
  books: [],
  readingLog: {},
  settings: { readingGoal: 20 },
});

const Store = {
  data: DEFAULTS(),
  timer: null,

  async init() {
    let saved = null;
    try {
      saved = window.portailStore
        ? await window.portailStore.load()
        : JSON.parse(localStorage.getItem('portail-data') || 'null');
    } catch {}
    this.data = Object.assign(DEFAULTS(), saved || {});
    this.data.settings = Object.assign(DEFAULTS().settings, this.data.settings);
  },

  save() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      try {
        if (window.portailStore) window.portailStore.save(this.data);
        else localStorage.setItem('portail-data', JSON.stringify(this.data));
      } catch (e) {
        console.error('save failed', e);
      }
    }, 150);
  },

  id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },
};

window.addEventListener('beforeunload', () => {
  if (Store.timer) {
    clearTimeout(Store.timer);
    if (window.portailStore) window.portailStore.save(Store.data);
    else localStorage.setItem('portail-data', JSON.stringify(Store.data));
  }
});
