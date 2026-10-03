// Tiny DOM helper: h('div', {class:'x', onclick:fn}, child, ...)
function h(tag, attrs, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'class') node.className = v;
    else if (k === 'value') node.value = v;
    else if (k === 'checked') node.checked = !!v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    node.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return node;
}

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const parseYmd = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (s, n) => {
  const d = parseYmd(s);
  d.setDate(d.getDate() + n);
  return ymd(d);
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const prettyDate = (s) => {
  const d = parseYmd(s);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
};
const longDate = (s) => {
  const d = parseYmd(s);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// Re-render hook set by app.js
let rerender = () => {};
function commit() {
  Store.save();
  rerender();
}

// Modal form. fields: [{name,label,type,value,options,placeholder,required}]
function openForm({ title, fields, submitLabel = 'Save', onSubmit, onDelete }) {
  const modal = document.getElementById('modal');
  const inputs = {};
  const form = h('form', { class: 'card modal-card' }, h('h3', {}, title));
  for (const f of fields) {
    let input;
    if (f.type === 'select') {
      input = h('select', {}, f.options.map((o) => {
        const [val, label] = Array.isArray(o) ? o : [o, o];
        return h('option', { value: val, selected: String(val) === String(f.value) }, label);
      }));
    } else {
      input = h('input', {
        type: f.type || 'text',
        value: f.value ?? '',
        placeholder: f.placeholder,
        required: f.required,
        min: f.min,
        step: f.step,
      });
    }
    inputs[f.name] = input;
    form.append(h('label', { class: 'field' }, h('span', {}, f.label), input));
  }
  const close = () => modal.classList.add('hidden');
  form.append(
    h('div', { class: 'row-end' },
      onDelete && h('button', { type: 'button', class: 'btn danger', onclick: () => { onDelete(); close(); } }, 'Delete'),
      h('span', { class: 'grow' }),
      h('button', { type: 'button', class: 'btn ghost', onclick: close }, 'Cancel'),
      h('button', { type: 'submit', class: 'btn primary' }, submitLabel)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const out = {};
    for (const f of fields) out[f.name] = inputs[f.name].value;
    onSubmit(out);
    close();
  });
  modal.replaceChildren(form);
  modal.classList.remove('hidden');
  modal.onclick = (e) => { if (e.target === modal) close(); };
  const first = form.querySelector('input,select');
  if (first) first.focus();
}

function emptyNote(text) {
  return h('p', { class: 'empty' }, text);
}

function pageHeader(title, subtitle, actions) {
  return h('header', { class: 'page-head' },
    h('div', {}, h('h2', {}, title), subtitle && h('p', { class: 'hand' }, subtitle)),
    h('div', { class: 'actions' }, actions));
}
