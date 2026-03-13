const token = localStorage.getItem("token")

if(!token){
window.location.href="index.html"
}

let chart
let expenses=[]
let filter="all"

function selectCategory(cat){
document.getElementById("category").value=cat
}

async function addExpense(){

const category=document.getElementById("category").value
const amount=document.getElementById("amount").value
const note=document.getElementById("note").value

if(!category||!amount){
alert("Enter category and amount")
return
}

await fetch("http://localhost:5000/api/expenses",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":token
},
body:JSON.stringify({category,amount,note})
})

loadExpenses()

}

async function deleteExpense(id){

await fetch("http://localhost:5000/api/expenses/"+id,{
method:"DELETE",
headers:{Authorization:token}
})

loadExpenses()

}

async function loadExpenses(){

const res=await fetch("http://localhost:5000/api/expenses",{
headers:{Authorization:token}
})

expenses=await res.json()

displayExpenses()
updateCalendarEvents() 
}

function displayExpenses(){

const table=document.getElementById("expenseTable")
table.innerHTML=""

let categoryTotals={}
let today=0
let week=0
let month=0

const now=new Date()

expenses.forEach(exp=>{

const d=new Date(exp.date)

if(filter==="today" && d.toDateString()!==now.toDateString()) return
if(filter==="week" && now-d>7*86400000) return
if(filter==="month" && d.getMonth()!==now.getMonth()) return

const row=document.createElement("tr")

row.innerHTML=
`<td>${exp.category}</td>
<td>₹${exp.amount}</td>
<td><button onclick="deleteExpense('${exp._id}')">❌</button></td>`

table.appendChild(row)

categoryTotals[exp.category]=(categoryTotals[exp.category]||0)+exp.amount

if(d.toDateString()===now.toDateString()) today+=exp.amount
if(now-d<7*86400000) week+=exp.amount
if(d.getMonth()===now.getMonth()) month+=exp.amount

})

document.getElementById("todayTotal").innerText="₹"+today
document.getElementById("weekTotal").innerText="₹"+week
document.getElementById("monthTotal").innerText="₹"+month

updateChart(categoryTotals)
updateBudget(month)

}

function filterExpenses(){

const text=document.getElementById("searchInput").value.toLowerCase()

expenses=expenses.filter(e=>e.category.toLowerCase().includes(text))

displayExpenses()

}

function setFilter(f){
filter=f
displayExpenses()
}

function updateChart(data){

const ctx=document.getElementById("expenseChart")

if(chart) chart.destroy()

chart=new Chart(ctx,{
type:"pie",
data:{
labels:Object.keys(data),
datasets:[{data:Object.values(data)}]
}
})

}

/* BUDGET */

function setBudget(){

const budget=document.getElementById("budgetInput").value
localStorage.setItem("budget",budget)

}

function updateBudget(monthSpent){

const budget=localStorage.getItem("budget")

if(!budget) return

const remaining=budget-monthSpent

const status=document.getElementById("budgetStatus")

if(remaining<0){

status.innerHTML="⚠ Budget exceeded!"

}else{

status.innerHTML="Remaining ₹"+remaining

}

}

/* PDF */

async function downloadPDF(){

const { jsPDF } = window.jspdf
const doc = new jsPDF()

doc.setFont("Helvetica")
doc.setFontSize(18)

doc.text("Expense Report",20,20)

doc.setFontSize(12)

let y = 40

expenses.forEach(exp => {

const category = String(exp.category)
const amount = Number(exp.amount)

doc.text(category + " - Rs. " + amount,20,y)

y += 10

})

doc.save("expenses.pdf")

}


/*logout*/

function logout(){

localStorage.removeItem("token")
window.location.href="index.html"

}


let calendar

function loadCalendar(){

const calendarEl=document.getElementById("calendar")

calendar=new FullCalendar.Calendar(calendarEl,{
initialView:"dayGridMonth",
height:500
})

calendar.render()

}

function updateCalendarEvents(){

let dailyTotals={}

expenses.forEach(exp=>{

const date=exp.date.split("T")[0]

dailyTotals[date]=(dailyTotals[date]||0)+exp.amount

})

let events=[]

Object.keys(dailyTotals).forEach(date=>{

events.push({
title:"₹"+dailyTotals[date],
start:date
})

})

calendar.removeAllEvents()
calendar.addEventSource(events)

}


loadExpenses()
loadCalendar()