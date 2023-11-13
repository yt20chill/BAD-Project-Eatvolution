var closeBtn = document.getElementById('closeBtn');
var popup = document.getElementById('popup');
var silmeType = "normal";

closeBtn.addEventListener('click', function () {
    popup.classList.remove('show'); // 移除 show 类，使其回到初始位置
});

// 显示 popup 元素
function showPopup() {
    popup.classList.add('show'); // 添加 show 类，使其从左侧弹出
}

function hidePopup() {
    popup.classList.remove('show'); // 移除 show 类，使其回到初始位置
}

// 移除初始的 hidden 类
window.addEventListener('load', function () {
    popup.classList.remove('hidden');
});

// 史來姆我行為 //

// 获取游戏容器和主角图像元素
var container = document.querySelector('.game_container');
var character = document.querySelector('.slime_character');

// 定义容器的宽度和主角图像的宽度
var containerWidth = container.offsetWidth;
var characterWidth = character.offsetWidth;

// 随机生成主角图像的左边距
var randomLeft = Math.floor(Math.random() * (containerWidth - characterWidth));

// 设置主角图像的初始位置
character.style.left = randomLeft + 'px';

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
        character.classList.remove('face_left')
    } else {
        character.classList.add('face_left')
    }
    // 获取主角图像的当前左边距
    var currentLeft = parseInt(character.style.left);

    // 判断是否到达移动范围的边界，若是则改变移动方向
    if (currentLeft <= minLeft || currentLeft >= maxLeft) {
        moveDirection *= -1;
    }

    // 根据移动方向更新主角图像的左边距
    var newLeft = currentLeft + moveSpeed * moveDirection;
    character.style.left = newLeft + 'px';

    // 每隔一段时间执行一次移动函数，实现连续移动效果
    setTimeout(moveCharacter, 50); // 可根据需要进行调整
}

// 调用移动函数开始主角图像的移动
moveCharacter();

function showPopupMenu() {
    var popup = document.getElementById("popupMenu");
    popup.style.display = "block";
}

function hidePopupMenu() {
    var popup = document.getElementById("popupMenu");
    popup.style.display = "none";
}

function closeFootContainer() {
    if (isFootContainerVisible) {
        footContainer.style.display = 'none';
        isFootContainerVisible = false;
    }
}

var footContainer = document.getElementById('footcontainerID');
var isFootContainerVisible = false;

document.addEventListener('mouseup', function (event) {
    var targetElement = event.target;
    console.log(targetElement)
    // 检查点击事件发生时的目标元素是否为footContainer或其内部元素
    var isClickInsideFootContainer = footContainer.contains(targetElement);

    if (!isClickInsideFootContainer && isFootContainerVisible) {
        // 点击了footContainer以外的地方且footContainer可见
        footContainer.style.display = 'none';
        isFootContainerVisible = false;
    }
});

// 点击food shop按钮时显示footContainer
document.getElementById('foodShopButton').addEventListener('click', async function () {
    footContainer.style.display = 'flex';
    isFootContainerVisible = true;
    await getShopItems()
});

// document.getElementById('foodShopButton').add.EventListener('click', async function () {
//     var footContainer = document.getElementById('footContainer');

//     if (footContainer.style.display === 'block') {
//         footContainer.style.display = 'none';
//         isFootContainerVisible = false;
//     } else {
//         footContainer.style.display = 'block';
//         isFootContainerVisible = true;
//         await getShopItems();
//     }
// });

async function getShopItems() {
    const res = await fetch("/api/shop");
    const { success, result } = await res.json();
    if (!success) return alert("something went wrong");

    // 更新每个卡片的 HTML 内容
    result.forEach((item, index) => {
        const { name, calories, cost, emoji } = item;
        const cardElement = document.getElementById(`card${index + 1}`);
        cardElement.querySelector(".name").textContent = name;
        cardElement.querySelector(".icon").textContent = emoji;
        cardElement.querySelector(".calories").textContent = `Calories: ${calories}`;
        cardElement.querySelector(".cost").textContent = `Cost: ${cost}`;
    });
}

async function login(username, password) {
    //for fetch method other than get (e.g. post)
    const res = await fetch("/auth/login", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        // body: JSON.stringify({username: username, password:password}) equals below
        body: JSON.stringify({ username, password })

    })
    const { success, result } = await res.json()
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
        return result;
        // console.log(result);

        // 更新货币余额

    } catch (error) {
        console.error(error);
        alert("Failed to get user data");
    }
}
function updateCoins(result) {
    result.money += +result.earningRate;
    document.querySelector('.card-text').textContent = `coin：${result.money}`;
}

async function getSlimeData() {
    try {
        const res = await fetch("/api/slime");
        if (!res.ok) {
            throw new Error("Failed to get slime data");
        }
        const { result } = await res.json();
        // console.log(result);

        const slime_type = document.querySelector('.slime_type');
        const current_calories = document.querySelector('.current_calories');
        const extra_calories = document.querySelector('.max_calories');

        slime_type.textContent = `Type :${result.slime_type} `
        current_calories.textContent = `Calories :${result.current_calories}/${result.max_calories} `
        extra_calories.textContent = `Extra Calories :${result.extra_calories ?? 0}`


    } catch (error) {
        console.error(error);
        alert("Failed to get slime data");
    }
};

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
        return result;
        // console.log(result);

        // 更新货币余额

    } catch (error) {
        console.error(error);
        alert("Failed to get user data");
    }
}
function updateCoins(result) {
    result.money += +result.earningRate;
    document.querySelector('.card-text').textContent = `coin：${result.money}`;
}

async function getSlimeData() {
    try {
        const res = await fetch("/api/slime");
        if (!res.ok) {
            throw new Error("Failed to get slime data");
        }
        const { result } = await res.json();
        // console.log(result);

        const slime_type = document.querySelector('.slime_type');
        const current_calories = document.querySelector('.current_calories');
        const extra_calories = document.querySelector('.max_calories');

        slime_type.textContent = `Type :${result.slime_type} `
        current_calories.textContent = `Calories :${result.current_calories}/${result.max_calories} `
        extra_calories.textContent = `Extra Calories :${result.extra_calories ?? 0}`


    } catch (error) {
        console.error(error);
        alert("Failed to get slime data");
    }
}

const updateDataAndRefresh = async () => {
    // await getUserFinance();
    // await getSlimeData();
    setTimeout(updateDataAndRefresh, 1000); //每一秒REFRESH 既CODE , 必要, 遲D 加返
};

window.onload = async () => {
    // get coins
    const finance = await getUserFinance();
    setInterval(function () { updateCoins(finance) }, 1000)
    // await getSlimeData();
    await updateDataAndRefresh();
    // await updateType()
}
// refresh shop bottom function

async function refreshShop() {
    const res = await fetch("/api/shop", {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const { success, result } = await res.json();
    if (!success) return alert("something went wrong");
    console.log(result)

    // 更新每个卡片的 HTML 内容
    result.forEach((item, index) => {
        const { name, calories, cost, emoji } = item;
        const cardElement = document.getElementById(`card${index + 1}`);
        cardElement.querySelector(".name").textContent = name;
        cardElement.querySelector(".icon").textContent = emoji;
        cardElement.querySelector(".calories").textContent = `Calories: ${calories}`;
        cardElement.querySelector(".cost").textContent = `Cost: ${cost}`;
    });
}

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

// eat function

const cardContainer = document.getElementById('food_card_containerID');
const gameContainer = document.getElementById('gamecontainer');
const cards = cardContainer.getElementsByClassName('card');

for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    card.addEventListener('click', async function () {
        closeFootContainer();
        const emoji = card.querySelector('.icon').innerText;
        const emojiElement = document.createElement('div');
        emojiElement.classList.add('emoji');
        emojiElement.innerText = emoji;

        gameContainer.appendChild(emojiElement);

        const gameContainerRect = gameContainer.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const emojiWidth = emojiElement.offsetWidth;
        const emojiHeight = emojiElement.offsetHeight;
        const leftOffset = gameContainerRect.left + gameContainerRect.width / 2 - emojiWidth / 2;
        const topOffset = cardRect.top - gameContainerRect.top - emojiHeight;

        emojiElement.style.left = leftOffset + 'px';
        emojiElement.style.top = topOffset + 'px';

        setTimeout(function () {
            emojiElement.style.transition = 'top 3s';
            emojiElement.style.left = gameContainerRect.width / 2 - emojiWidth / 2 + 'px';
            emojiElement.style.top = gameContainerRect.height - emojiHeight - 80 + 'px';

            setTimeout(function () {

                gameContainer.removeChild(emojiElement);

                const slimeCharacter = document.getElementById('slime_character');
                slimeCharacter.src = `./img/${silmeType}/eat.gif`;

                setTimeout(function () {

                    //slimeCharacter.src = './img/blue_jump.gif';
                    slimeCharacter.src = `./img/${silmeType}/jump.gif`;

                    setTimeout(function () {

                        //slimeCharacter.src = './img/blue_run.gif';
                        slimeCharacter.src = `./img/${silmeType}/move.gif`;
                    }, 1000); // 1秒後回到最初的圖片
                }, 2000); // 2秒後換成 'blue_jump.gif'
            }, 2000); // 2秒後換成 'blue_eat.gif'
        }, 0);
    });
}

async function tryMe() {
    silmeType = data.type
    document.getElementById('slime_character').src = `./img/${slimeType}}/move.gif`;
}
//food api -PUT , foodId: number ,success: boolean, result: Slime
