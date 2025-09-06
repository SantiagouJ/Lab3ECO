const btn = document.querySelector(".login-button");

btn.addEventListener("click", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!data.role) {
      window.alert(data.message || "Error en el login");
    }
    if (response.ok) {
      window.localStorage.setItem("role", data.role);
      window.localStorage.setItem("userId", data.userId);
      
      // Guardar riderId si el usuario es un rider
      if (data.role === "rider" && data.riderId) {
        window.localStorage.setItem("riderId", data.riderId);
      }

      if (data.role === "user") {
        window.location.href = "/user";
      } else if (data.role === "store") {
        window.location.href = "/store";
      } else if (data.role === "rider") {
        window.location.href = "/rider ";
      }
    }
  } catch (error) {
    console.error("Error en el login:", error);
    window.alert("Ocurrio algo inesperado");
  }
});
