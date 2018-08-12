<img src="https://zibal.ir/assets/img/EngLogo.png" width="128"/>
# [Zibal](https://zibal.ir/) Payment SDK for NodeJS

## Installation
<!--
In a browser:
```html
<script src="zibal.js"></script>
``` -->

Using npm:
```shell
$ npm install --save zibal
```

## Usage

In Node.js:
```js
// Load the full build.
const Zibal = require('zibal');

// Initialize with configurations
Zibal.init({
	merchant: 'YOUR-MERCHANT-ID',
	callbackUrl: 'https://some-callback-url.tld',
	logLevel: 2
	// 0: none (default in production)
	// 1: error
	// 2: error + info (default)
});

// Payment Request
Zibal.request(1500)
	.then((result) => {
		console.log(result);
		// { trackId: 1533727744287, result: 100, message: 'success', statusMessage: 'با موفقیت تایید شد.' }
	}).catch((err) => {
		console.error(err);
		// { result: 103, message: 'authentication error', statusMessage: '{merchant} غیرفعال' }
	});

// Payment Start URL
const url = Zibal.startURL(1533727744287);
// >> then open url in browser

// Payment Verify
Zibal.verify(1533727744287)
	.then((result) => {
		console.log(result);
		// { paidAt: '2018-03-25T23:43:01.053000', amount: 1600, result: 100, status: 1, message : 'success', statusMessage: 'با موفقیت تایید شد.' }
	}).catch((err) => {
		console.error(err);
		// { result: 103, message: 'authentication error', statusMessage: '{merchant} غیرفعال' }
	});
```

## SDK
### Methods
- `init(**config**)` - init using [`config` object](#objects)
- `update(**config**)` - update config using [`config` object](#objects)
- `request(**amount, extras**)` - request payment using `amount: Number` and [`extras` object](#objects) - returns a `Promise` of [`request` object](#objects)
- `startURL(**trackId**)` - get payment url using `trackId: Number` from [`request` object](#methods) - returns a `String` of payment url
- `verify(**trackId**)` - verify payment using `trackId: Number` from [`request` object](#methods) - returns a `Promise` of [`verify` object](#objects)

### Objects
- `config`:
	- `merchant: String` - your merchant id
	- `callbackUrl: String` - your callback url
	- `logLevel: Number` - desired log level:
		- `0`: none (default in production)
		- `1`: error
		- `2`: error + info (default)

- `extras`:
	- `mobile: String`
	- `description: String`
	- `multiplexingInfos`
	- `feeMode`
	- `percentMode`

- `request` Response:
	- `trackId: Number` - payment id
	- `result: Number` - result status code
	- `message: String` - status short message
	- `statusMessage: String` - user friendly status message

- `verify` Resopnse:
	- `paidAt: Date` - payment time
	- `amount: Number` - payment amount
	- `result: Number` - payment status code
	- `message: String` - status short message
	- `statusMessage: String` - user friendly status message
