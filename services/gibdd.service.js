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
			cache: false,
			rest: {
				method: "GET",
				path: "/history"
			},
			params: {
				vin: {
					type: "string",
					length: 17,
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

					await page.waitForSelector(".ownershipPeriods");
					const periods = await page.$$(".ownershipPeriods > li");

					const ownershipPeriods = [];
					for (let i = 0; i < periods.length; i++) {
						const fromSelector = await periods[i].$(".ownershipPeriods-from");
						const from = await page.evaluate(el => el.innerText, fromSelector);
						const toSelector = await periods[i].$(".ownershipPeriods-to");
						const to = await page.evaluate(el => el.innerText, toSelector);
						const personTypeSelector = await periods[i].$(".simplePersonType");
						const personType = await page.evaluate(el => el.innerText, personTypeSelector);
						ownershipPeriods.push(
							{
								from,
								to,
								personType,
							}
						);
					}

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
						ownershipPeriods,
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
