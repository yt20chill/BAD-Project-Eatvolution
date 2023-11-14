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

  await changePage();
  await getFoodCollection();
  await getCustomCollection()

}


async function changePage() {
  const next = document.querySelector("#next");
  const prev = document.querySelector("#prev");
  const title = document.querySelector('#title');

  let page = 0;
  next.addEventListener("click", async (e) => {
    if (page < 2) {
      const nextBtn = document.getElementById(`collection-${++page}`)
      title.textContent = nextBtn.dataset.title
      nextBtn.click();
    } else {
      page = 0;
      const nextBtn = document.getElementById(`collection-${page}`)
      title.textContent = nextBtn.dataset.title
      nextBtn.click();
    }
    console.log({ page });
  });

  prev.addEventListener("click", async (e) => {

    if (page > 0) {
      const prevBtn = document.getElementById(`collection-${--page}`)
      title.textContent = prevBtn.dataset.title
      prevBtn.click();
    } else {
      page = 2;
      const prevBtn = document.getElementById(`collection-${page}`)
      title.textContent = prevBtn.dataset.title
      prevBtn.click();
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
                <p class="list-title">${foodCollectionListUnlock[j].category_name}</p>
                <p class="list">Calories:${foodCollectionListUnlock[j].calories}</p>
                <p class="list">Protein:${foodCollectionListUnlock[j].protein}</p>
                <p class="list">Fat:${foodCollectionListUnlock[j].fat}</p>
                <p class="list">Carbohydrates:${foodCollectionListUnlock[j].carbohydrates}</p>
                <p class="list">Fibre:${foodCollectionListUnlock[j].fibre}</p>
                <p class="list">Sugar:${foodCollectionListUnlock[j].sugar}</p>
                <p class="list">Sodium:${foodCollectionListUnlock[j].sodium}</p>
               
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
  const res = await fetch("/api/collection/slime");
  const result = await res.json();
  console.log({ result })
  const userSlimeType = result.result
  const cardSlimeType = document.querySelector('.slimeType')
  let totalType = 4 - userSlimeType.length



  for (let i = 0; i < userSlimeType.length; i++) {
    const cardTemplateSlimeType = `  <script>
    function flipCard(card) {
        card.classList.toggle('flipped');
    }
</script>

<div class="setup_card_container">
    <div class="myCard">
        <div class="innerCard" onclick="flipCard(this)">
            <div class="frontSide">
                <p class="title" style="font-size: 20px;">${userSlimeType[i].name}</p>
                <p style="margin-top: 15px;">Click Me</p>
            </div>
            <div class="backSide">
                <p class="list-title">${userSlimeType[i].name}</p>
                <p class="list">Description: ${userSlimeType[i].description}</p>
                <p class="list">Calories(Max): ${userSlimeType[i].max_calories}</p>
                <p class="list">BMR: ${userSlimeType[i].bmr_multiplier}</p>
                <p class="list">Earn Rate: ${userSlimeType[i].earn_rate_multiplier}</p>
               
            </div>
        </div>
    </div>
</div>`

    cardSlimeType.innerHTML += cardTemplateSlimeType
  }



  for (let j = 0; j < totalType; j++) {

    const cardTemplateTypeLock = `   
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
    </div>`

    cardSlimeType.innerHTML += cardTemplateTypeLock


  }


}


