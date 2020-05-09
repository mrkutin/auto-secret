"use strict";

const puppeteer = require("puppeteer");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "gibdd",

	/**
	 * Settings
	 */
	settings: {},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Say a 'Hello' action.
		 *
		 * @returns
		 */
		index: {
			cache: true,
			rest: {
				method: "GET",
				path: "/history"
			},
			params: {
				vin: {
					type: "string",
					length: 17,
					pattern: /^(?<wmi>[A-HJ-NPR-Z\d]{3})(?<vds>[A-HJ-NPR-Z\d]{5})(?<check>[\dX])(?<vis>(?<year>[A-HJ-NPR-Z\d])(?<plant>[A-HJ-NPR-Z\d])(?<seq>[A-HJ-NPR-Z\d]{6}))$/
				},
			},
			timeout: 15 * 1000,
			async handler(ctx) {
				const browser = await puppeteer.launch({headless: false});
				try {
					const page = await browser.newPage();

					await page.goto(`https://xn--90adear.xn--p1ai/check/auto/#${ctx.params.vin}`, {
						waitUntil: "networkidle0",
					});

					await page.waitForSelector("[href=\"#history\"]");
					await page.click("[href=\"#history\"]");

					await page.waitForSelector(".adds-modal", {visible: true});
					await page.waitForSelector(".adds-modal", {visible: false});
					await page.waitForSelector(".vehicle-model");

					const model = await page.$eval(".vehicle-model", el => el.innerText);
					const year = await page.$eval(".vehicle-year", el => el.innerText);
					const vin = await page.$eval(".vehicle-vin", el => el.innerText);
					const chassisNumber = await page.$eval(".vehicle-chassisNumber", el => el.innerText);
					const bodyNumber = await page.$eval(".vehicle-bodyNumber", el => el.innerText);
					const color = await page.$eval(".vehicle-color", el => el.innerText);
					const engineVolume = await page.$eval(".vehicle-engineVolume", el => el.innerText);
					const powerKwtHp = await page.$eval(".vehicle-powerKwtHp", el => el.innerText);
					const type = await page.$eval(".vehicle-type", el => el.innerText);

					//todo await page.waitForSelector('.ownershipPeriods'); > li.last-owner > .ownershipPeriods-from, ownershipPeriods-to, simplePersonType, <div>Последняя операция - первичная регистрация</div>

					return {
						vin,
						model,
						year,
						chassisNumber,
						bodyNumber,
						color,
						engineVolume,
						powerKwtHp,
						type,
					};
				} finally {
					await browser.close();
				}
			}
		},
	},

	/**
	 * Events
	 */
	events: {},

	/**
	 * Methods
	 */
	methods: {},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
