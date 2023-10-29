# Slime Saga
Here are some notes that might be helpful during the development stage. The real documentation of this game is temporarily put inside the docs folder. (despite 404)

## Project init

```bash
yarn install
cp .env.example .env
# tested in macOS
createdb "slime_saga"
# OR in psql, run sql to create database
psql
CREATE DATABASE "slime_saga"
```

&nbsp;

## Rules to be observed

1. Make small commits
2. Write clear commit messages
3. Push often

No worries, github comes with version control. You can't break anything.
Still not confident? You can work on your own branch 😌. After making sure nothing is broken, merge with the `main` branch

&nbsp;

## Pull from git

normally, all completed features will be merged to `main`
it's important to keep your code updated with the latest main
```bash
# this line downloads the latest updates in main to your branch
git fetch origin main
# this line merge the changes to your branch
git merge origin/main
```
Running the second line may result in conflict if the same file happens to be changed from the last pull
You must resolve the conflicts manually. Next, push the resolved version to repo for your teammates 🥰
```bash
git add .
git commit -m "ci: merged with latest main"
git push
```

if you see a **U** in `src/db/migrations`, it means there are new migration files. Run this line to update to the latest db schema
```bash
npx knex migrate:latest
```

if you see a **M** in `package.json`, it means there are new packages installed. Run this line to update the node_modules
```bash
npm i
```

## Adding features

You may want to work on a new branch
```bash
# to create and switch to a new branch
git checkout -b {feature_name}
```

To switch to an existing brach
```bash
# if you have some edits that are not ready to be committed, stash them temporarily
# remember to pop out the stash when you get back to your current branch by git stash pop
git stash
git checkout {branch_name}
# to integrate with the latest main branch
git fetch origin main
git merge origin/main
```

Features are separated by folders
create new folder inside the `src` folder (./src), inside which, create:
- {feature_name}.controller.ts
- {feature_name}.service.ts

_NOTES_: Still studying how to use nest js. Seems like it has its own MVC structure other than the 2 ts files mentioned above. Will keep this README updated

&nbsp;

## Update database schema

We are using Beeno's quick-erd package to manage the database schema
Here is the documentation FYR
https://github.com/beenotung/quick-erd/tree/master

**Always** update the erd together with the db
**Never** amend the migration files after it was pushed to github

### Manual update

For the sake of practice, I recommend doing manual updates
```bash
# to make a new migration file
npm run knex migrate:make {action}-{table affected}
# to run the new migration file
npm run knex migrate:latest
# to update the erd.txt
npx pg-to-erd > erd.txt
```
**IMPORTANT** use npx to run this cli instead of yarn since yarn contains unnecessary headers that will be saved to the erd.txt file

### Auto update
Apparently, Beeno has a way to do auto-migration from the erd.txt but for now we may just do it manually for practice 🙃. This is the line you need
```bash
npx auto-migrate pg < erd.txt
```
_NOTES_: You have to make sure that the erd.txt is correct and up-to-date. Don't run this line when in doubt.
**IMPORTANT**: always check the correctness of the generated script. Change when deem fit.
From my understanding, quick-erd doesn't support `default` values and `check` constraints. Those need to be added manually to the knex migration files



&nbsp;

## Seeding db

Unlike migrations, seed file can be modified however you like. It is recommended to have only **1** seed file to avoid ordering issues.
```bash
# to create new seed file
npm run knex seed:make {order number}-{description}
```

## Appendix

### eslint and prettier

nest js comes with eslint and prettier packages. The coding style errors can sometimes be annoying (👀 at Leo).
Solution: spam the `Ctrl/Cmd+S` as you like on the go. Those formatting issues should be resolved automatically when you save the file.
Run the `npx format` script with **caution** as it changes almost every files and is highly likely that it will create conflicts when others try to pull the latest change.

&nbsp;

### Naming convention

#### Go for clarity

It's okay to have a long but clear variable name than short but ambiguous one. Good variable names facilitates code understanding. Plus Intellisense will complete the typing for us so we don't have to type the whole name by ourselves.


#### Case format when naming different things 

- `python`: snake_case
- `js/ts`: camelCase
- `db`: snake_case
- `class` (both js and python): PascalCase
- `type/interface`: PascalCase
- `constants`: SCREAMING_SNAKE_CASE


### Useful Links
- [Winston Logger in Nest js](https://timothy.hashnode.dev/advance-your-nestjs-application-with-winston-logger-a-step-by-step-guide)
- [CalorieNinjas](https://calorieninjas.com/)
&nbsp;



### CalorieNinjas API

request example
GET `https://api.calorieninjas.com/v1/nutrition?query=oranges`

response example
```json
{
    "items": [
        {
            "name": "oranges",
            "calories": 49.8,
            "serving_size_g": 100.0,
            "fat_total_g": 0.1,
            "fat_saturated_g": 0.0,
            "protein_g": 0.9,
            "sodium_mg": 1,
            "potassium_mg": 23,
            "cholesterol_mg": 0,
            "carbohydrates_total_g": 12.5,
            "fiber_g": 2.2,
            "sugar_g": 8.6
        }
    ]
}
```