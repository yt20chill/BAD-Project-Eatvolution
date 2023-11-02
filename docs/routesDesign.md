# URL design

/
/game
/collections

# route design

## auth

/auth/login
/auth/signup
/oauth/google

## food

/api/food
- PUT: feed slime
	- expect req.body in json `{ user_id, slime_id, food_id }`
	- return `{ success: boolean, result: Slime|error.message }`
- POST: user custom food/recipe
	- expect req.body in json `{ user_id, slime_id, recipe: string }`
	- return `{ success: boolean, result: Slime|error.message }`

/api/food/:id
- GET: show food nutrient values
	- return `{ success: boolean, result: Food }`

## collection

/api/collections/food
- GET: return food collections for that user
	- return `{ success: boolean, result: Food[] }`

/api/collections/slime
- GET: return slime collections for that user
	- return `{ success: boolean, result: SlimeType[] }`

