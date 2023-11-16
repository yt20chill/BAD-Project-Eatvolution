const slime = {
  type: undefined,
  bmr: undefined,
  cal: undefined,
  maxCal: undefined,
  extraCal: undefined,
  isEvolving: false,
  updateIntervalId: undefined,
};
const user = { money: undefined, earningRate: undefined };
const foodShop = {
  isVisible: false,
  updateCoinIntervalId: undefined,
  remainingTime: undefined,
  remainingTimeIntervalId: undefined,
  refreshCost: undefined,
  customFoodCost: undefined,
  scheduleUpdateHour: [8, 13, 19],
};
const audio = { bgm: new Audio("./mp3/bgm.mp3"), evoSound: new Audio("./mp3/eva.mp3"), pickfoodSound: new Audio("./mp3/select-food.mp3"), isMuted: true };

function updateShopCoins() {
  document.querySelector("#shop-coin").textContent = `${displayCoinFormat(user.money)}`;
  if (foodShop.updateCoinIntervalId) clearInterval(foodShop.updateCoinIntervalId);
  foodShop.updateCoinIntervalId = setInterval(
    () => (document.querySelector("#shop-coin").textContent = `${displayCoinFormat(user.money)} `),
    1000
  );
}
function updateRemainingTime() {
  if (foodShop.remainingTime === undefined)
    foodShop.remainingTime = calculateRemainingTime(foodShop.scheduleUpdateHour);
  if (foodShop.remainingTimeIntervalId) clearInterval(foodShop.remainingTimeIntervalId);
  foodShop.remainingTimeIntervalId = setInterval(() => {
    foodShop.remainingTime -= 1000;
    document.querySelector("#remaining-time").innerText = `${formatTime(foodShop.remainingTime)} `;
  }, 1000);
}
function displayFood(result) {
  document.querySelector("#custom-food-cost").innerHTML = `<img src="/user/img/01coin (1).gif" alt="Coin Icon"> ${displayCoinFormat(foodShop.customFoodCost)} `;
  result.forEach((item, index) => {
    const { name, calories, cost, emoji, id: foodId } = item;
    const cardElement = document.getElementById(`card${index + 2}`);
    cardElement.setAttribute("onclick", `purchaseFood(${foodId}, "${emoji}", ${cost}, ${calories})`);
    cardElement.querySelector(".name").textContent = name;
    cardElement.querySelector(".icon").textContent = emoji;
    cardElement.querySelector(".calories").textContent = `${calories} Cal`;
    cardElement.querySelector(".cost").innerHTML = `<img src="/user/img/01coin (1).gif" alt="Coin Icon"> ${displayCoinFormat(cost)}`;
  });
}

function eatAnimation(emoji) {
  audio.pickfoodSound.play();
  const emojiElement = document.createElement("div");
  const gameContainer = document.getElementById("gamecontainer");
  emojiElement.classList.add("emoji");
  emojiElement.innerText = emoji;
  gameContainer.appendChild(emojiElement);

  const gameContainerRect = gameContainer.getBoundingClientRect();
  // const cardRect = card.getBoundingClientRect();
  const emojiWidth = emojiElement.offsetWidth;
  const emojiHeight = emojiElement.offsetHeight;
  const leftOffset = gameContainerRect.left + gameContainerRect.width / 2 - emojiWidth / 2;
  //const topOffset = gameContainerRect.top - emojiHeight;

  emojiElement.classList.add("emoji");
  emojiElement.style.left = leftOffset + "px";
  emojiElement.style.top = 0;
  setTimeout(function () {
    emojiElement.style.transition = "top 3s";
    emojiElement.style.left = gameContainerRect.width / 2 - emojiWidth / 2 + "px";
    emojiElement.style.top = gameContainerRect.height - emojiHeight - 80 + "px";
  }, 10);
  setTimeout(function () {
    const slimeCharacter = document.getElementById("slime_character");
    slimeCharacter.src = `./img/${slime.type.split(" ")[0]}/eat.gif`;

    setTimeout(function () {
      gameContainer.removeChild(emojiElement);
      slimeCharacter.src = `./img/${slime.type.split(" ")[0]}/jump.gif`;
      setTimeout(async function () {
        //slimeCharacter.src = './img/blue_run.gif';
        slimeCharacter.src = `./img/${slime.type.split(" ")[0]}/move.gif`;
      }, 1000); // 1秒後回到最初的圖片
    }, 500);
  }, 3000);
}
async function getShopItems() {
  const res = await fetch("/api/shop");
  if (res.status === 401) window.location = "/";
  const { success, result } = await res.json();
  if (!success) return;
  await getItemCost();
  updateShopCoins();
  updateRemainingTime();
  displayFood(result);
}

async function getItemCost() {
  const res = await fetch("/api/shop/items");
  if (res.status === 401) window.location = "/";
  const { success, result } = await res.json();
  if (!success) return;
  foodShop.refreshCost = result.refreshCost;
  foodShop.customFoodCost = result.customFoodCost;
  return;
}

async function refreshShop() {
  if (foodShop.refreshCost < 0) alert("something went wrong");
  // 彈出確認提示
  const confirmed = confirm(`Refresh shop costs $${foodShop.refreshCost}, continue?`);
  if (user.money - foodShop.refreshCost < 0) return alert("Not enough money");
  // 根據使用者的確認狀態執行相應的操作
  if (!confirmed) return;
  const res = await fetch("/api/shop", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status === 401) window.location = "/";
  const { success, result } = await res.json();
  if (!success) return alert(result);
  user.money -= foodShop.refreshCost;
  document.querySelector("#shop-coin").textContent = `${displayCoinFormat(user.money)}`;
  updateShopCoins();
  displayFood(result);
}

async function postCustomFood() {
  if (user.money - foodShop.customFoodCost < 0) return alert("Not enough money");

  const foodName = document.querySelector(`input[name="foodName"]`).value.trim().toLowerCase();
  // 如果食物名称为空或纯数字，则返回
  if (foodName === "" || !isNaN(+foodName)) return;

  const confirmed = confirm(`Want to feed your slime with ${foodName}?`);
  if (!confirmed) return;

  const res = await fetch("/api/food", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ foodName }),
  });

  if (res.status === 401) window.location = "/";

  const { success, result } = await res.json();
  if (!success) return alert(`Failed to feed your slime with ${foodName}`);

  if (result.slime_type !== slime.type) slime.isEvolving = true;

  const { current_calories, max_calories, extra_calories, bmr_rate } = result;
  slime.cal = current_calories;
  slime.maxCal = max_calories;
  slime.extraCal = extra_calories;
  slime.bmr = bmr_rate;
  eatAnimation("✨");
  await getUserFinance();
  await getSlimeData();
  closeFootContainer();
}

const purchaseFood = async (foodId, emoji, cost, calories) => {
  if (user.money - cost < 0) return alert("Not enough money");
  const res = await fetch("/api/food", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ foodId }),
  });
  if (res.status === 401) window.location = "/";
  if (!res.ok) return;
  const { success } = await res.json();
  if (!success) return alert("Failed to feed your slime");
  eatAnimation(emoji);
  addCalories(calories);
  await getUserFinance();
  await getSlimeData();
  closeFootContainer();
};

// implement evolve animation
function evolveAnimation(newType) {
  if (!slime.isEvolving) return;
  slime.isEvolving = false;
  slime.type = newType;
  // animation
  audio.evoSound.play();

  const evolveText = document.createElement("div");
  evolveText.classList.add("evolve-text");
  evolveText.style.opacity = "0";
  evolveText.innerText = "EVOLVE ANIMATION!!";

  const slimeCharacter = document.getElementById("gamecontainer");
  slimeCharacter.appendChild(evolveText);

  // 使用 GSAP 庫創建動畫
  gsap.to(evolveText, {
    duration: 5, // 動畫持續時間（秒）
    opacity: 1, // 目標透明度
    y: -50, // 在 y 軸上的移動距離
    ease: "power2.out", // 動畫緩動函式
    delay: 0, // 延遲 3 秒後開始動畫
    onComplete: function () {
      // 動畫完成時的回調函式
      // 在這裡可以執行其他操作或觸發其他事件
      evolveText.remove();
    },
  });
  // change character to slime type
  slimeCharacter.src = `./img/${slime.type.split(" ")[0]}/move.gif`;
}

function addCalories(calories) {
  if (slime.cal + calories <= slime.maxCal) {
    slime.cal += calories;
    return;
  }
  slime.extraCal += slime.cal + calories - slime.maxCal;
  if (slime.extraCal > 2000 && slime.type !== "Obese") {
    slime.type = "Obese";
    slime.isEvolving = true;
    evolveAnimation(slime.type);
  }
  slime.cal = slime.maxCal;
  return;
}
function closeFootContainer() {
  if (foodShop.isVisible) {
    if (foodShop.updateCoinIntervalId) clearInterval(foodShop.updateCoinIntervalId);
    if (foodShop.remainingTimeIntervalId) clearInterval(foodShop.remainingTimeIntervalId);
    foodShop.remainingTime = undefined;
    //document.getElementById("footcontainerID").style.display = "none";
    document.querySelector(":root").removeAttribute("SHOP");
    document.querySelector("main").classList.remove("blur");
    foodShop.isVisible = false;
  }
}

// close food shop if clicked elsewhere
document.addEventListener("mouseup", function (event) {
  var targetElement = event.target;
  // 检查点击事件发生时的目标元素是否为footContainer或其内部元素
  const isClickInsideFootContainer = document
    .getElementById("footcontainerID")
    .contains(targetElement);

  if (!isClickInsideFootContainer && foodShop.isVisible) {
    // 点击了footContainer以外的地方且footContainer可见
    closeFootContainer();
  }
});

// 点击food shop按钮时显示footContainer
document.getElementById("foodShopButton").addEventListener("click", async function () {
  document.getElementById("footcontainerID").style.display = "flex";
  foodShop.isVisible = true;
  await getShopItems();
});

function calculateRemainingTime(hours) {
  const now = new Date();
  const targetTime = new Date();
  const resultTime = new Date();

  targetTime.setMinutes(0);
  targetTime.setSeconds(0);
  targetTime.setMilliseconds(0);
  for (const hour of hours) {
    targetTime.setHours(hour);
    const diff = targetTime.getTime() - now.getTime();
    if (diff > 0) {
      resultTime.setHours(Math.floor(diff / 1000 / 60 / 60));
      resultTime.setMinutes(Math.floor((diff / 1000 / 60) % 60));
      resultTime.setSeconds(Math.floor((diff / 1000) % 60));
      return resultTime.getTime();
    }
  }
  // advance the day by 1
  targetTime.setDate(targetTime.getDate() + 1);
  targetTime.setHours(hours[0]);
  const diff = targetTime.getTime() - now.getTime();
  resultTime.setHours(Math.floor(diff / 1000 / 60 / 60));
  resultTime.setMinutes(Math.floor((diff / 1000 / 60) % 60));
  resultTime.setSeconds(Math.floor((diff / 1000) % 60));
  return resultTime.getTime();
}

function formatTime(date) {
  const newDate = new Date(date);
  const hours = newDate.getHours().toString().padStart(2, "0");
  const minutes = newDate.getMinutes().toString().padStart(2, "0");
  const seconds = newDate.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
