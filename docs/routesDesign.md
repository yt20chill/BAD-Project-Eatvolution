# URL design

- /
- /game
- /collections

# route design

## auth

- `/auth/login`
	- `POST` req.body: { username: string, password: string }
	- return boolean
- `/auth/signup`
	- `POST` req.body: { username: string, password: string, confirmPassword: string }
	- return boolean
- `/auth/login-google`
	- `GET` return boolean

## food
`/api/food`
- POST: user custom food/recipe
	- expect req.body in json `{ user_id, slime_id, recipe: string }`
	- return `{ success: boolean, result: Slime|error.message }`


## collection

`/api/collection/food`
- GET: return food collections for that user
	- return `{ success: boolean, result: ExportFoodCollection }`

`/api/collection/slime`
- GET: return slime collections for that user
	- return `{ success: boolean, result: ExportSlimeCollection }`

## user

`/api/user/finance`
- `GET`: return `{ success: boolean, result: FinancialData }`

## shop
`/api/shop`
- `GET`: get shop items
	- return `{success: boolean, result: BriefFood[]}`
- `PUT`: refresh shop for user
	- return `{success: boolean, result: BriefFood[]}`

## slime
`/api/slime`
**TO BE FILLED**