const API_KEY = `YOUR API KEY`;

const searchSummonerBtn = document.querySelector(".search-summoner");
const summonerNameInput = document.querySelector("#summoner-name");
const summonerTagInput = document.querySelector("#summoner-tag");

function searchForSummoner() {
    let summonerName = summonerNameInput.value;
    let summonerTag = summonerTagInput.value;

    data(summonerName, summonerTag);
}

async function data(summonerName, summonerTag) {
    let eun_url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${summonerTag}?api_key=${API_KEY}`;
    try {
        const response = await fetch(eun_url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const summonerData = await response.json(); 
        console.log(summonerData);

        // Extract values
        let summonerPuuid = summonerData.puuid;
        let gameName = summonerData.gameName;
        let tagLine = summonerData.tagLine;

    } catch (error) {
        console.error("Error fetching summoner data:", error);
    }
}

searchSummonerBtn.addEventListener("click", searchForSummoner);
