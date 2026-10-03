const TABS = [
  ['today', 'Today', Today],
  ['habits', 'Habits', Habits],
  ['homework', 'Homework', Homework],
  ['calendar', 'Calendar', Calendar],
  ['reading', 'Reading', Reading],
];
let currentTab = 'today';

function draw() {
  const nav = document.getElementById('nav');
  nav.replaceChildren(...TABS.map(([id, label]) =>
    h('button', {
      class: 'nav-item' + (id === currentTab ? ' active' : ''),
      onclick: () => { currentTab = id; draw(); },
    }, label)));
  const mod = TABS.find((t) => t[0] === currentTab)[2];
  const view = document.getElementById('view');
  const scroll = view.scrollTop;
  view.replaceChildren(mod.render());
  view.scrollTop = scroll;
  document.getElementById('sideDate').textContent = longDate(todayStr());
}

rerender = draw;

(async () => {
  await Store.init();
  draw();
  // refresh at midnight rollover
  let last = todayStr();
  setInterval(() => {
    if (todayStr() !== last) { last = todayStr(); draw(); }
  }, 60000);
})();
