[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0)
[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/afaneca/myfin?include_prereleases&logo=github&style=flat-square)](https://github.com/afaneca/myfin/releases)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff&style=flat-square)](https://github.com/afaneca/myfin/pkgs/container/myfin)

[![Deploy on Hostinger](https://assets.hostinger.com/vps/deploy.svg)](https://www.hostinger.com/vps/docker-hosting?compose_url=https://raw.githubusercontent.com/afaneca/myfin/refs/heads/master/docker-compose.yml&REFERRALCODE=SC1ADNFANHG6)

📟 ***The API project is available [here](https://github.com/aFaneca/myfin-api/).*** 📟

📱 ***The android mobile app project lives [here](https://github.com/aFaneca/myfin-android/).*** 📱

#  🏦📈💳 MyFin - Personal Finances Platform 

- [About MyFin](#-about-myfin)
  - [Features](#-features)
  - [Roadmap](#%EF%B8%8F-roadmap)
- [Getting Started](#-getting-started)
  - [Demo account - try it for yourself!](#demo-account---try-it-for-yourself)
  - [Initial setup](#initial-setup)
- [Contributing](#%EF%B8%8F-contributing)
- [Dependencies](#-dependencies)

# ⚡ About MyFin

MyFin originated as my own passion project in 2020. At that point, I'd already tried a bunch of other FPM's, but all of
them lacked in at least one of the following points:

- They were not user-friendly
- Their features lacked a full-fledged budgeting tool
- I was never in control of my own data

MyFin is my <u>attempt</u> to solve all of these issues. It has helped me manage my finances for a while now and I hope
it can be useful for you as well.

<p align="center">
  <img src="/screenshots/1.PNG" alt="MyFin" width="400">
  <img src="/screenshots/2.PNG" alt="MyFin" width="400">
  <img src="/screenshots/3.PNG" alt="MyFin" width="400">
  <img src="/screenshots/4.PNG" alt="MyFin" width="400">
  <img src="/screenshots/13.PNG" alt="MyFin" width="400">
  <img src="/screenshots/14.PNG" alt="MyFin" width="400">
  <img src="/screenshots/15.PNG" alt="MyFin" width="400">
  <img src="/screenshots/16.PNG" alt="MyFin" width="400">
  <img src="/screenshots/17.PNG" alt="MyFin" width="400">
  <img src="/screenshots/18.PNG" alt="MyFin" width="400">
  <img src="/screenshots/19.PNG" alt="MyFin" width="400">
  <img src="/screenshots/20.PNG" alt="MyFin" width="400">

</p>

## ✨ Features

Here are the main features of MyFin:

- **Localization (Multilingual support)** - Native full support to both english and portuguese
- **Transactions** - You can add transactions manually or import them in batches from the clipboard (from a .csv file or
  directly from your bank's homebanking solution)
- **Split Transactions** - Easily split an already added transaction into two different ones, all with a few clicks
- **Accounts** - You can track all of your accounts, including their transactions and balances
- **Categories & Entities** - You can create as many of these as you want to better segment your income and spending
- **Rules & Auto-categorization** - With rules, you can make your transactions importing smarter and faster, by allowing
  MyFin to automatically categorize some of your imported transactions, based on your specifications
- **Budgets** - Taking a Boonzi-style approach to budgeting, our budget tool allows you to budget for your future, month
  by month
- **Stats** - this one's for the data nerds. Here you have an overview of your patrimony's evolution across each month
  and get a forecast of your financial future for the years to come
- **Account Management** - Change your password, etc...
- **Investing** - keeping track of your investments (currently in beta!)
- **Theming** - multiple (white & dark) themes to choose from!

## 🛣️ Roadmap

Here's some of the features currently in development or planned for the near future:

- **Goals** - Record and keep track of your goals to keep yourself motivated at all times
- **Better Account Management** - allowing the user to change its data (email, profile photo...)
- **Better Stats** - add more complex & interesting stats
- & much more...

# 🔰 Getting Started
## Demo account - try it for yourself!
Before fully committing to it, you can give MyFin a try by using the demo account I've made available [here](https://myfinbudget.com/goto/demo).
````
Username: demo
Password: demo
````

## Initial setup
[Here](https://myfinbudget.com/goto/wiki-initial-setup) you can find the full documentation on the
first steps to get started.

# 🙋‍♂️ Contributing

This was never meant to be anything other than a little passion project of mine. However, if you're interested in taking
this project and make it your own or add something to it, you're more than welcome to do so. Just get in touch :)

# 📦 Dependencies

## Web

This app was built with React, using Typescript. You can check the full list of dependencies [here](/package.json).
