// Set the backend URL for production (Render) 
const BASE_URL = "https://home-minister-s-budget-book.onrender.com";

// Login function
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password 😊");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      // Redirect to dashboard
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Login failed 😢");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong! Try again later 😅");
  }
}

// Attach login to button by ID
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.addEventListener("click", login);
});
