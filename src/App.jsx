import React, { useState } from "react";

const API_KEY = import.meta.env.VITE_API_KEY; 

const App = () => {
  const [summonerName, setSummonerName] = useState("");
  const [summonerTag, setSummonerTag] = useState("");
  const [summonerData, setSummonerData] = useState(null);
  const [error, setError] = useState(null);
  const regions = [
    'br1.api.riotgames.com',
    'eun1.api.riotgames.com',
    'euw1.api.riotgames.com',
    'jp1.api.riotgames.com',
    'kr.api.riotgames.com', 
    'la1.api.riotgames.com',
    'la2.api.riotgames.com',
    'na1.api.riotgames.com',
    'oc1.api.riotgames.com',
    'tr1.api.riotgames.com',
    'ru.api.riotgames.com',
    'ph2.api.riotgames.com',
    'sg2.api.riotgames.com',
    'th2.api.riotgames.com',
    'tw2.api.riotgames.com',
    'vn2.api.riotgames.com',
  ]

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
    <div className="container w-screen">
      <div className="summonerSearch flex flex-col justify-center w">
        <h2 className=" text-center">Thunder<span>.GG</span></h2>
        <div className="inputContainer text-center flex justify-center">
        
          <select name="region" id="region" className=" ml-3 mr-2 p-3">
            
            <option value="br1">BR</option>
            <option value="eun1">EUNE</option>
            <option value="euw1">EUW</option>
            <option value="jp1">JP</option>
            <option value="kr">KR</option>
            <option value="la1">LAN</option>
            <option value="la2">LAS</option>
            <option value="na1">NA</option>
            <option value="oc1">OCE</option>
            <option value="tr1">TR</option>
            <option value="ru">RU</option>
            <option value="ph2">PH</option>
            <option value="sg2">SG</option>
            <option value="th2">TH</option>
            <option value="tw2">TW</option>
            <option value="vn2">VN</option>

          </select>

          <input
            type="text"
            placeholder="Game Name (Summoner Name)"
            value={summonerName}
            onChange={(e) => setSummonerName(e.target.value)}
            id="summonerName"
            className="mr-2 p-3"
          />
          
          <input
            type="text"
            placeholder="Enter Summoner Tag"
            value={summonerTag}
            onChange={(e) => setSummonerTag(e.target.value)}
            id="summonerTag"
            className=" p-3"
          />


          <button class="btn btn-ghost p-3" onClick={fetchSummonerData}>.GG</button>
        </div>

        {error && <p style={{ color: "red" }} id="errorBox">{error}</p>}
      </div>

      {summonerData && (
        <div className="summoner-details">
          <p><img src={`https://ddragon.leagueoflegends.com/cdn/11.14.1/img/profileicon/${summonerData.profileIconId}.png`} alt="icon" /></p>
          <p><strong>Name:</strong> {summonerName + "#" + summonerTag}</p>
          <p><strong>Level:</strong> {summonerData.summonerLevel}</p>
        </div>
      )}
    </div>
  );
};

export default App;
