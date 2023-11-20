var closeBtn = document.getElementById("closeBtn");
var popup = document.getElementById("popup");


closeBtn.addEventListener("click", function () {
  popup.classList.remove("show"); // 移除 show 类，使其回到初始位置
});

// 显示 popup 元素
function showPopup() {
  popup.classList.add("show"); // 添加 show 类，使其从左侧弹出
  document.querySelector("main").classList.add("blur");
}

function hidePopup() {
  popup.classList.remove("show"); // 移除 show 类，使其回到初始位置
  document.querySelector("main").classList.remove("blur");
}

// 史來姆我行為 //

// 获取游戏容器和主角图像元素
var container = document.querySelector(".game_container");
var character = document.querySelector(".slime_character");

// 定义容器的宽度和主角图像的宽度
var containerWidth = container.offsetWidth;
var characterWidth = character.offsetWidth * 0.5;

// 随机生成主角图像的左边距
var randomLeft = Math.floor(Math.random() * (containerWidth - characterWidth));

// 设置主角图像的初始位置
character.style.left = randomLeft + "px";

// 定义主角图像的移动范围
var minLeft = 0;
var maxLeft = containerWidth - characterWidth;

// 定义主角图像的移动速度
var moveSpeed = 2; // 可根据需要进行调整

// 定义主角图像的移动方向（向左或向右）
var moveDirection = 1; // 1 表示向右移动，-1 表示向左移动

// 定义主角图像的移动函数
function moveCharacter() {
  if (moveDirection == 1) {
    character.classList.remove("face_left");
  } else {
    character.classList.add("face_left");
  }
  // 获取主角图像的当前左边距
  var currentLeft = parseInt(character.style.left);

  // 判断是否到达移动范围的边界，若是则改变移动方向
  if (currentLeft <= minLeft || currentLeft >= maxLeft) {
    moveDirection *= -1;
  }

  // 根据移动方向更新主角图像的左边距
  var newLeft = currentLeft + moveSpeed * moveDirection;
  character.style.left = newLeft + "px";

  // 每隔一段时间执行一次移动函数，实现连续移动效果
  setTimeout(moveCharacter, 50); // 可根据需要进行调整
}

function showPopupMenu() {
  document.querySelector(":root").setAttribute("SHOP", "true");
  document.querySelector("main").classList.add("blur");
}

async function getUserFinance() {
  try {
    const res = await fetch("/api/user/finance");
    if (res.status === 401) window.location = "/";
    if (!res.ok) {
      throw new Error("Failed to get user data");
    }
    const { success, result } = await res.json();
    if (!success) {
      throw new Error("Failed to get user data");
    }
    if (result.money < 0 || result.earning_rate < 0) return;
    user.money = result.money;
    user.earningRate = result.earning_rate;
    document.querySelector("#coin_balance p").textContent = `${displayCoinFormat(user.money, 1)} `;
    document.querySelector("#earn_rate").textContent = `${displayCoinFormat(user.earningRate, 1)}`;
  } catch (error) {
    console.error(error);
    // alert("Failed to get user data");
  }
}

function displayCoinFormat(coin, decimal) {
  if (coin < 100_000) return coin.toFixed(decimal);
  if (coin < 1_000_000) return `${(coin / 1000).toFixed(decimal)}k`;
  if (coin < 1_000_000_000) return `${(coin / 1_000_000).toFixed(decimal)}M`;
  return `${(coin / 1_000_000_000).toFixed(decimal)}B`;
}

async function getSlimeData() {
  try {
    const res = await fetch("/api/slime");
    if (res.status === 401) window.location = "/";
    if (!res.ok) {
      throw new Error("Failed to get slime data");
    }
    const { result } = await res.json();
    slime.bmr = result.bmr_rate;
    slime.cal = result.current_calories;
    slime.maxCal = result.max_calories;
    slime.extraCal = result.extra_calories;
    const newType = result.slime_type.split(" ")[0];
    if (!slime.type) slime.type = newType;
    if (slime.type !== newType) slime.isEvolving = true;
    evolveAnimation(newType);
    displaySlimeData();
  } catch (error) {
    console.error(error);
    // alert("Failed to get slime data");
  }
}
function displaySlimeData() {
  if (slime.calories < 0 || slime.bmr < 0) return;
  document.getElementById("slimeIcon").src = `./img/${slime.type}/move.gif`;
  document.getElementById("slime_character").src = `./img/${slime.type}/move.gif`;
  document.getElementById("slimeStableIcon").src = `./img/${slime.type}/die.gif`;
  const displayType = slime.type === "Skinny" ? "Skinny Fat" : slime.type;
  document.querySelector(".slime_type").innerHTML = `<span>Type</span> <b>${displayType}</b>`;
  document.querySelector(
    ".current_calories"
  ).innerHTML = `<span> Calories </span> <b>${slime.cal}/${slime.maxCal} </b>`;
  document.querySelector(".max_calories").innerHTML = `<span> Extra Calories</span> <b>${slime.extraCal ?? 0
    }</b>`;
}
async function updateSlimeCal() {
  if (slime.cal < 0 || slime.bmr < 0) return;
  if (slime.cal === 0 && slime.extraCal > 0) {
    slime.extraCal = Math.max(0, slime.extraCal - slime.bmr);
    if (slime.extraCal <= 2000 && slime.type === "Obese") {
      slime.isEvolving = true;
      // update slime type
      await getSlimeData();
    }
  }
  slime.cal = Math.max(0, slime.cal - slime.bmr);
  if (slime.cal === 0) {
    user.earningRate = 0;
    document.querySelector("#earn_rate").textContent = 0;
  }
  document.querySelector(".current_calories b").innerText = `${Math.round(slime.cal)}/${slime.maxCal
    }`;
  document.querySelector(".max_calories b").innerText = `${Math.round(slime.extraCal) ?? 0}`;
}

function updateCoins() {
  if (user.money < 0 || user.earningRate <= 0) return;
  user.money += user.earningRate;
  document.querySelector("#coin_balance p").textContent = `${displayCoinFormat(user.money, 1)} `; // Update the coin balance
}




// const socket = io.connect();



function toggleMute(elem) {
  if (audio.bgm.paused) {
    audio.bgm.play();
    audio.bgm.loop = true;
  }
  if (audio.isMuted) {
    audio.isMuted = false;
    for (const key in audio) {
      if (key === "isMuted") continue;
      audio[key].volume = 1;
      elem.textContent = "music_note";
    }
    return;
  }
  audio.isMuted = true;
  for (const key in audio) {
    if (key === "isMuted") continue;
    audio[key].volume = 0;
    elem.textContent = "music_off";
  }
};

document.addEventListener("DOMContentLoaded", async () => {

  // get coins
  await getUserFinance();
  updateCoins();

  setInterval(updateCoins, 1000);
  // socket.on("evolving", evolveAnimation);
  await getSlimeData();
  slime.updateIntervalId = setInterval(updateSlimeCal, 1000);
  moveCharacter();
});
