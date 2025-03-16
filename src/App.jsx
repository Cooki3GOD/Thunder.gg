import React, { useState } from "react";

const API_KEY = import.meta.env.VITE_API_KEY;

const App = () => {
  const [summonerName, setSummonerName] = useState("");
  const [summonerTag, setSummonerTag] = useState("");
  const [summonerData, setSummonerData] = useState(null);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState("na1"); 
  const latestVersion = "14.5.1"; 

  const fetchRankAndWinRate = async (summonerId, puuid) => {
    try {
      const rankUrl = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${API_KEY}`;
      const rankResponse = await fetch(rankUrl);
      if (!rankResponse.ok) throw new Error(`Rank API Error: ${rankResponse.status}`);
      const rankData = await rankResponse.json();

      const soloRank = rankData.find(queue => queue.queueType === "RANKED_SOLO_5x5");
      const tier = soloRank ? soloRank.tier : "Unranked";
      const rank = soloRank ? soloRank.rank : "";

      console.log("Rank Data:", rankData);

      const matchesUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${API_KEY}`;
      const matchesResponse = await fetch(matchesUrl);
      if (!matchesResponse.ok) throw new Error(`Match History API Error: ${matchesResponse.status}`);
      const matchIds = await matchesResponse.json();

      console.log("Match IDs:", matchIds);

      let wins = 0, totalGames = matchIds.length;

      for (const matchId of matchIds) {
        const matchUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`;
        const matchResponse = await fetch(matchUrl);
        if (!matchResponse.ok) continue; 

        const matchData = await matchResponse.json();
        const participant = matchData.info.participants.find(p => p.puuid === puuid);

        if (participant?.win) wins++;
      }

      const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(2) : 0;

      setSummonerData(prev => ({
        ...prev,
        tier,
        rank,
        winRate,
      }));

    } catch (err) {
      console.error("Error fetching rank and winrate:", err);
      setError(err.message);
    }
  };

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

      const summonerPuuid = accountData.puuid;

      const summonerUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${summonerPuuid}?api_key=${API_KEY}`;
      const summonerResponse = await fetch(summonerUrl);
      if (!summonerResponse.ok) throw new Error(`HTTP Error: ${summonerResponse.status}`);
      const summonerInfo = await summonerResponse.json();

      setSummonerData(summonerInfo);

      await fetchRankAndWinRate(summonerInfo.id, summonerPuuid);
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
            <p>
              <img 
                src={`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${summonerData.profileIconId}.png`} 
                alt="icon" 
                onError={(e) => e.target.src = "/fallback-icon.png"} 
              />
            </p>
            <p><strong>Name:</strong> {summonerName + "#" + summonerTag}</p>
            <p><strong>Level:</strong> {summonerData.summonerLevel}</p>
            <p><strong>Rank:</strong> {summonerData.tier} {summonerData.rank}</p>
            <p><strong>Win Rate (Last 20):</strong> {summonerData.winRate}%</p>
        </div>
      )}
    </div>
  );
};

export default App;
