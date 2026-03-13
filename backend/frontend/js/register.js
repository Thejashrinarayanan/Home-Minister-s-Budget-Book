// Backend URL for Render
const BASE_URL = "https://home-minister-s-budget-book.onrender.com";

async function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    alert("Please fill all fields 😊");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      // Save token to localStorage
      localStorage.setItem("token", data.token);
      alert("🎉 Registration successful! Welcome 💖");
      // Redirect to dashboard
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Registration failed 😢");
    }
  } catch (error) {
    console.error("Registration error:", error);
    alert("Something went wrong! Try again later 😅");
  }
}

// Attach function to button
document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.querySelector("button");
  if (registerBtn) registerBtn.addEventListener("click", register);
});
