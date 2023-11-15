async function logout() {
  await fetch("/auth/logout");
  window.location.href = "/";
};


const signupForm = document.getElementById("signUP_form");

const loginform = document.getElementById("login_form");

let loginSound = new Audio("./mp3/login.mp3")

loginform?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  if (!email || !password) return alert("Please fill all the fields");
  const body = {
    username: email,
    password: password,
  };

  const res = await fetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-type": "application/json",
    },
  });
  const { success } = await res.json(); // { success: true, result:null }
  if (!success) {
    alert("wrong username or password");
    return;
  } else {
    loginSound.play();
    setTimeout(() => window.location = "/user", 500);
  }
});

signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  const repassword = e.target.repassword.value;
  const body = {
    username: email,
    password: password,
    confirmPassword: repassword,
  };
  const res = await fetch("/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-type": "application/json",
    },
  });
  const data = await res.json(); // { success: true, result:null }
  if (!data.success) {
    alert(data.result);
    return;
  } else {
    loginSound.play();
    setTimeout(() => window.location = "/user", 500);
  }
});