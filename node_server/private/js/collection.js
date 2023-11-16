window.onload = async () => {

  await changePage();
  await getFoodCollection();
  await getSlimeTypeCollection();

}





function flipCard(card) {
  card.classList.toggle('flipped');
  let clickCardSound = new Audio("./mp3/clickDex.mp3");
  clickCardSound.play();
  clickCardSound = null;
}

async function changePage() {
  try {
    const next = document.querySelector("#next");
    const prev = document.querySelector("#prev");
    const title = document.querySelector('#title');
    const slideFirst = document.querySelector('.slideFirst')
    const slideSecond = document.querySelector('.slideSecond')
    const slideThird = document.querySelector('.slideThird')

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

    slideFirst.addEventListener("click", async (e) => {
      const firstBtn = document.getElementById(`collection-0`)
      title.textContent = firstBtn.dataset.title
    })

    slideSecond.addEventListener("click", async (e) => {
      const secondBtn = document.getElementById(`collection-1`)
      title.textContent = secondBtn.dataset.title
    })

    slideThird.addEventListener("click", async (e) => {
      const thirdBtn = document.getElementById(`collection-2`)
      title.textContent = thirdBtn.dataset.title
    })
  } catch (error) {
    console.error(error);
  }

}


async function getFoodCollection() {
  try {
    const res = await fetch("/api/collection/food");
    const result = await res.json();
    const foodCollectionListLock = result.result.locked.universal;
    const foodCollectionListUnlock = result.result.unlocked.universal;
    const foodCollectionListCustom = result.result.unlocked.custom;
    const cardUniversal = document.querySelector(".universal");
    const cardCustom = document.querySelector(".custom");

    //Custom
    for (let x = 0; x < foodCollectionListCustom.length; x++) {
      const cardTemplateCustom = `  

<div class="setup_card_container">
    <div class="myCard">
        <div class="innerCard" onclick="flipCard(this)">
            <div class="frontSide">
            <p class="nameFood" style="font-size: 20px; color: black;margin-bottom: 7px;">${(foodCollectionListCustom[x].food_name).toUpperCase()}
            </p>
                <p class="title" style="font-size: 80px;">${foodCollectionListCustom[x].emoji}</p>
                <p style="margin-top: 15px;">Click Me</p>
            </div>
            <div class="backSide">
                <p class="list-title">${foodCollectionListCustom[x].category_name}</p>
                <div class="groupList">
                <p class="list">Calories : ${foodCollectionListCustom[x].calories}</p>
                <p class="list">Protein : ${foodCollectionListCustom[x].protein}</p>  
                <p class="list">Sodium : ${foodCollectionListCustom[x].sodium}</p>
                <p class="list">Carbs : ${foodCollectionListCustom[x].carbohydrates}</p>
                <p class="list">Fibre : ${foodCollectionListCustom[x].fibre}</p>
                <p class="list">Sugar : ${foodCollectionListCustom[x].sugar}</p>
                <p class="list">Fat : ${foodCollectionListCustom[x].fat}</p>
                </div>
               
            </div>
        </div>
    </div>
</div>`;

      cardCustom.innerHTML += cardTemplateCustom;
    }
    //Food Unlock 
    for (let j = 0; j < foodCollectionListUnlock.length; j++) {
      const cardTemplateUnLock = `  
<div class="setup_card_container">
    <div class="myCard">
        <div class="innerCard" onclick="flipCard(this)">
            <div class="frontSide">
            <p class="nameFood" style="font-size: 20px; color: black;margin-bottom: 7px;">${(foodCollectionListUnlock[j].food_name).toUpperCase()}
            </p>
                <p class="title" style="font-size: 80px;">${foodCollectionListUnlock[j].emoji}</p>
                <p style="margin-top: 15px;">Click Me</p>
            </div>
            <div class="backSide">
                <p class="list-title">${foodCollectionListUnlock[j].category_name}</p>
                <div class="groupList">
                <p class="list">Calories : ${foodCollectionListUnlock[j].calories}</p>
                <p class="list">Protein : ${foodCollectionListUnlock[j].protein}</p>  
                <p class="list">Sodium : ${foodCollectionListUnlock[j].sodium}</p>
                <p class="list">Carbs : ${foodCollectionListUnlock[j].carbohydrates}</p>
                <p class="list">Fibre : ${foodCollectionListUnlock[j].fibre}</p>
                <p class="list">Sugar : ${foodCollectionListUnlock[j].sugar}</p>
                <p class="list">Fat : ${foodCollectionListUnlock[j].fat}</p>
                </div>
               
            </div>
        </div>
    </div>
</div>`;

      cardUniversal.innerHTML += cardTemplateUnLock;
    }

    //Food Lock 
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

  } catch (error) {
    console.error(error);
  }

}

async function getSlimeTypeCollection() {
  try {
    const res = await fetch("/api/collection/slime");
    const result = await res.json();
    console.log({ result })
    const userSlimeType = result.result
    const cardSlimeType = document.querySelector('.slimeType')
    let totalType = 4 - userSlimeType.length

    const slimeTypePhoto = new Map()
    slimeTypePhoto.set('Balance', '/game/img/Balance/jump.gif')
    slimeTypePhoto.set('Keto', '/game/img/Keto/jump.gif')
    slimeTypePhoto.set('Obese', '/game/img/Obese/jump.gif')
    slimeTypePhoto.set('Skinny Fat', '/game/img/Skinny/jump.gif')

    for (let i = 0; i < userSlimeType.length; i++) {
      const cardTemplateSlimeType = ` 
  <div class="setup_card_container">
      <div class="myCard">
          <div class="innerCard" onclick="flipCard(this)">
              <div class="frontSide">
              <div class="slimePhoto">
                  <img src="${slimeTypePhoto.get(userSlimeType[i].name)}" alt="Type Balance">
              </div>
              <div class="slimeTypeTxt">
                  <p class="title" style="font-size: 20px;">${userSlimeType[i].name}</p>
                  <p class="click">Click Me</p>
              </div>
          </div>
              <div class="backSide">
              <div class="groupList">
                  <p class="list-title">${userSlimeType[i].name}</p>
                  <p class="list" style="text-align: start;">Description :<br>${userSlimeType[i].description}</p>
                  <p class="list">Calories(Max) : ${userSlimeType[i].max_calories}</p>
                  <p class="list">BMR : ${userSlimeType[i].bmr_multiplier}</p>
                  <p class="list">Earn Rate : ${userSlimeType[i].earn_rate_multiplier}</p>
                 </div>
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
  } catch (error) {
    console.error(error);
  }
}




