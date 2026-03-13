const BASE_URL = "https://home-minister-s-budget-book.onrender.com";

// Check token
const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
};

let expenses = [], chart, filter = "all", calendar;

// Quick category selection
function selectCategory(cat) {
  document.getElementById("category").value = cat;
}

// Add Expense
async function addExpense() {
  const category = document.getElementById("category").value.trim();
  const amount = Number(document.getElementById("amount").value.trim());
  const note = document.getElementById("note").value.trim();

  if (!category || !amount) return showToast("Enter category and amount ❌", "error");

  try {
    const res = await fetch(`${BASE_URL}/api/expenses`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ category, amount, note })
    });

    if (!res.ok) {
      if (res.status === 401) return logout();
      const errData = await res.json();
      return showToast(errData.message || "Failed to add expense 😅", "error");
    }

    // Clear inputs
    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";

    await loadExpenses();
    showToast("Expense added successfully ✅", "success");
  } catch (err) {
    console.error(err);
    showToast("Something went wrong 😅", "error");
  }
}

// Load Expenses
async function loadExpenses() {
  try {
    const res = await fetch(`${BASE_URL}/api/expenses`, { headers: authHeaders });
    if (!res.ok) return res.status === 401 ? logout() : console.error(res.status);

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
  let now = new Date(), today=0, week=0, month=0;

  expArr.forEach(exp => {
    const d = new Date(exp.date);
    if (filter === "today" && d.toDateString()!==now.toDateString()) return;
    if (filter === "week" && now - d > 7*86400000) return;
    if (filter === "month" && d.getMonth()!==now.getMonth()) return;

    table.innerHTML += `<tr>
      <td>${exp.category}</td>
      <td>₹${exp.amount}</td>
      <td><button onclick="deleteExpense('${exp._id}')">❌</button></td>
    </tr>`;

    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
    if (d.toDateString() === now.toDateString()) today+=Number(exp.amount);
    if (now - d < 7*86400000) week+=Number(exp.amount);
    if (d.getMonth() === now.getMonth()) month+=Number(exp.amount);
  });

  document.getElementById("todayTotal").innerText = "₹"+today;
  document.getElementById("weekTotal").innerText = "₹"+week;
  document.getElementById("monthTotal").innerText = "₹"+month;

  updateChart(categoryTotals);
  updateBudget(month);
}

// Delete Expense
async function deleteExpense(id) {
  try {
    const res = await fetch(`${BASE_URL}/api/expenses/${id}`, {
      method: "DELETE",
      headers: authHeaders
    });
    if (!res.ok) return res.status===401 ? logout() : null;
    await loadExpenses();
  } catch(err){ console.error(err); }
}

// Filter/Search
function filterExpenses() {
  const text = document.getElementById("searchInput").value.toLowerCase();
  displayExpenses(expenses.filter(e=>e.category.toLowerCase().includes(text)));
}

function setFilter(f){ filter=f; displayExpenses(); }

// Chart
function updateChart(data){
  const ctx = document.getElementById("expenseChart");
  if(chart) chart.destroy();
  chart = new Chart(ctx, { type:"pie", data:{ labels:Object.keys(data), datasets:[{data:Object.values(data)}] } });
}

// Budget
function setBudget(){ 
  const b = Number(document.getElementById("budgetInput").value);
  localStorage.setItem("budget", b); 
  updateBudget(0);
}

function updateBudget(monthSpent){
  const budget = Number(localStorage.getItem("budget"));
  if(!budget) return;
  document.getElementById("budgetStatus").innerText = monthSpent>budget?"⚠ Budget exceeded!":"Remaining ₹"+(budget-monthSpent);
}

// PDF
async function downloadPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("Helvetica"); doc.setFontSize(18);
  doc.text("Expense Report",20,20);
  doc.setFontSize(12);
  let y=40;
  expenses.forEach(exp=>{ doc.text(`${exp.category} - ₹${exp.amount}`,20,y); y+=10; });
  doc.save("expenses.pdf");
}

// Logout
function logout(){ localStorage.removeItem("token"); window.location.href="index.html"; }

// Calendar
function loadCalendar(){
  const el=document.getElementById("calendar");
  calendar=new FullCalendar.Calendar(el,{ initialView:"dayGridMonth", height:500 });
  calendar.render();
}

function updateCalendarEvents(){
  if(!calendar) return;
  const dailyTotals={};
  expenses.forEach(exp=>{ const d=exp.date.split("T")[0]; dailyTotals[d]=(dailyTotals[d]||0)+Number(exp.amount); });
  const events=Object.keys(dailyTotals).map(d=>({title:"₹"+dailyTotals[d],start:d}));
  calendar.removeAllEvents(); calendar.addEventSource(events);
}

// Toast
function showToast(msg,type="success"){
  const t=document.getElementById("toast");
  t.innerText=msg;
  t.style.backgroundColor=type==="success"?"#4caf50":"#f44336";
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2500);
}

// Initialize
loadExpenses(); loadCalendar();
