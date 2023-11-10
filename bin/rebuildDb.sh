dropdb eatvolution
dropdb eatvolution_test
createdb eatvolution
createdb eatvolution_test

cd "$(dirname "$0")/node_server"
npm run knex migrate:latest
npm run knex seed:run
npm run knex:test migrate:latest
npm run knex:test seed:run