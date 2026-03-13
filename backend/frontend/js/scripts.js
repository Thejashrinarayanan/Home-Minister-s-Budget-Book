// Backend URL (Render)
const BASE_URL = "https://home-minister-s-budget-book.onrender.com";

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
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      // ✅ Store token correctly (plain string)
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Login failed 😢");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Something went wrong! Try again later 😅");
  }
}

// Attach event listener
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginBtn").addEventListener("click", login);
});
