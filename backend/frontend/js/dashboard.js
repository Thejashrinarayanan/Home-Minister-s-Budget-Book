// Backend URL
const BASE_URL = "https://home-minister-s-budget-book.onrender.com";

// Get token
const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
};

let expenses = [];
let chart;
let filter = "all";
let calendar;
let editingId = null;

// Quick category selection
function selectCategory(cat) {
  document.getElementById("category").value = cat;
}

// Toast
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.style.backgroundColor = type === "success" ? "#4caf50" : "#f44336";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// Logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// ADD / UPDATE EXPENSE
async function addExpense() {

  const category = document.getElementById("category").value.trim();
  const amount = Number(document.getElementById("amount").value.trim());
  const note = document.getElementById("note").value.trim();

  if (!category || isNaN(amount) || amount <= 0) {
    return showToast("Enter category and amount ❌", "error");
  }

  try {

    let url = `${BASE_URL}/api/expenses`;
    let method = "POST";

    if (editingId) {
      url = `${BASE_URL}/api/expenses/${editingId}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: authHeaders,
      body: JSON.stringify({ category, amount, note })
    });

    if (!res.ok) {
      if (res.status === 401) return logout();
      return showToast("Operation failed 😅", "error");
    }

    editingId = null;

    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";

    await loadExpenses();
    showToast("Saved successfully ✅");

  } catch (err) {
    console.error(err);
    showToast("Something went wrong 😅", "error");
  }

}

// LOAD EXPENSES
async function loadExpenses() {
  try {

    const res = await fetch(`${BASE_URL}/api/expenses`, { headers: authHeaders });

    if (!res.ok) {
      if (res.status === 401) return logout();
      return;
    }

    const data = await res.json();

    expenses = Array.isArray(data) ? data : [];

    displayExpenses();
    updateCalendarEvents();

  } catch (err) {
    console.error(err);
  }
}

// DISPLAY EXPENSES
function displayExpenses(arr = expenses) {

  const table = document.getElementById("expenseTable");
  table.innerHTML = "";

  let categoryTotals = {};
  const now = new Date();

  let today = 0;
  let week = 0;
  let month = 0;

  arr.forEach(exp => {

    const d = new Date(exp.date);

    if (filter === "today" && d.toDateString() !== now.toDateString()) return;
    if (filter === "week" && now - d > 7 * 86400000) return;
    if (filter === "month" && d.getMonth() !== now.getMonth()) return;

    table.innerHTML += `
    <tr>
      <td>${exp.category}</td>
      <td>₹${exp.amount}</td>
      <td><button onclick="startEdit('${exp._id}','${exp.category}',${exp.amount},'${exp.note || ""}')">✏️</button></td>
      <td><button onclick="deleteExpense('${exp._id}')">❌</button></td>
    </tr>
    `;

    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + Number(exp.amount);

    if (d.toDateString() === now.toDateString()) today += Number(exp.amount);
    if (now - d < 7 * 86400000) week += Number(exp.amount);
    if (d.getMonth() === now.getMonth()) month += Number(exp.amount);

  });

  document.getElementById("todayTotal").innerText = "₹" + today;
  document.getElementById("weekTotal").innerText = "₹" + week;
  document.getElementById("monthTotal").innerText = "₹" + month;

  updateChart(categoryTotals);
  updateBudget(month);

}

// START EDIT
function startEdit(id, category, amount, note) {

  editingId = id;

  document.getElementById("category").value = category;
  document.getElementById("amount").value = amount;
  document.getElementById("note").value = note;

  showToast("Editing expense ✏️");

}

// DELETE
async function deleteExpense(id) {

  try {

    const res = await fetch(`${BASE_URL}/api/expenses/${id}`, {
      method: "DELETE",
      headers: authHeaders
    });

    if (!res.ok) {
      if (res.status === 401) return logout();
      return;
    }

    await loadExpenses();

  } catch (err) {
    console.error(err);
  }

}

// SEARCH
function filterExpenses() {
  const text = document
    .getElementById("searchInput")
    .value.toLowerCase();

  displayExpenses(
    expenses.filter(e =>
      e.category.toLowerCase().includes(text)
    )
  );
}

// FILTER BUTTONS
function setFilter(f) {
  filter = f;
  displayExpenses();
}

// PIE CHART
function updateChart(data) {

  const ctx = document.getElementById("expenseChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(data),
      datasets: [
        {
          data: Object.values(data)
        }
      ]
    }
  });

}

// BUDGET
function setBudget() {

  const b = Number(document.getElementById("budgetInput").value);

  localStorage.setItem("budget", b);

  updateBudget(0);

}

function updateBudget(monthSpent) {

  const budget = Number(localStorage.getItem("budget"));

  if (!budget) return;

  const status = document.getElementById("budgetStatus");

  status.innerText =
    monthSpent > budget
      ? "⚠ Budget exceeded!"
      : "Remaining ₹" + (budget - monthSpent);

}

// PDF REPORT
function downloadPDF() {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.setFont("Helvetica");

  doc.setFontSize(18);
  doc.text("Expense Report", 20, 20);

  doc.setFontSize(12);

  let y = 40;

  expenses.forEach(e => {

    doc.text(`${e.category} - ₹${e.amount}`, 20, y);

    y += 10;

  });

  doc.save("expenses.pdf");

}

// CALENDAR
function loadCalendar() {

  const el = document.getElementById("calendar");

  calendar = new FullCalendar.Calendar(el, {

    initialView: "dayGridMonth",
    height: 500,

    dateClick: function(info) {

      const selected = info.dateStr;

      const filtered = expenses.filter(
        e => e.date.split("T")[0] === selected
      );

      displayExpenses(filtered);

      showToast("Showing expenses for " + selected);

    }

  });

  calendar.render();

}

// UPDATE CALENDAR EVENTS
function updateCalendarEvents() {

  if (!calendar) return;

  const daily = {};

  expenses.forEach(e => {

    const d = e.date.split("T")[0];

    daily[d] = (daily[d] || 0) + Number(e.amount);

  });

  const events = Object.keys(daily).map(d => ({
    title: "₹" + daily[d],
    start: d
  }));

  calendar.removeAllEvents();

  calendar.addEventSource(events);

}

// INITIALIZE
loadExpenses();
loadCalendar();
