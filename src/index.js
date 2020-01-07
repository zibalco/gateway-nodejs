import request from 'request'
import { Z_BINARY } from 'zlib';

export default class Zibal {
	// private
	static config = {}
	// private
	static api = {
		base: 'https://gateway.zibal.ir/v1/',
	}

	static extraProperties = [
		'mobile',
		'description',
		'multiplexingInfos',
		'feeMode',
		'percentMode',
	]

	static errors = {
		invalidConfig: 'Invalid Configuration',
	}


	static init(config) {
		Zibal.updateConfig(config)
	}

	static updateConfig({
		merchant,
		callbackUrl,
		logLevel = process.env.NODE_ENV === 'production' ? 0 : 2,
	}) {
		Zibal.config = {
			merchant,
			callbackUrl,
			logLevel,
			// 0: none
			// 1: error
			// 2: error + info
		}
	}

	static request(amount, extras) {
		const { isConfigValid, config, errors, extractExtras, post, log, error } = Zibal
		return new Promise((resolve, reject) => {
			if (!isConfigValid) {
				reject(errors.invalidConfig)
				return
			}
			const { merchant, callbackUrl } = config
			const data = {
				merchant,
				callbackUrl,
				amount: parseInt(amount),
				...extractExtras(extras),
			}
			post('request', data, (err, res, body) => {
				log('statusCode:', res.statusCode)
				log('headers:', res.headers)
				if (err) {
					error('REQUEST ENDPOINT FAILED:', err)
					log('DETAILS:', res)
					reject(err)
				} else {
					log("REQUEST SUCCESSFUL:\n", JSON.stringify(body, null, 4))
					let statusMessage = null
					switch (body.result) {
						case 100:
							statusMessage = 'با موفقیت تایید شد.'
							break
						case 102:
							statusMessage = '{merchant} یافت نشد.'
							break
						case 103:
							statusMessage = '{merchant} غیرفعال'
							break
						case 104:
							statusMessage = '{merchant} نامعتبر'
							break
						case 201:
							statusMessage = 'قبلا تایید شده.'
							break
						case 105:
							statusMessage = '{amount} بایستی بزرگتر از 1,000 ریال باشد.'
							break
						case 106:
							statusMessage = '{callbackUrl} نامعتبر می‌باشد. (شروع با http و یا https)'
							break
					}
					resolve({
						...body,
						statusMessage,
					})
				}
			})
		})
	}

	static startURL(trackId) {
		return `${Zibal.api.base}/start/${trackId}`
	}

	static verify(trackId) {
		const { isConfigValid, config, post, log, error } = Zibal
		return new Promise((resolve, reject) => {
			!isConfigValid && reject()
			const { merchant } = config
			const data = {
				trackId,
				merchant,
			}
			post('verify', data, (err, res, body) => {
				log('statusCode:', res.statusCode)
				log('headers:', res.headers)
				if (err) {
					error('VERIFY ENDPOINT FAILED:', err)
					log('DETAILS:', res)
					reject(err)
				} else {
					log("VERIFY SUCCESSFUL:\n", JSON.stringify(body, null, 4))
					let statusMessage = null
					switch (body.result) {
						case 100:
							statusMessage = 'با موفقیت تایید شد.'
							break
						case 102:
							statusMessage = '{merchant} یافت نشد.'
							break
						case 103:
							statusMessage = '{merchant} غیرفعال'
							break
						case 104:
							statusMessage = '{merchant} نامعتبر'
							break
						case 201:
							statusMessage = 'قبلا تایید شده.'
							break
						case 202:
							statusMessage = 'سفارش پرداخت نشده یا ناموفق بوده است. '
							break
						case 203:
							statusMessage = '{trackId} نامعتبر می‌باشد.'
							break
					}
					resolve({
						...body,
						statusMessage,
					})
				}
			})
		})
	}

	// private
	static extractExtras(obj) {
		return obj ? Zibal.extraProperties.reduce((a, c) => ({ ...a, [c]: obj[c] }), {}) : {}
	}

	// private
	static post(path, body, callback) {
		const { api, log } = Zibal
		const uri = `${api.base}/${path}`
		log(`POST: \n${JSON.stringify(body, null, 4)}\nTO: ${uri}`)
		request.post(uri, {
			uri,
			json: true,
			body,
		}, callback)
	}

	// private
	static get isConfigValid() {
		const { config, errors, error } = Zibal
		const isValid = config && config.merchant && config.callbackUrl
		!isValid && error(errors.invalidConfig)
		return isValid
	}

	// private
	static log(...args) {
		const { config } = Zibal
		config.logLevel > 1 && console.log(`==== Zibal - info - ${Date.now()} -`, ...args)
	}

	// private
	static error(...args) {
		const { config } = Zibal
		config.logLevel > 0 && console.error(`==== Zibal - info - ${Date.now()} -`, ...args)
	}
}


// "compile": "babel -d lib/ src/",
// "prepublish": "npm run compile",
// "start": "npm run prepublish && node lib/index.js"
