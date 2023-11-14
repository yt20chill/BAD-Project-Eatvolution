// collection page js
// const title = document.getElementById('title');
// const slideFirst = document.getElementById('slideFirst');
// const slideSecond = document.getElementById('slideSecond');
// const slideThird = document.getElementById('slideThird');

// window.onload = async () => {

//   slideFirst = document.querySelector('.slideFirst');
//   slideSecond = document.querySelector('.slideSecond');
//   slideThird = document.querySelector('.slideThird');
//   prev = document.querySelector('#prev');
//   next = document.querySelector('#next');

//   getFoodCollection()
// }

// let inner = document.querySelector('.carousel-inner')

// inner.addEventListener("DOMContentLoaded", async () => {
//   await getFoodCollection()
// })

window.onload = async () => {
  let title;
  await getFoodCollection();
};

function changePage() {
  const next = document.querySelector("#next");
  const prev = document.querySelector("#prev");
  const slideFirst = document.querySelector(".slideFirst");
  const slideSecond = document.querySelector(".slideSecond");
  const slideThird = document.querySelector(".slideThird");
  const indicators = document.querySelector(".carousel-indicators");

  let page = 0;
  next.addEventListener("click", async (e) => {
    if (page < 2) {
      document.getElementById(`collection-${++page}`).click();
    } else {
      page = 0;
      document.getElementById(`collection-${page}`).click();
    }
    console.log({ page });
  });

  prev.addEventListener("click", async (e) => {
    if (page > 0) {
      document.getElementById(`collection-${--page}`).click();
    } else {
      page = 2;
      document.getElementById(`collection-${page}`).click();
    }
    console.log({ page });
  });

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

changePage();

async function getFoodCollection() {
  const res = await fetch("/api/collection/food");
  const result = await res.json();
  const foodCollectionListLock = result.result.locked.universal;
  const foodCollectionListUnlock = result.result.unlocked.universal;
  const foodCollectionListCustom = result.result.unlocked.custom;
  console.log(foodCollectionListLock);
  console.log(foodCollectionListUnlock);
  console.log(`L7${foodCollectionListLock[7]}`);
  // console.log(result.result.unlocked.universal[0].food_name
  // )
  // console.log(foodCollectionListUnlock[0].emoji)

  const cardUniversal = document.querySelector(".universal");
  const cardCustom = document.querySelector(".custom");

  for (let x = 0; x < foodCollectionListCustom.length; x++) {
    const cardTemplateCustom = `  <script>
    function flipCard(card) {
        card.classList.toggle('flipped');
    }
</script>

<div class="setup_card_container">
    <div class="myCard">
        <div class="innerCard" onclick="flipCard(this)">
            <div class="frontSide">
            <p class="nameFood" style="font-size: 20px; color: black;margin-bottom: 7px;">${foodCollectionListCustom[x].food_name}
            </p>
                <p class="title" style="font-size: 80px;">${foodCollectionListCustom[x].emoji}</p>
                <p style="margin-top: 15px;">Click Me</p>
            </div>
            <div class="backSide">
                <p class="list">${foodCollectionListCustom[x].category_name}</p>
                <p class="list">Calories:${foodCollectionListCustom[x].calories}</p>
                <p class="list">Protein:${foodCollectionListCustom[x].protein}</p>
                <p class="list">Fat:${foodCollectionListCustom[x].fat}</p>
                <p class="list">Carbohydrates:${foodCollectionListCustom[x].carbohydrates}</p>
                <p class="list">Fibre:${foodCollectionListCustom[x].fibre}</p>
                <p class="list">Sugar:${foodCollectionListCustom[x].sugar}</p>
                <p class="list">Sodium:${foodCollectionListCustom[x].sodium}</p>
                <p>Leave Me</p>
            </div>
        </div>
    </div>
</div>`;
    cardCustom.innerHTML += cardTemplateCustom;
  }

  for (let j = 0; j < foodCollectionListUnlock.length; j++) {
    const cardTemplateUnLock = `  <script>
    function flipCard(card) {
        card.classList.toggle('flipped');
    }
</script>

<div class="setup_card_container">
    <div class="myCard">
        <div class="innerCard" onclick="flipCard(this)">
            <div class="frontSide">
            <p class="nameFood" style="font-size: 20px; color: black;margin-bottom: 7px;">${foodCollectionListUnlock[j].food_name}
            </p>
                <p class="title" style="font-size: 80px;">${foodCollectionListUnlock[j].emoji}</p>
                <p style="margin-top: 15px;">Click Me</p>
            </div>
            <div class="backSide">
                <p class="list">${foodCollectionListUnlock[j].category_name}</p>
                <p class="list">Calories:${foodCollectionListUnlock[j].calories}</p>
                <p class="list">Protein:${foodCollectionListUnlock[j].protein}</p>
                <p class="list">Fat:${foodCollectionListUnlock[j].fat}</p>
                <p class="list">Carbohydrates:${foodCollectionListUnlock[j].carbohydrates}</p>
                <p class="list">Fibre:${foodCollectionListUnlock[j].fibre}</p>
                <p class="list">Sugar:${foodCollectionListUnlock[j].sugar}</p>
                <p class="list">Sodium:${foodCollectionListUnlock[j].sodium}</p>
                <p>Leave Me</p>
            </div>
        </div>
    </div>
</div>`;

    cardUniversal.innerHTML += cardTemplateUnLock;
  }

  for (let i = 0; i < foodCollectionListLock.length; i++) {
    const cardTemplateLock = `   
<div class="setup_card_container">
    <div class="myCard">
        <div class="innerCard" >
            <div class="frontSide">
                <p class="title"><i class="fa-solid fa-question" style="font-size: 120px;"></i></p>
                <p style="font-size: 20px;margin-top: 5px;"><i class="fa-solid fa-question"></i><i
                        class="fa-solid fa-question"></i><i class="fa-solid fa-question"></i><i
                        class="fa-solid fa-question"></i><i class="fa-solid fa-question"></i></p>
            </div>
        </div>
    </div>
</div>`;
    cardUniversal.innerHTML += cardTemplateLock;
  }

  // const foodCollectionData = foodCollectionList.result
  // console.log(foodCollectionData)
}

async function getCustomCollection() {
  const res = await fetch("/api/collection/food");
  const result = await res.json();
}

title = document.getElementById("title");
// getFoodCollection()
// if (slideFirst) {
title.innerHTML = ` <h2>${"123"}</h2>`;
// } else if (slideSecond) {
//   title.innerHTML = ` <h2>${'456'}</h2>`
// } else if (slideThird) {
//   title.innerHTML = ` <h2>${'789'}</h2>`
// }
