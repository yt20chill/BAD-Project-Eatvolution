const slime = { type: undefined, bmr: undefined, cal: undefined, maxCal: undefined, extraCal: undefined, isEvolving: false, updateIntervalId: undefined };
const user = { money: undefined, earningRate: undefined };
let foodShopCoinIntervalId;
let isFootContainerVisible = false;

function updateShopCoins() {
  if (foodShopCoinIntervalId) clearInterval(foodShopCoinIntervalId);
  foodShopCoinIntervalId = setInterval(
    () => (document.querySelector("#shop-coin").textContent = `${user.money}`),
    1000
  );
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
  if (isFootContainerVisible) {
    if (foodShopCoinIntervalId) clearInterval(foodShopCoinIntervalId);
    document.getElementById("footcontainerID").style.display = "none";
    isFootContainerVisible = false;
  }
}

// close food shop if clicked elsewhere
document.addEventListener("mouseup", function (event) {
  var targetElement = event.target;
  // 检查点击事件发生时的目标元素是否为footContainer或其内部元素
  const isClickInsideFootContainer = document
    .getElementById("footcontainerID")
    .contains(targetElement);

  if (!isClickInsideFootContainer && isFootContainerVisible) {
    // 点击了footContainer以外的地方且footContainer可见
    document.getElementById("footcontainerID").style.display = "none";
    isFootContainerVisible = false;
  }
});

// 点击food shop按钮时显示footContainer
document.getElementById("foodShopButton").addEventListener("click", async function () {
  document.getElementById("footcontainerID").style.display = "flex";
  isFootContainerVisible = true;
  await getShopItems();
});
