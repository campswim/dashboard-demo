# Order-staging Dashboard Demo

## Authors

Nathan Cox (<nate@campswim.co>)  

## Description

The order-staging dashboard tracks orders through their full lifecycle, from origination in the CRM to their transfer to the ERP, with built-in error tracking and resolution, and user authentication and authorization.

## Locations

1. Front-end
    - URL
      - Local development: `http://localhost:3000/`
      - Production: `https://campswim-dashboard-demo.netlify.app/`
      - CI/CD deploy: N/A (because Netlify charges to connect a private GitHub repo).
      - Manual deploy:
        - change the "REACT_APP_ENV" in the .env file to "production";
        - in the terminal, run "npm run build";
        - in the terminal, run "netlify deploy" for a preview, indicating "build" as the directory to deploy;
        - if satisfied with the preview, run "netlify deploy --prod" in the terminal, indicating "build" as the directory to deploy.
      - Environment: to avoid errors in Safari when setting third-party cookies, the following rewrite rule needs to be added to the top of the _redirects file in the build folder after "npm run build" but before "netlify deploy --prod":  `/api/* https://dashboard-api-ncompass-demo-f3b2c0dc9f7c.herokuapp.com/graphql/:splat 200`

2. Back-end
    - URL
      - Local development: `http://localhost:4000/graphql/`
      - Production endpoint: on Heroku.
      - CI/CD deploy: Deploys automatically to Heroku on pushes (or PRs) to the main branch.

## To Run the App Locally

- Run `npm i` from the CLI to install all necessary dependencies.
- Add the required environment variables in a .env file. (See sample files.)
- Run `npm start` in the root directory from the CLI in separate terminal windows for both the front- and backends.

## User Stories

- Dashboard page

  - Pushed Orders (currently hidden)

  - Staged Orders

    [x] As a user, I want to see a list of all pending orders by market (pulled but not pushed).  
    [x] As a user, I want to see a list of all orders that have failed to push.
    [x] As a user, I want to see a list of all orders ignored, by market.

  - Failed Processes

    [x] As a user, I want to see a summary of failed processes.
    [x] As a user, I want to be able to click on the name of the failed process and be redirected to its full list on its respective tab of the failed-processes page.

  - Failed Payments

    [x] As a user, I want to see a summary of failed payments.
    [x] As a user, I want to click on the failed-payment type and be redirected to its full l ist on its respective tab of the failed-payments page.

  - Missing CRM Items (currently hidden)

    [x] As a user, I want to have the option to generate a market-specific list of CRM items that are missing from the ERP.
    [x] As a user, I want to be able to indicate the number of days back to be used in generating the list.

  - Actions

    [ ] As an administrator, I want to initiate a pull operation manually.  
    [ ] As an administrator, I want to initiate a push operation manually.

- Failed Orders page

  - Failed to Pull tab

    [x] As a user, I want to to see a list of orders (with a count total) that have failed to pull, with some detail, such as Market, Warehouse, Total and the error message, without having to click on an additional button.
      [x] Full detail on desktop (> 1280px).
      [x] Partial detail with modal on mobile (< 1280px).
    [x] As an administrator, I want to select one, some, or all failed orders and perform any one of the following actions on them:  
      [x] repull (which deletes from Staging and pulls a fresh version of the order from the CRM);
      [x] ignore,

  - Failed to Push tab

    [x] As a user, I want to see a list of orders (with a count total) that have failed to be pushed into the ERP, with some detail, such as Order #, Market, Warehouse, and Error message.
      [x] Full detail on desktop (> 1280px).
      [x] Partial detail with modal on mobile (< 1280px).
    [x] As an administrator, I want to select one, some, or all failed orders and perform any one of the following actions on them:  
      [x] repush;  
      [x] delete;  
      [x] ignore.
  
  - Ignored Orders tab
    [x] As a user, I want to see a list of orders (with a count totla) that have been manually ignored, with details to include the name of the users who ignored them.
      [x] Full detail on desktop (> 1280px).
      [x] Partial detail with modal on mobile (< 1280px).
    [x] As an adminstrator, I want to select one, some, or all ignored orders and perform any one of the following actions on them:
      [x] unignore.

- Order Summary page

    [x] As a user, I want to see an order's detail from various places (CRM, Staging, ERP) to determine how far the order went through the workflow and compare order values among the various stages.  
    [ ] As an administrator, I want to be able to do the following:  
      [ ] pull an order manually if it only exists in the CRM;  
      [ ] repull or repull with mismatch if an order returns an error, showing these action buttons conditionally;
      [ ] repush and order manually if it returns an error, showing this button conditionally;
      [ ] push an order manually if it is in staging and not yet in the ERP;
      [ ] hide the pull option for the CRM if the order is in staging.

- Failed Processes page

  [x] As a user, I want to be shown a list of failed processes categorized by process, and some details.
    [x] Full detail on desktop (> 1280px).
    [x] Partial detail with modal on mobile (< 1280px).
  [x] As a user, I want to be able to choose to view include dismissed errors in the list or otherwise.
  [x] As an administrator, I want to be able to dismiss an error or reinstate it.

- Failed Payments page

  [x] As a user, I want to be shown a full list of failed payments with additional tabs listing each error by payment type, with some details of the cause of the failure.
    [x] Full detail on desktop (> 1280px).
    [x] Partial detail with modal on mobile (<1280px).
  [x] As a user, I want to be able to toggle the dismissed errors on and off.
  [x] As an administrator, I want to be able to dismiss and reinstate errors.

- Settings page

  [x] As an administrator, I would like:
    [x] to review the warehouse mappings and parameters at a glance, so that I may spot discrepancies in the way our business is importing orders;
      [x] Full detail on desktop (> 1280px).
      [x] Partial detail with modal on mobile (< 1280px).
    [x] to be able to edit certain values of each tab when needed, and for those changes to be logged to the database.

- User Authentication and Authorization

  [x] As a user:
    [x] I want to be able to  log in and log out of the application;
    [x] I want my logged-in session to persist until I log out (which functionality is browser specific and uses cookies, local storage, and session storage);
    [x] I want to be required to update my password after an administator registers my profile with a temporary password;
    [x] I want to be able to reset my password (which can be done via request to the adminstrator, who must delete and recreate the user with the same email address and any temporary password);
    [x] I want to be able to visit only those pages allowed by the role assigned to my profile;
    [x] I want an understandable error to be displayed in the event that I mistype my email or password.
  [x] As an adminstrator, I want:
    [x] to be able to register new users;
    [x] to be able to delete new users;
    [x] to be able to reset users' passwords;
    [x] tokens to be used to verify a user's right to access, instead of storing or relaying passwords;
    [x] to be able to change a user's name and role;
    [x] a deactivated user to be barred access to the site.

- Miscelaneous

  [ ] As a user, I'd like:
    [x] to be able to sort each column of each section in ascending or descending order;
    [ ] to be able to filter each column by specified criteria;
    [ ] to be able to toggle between dark and light themes;
    [ ] there to be caching of data that is rarely updated, so that each page loads as quickly as possible;
    [x] the app to use the secure HTTPs protocol, to ensure the security of the site (unless it is behind a firewall on a VPN).
  [ ] As an adminstrator, I'd like:
    [x] any changes made to editable fields to be logged in the database;
    [ ] to see a list of changes made to the editable fields and be able to determine how far back to generate the list.
  [ ] As a developer, I'd like the app to be deployed automatically whenever I make a pull request into the main branch:
    [x] backend;
    [ ] frontend.

## Sources

- The sorting algorithm used in the useSort hook was adapted from [here](https://www.smashingmagazine.com/2020/03/sortable-tables-react/).

## Notes

- The "_redirect"s" file houses core redirect from /api--considered a local path and thereby circumventing third-party cookie errors--to the actual API, deployed on heroku.
- This "_redirects" file has a companion file, called "_redirects.sample", which holds the contents of the "_redirects" file, this latter getting reset everytime a new build is run (npm run build). The "_redirects" file must mirror the "_redirects.sample" file or the app will break.
