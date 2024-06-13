# nCompass | Order-staging Dashboard

## Authors

Nathan Cox (<nate@campswim.co>)  
Chad Larson (<chad@ncompass.org>)

## Description

The nCompass order-staging dashboard tracks orders through their full lifecycle, from origination in the CRM to the ERP, with built-in error tracking and resolution, and user authentication and authorization.

## Locations

1. Front-end
    - URL
      - Local development: `http://localhost:3000/`
      - Development on server: `https://hulk.yoli.net:3003`
      - Manual deploy: `http://hulk.yoli.net:3001/`
      - CI/CD deploy: `http://hulk.yoli.net:3002/`
    - On the server
      - :3001: C:\inetpub\wwwroot\Dashboard APP\build\
      - :3002: C:\web\STAGE\ErpStageDashboard\
      - :3003: C:\web\inetpub\wwwroot\Dashboard APP Dev\build\
2. Back-end
    - URL
      - Local development: `http://localhost:4000/graphql/`
      - Manual deploy--production: `http:/hulk.yoli.net:4000/graphql/`
      - Manual deploy--development: `http:/hulk.yoli.net:4001/graphql`
      - CI/CD deploy: N/A
    - On the server
      - Manual deploy--production: C:\inetpub\wwwroot\Dashboard API\
      - Manual deploy--development: C:\inetpub\wwwroot\Dashboard API Dev\
      - CI/CD: N/A

## To Run the App Locally

- run `npm i` from the CLI to install all necessary dependencies.
- add the required environment variables in a .env file. (See sample files.)
- Currently, the frontend requires Node version 16.10.0 or lower. To change the Node version you're using from the command line, type nvm use 16.10.0. (If you don't have NVM, you can install it by following [these instructions for your device](https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/).)
- run `npm start` from the CLI in separate terminal windows for both the front- and backends.

## To deploy the App Manually

1. Frontend
  
    - With `REACT_APP_ENV` property in the .env file set to 'production-manual', run `npm run build` from the command line.
    - Copy the build folder.
    - RDP into the Hulk server and delete the current build folder.
    - Paste the new build folder into the same directory.

2. Backend

    - Copy the relevant folders and files from the local development environment.
    - RDP into the server.
    - Stop the service that runs the app by running `pm2 stop index.js` on the command line from the APP's root directory.
    - Delete all the files in the root directory.
    - Paste the new files into the root directory.
    - Run `npm i` from the command line at the root directory.
    - Run `pm2 start index.js --watch` from the root directory to start the app back up.

## To deploy the App via CI/CD (which has yet to be implemented)

1. Either push directly to main or perform a pull request from another branch to main.
2. Wait a few seconds and test the site.
3. Note: Because the pipeline is set up via Azure DevOps, in order to avoid the difficulties and potential side effects of punching a hole in the firewall of the IIS server in order to SSH in from a third-party website (like bitbucket), only the server administrator can see whether the build was successful or, more important, wasn't and why.
4. Currently, CI/CD is only set up for the frontend, not the backend, and has yet to be fully implemented with environment variables and a step that deletes the pre-existing files, instead of copying over them--they end up being merged, breaking the app. For any changes to effect on the backend, a step in the pipeline that stops and restarts the pm2 service that runs it will be required, as well.

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

- Order View page (currently hidden)

    [x] As a user, I want to see the order detail from various places (CRM, Staging, ERP) to determine how far the order went through the CRM2GP workflow and compare order values among these various stages.  
    [ ] As an administrator, I want to be able to do the following:  
      [x] pull an order manually if it only exists in the CRM;  
      [x] repull or repull with mismatch if an order returns an error, showing these action buttons conditionally;
      [x] repush and order manually if it returns an error, showing this button conditionally;
      [x] push an order manually if it is in staging and not yet in the ERP;
      [ ] hide the pull option for the CRM if the order is in staging.

- Failed Processes page

  [x] As a user, I want to be shown a list of failed processes categorized by process, and some details.
    [x] Full detail on desktop (> 1280px).
    [x] Partial detail with modal on mobile (< 1280px).
  [x] As a user, I want to be able to choose to view include dismissed errors in the list or otherwise.
  [x] As an administrator, I want to be able to dismiss an error or reinstate it.

- Failed Payments page

  [x] As a user, I want to be shown a list of failed payments with some details of the cause of the failure.
    [x] Full detail on desktop (> 1280px).
    [x] Partial detail with modal on mobile (<1280px).
  [x] As a user, I want to be able to view 

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
    [ ] the app to use the secure HTTPs protocol, to ensure the security of the site (which is behind a firewall on a VPN).
  [ ] As an adminstrator, I'd like:
    [x] any changes made to editable fields to be logged in the database;
    [ ] to see a list of changes made to the editable fields and be able to determine how far back to generate the list.
  [ ] As a developer, I'd like the app to be deployed automatically whenever I make a pull request into the main branch.

## Sources

- The sorting algorithm used in the useSort hook was adapted from [here](https://www.smashingmagazine.com/2020/03/sortable-tables-react/).
