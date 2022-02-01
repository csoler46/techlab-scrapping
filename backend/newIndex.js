const express2 = require("express")
const app2 = express2()
const request2 = require("request-promise")

app2.listen (4001, () => {
    console.log("Server running on port 4001");
})

app2.get("/locations-sunweb2", async (req, res, next) => {

    const url = "https://www.sunweb.nl/api/sitecore/SearchApi/GetSearchResponse?contextitemid=0ce7a740-e27e-4578-a207-5466357b548d&isFirstUserRequest=True&offset=0&Participants%5B0%5D%5B0%5D=1990-03-20&Participants%5B0%5D%5B1%5D=1990-03-20&ParticipantsDistribution=1%7C2&Country%5B0%5D=16&Duration%5B0%5D=8-11&TransportType=Flight&isFirstLoad=true";
    const json = request2.get(url);
    console.log("result:", json);
    let result = json;

    /*res.setHeader("Content-Type", "application/json");
    res.send(result);*/

    res.send(result);
})
