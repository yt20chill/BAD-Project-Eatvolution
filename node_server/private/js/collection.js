// 假设您有一个包含卡片数据的数组
const cardData = [
    { id: 1, title: "Card 1", content: "Content 1" },
    { id: 2, title: "Card 2", content: "Content 2" },
    // ... 其他卡片数据
];

// 获取放置卡片的容器元素
const cardsContainer = document.getElementById("cards-container");

// 使用 for 循环生成卡片并添加到容器中
for (let i = 0; i < cardData.length; i++) {
    const card = cardData[i];
    const cardElement = `
      <div class="card">
        <h2>${card.title}</h2>
        <p>${card.content}</p>
      </div>
    `;
    cardsContainer.innerHTML += cardElement;
}