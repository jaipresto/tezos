# Tezos Transactions
An elementary web app for viewing transactions from the Tezos Blockchain, lazy-load style. Transactions will be pulled as available from the [Tezos](https://tezos.com/) API using [Operation Table](https://tzstats.com/docs/api/index.html#operation-table). The list is configurable, with options for displaying more fields, ordering, and more.

**LIVE:** https://tezos.jaipreston.com

## Getting Started
1) Clone or download the repo into a fresh folder on your machine.
2) Run `npm install` from the project root to install dependencies.

## Tech
* Typescript
* [Angular 11](https://next.angular.io)
* [Angular Material](https://next.material.angular.io)
* [NGRX](https://ngrx.io/)
* [CORS Anywhere](https://github.com/Rob--W/cors-anywhere) because CORS.
* [Cypress](https://cypress.io)

## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Unit Tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## End-to-End Tests

Run `npm run e2e` to execute e2e tests via [Cypress](https://cypress.io). This will start a dev server on port 4200 (Angular default), and then run cypress.


## Notes
To solve CORS issues, a (Cors Anywhere)-powered proxy is used for pulling transactions from the API.
But this is only for the [live app](https://tezos.jaipreston.com); localhost has no problems.


# In the Pipeline
* Get whitelisted by Tezos for automatic CORS support, thereby removing need for proxy.

# Ideas
Some feature considerations:
* Saving settings to local storage.
* More list configuration options:
  - More [fields](https://tzstats.com/docs/api/index.html#operation-table)
  - different currencies conversions
  - filtering senders
* Dark and/or custom themes.
* Comprehensive error handling, including styling, http request, and connection problems.
* More coherent styling.