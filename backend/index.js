const express = require("express")
const app = express()
const request = require("request-promise")
const cheerio = require("cheerio")

app.listen (4000, () => {
    console.log("Server running on port 4000");
})

app.get("/locations-sunweb2", async (req, res, next) => {

    const url = "https://www.sunweb.nl/api/sitecore/SearchApi/GetSearchResponse?contextitemid=0ce7a740-e27e-4578-a207-5466357b548d&isFirstUserRequest=True&offset=0&Participants%5B0%5D%5B0%5D=1990-03-20&Participants%5B0%5D%5B1%5D=1990-03-20&ParticipantsDistribution=1%7C2&Country%5B0%5D=16&Duration%5B0%5D=8-11&TransportType=Flight&isFirstLoad=true";
    const json = await request.get(url);
    let result = json.filtersmp;

    rs.setHeader("Content-Type", "application/json");
    res.send(result);

    res.send(result);
})




app.get("/locations-corendon", async (req, res, next) => {

    const url = "https://www.corendon.nl/";
    const json = await request.get(url);
    console.log(json)

    res.setHeader("Content-Type", "application/json");
    const locations = await corendon()
    res.send(locations);
})

async function corendon() {
    try {
        const url = "https://www.corendon.nl/";
        const json = await request.get(url);
        const $ = await cheerio.load(json);
        const countries = []
        $('#filter-favorites').find('li').each((index, element) => {
            const name = $(element).find('.cor-filter__label').text().trim();
            const count = $(element).find('.cor-filter__count').text().trim().slice(1,-1);
            countries.push({name, count}) 
        })
        return countries;
    } catch(err) {
        console.error(err);
    }
    
}
