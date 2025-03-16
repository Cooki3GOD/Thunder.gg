import React, { useState } from "react";

const API_KEY = import.meta.env.VITE_API_KEY;

const App = () => {
  const [summonerName, setSummonerName] = useState("");
  const [summonerTag, setSummonerTag] = useState("");
  const [summonerData, setSummonerData] = useState(null);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState("na1"); // Default to NA
  const latestVersion = "14.5.1"; // Replace with the latest version from Riot API
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

      // ✅ Use selected region in the API call
      const summonerUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${summonerPuuid}?api_key=${API_KEY}`;
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
      <div className="summonerSearch flex flex-col justify-center">
        <h2 className="text-center">Thunder<span>.GG</span></h2>
        <div className="inputContainer text-center flex justify-center">
        
          {/* ✅ Update region on selection */}
          <select name="region" className="ml-3 mr-2 p-3" onChange={(e) => setRegion(e.target.value)} value={region}>
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
            className="mr-2 p-3"
          />
          
          <input
            type="text"
            placeholder="Enter Summoner Tag"
            value={summonerTag}
            onChange={(e) => setSummonerTag(e.target.value)}
            className="p-3"
          />

          <button className="btn btn-ghost p-3" onClick={fetchSummonerData}>.GG</button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      {summonerData && (
        <div className="summoner-details">
            <p><img src={`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${summonerData.profileIconId}.png`} alt="icon" onError={(e) => e.target.src = "/fallback-icon.png"} /></p>
          <p><strong>Name:</strong> {summonerName + "#" + summonerTag}</p>
          <p><strong>Level:</strong> {summonerData.summonerLevel}</p>
        </div>
      )}
    </div>
  );
};

export default App;
