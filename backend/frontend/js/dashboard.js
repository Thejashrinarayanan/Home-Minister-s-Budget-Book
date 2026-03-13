// Backend URL
const BASE_URL = "https://home-minister-s-budget-book.onrender.com";

// Check token
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "index.html"; // redirect if missing
}

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

let chart;
let expenses = [];
let filter = "all";
let calendar;

// Quick category selection
function selectCategory(cat) {
  document.getElementById("category").value = cat;
}

// Add Expense
async function addExpense() {
  const category = document.getElementById("category").value.trim();
  const amount = Number(document.getElementById("amount").value.trim());
  const note = document.getElementById("note").value.trim();

  if (!category || !amount) {
    showToast("Enter category and amount ❌", "error");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/expenses`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ category, amount, note }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        alert("Session expired. Please login again 😅");
        logout();
      } else {
        const errData = await res.json();
        showToast(errData.message || "Failed to add expense 😅", "error");
      }
      return;
    }

    // Clear inputs
    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";

    await loadExpenses();
    showToast("Expense added successfully ✅", "success");
  } catch (err) {
    console.error("Add expense error:", err);
    showToast("Something went wrong 😅", "error");
  }
}

// Delete Expense
async function deleteExpense(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/expenses/${id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (!res.ok && res.status === 401) {
      alert("Session expired. Please login again 😅");
      logout();
    } else {
      await loadExpenses();
    }
  } catch (err) {
    console.error("Delete error:", err);
  }
}

// Load Expenses
async function loadExpenses() {
  try {
    const res = await fetch(`${BASE_URL}/api/expenses`, { headers: authHeaders });
    if (!res.ok) {
      if (res.status === 401) {
        alert("Session expired. Please login again 😅");
        logout();
      }
      return;
    }
    const data = await res.json();
    expenses = Array.isArray(data) ? data : [];
    displayExpenses();
    updateCalendarEvents();
  } catch (err) {
    console.error("Load expenses error:", err);
  }
}

// Display Expenses
function displayExpenses(expArr = expenses) {
  if (!Array.isArray(expArr)) expArr = [];
  const table = document.getElementById("expenseTable");
  table.innerHTML = "";

  let categoryTotals = {};
  let now = new Date();
  let today = 0, week = 0, month = 0;

  expArr.forEach(exp => {
    const d = new Date(exp.date);
    if (filter === "today" && d.toDateString() !== now.toDateString()) return;
    if (filter === "week" && now - d > 7 * 86400000) return;
    if (filter === "month" && d.getMonth() !== now.getMonth()) return;

    const row = document.createElement("tr");
    row.innerHTML = `<td>${exp.category}</td>
                     <td>₹${exp.amount}</td>
                     <td><button onclick="deleteExpense('${exp._id}')">❌</button></td>`;
    table.appendChild(row);

    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);

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

// Filter Expenses
function filterExpenses() {
  const text = document.getElementById("searchInput").value.toLowerCase();
  const filtered = expenses.filter(e => e.category.toLowerCase().includes(text));
  displayExpenses(filtered);
}

// Set Filter
function setFilter(f) {
  filter = f;
  displayExpenses();
}

// Chart
function updateChart(data) {
  const ctx = document.getElementById("expenseChart");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(data),
      datasets: [{ data: Object.values(data) }]
    }
  });
}

// Budget
function setBudget() {
  const budget = Number(document.getElementById("budgetInput").value);
  localStorage.setItem("budget", budget);
  updateBudget(0);
}

function updateBudget(monthSpent) {
  const budget = Number(localStorage.getItem("budget"));
  if (!budget) return;
  const remaining = budget - monthSpent;
  document.getElementById("budgetStatus").innerText = remaining < 0 ? "⚠ Budget exceeded!" : "Remaining ₹" + remaining;
}

// PDF Report
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("Helvetica");
  doc.setFontSize(18);
  doc.text("Expense Report", 20, 20);
  doc.setFontSize(12);

  let y = 40;
  expenses.forEach(exp => {
    doc.text(`${exp.category} - ₹${exp.amount}`, 20, y);
    y += 10;
  });

  doc.save("expenses.pdf");
}

// Logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// Calendar
function loadCalendar() {
  const calendarEl = document.getElementById("calendar");
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: 500
  });
  calendar.render();
}

function updateCalendarEvents() {
  if (!calendar) return;
  const dailyTotals = {};
  expenses.forEach(exp => {
    const date = exp.date.split("T")[0];
    dailyTotals[date] = (dailyTotals[date] || 0) + Number(exp.amount);
  });

  const events = Object.keys(dailyTotals).map(date => ({
    title: "₹" + dailyTotals[date],
    start: date
  }));

  calendar.removeAllEvents();
  calendar.addEventSource(events);
}

// Toast
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.backgroundColor = type === "success" ? "#4caf50" : "#f44336";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// Initialize
loadExpenses();
loadCalendar();
