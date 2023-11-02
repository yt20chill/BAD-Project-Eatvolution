# nodejs server

init or if you see a **M** in `package.json`, run this line to update the node_modules

```bash
yarn install
```

if you see a **U** in `src/db/migrations`, it means there are new migration files. Run this line to update to the latest db schema

```bash
npx knex migrate:latest
```

&nbsp;

## Separate features by folders

create new folder inside the `src` folder (./src), inside which, create:

- {feature_name}.service.ts
- {feature_name}.controller.ts (optional)
- {feature_name}.route.ts (optional)

e.g. for authentication
```bash
# assume your current directory is in node_server/
mkdir ./src/auth
touch ./src/auth/auth.controller.ts
touch ./src/auth/auth.service.ts
touch ./src/auth/auth.routes.ts
```

_NOTES_: Still studying how to use nest js. Seems like it has its own MVC structure other than the 2 ts files mentioned above. Will keep this README updated

20231102: let's build on `express` first. Forget about nest js

&nbsp;

## Grouping instances

All service and controller instances are created and exported inside the `container.ts` file right under `./src`. This is to avoid cross-import issues which can be hard to debug.

&nbsp;

## Format of server response (for Controllers)

All controllers methods should have the return value looks like this: `{ success: boolean, result: ResultType }` for easier handling in frontend

You may want to use `AppUtils` (./src/utils/utils) function: `setServerResponse<T=null>(result: T, success: boolean)` to help construct the response.
- It takes 0-2 arguments and a generic type (default = null), examples:
```ts
// no arg and type, result default = null and success = true
return AppUtils.setServerResponse()	// return {success: true, result: null}
// 1 arg and type = number, success default = true
return AppUtils.setServerResponse<number>(1)	// {success: true, result: 1}
// 2 args
return AppUtils.setServerResponse<string>("error", false)	// {success: false, result: "error"}
```

&nbsp;

## Error handling

`Services` and `controllers` can just throw an error when anything goes wrong. All errors will be handled by the final exception handler which will return the result to the frontend in the format of `{ success: false, result: error.message }` and an http error status.

To achieve this, `AppUtils.exceptionWrapper` should be applied to controllers' methods in the `*.routes.ts` file
```ts
export const authRoutes = Router();
authRoutes.post("/login", AppUtils.exceptionWrapper(authController.login));
```



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
