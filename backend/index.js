const express = require("express")
const app = express()
const request = require("request-promise")
const cherrio = require("cheerio")
const puppeteer = require("puppeteer")
const cors = require("cors")

app.use(cors());

app.listen (4000, () => {
    console.log("Server running on port 4000");
})

app.get("/locations-sunweb", async (req, res, next) => {

    const url = `https://www.sunweb.nl/api/sitecore/SearchApi/GetSearchResponse?contextitemid=0ce7a740-e27e-4578-a207-5466357b548d&isFirstUserRequest=True&offset=0&Participants%5B0%5D%5B0%5D=1990-03-20&Participants%5B0%5D%5B1%5D=1990-03-20&ParticipantsDistribution=1%7C2&Country%5B0%5D=16&Duration%5B0%5D=8-11&TransportType=Flight&isFirstLoad=true`;
    const json = await request.get(url);
    let result = JSON.parse(json).filters.filter(({ type }) => type === 'Country');
    let values = []
    result.forEach(concept => { 
        values = values.concat(concept.values.map(v => (            
            {
                countryLabel : v.caption,
                countryCount: v.count,
                value: v.value
            }
        )));   
    });

    res.setHeader("Content-Type", "application/json");

    res.send(values);
})

app.get("/filters-sunweb/:id", async (req, res, next) => {
    
    console.log(req.params.id)
    const url = `https://www.sunweb.nl/api/sitecore/SearchApi/GetSearchResponse?contextitemid=0ce7a740-e27e-4578-a207-5466357b548d&isFirstUserRequest=True&offset=0&Participants%5B0%5D%5B0%5D=1990-03-20&Participants%5B0%5D%5B1%5D=1990-03-20&ParticipantsDistribution=1%7C2&Country%5B0%5D=${req.params.id}&Duration%5B0%5D=8-11&TransportType=Flight&isFirstLoad=true`;

    console.log(url)
    
    const json = await request.get(url);

    const result = JSON.parse(json).results.map(res => ({       
        name: res.name,
        price: res.price.averagePrice
    }));
    result.sort((a,b) => a.price > b.price);
    res.setHeader("Content-Type", "application/json");

    res.send(result);
})

app.get("/filters-corendon/:name", async (req, res, next) => {

    const url = `https://www.corendon.nl/${req.params.name}`;

    let result = [];
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto(url);
        await sleep(2000);
        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = await cherrio.load(html);
        const res = $(".cor-sr-item");
        res.each((_, element) => {
            const name = $(element).find($("[itemprop=name]")).text().trim()
            const price = $(element).find($("div.cor-price-element > div > span")).text().trim()
            result.push({ name, price });
        });
        result.sort((a,b) => a.price > b.price);
    } catch (error) {
        console.error(error);
    }

    res.setHeader("Content-Type", "application/json");

    res.send(result);
})

app.get("/filters-corendon2/:name", async (req, res, next) => {

    const url = `https://www.corendon.nl/${req.params.name}`;

    let result = [];
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto(url);        
        const selector = "a.page-link";
        
        while((await page.$(selector)) != null){
            result = result.concat(await getCorendonAccos(page, true));
        }
        result = result.concat(await getCorendonAccos(page, false));
        result.sort((a,b) => a.price > b.price);
    } catch (error) {
        console.error(error);
    }

    res.setHeader("Content-Type", "application/json");

    res.send(result);
})

async function getCorendonAccos(page, goToNextPage){
    result = [];
    await sleep(2000);
    //page.waitForSelector(".cor-sr-item");
    const html = await page.evaluate(() => document.body.innerHTML);
    const $ = await cherrio.load(html);
    const res = $(".cor-sr-item");
    res.each((_, element) => {
        const name = $(element).find($("[itemprop=name]")).text().trim()
        const price = $(element).find($("div.cor-price-element > div > span")).text().trim()
        result.push({ name, price });
    });
    if(goToNextPage){
        await page.click(selector);
    }
    return result;
}

app.get("/locations-corendon", async (req, res, next) => {

    const url = "https://www.corendon.nl/";
    const json = await request.get(url);

    res.setHeader("Content-Type", "application/json");
    const locations = await corendon()
    res.send(locations);
})

async function corendon() {
    try {
        const url = "https://www.corendon.nl/";
        const json = await request.get(url);
        const $ = await cherrio.load(json);
        const countries = []
        $('#filter-favorites').find('li').each((index, element) => {
            const countryLabel = $(element).find('.cor-filter__label').text().trim();
            const countryCount = $(element).find('.cor-filter__count').text().trim().slice(1,-1);
            countries.push({countryLabel, countryCount}) 
        })
        return countries;
    } catch(err) {
        console.error(err);
    }
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};