[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

**Important: This platform is NOT production ready. I've been using it personally for a few months and it seems to work fine, but you should be aware that this is still a work in progress. Please take that into consideration when interacting with it.**

# MyFin - Personal Finances Platform

- [About MyFin](#about-myfin)
  - [Features](#features)
  - [Roadmap](#roadmap)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Dependencies](#dependencies)

# About MyFin
MyFin came as my own passion project in 2020. At that point, I'd already tried a bunch of other FPM's, but all of them lacked in atleast one of the following points:
- They we're not user friendly
- Their features lacked a full-fledged budgeting tool
- I was never in control of my own data

MyFin is my attempt to solve all of these issues. It has helped me manage my finances for a while now and I hope it can be useful for you as well.

<p align="center">
  <img src="https://github.com/aFaneca/myfin/blob/master/web/screenshots/1.PNG" alt="MyFin" width="400">
  <img src="https://github.com/aFaneca/myfin/blob/master/web/screenshots/2.PNG" alt="MyFin" width="400">
  <img src="https://github.com/aFaneca/myfin/blob/master/web/screenshots/3.PNG" alt="MyFin" width="400">
  <img src="https://github.com/aFaneca/myfin/blob/master/web/screenshots/4.PNG" alt="MyFin" width="400">
  <img src="https://github.com/aFaneca/myfin/blob/master/web/screenshots/14.PNG" alt="MyFin" width="400">
  <img src="https://github.com/aFaneca/myfin/blob/master/web/screenshots/16.PNG" alt="MyFin" width="400">
  <img src="https://github.com/aFaneca/myfin/blob/master/web/screenshots/17.PNG" alt="MyFin" width="400">
  <img src="https://github.com/aFaneca/myfin/blob/master/web/screenshots/18.PNG" alt="MyFin" width="400">
  <img src="https://github.com/aFaneca/myfin/blob/master/web/screenshots/19.PNG" alt="MyFin" width="400">
  <img src="https://github.com/aFaneca/myfin/blob/master/web/screenshots/20.PNG" alt="MyFin" width="400">
</p>

## Features
Here are the main features of MyFin:
- **Transactions** - You can add transactions manually or batch import them from the clipboard (from a .csv file or directly from your bank's homebanking solution)
- **Accounts** - You can track all of your accounts, including their transactions and balances
- **Categories & Entities** - You can create as many of these as you want to better segment your income and spending
- **Rules & Auto-categorization** - With rules, you can make your transactions importing smarter and faster, by allowing MyFin to automatically categorize some of your imported transactions, based on your specifications
- **Budgets** - Taking a boonzi-styled approach to budgeting, our budget tool allows you to budget for your future, month by month
- **Stats** - this one's for the data nerds. Here you have an overview of your patrimony's evolution across each month and get a forecast of your financial future for the years to come 

## Roadmap
Here's some of the feature currently in development or planned for the near future:
- **Account Management** - allowing the user to change its data (password, email, ...)
- **Better Stats** - add more complex & interesting stats
- **Investing** - add a module specific to keeping track of your investments
- & much more...

# Getting Started
This project relies on PHP's Slim framework for its backend and there's where most of the initial setup will take place if you want to deploy this solution to your own server.
Here's the steps:
1. Create a MySQL/MariaDB Database for myfin with the same structure as [depicted here](https://github.com/aFaneca/myfin/blob/master/model/myfin_model.mwb).
2. Upload this project into your server
3. Setup your webserver to work with slim ([Apache](http://www.slimframework.com/docs/v4/start/web-servers.html#apache-configuration) or [Nginx](http://www.slimframework.com/docs/v4/start/web-servers.html#nginx-configuration))
4. Setup your webserver to correctly resolve your web app (set its root to %YOUR_SERVER%/%YOUR_DOMAINS_DIR%/myfin/web)

# Contributing
This was never meant to be anything other than a little passion project of mine. However, if you're interested in taking this project and make it your own or add something to it, you're more than welcome to do so. Just get in touch :)

# Dependencies
- [MaterializeCSS](https://materializecss.com)
- [Simple MonthPicker](https://github.com/VincentCharpentier/Simple-MonthPicker)
- [DataTables](https://datatables.net/)
- [Chart.js](https://www.chartjs.org/)
- [CSSLoader](https://www.npmjs.com/package/css-loader)
- [Moment.js](https://momentjs.com/)