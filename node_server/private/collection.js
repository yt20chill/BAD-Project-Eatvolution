// // 假设您有一个包含卡片数据的数组
// const cardData = [
//   { id: 1, title: "Card 1", content: "Content 1" },
//   { id: 2, title: "Card 2", content: "Content 2" },
//   // ... 其他卡片数据
// ];

// 获取放置卡片的容器元素
// Lai ka
// const cardsContainer = document.getElementById("cards-container");

// // 使用 for 循环生成卡片并添加到容器中
// for (let i = 0; i < 150; i++) {
//   const card = cardData[i];
//   const cardElement = `
//       <div class="card">
//         <h2>${card.title}</h2>
//         <p>${card.content}</p>
//       </div>
//     `;
//   cardsContainer.innerHTML += cardElement;
// }

// collection page js
// const title = document.getElementById('title');
// const slideFirst = document.getElementById('slideFirst');
// const slideSecond = document.getElementById('slideSecond');
// const slideThird = document.getElementById('slideThird');

let title;

// window.onload = async () => {
title = document.getElementById('title');
//   slideFirst = document.querySelector('.slideFirst');
//   slideSecond = document.querySelector('.slideSecond');
//   slideThird = document.querySelector('.slideThird');
//   prev = document.querySelector('#prev');
//   next = document.querySelector('#next');

//   getFoodCollection()
// }

function changePage() {
  const next = document.querySelector('#next')
  const prev = document.querySelector('#prev')
  const slideFirst = document.querySelector('.slideFirst')
  const slideSecond = document.querySelector('.slideSecond')
  const slideThird = document.querySelector('.slideThird')
  const indicators = document.querySelector('.carousel-indicators')

  let page = 0;
  next.addEventListener('click', async (e) => {
    if (page < 2) {
      document.getElementById(`collection-${++page}`).click()
    } else {
      page = 0
      document.getElementById(`collection-${page}`).click()
    }
    console.log({ page })
  })

  prev.addEventListener('click', async (e) => {
    if (page > 0) {
      document.getElementById(`collection-${--page}`).click()
    } else {
      page = 2
      document.getElementById(`collection-${page}`).click()
    }
    console.log({ page })
  })

  // indicators.style.setProperty('width','100%')
  // indicators.style.setProperty('margin-left','0','!important')
  // indicators.style.setProperty('top','0')
  // indicators.style.setProperty('height','100%')


  // slideFirst.innerHTML = `  <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${page}"
  // class="active slide-btn slideFirst" aria-current="true" aria-label="Slide 1"></button>`
  // slideSecond.innerHTML = ` <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${page}" aria-label="Slide 2"
  // class="slide-btn slideSecond"></button>`
  // slideThird.innerHTML = ` <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${page}" aria-label="Slide 3"
  // class="slide-btn slideThird"></button>`


}

changePage()

// slideFirst.innerHTML = `  <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${page}"
// class="active slide-btn slideFirst" aria-current="true" aria-label="Slide 1"></button>`
// slideSecond.innerHTML = ` <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${page}" aria-label="Slide 2"
// class="slide-btn slideSecond"></button>`
// slideThird.innerHTML = ` <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${page}" aria-label="Slide 3"
// class="slide-btn slideThird"></button>`







async function getFoodCollection() {

  const res = await fetch("/api/collection/food");
  const result = await res.json();
  const foodCollectionListLock = result.result.locked.universal
  const foodCollectionListUnlock = result.result.unlocked.universal
  console.log(foodCollectionListLock)
  console.log(foodCollectionListUnlock)
  console.log(`L7${foodCollectionListLock[7]}`)
  console.log(result.result.unlocked.universal[0].food_name
  )
  console.log(result.result.unlocked.universal[0].id
  )
  console.log(foodCollectionListLock.length)


  for (const lock of foodCollectionListLock) {
    const card = document.querySelector('.card-container')
    card.innerHTML += `   
<div class="setup_card_container">
    <div class="myCard">
        <div class="innerCard" >
            <div class="frontSide">
                <p class="title" style="font-size: 120px;"><i class="fa-solid fa-question"></i></p>
                <p style="font-size: 20px;"><i class="fa-solid fa-question"></i><i
                        class="fa-solid fa-question"></i><i class="fa-solid fa-question"></i><i
                        class="fa-solid fa-question"></i><i class="fa-solid fa-question"></i></p>
            </div>
        </div>
    </div>
</div>`


  }
  console.log(foodCollectionListLock.length)
  const card = document.querySelector('.card-container')
  for (let i = 0; i < foodCollectionListLock.length; i++) {

    const cardTemplateLock = `   
<div class="setup_card_container">
    <div class="myCard">
        <div class="innerCard" >
            <div class="frontSide">
                <p class="title" style="font-size: 120px;"><i class="fa-solid fa-question"></i></p>
                <p style="font-size: 20px;"><i class="fa-solid fa-question"></i><i
                        class="fa-solid fa-question"></i><i class="fa-solid fa-question"></i><i
                        class="fa-solid fa-question"></i><i class="fa-solid fa-question"></i></p>
            </div>
        </div>
    </div>
</div>`
    card.innerHTML += cardTemplateLock;
  }

  const cardTemplateUnLock = `   
  <div class="setup_card_container">
  <div class="myCard">
      <div class="innerCard" onclick="flipCard(this)">
          <div class="frontSide">
              <p class="title" style="font-size: 120px;"><i class="fa-solid fa-question"></i></p>
              <p style="font-size: 20px;"><i class="fa-solid fa-question"></i><i
                      class="fa-solid fa-question"></i><i class="fa-solid fa-question"></i><i
                      class="fa-solid fa-question"></i><i class="fa-solid fa-question"></i></p>
          </div>
          <div class="backSide">
              <p class="title">BACK SIDE</p>
              <p>Leave Me</p>
          </div>
      </div>
  </div>
</div>`





  // const foodCollectionData = foodCollectionList.result
  // console.log(foodCollectionData)


}


// getFoodCollection()
// if (slideFirst) {
title.innerHTML = ` <h2>${'123'}</h2>`
// } else if (slideSecond) {
//   title.innerHTML = ` <h2>${'456'}</h2>`
// } else if (slideThird) {
//   title.innerHTML = ` <h2>${'789'}</h2>`
// }







