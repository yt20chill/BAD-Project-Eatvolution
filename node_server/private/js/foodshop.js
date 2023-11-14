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
    cardElement.setAttribute("onclick", `purchaseFood(${foodId},"${emoji}", ${cost})`);
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
    slimeCharacter.src = `./img/${slime.type}/eat.gif`;

    setTimeout(function () {
      gameContainer.removeChild(emojiElement);
      slimeCharacter.src = `./img/${slime.type}/jump.gif`;
      setTimeout(function () {
        //slimeCharacter.src = './img/blue_run.gif';
        slimeCharacter.src = `./img/${slime.type}/move.gif`;
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
  closeFootContainer();
  eatAnimation(emoji);
}

const purchaseFood = async (foodId, emoji, cost) => {
  if (user.money - cost < 0) return alert("Not enough money");
  user.money -= cost;
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
  closeFootContainer();
  eatAnimation(emoji);
};

// implement evolve animation
function evolveAnimation() {
  slime.isEvolving = false;
  console.log("evolve");
}

function closeFootContainer() {
  if (foodShop.isVisible) {
    if (foodShop.updateCoinIntervalId) clearInterval(foodShop.updateCoinIntervalId);
    if (foodShop.remainingTimeIntervalId) clearInterval(foodShop.remainingTimeIntervalId);
    foodShop.remainingTime = undefined;
    document.getElementById("footcontainerID").style.display = "none";
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
