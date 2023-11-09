var closeBtn = document.getElementById('closeBtn');
var popup = document.getElementById('popup');

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