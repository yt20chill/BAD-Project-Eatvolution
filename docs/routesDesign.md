# URL design

/
/game
/collections/food
/collections/slime

# route design

## auth

/auth/login
/auth/signup
/oauth/google

## food

/api/food
- POST: feed slime
	- expect req.body in json { user_id, slime_id, food_id }

/api/food/:id
- GET: show food nutrient values

## collection

/api/collections/food
- GET: return food collections for that user

/api/collections/slime
- GET: return slime collections for that user

