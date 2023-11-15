async function logout() {
  await fetch("/auth/logout");
  window.location.href = "/";
};
