/* ----- Student Manager with Edit/Update/Delete, Search, Dark Mode, localStorage ----- */

/* ---------- Utilities ---------- */
const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);

function saveToStorage(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}
function readFromStorage(key){
  const v = localStorage.getItem(key);
  return v ? JSON.parse(v) : null;
}

/* ---------- App State ---------- */
let students = readFromStorage('sms_students') || []; // array of objects {id,name,email,phone,course}
let editId = null; // id of student currently editing

/* ---------- DOM Elements ---------- */
const form = $('studentForm');
const addBtn = $('addBtn');
const resetBtn = $('resetBtn');
const tbody = qs('#studentTable tbody');
const noData = $('noData');
const searchInput = $('searchInput');
const clearSearch = $('clearSearch');
const themeToggle = $('themeToggle');

/* ---------- Helpers ---------- */
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

function clearForm(){
  form.reset();
  editId = null;
  addBtn.textContent = 'Add Student';
  // focus first input
  $('name').focus();
}

function setEditMode(student){
  editId = student.id;
  $('name').value = student.name;
  $('email').value = student.email;
  $('phone').value = student.phone;
  $('course').value = student.course;
  addBtn.textContent = 'Update Student';
}

/* ---------- Render Table ---------- */
function renderTable(list = students){
  tbody.innerHTML = '';
  if (!list.length){
    noData.style.display = 'block';
    return;
  } else {
    noData.style.display = 'none';
  }

  list.forEach(stu => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(stu.name)}</td>
      <td>${escapeHtml(stu.email)}</td>
      <td>${escapeHtml(stu.phone)}</td>
      <td>${escapeHtml(stu.course)}</td>
      <td class="actions-col">
        <div class="action-group">
          <button class="action-btn edit-btn" data-id="${stu.id}" title="Edit">Edit</button>
          <button class="action-btn delete-btn" data-id="${stu.id}" title="Delete">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* small escape helper */
function escapeHtml(str = ''){
  return String(str).replace(/[&<>"']/g, s=>{
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s];
  });
}

/* ---------- CRUD ---------- */
function addOrUpdateStudent(e){
  e.preventDefault();
  const name = $('name').value.trim();
  const email = $('email').value.trim();
  const phone = $('phone').value.trim();
  const course = $('course').value.trim();

  if (!name || !email || !phone || !course){
    alert('Please fill all fields');
    return;
  }

  if (editId){
    // UPDATE
    students = students.map(s => s.id === editId ? {...s, name, email, phone, course} : s);
    editId = null;
    addBtn.textContent = 'Add Student';
  } else {
    // CREATE
    const newStu = { id: uid(), name, email, phone, course };
    students.unshift(newStu); // newest on top
  }

  saveToStorage('sms_students', students);
  renderTable(filterBy(searchInput.value));
  clearForm();
}

function deleteStudentById(id){
  if (!confirm('Delete this student?')) return;
  students = students.filter(s => s.id !== id);
  saveToStorage('sms_students', students);
  renderTable(filterBy(searchInput.value));
}

/* ---------- Search ---------- */
function filterBy(query){
  query = (query || '').trim().toLowerCase();
  if (!query) return students;
  return students.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.email.toLowerCase().includes(query) ||
    s.course.toLowerCase().includes(query)
  );
}

/* ---------- Events ---------- */
form.addEventListener('submit', addOrUpdateStudent);
resetBtn.addEventListener('click', clearForm);

tbody.addEventListener('click', (ev) => {
  const btn = ev.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.classList.contains('edit-btn')){
    const stu = students.find(s => s.id === id);
    if (stu) setEditMode(stu);
  } else if (btn.classList.contains('delete-btn')){
    deleteStudentById(id);
  }
});

/* search */
searchInput.addEventListener('input', (e)=>{
  const q = e.target.value;
  renderTable(filterBy(q));
});
clearSearch.addEventListener('click', ()=>{
  searchInput.value = '';
  renderTable(students);
});

/* theme (persist) */
function applyTheme(theme){
  if (theme === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');
  saveToStorage('sms_theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', ()=>{
  const isDark = document.body.classList.toggle('dark');
  applyTheme(isDark ? 'dark' : 'light');
});

/* ---------- Init ---------- */
(function init(){
  // load theme
  const savedTheme = readFromStorage('sms_theme') || 'light';
  applyTheme(savedTheme);

  // initial render
  renderTable(students);

  // focus
  $('name').focus();
})();
