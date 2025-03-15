import React, { useState } from "react";

const API_KEY = import.meta.env.VITE_API_KEY; 

const App = () => {
  const [summonerName, setSummonerName] = useState("");
  const [summonerTag, setSummonerTag] = useState("");
  const [summonerData, setSummonerData] = useState(null);
  const [error, setError] = useState(null);

  const fetchSummonerData = async () => {
    if (!summonerName || !summonerTag) {
      setError("Please enter both Summoner Name and Tag.");
      return;
    }

    setError(null);
    setSummonerData(null);

    const accountUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${summonerTag}?api_key=${API_KEY}`;

    try {
      const response = await fetch(accountUrl);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const accountData = await response.json();

      console.log("Account Data:", accountData);
      const summonerPuuid = accountData.puuid;

      const summonerUrl = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${summonerPuuid}?api_key=${API_KEY}`;
      const summonerResponse = await fetch(summonerUrl);
      if (!summonerResponse.ok) throw new Error(`HTTP Error: ${summonerResponse.status}`);
      const summonerInfo = await summonerResponse.json();

      console.log("Summoner Data:", summonerInfo);
      setSummonerData(summonerInfo);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h2>League of Legends Summoner Search</h2>
      <input
        type="text"
        placeholder="Enter Summoner Name"
        value={summonerName}
        onChange={(e) => setSummonerName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Summoner Tag"
        value={summonerTag}
        onChange={(e) => setSummonerTag(e.target.value)}
      />
      <button onClick={fetchSummonerData}>Search Summoner</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {summonerData && (
        <div>
          <h3>Summoner Details:</h3>
          <p><strong>Name:</strong> {summonerName}</p>
          <p><strong>Level:</strong> {summonerData.summonerLevel}</p>
          <p><img src={`https://ddragon.leagueoflegends.com/cdn/11.14.1/img/profileicon/${summonerData.profileIconId}.png`} alt="icon" /></p>
        </div>
      )}
    </div>
  );
};

export default App;
