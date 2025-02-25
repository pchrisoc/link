<div align="center">
  <h1>Mini Link</h1>
  <img src="https://i.ibb.co/dmHZr1T/ezgif-2-c3420ecc5d.gif" alt="Website Demo" />
  <h2><a href="https://mini-link-two.vercel.app/">Demo</a></h2>
</div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

## About the Project
This repository is a URL Shortener to shorten long URLs like [bit.ly](https://bitly.com/) and similar. Built using [Next.js](https://nextjs.org/) and [MongoDB](https://mongodb.com) as database and secured with [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/).

## Build With
This project was built using these technologies.
- [Next.js](https://nextjs.org/)
- [MongoDB](https://mongodb.com)
- [TailwindCSS](https://tailwindcss.com)
- [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)

## 🛠 Installation and Setup Instructions
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fgbagush%2FMiniLink%2Ftree%2Fmain&env=MONGODB_URL,NEXT_PUBLIC_SITE_KEY,SECRET_KEY)
1. Setup `.env`
    ```
    MONGODB_URL = "MONGODB_URL"
    NEXT_PUBLIC_SITE_KEY = "CF_TURNSTILE_SITE_KEY"
    SECRET_KEY = "CF_TURNSTILE_SECRET_KEY"
    ```
2. Install dependencies
	```
	npm install
	```
3. Run the project 
	```
	npm run dev
	```
Web will run on localhost:3000 by default at development mode.

## Show your support
Give a ⭐ if you like this project!

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/gbagush/MiniLink.svg?style=for-the-badge
[contributors-url]: https://github.com/gbagush/MiniLink/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/gbagush/MiniLink.svg?style=for-the-badge
[forks-url]: https://github.com/gbagush/MiniLink/network/members
[stars-shield]: https://img.shields.io/github/stars/gbagush/MiniLink.svg?style=for-the-badge
[stars-url]: https://github.com/gbagush/MiniLink/stargazers
[issues-shield]: https://img.shields.io/github/issues/gbagush/MiniLink.svg?style=for-the-badge
[issues-url]: https://github.com/gbagush/MiniLink/issues
[license-shield]: https://img.shields.io/github/license/gbagush/MiniLink.svg?style=for-the-badge
[license-url]: https://github.com/gbagush/MiniLink/blob/master/LICENSE
