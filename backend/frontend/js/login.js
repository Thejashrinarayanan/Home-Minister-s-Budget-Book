async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Use Render backend URL directly
  const BASE_URL = "https://home-minister-s-budget-book.onrender.com/";

  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Unable to login. Please try again later.");
  }
}
