// Set the backend URL depending on environment
const BASE_URL = "";

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
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Login failed 😢");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong! Try again later 😅");
  }
}

// Attach login to button
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("button[onclick='login()']");
  if (loginBtn) loginBtn.addEventListener("click", login);
});


