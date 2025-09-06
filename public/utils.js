export function checkRole(role) {
  const savedRole = window.localStorage.getItem("role");

  if (!savedRole || savedRole !== role) {
    console.log("Rol equivocado");
    window.location.href = "/";
  }
}

export function getUser() {
  const savedRole = window.localStorage.getItem("role");
  const userId = window.localStorage.getItem("userId");
  return {
    role: savedRole,
    userId: userId
  };
}
