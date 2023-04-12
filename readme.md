<center>
    <h1>
        CapSolver
    </h1>


<a href="https://discord.gg/tamVs2Ujrf">
    <img src="https://discordapp.com/api/guilds/769020183540400128/widget.png?style=banner2" alt="Discord Banner 2"/>
</a>

![Discord Shield](https://img.shields.io/github/commit-activity/m/furry/capsolver)
![Size](https://img.shields.io/bundlephobia/min/capsolver)
![Downloads](https://img.shields.io/npm/dw/capsolver)

</center>

<center>A wrapper around the <a href="https://capsolver.com/">CapSolver</a> API</center>
<br>
<br>

If there's problems with this service, you can contact official support through [2captcha's Official Site](https://github.com/2captcha) or try [DeathByCaptcha's API](https://github.com/furry/DeathByCaptcha)

## Features
- Promise Based API methods
- Browser & NodeJS support
- Node-Fetch EMCAScript
- Fluent typings & native TS.
- Proxy Support

Currently Supports:
- Google Recaptcha (v2/v3/enterprise),
- hcaptcha,
- FunCaptcha,
- base64 image captchas

## Planned Coverage
- Funcaptcha
- DatadomeSlider
- AntiKasada
- AntiAkamiBMP

## Install

```sh
npm install capsolver
```
```sh
yarn add capsolver
```

## Usage


Recaptcha,
```js
import CapSolver from "capsolver"

// A new 'solver' instance with our API key
const solver = new CapSolver.Solver("<Your captchaai api key>")

/* Example ReCaptcha Website */
// solver.<recaptchaV2 | recaptchaV2Enterprise | recaptchaV3>
solver.recaptchaV2("6Ld2sf4SAAAAAKSgzs0Q13IZhY02Pyo31S2jgOB5", "https://patrickhlauke.github.io/recaptcha/")

.then((res) => {
    console.log(res)
})
.catch((err) => {
    console.error("Could not solve captcha.")
})
```

Image,
```js
import CapSolver from "capsolver"
import fs from "fs";

const solver = new CapSolver.Solver("<Your captchaai api key>")

// Read from a file as base64 text
solver.imageCaptcha(fs.readFileSync("./captcha.png", "base64"))
.then((res) => {
    console.log(res)
})
.catch((err) => {
    console.error("Could not solve captcha..")
})
```

Proxy,
```js
import CapSolver from "capsolver"

const solver = new CapSolver.Solver("<Your captchaai api key>")


solver.recaptchaV2("6Ld2sf4SAAAAAKSgzs0Q13IZhY02Pyo31S2jgOB5", "https://patrickhlauke.github.io/recaptcha/", {
    proxyAddress: "login:password@21.214.43.26", // The (Username : Password @ Address) of our chosen proxy
    proxyType: "HTTP" // The 'Type' of proxy, http, https, socks, ect.
    proxyPort: 8080
})

.then((res) => {
    console.log(res)
})
.catch((err) => {
    console.error("Could not solve captcha..")
})
```

## Commit Guidelines

The latest version of the code base will always be under the '**next**' branch!

- All pull requiests must provide a valid reason for the change or implementation
- All **CORE CHANGES** require an issue with reasoning made before a PR will even be addressed.
- All PR's must follow the general structure of the code base
- If you have questions, feel free to make an issue and i'll get to it right away!

<hr>
<div style="text-align: center">
<a href="https://www.buymeacoffee.com/ether" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</div>
