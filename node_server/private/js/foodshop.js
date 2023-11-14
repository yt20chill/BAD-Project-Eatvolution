async function refreshShop() {
  const res = await fetch("/api/shop", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { success, result } = await res.json();
  if (!success) return alert(result);

  // 更新每个卡片的 HTML 内容
  result.forEach((item, index) => {
    const { name, calories, cost, emoji, id: foodId } = item;
    const cardElement = document.getElementById(`card${index + 2}`);
    cardElement.setAttribute("food-id", foodId);
    cardElement.querySelector(".name").textContent = name;
    cardElement.querySelector(".icon").textContent = emoji;
    cardElement.querySelector(".calories").textContent = `Calories: ${calories}`;
    cardElement.querySelector(".cost").textContent = `Cost: ${cost}`;
  });
}


// possible evolve action
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
  if (success) closeFootContainer();
}