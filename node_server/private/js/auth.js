document.getElementById("logout").addEventListener("click", async function (e) {
  e.preventDefault();

  const res = await fetch("/auth/logout");

  if (res.ok) {
    window.location.href = "/index.html";
  } else {
    console.error("Logout failed.");
  }
});
