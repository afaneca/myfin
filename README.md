[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

***The android mobile app project is available [here](https://github.com/aFaneca/myfin-android/).***

# MyFin - Personal Finances Platform

- [About MyFin](#about-myfin)
  - [Features](#features)
  - [Roadmap](#roadmap)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Dependencies](#dependencies)

# About MyFin
MyFin originated as my own passion project in 2020. At that point, I'd already tried a bunch of other FPM's, but all of
them lacked in at least one of the following points:
- They were not user-friendly
- Their features lacked a full-fledged budgeting tool
- I was never in control of my own data

MyFin is my <u>attempt</u> to solve all of these issues. It has helped me manage my finances for a while now and I hope it can be useful for you as well.

<p align="center">
  <img src="/web/screenshots/1.PNG" alt="MyFin" width="400">
  <img src="/web/screenshots/2.PNG" alt="MyFin" width="400">
  <img src="/web/screenshots/3.PNG" alt="MyFin" width="400">
  <img src="/web/screenshots/4.PNG" alt="MyFin" width="400">
  <img src="/web/screenshots/14.PNG" alt="MyFin" width="400">
  <img src="/web/screenshots/16.PNG" alt="MyFin" width="400">
  <img src="/web/screenshots/17.PNG" alt="MyFin" width="400">
  <img src="/web/screenshots/18.PNG" alt="MyFin" width="400">
  <img src="/web/screenshots/19.PNG" alt="MyFin" width="400">
  <img src="/web/screenshots/20.PNG" alt="MyFin" width="400">
</p>

## Features
Here are the main features of MyFin:

- **Localization (Multilingual support)** - Native full support to both english and portuguese
- **Transactions** - You can add transactions manually or batch import them from the clipboard (from a .csv file or
  directly from your bank's homebanking solution)
- **Split Transactions** - Easily split an already added transaction into two different ones, all with a few clicks
- **Accounts** - You can track all of your accounts, including their transactions and balances
- **Categories & Entities** - You can create as many of these as you want to better segment your income and spending
- **Rules & Auto-categorization** - With rules, you can make your transactions importing smarter and faster, by allowing MyFin to automatically categorize some of your imported transactions, based on your specifications
- **Budgets** - Taking a Boonzi-style approach to budgeting, our budget tool allows you to budget for your future, month by month
- **Stats** - this one's for the data nerds. Here you have an overview of your patrimony's evolution across each month and get a forecast of your financial future for the years to come 
- **Account Management** - Change your password, etc...
- **Investing** - keeping track of your investments (currently in beta!)
- **Theming** - multiple (white & dark) themes to choose from!
## Roadmap
Here's some of the features currently in development or planned for the near future:
- **Goals** - Record and keep track of your goals to keep yourself motivated at all times
- **Better Account Management** - allowing the user to change its data (email, profile photo...)
- **Better Stats** - add more complex & interesting stats
- & much more...

# Getting Started
This project relies on PHP's Slim framework for its backend and there's where most of the initial setup will take place if you want to deploy this solution to your own server. 

[Here](https://github.com/aFaneca/myfin/wiki/Project-Setup#initial-setup) you can find the full documentation on the first steps to get started.

# Contributing

This was never meant to be anything other than a little passion project of mine. However, if you're interested in taking
this project and make it your own or add something to it, you're more than welcome to do so. Just get in touch :)

# Dependencies

## Web

- [MaterializeCSS](https://materializecss.com)
- [Simple MonthPicker](https://github.com/VincentCharpentier/Simple-MonthPicker)
- [DataTables](https://datatables.net/)
- [Chart.js](https://www.chartjs.org/)
- [CSSLoader](https://www.npmjs.com/package/css-loader)
- [Moment.js](https://momentjs.com/)
- [i18next](https://github.com/i18next/jquery-i18next)
- [Emoji Picker Element](https://github.com/nolanlawson/emoji-picker-element)

## API

- [Slim](https://www.slimframework.com/)
- [Monolog](https://github.com/Seldaek/monolog)
- [Phinx](https://phinx.org/)
- [Phinx Migrations Generator](https://github.com/odan/phinx-migrations-generator/issues)
- [PHP Dot Env](https://github.com/vlucas/phpdotenv)
