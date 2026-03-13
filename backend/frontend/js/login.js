async function login(){

const email=document.getElementById("email").value
const password=document.getElementById("password").value

const res=await fetch("http://localhost:5000/api/auth/login",{

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:10000"
    : "https://amma-expense.onrender.com";


const data=await res.json()

if(data.token){

localStorage.setItem("token",data.token)

window.location.href="dashboard.html"

}else{

alert(data.message)

}


}
