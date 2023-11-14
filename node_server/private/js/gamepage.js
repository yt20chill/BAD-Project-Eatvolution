var closeBtn = document.getElementById("closeBtn");
var popup = document.getElementById("popup");

closeBtn.addEventListener("click", function () {
  popup.classList.remove("show"); // 移除 show 类，使其回到初始位置
});

// 显示 popup 元素
async function showPopup() {
  popup.classList.add("show"); // 添加 show 类，使其从左侧弹出
  document.querySelector("#gamecontainer").classList.add("blur");
}

function hidePopup() {
  popup.classList.remove("show"); // 移除 show 类，使其回到初始位置
  document.querySelector("#gamecontainer").classList.remove("blur");
}

// 移除初始的 hidden 类
window.addEventListener("load", function () {
  popup.classList.remove("hidden");
});

// 史來姆我行為 //

// 获取游戏容器和主角图像元素
var container = document.querySelector(".game_container");
var character = document.querySelector(".slime_character");

// 定义容器的宽度和主角图像的宽度
var containerWidth = container.offsetWidth;
var characterWidth = character.offsetWidth;

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
  var popup = document.getElementById("popupMenu");
  popup.style.display = "block";
}

function hidePopupMenu() {
  var popup = document.getElementById("popupMenu");
  popup.style.display = "none";
}

// log out api

async function getUserFinance() {
  try {
    const res = await fetch("/api/user/finance");
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
  } catch (error) {
    console.error(error);
    // alert("Failed to get user data");
  }
}

async function getSlimeData() {
  try {
    const res = await fetch("/api/slime");
    if (!res.ok) {
      throw new Error("Failed to get slime data");
    }
    const { result } = await res.json();
    slime.bmr = result.bmr_rate;
    slime.cal = result.current_calories;
    slime.maxCal = result.max_calories;
    slime.extraCal = result.extra_calories;
    if (slime.type && slime.type !== result.slime_type.split(" ")[0]) slime.isEvolving = true;
    if (slime.isEvolving) evolveAnimation();
    slime.type = result.slime_type.split(" ")[0];
    displaySlimeData();
  } catch (error) {
    console.error(error);
    // alert("Failed to get slime data");
  }
}
function displaySlimeData() {
  if (slime.calories < 0 || slime.bmr < 0) return;
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
function updateSlimeCal() {
  if (slime.cal < 0 || slime.bmr < 0) return;
  if (slime.cal === 0 && slime.extraCal > 0) slime.extraCal -= slime.bmr;
  slime.cal = Math.max(0, slime.cal - slime.bmr);
  if (slime.cal === 0) user.earningRate = 0;
  document.querySelector(".current_calories b").innerText = `${Math.round(slime.cal)}/${slime.maxCal}`;
  document.querySelector(".max_calories b").innerText = `${Math.round(slime.extraCal) ?? 0}`;
}

function updateCoins() {
  if (user.money < 0 || user.earningRate < 0) return;
  user.money = Math.floor(user.money + user.earningRate);
  document.querySelector(".card-text").textContent = `coin：${user.money} `; // Update the coin balance
}
// refresh shop bottom function

// pick the food to eat

// 獲取卡片容器元素
// const cardContainer = document.getElementById('food_card_containerID');

// // 獲取遊戲容器元素
// const gameContainer = document.getElementById('gamecontainer');

// // 獲取所有卡片元素
// const cards = cardContainer.getElementsByClassName('card');

// // 迭代每個卡片元素，添加點擊事件處理程序
// for (let i = 0; i < cards.length; i++) {
//     const card = cards[i];
//     const icon = card.querySelector('.icon');

//     card.addEventListener('click', function () {
//         console.log(123)
//         console.log(icon)
//         // 克隆 ICON 元素
//         const clonedIcon = icon.cloneNode(true);

//         // 設置 ICON 的位置和顯示
//         clonedIcon.style.display = 'block';
//         clonedIcon.style.top = '0';
//         clonedIcon.style.left = '50%';
//         clonedIcon.style.transform = 'translateX(-50%)';

//         // 將 ICON 添加到遊戲容器中
//         gameContainer.appendChild(clonedIcon);

//         // 計算 ICON 掉落到 slime_character 位置的距離
//         const characterRect = gameContainer.querySelector('.slime_character').getBoundingClientRect();
//         const iconRect = clonedIcon.getBoundingClientRect();
//         const distance = characterRect.top - iconRect.bottom;

//         // 使用 CSS 動畫使 ICON 掉落
//         clonedIcon.style.transition = 'top 1s';
//         clonedIcon.style.top = distance + 'px';

//         // 監聽動畫結束事件，當 ICON 掉落完成後從遊戲容器中移除
//         clonedIcon.addEventListener('transitionend', function () {
//             gameContainer.removeChild(clonedIcon);
//         });
//     });
// }

// const cardContainer = document.getElementById('food_card_containerID');
// const gameContainer = document.getElementById('gamecontainer');
// const cards = cardContainer.getElementsByClassName('card');

// for (let i = 0; i < cards.length; i++) {
//     const card = cards[i];

//     card.addEventListener('click', function () {
//         const emoji = card.querySelector('.icon').innerText;

//         const emojiElement = document.createElement('div');
//         emojiElement.classList.add('emoji');
//         emojiElement.innerText = emoji;

//         gameContainer.appendChild(emojiElement);

//         const gameContainerRect = gameContainer.getBoundingClientRect();
//         const cardRect = card.getBoundingClientRect();
//         const emojiWidth = emojiElement.offsetWidth;
//         const emojiHeight = emojiElement.offsetHeight;
//         const leftOffset = cardRect.left + cardRect.width / 2 - emojiWidth / 2;
//         const topOffset = gameContainerRect.top - emojiHeight;

//         emojiElement.style.left = leftOffset + 'px';
//         emojiElement.style.top = topOffset + 'px';

//         setTimeout(function () {
//             emojiElement.style.transition = 'top 1s';
//             emojiElement.style.top = gameContainerRect.bottom - emojiHeight + 'px';
//         }, 0);

//         // emojiElement.addEventListener('transitionend', function () {
//         //     gameContainer.removeChild(emojiElement);
//         // });
//     });
// }

// const cardContainer = document.getElementById("food_card_containerID");
// const gameContainer = document.getElementById("gamecontainer");
// const cards = cardContainer.getElementsByClassName("card");

// const socket = io.connect();

document.addEventListener("DOMContentLoaded", async () => {
  // get coins
  await getUserFinance();
  setInterval(updateCoins, 1000);
  // socket.on("evolving", evolveAnimation);
  await getSlimeData();
  slime.updateIntervalId = setInterval(updateSlimeCal, 1000);
  moveCharacter();
});
