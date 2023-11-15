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
  scheduleUpdateHour: [8, 13, 19],
};

function updateShopCoins() {
  if (foodShop.updateCoinIntervalId) clearInterval(foodShop.updateCoinIntervalId);
  foodShop.updateCoinIntervalId = setInterval(
    () => (document.querySelector("#shop-coin").textContent = `${user.money}`),
    1000
  );
}
function updateRemainingTime() {
  if (foodShop.remainingTime === undefined)
    foodShop.remainingTime = calculateRemainingTime(foodShop.scheduleUpdateHour);
  if (foodShop.remainingTimeIntervalId) clearInterval(foodShop.remainingTimeIntervalId);
  foodShop.remainingTimeIntervalId = setInterval(() => {
    foodShop.remainingTime -= 1000;
    document.querySelector("#remaining-time").innerText = `${formatTime(foodShop.remainingTime)}`;
  }, 1000);
}
function displayFood(result) {
  result.forEach((item, index) => {
    const { name, calories, cost, emoji, id: foodId } = item;
    const cardElement = document.getElementById(`card${index + 2}`);
    cardElement.setAttribute("onclick", `purchaseFood(${foodId},"${emoji}", ${cost}, ${calories})`);
    cardElement.querySelector(".name").textContent = name;
    cardElement.querySelector(".icon").textContent = emoji;
    cardElement.querySelector(".calories").textContent = `Calories: ${calories}`;
    cardElement.querySelector(".cost").textContent = `$ ${cost}`;
  });
}

function eatAnimation(emoji) {
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
      setTimeout(function () {
        //slimeCharacter.src = './img/blue_run.gif';
        slimeCharacter.src = `./img/${slime.type.split(" ")[0]}/move.gif`;
        if (slime.isEvolving) evolveAnimation();
      }, 1000); // 1秒後回到最初的圖片
    }, 500);
  }, 3000);
}
async function getShopItems() {
  const res = await fetch("/api/shop");
  const { success, result } = await res.json();
  if (!success) return;
  updateShopCoins();
  updateRemainingTime();
  displayFood(result);
}

async function refreshShop() {
  // 彈出確認提示
  const confirmed = confirm("Do you want to spend money to refresh?");

  // 根據使用者的確認狀態執行相應的操作
  if (confirmed) {
    const res = await fetch("/api/shop", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { success, result } = await res.json();
    if (!success) return alert(result);
    updateShopCoins();
    displayFood(result);
  } else {
    // 使用者取消，不執行任何操作
    // 可以根據需要進行其他處理
  }
}

async function postCustomFood() {
  const foodName = document.querySelector(`textarea[name="foodName"]`).value.trim().toLowerCase();
  // if food name is empty or is purely number
  if (foodName === "" || !isNaN(+foodName)) return;

  const res = await fetch("/api/food", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ foodName }),
  });
  const { success } = await res.json();
  if (!success) return;
  if (result.slime_type !== slime.type) slime.isEvolving = true;
  const { current_calories, max_calories, extra_calories, bmr_rate } = result;
  slime.cal = current_calories;
  slime.maxCal = max_calories;
  slime.extraCal = extra_calories;
  slime.bmr = bmr_rate;
  if (slime.isEvolving) evolveAnimation(result.slime_type);
  await getUserFinance();
  closeFootContainer();
  eatAnimation(emoji);
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
  if (!res.ok) return;
  const { success, result } = await res.json();
  if (!success) return;
  if (result.slime_type !== slime.type) slime.isEvolving = true;
  addCalories(calories);
  if (slime.isEvolving) evolveAnimation(result.slime_type);
  await getUserFinance();
  closeFootContainer();
  eatAnimation(emoji);
};

// implement evolve animation
async function evolveAnimation(newType) {
  slime.isEvolving = false;
  slime.type = newType;

  // animation
  const evolveText = document.createElement("div");
  evolveText.classList.add("evolve-text");
  evolveText.style.opacity = "0";
  evolveText.innerText = "EVOLVEANIMATION!!";

  const slimeCharacter = document.getElementById("gamecontainer");
  slimeCharacter.appendChild(evolveText);

  // change character to slime type
  slimeCharacter.src = `./img/${slime.type.split(" ")[0]}/move.gif`;

  // 使用 GSAP 庫創建動畫
  gsap.to(evolveText, {
    duration: 5, // 動畫持續時間（秒）
    opacity: 1, // 目標透明度
    y: -50, // 在 y 軸上的移動距離
    ease: "power2.out", // 動畫緩動函式
    delay: 3, // 延遲 3 秒後開始動畫
    onComplete: function () {
      // 動畫完成時的回調函式
      // 在這裡可以執行其他操作或觸發其他事件
      console.log("Animation complete!");
      evolveText.remove();
    },
  });
}

function addCalories(calories) {
  if (slime.cal + calories <= slime.maxCal) {
    slime.cal += calories;
    return;
  }
  slime.extraCal += slime.cal + calories - slime.maxCal;
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
