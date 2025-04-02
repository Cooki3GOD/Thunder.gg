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
      const [rankResponse, matchesResponse] = await Promise.all([
        fetch(`https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${API_KEY}`),
        fetch(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${API_KEY}`),
      ]);

      if (!rankResponse.ok || !matchesResponse.ok) {
        throw new Error("Failed to fetch rank or match data");
      }

      const rankData = await rankResponse.json();
      const matchIds = await matchesResponse.json();

      const soloRank = rankData.find((queue) => queue.queueType === "RANKED_SOLO_5x5");
      const tier = soloRank?.tier || "Unranked";
      const rank = soloRank?.rank || "";

      const matchDetails = await Promise.all(
        matchIds.map((matchId) =>
          fetch(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`).then((res) =>
            res.ok ? res.json() : null
          )
        )
      );

      const wins = matchDetails.reduce((acc, match) => {
        const participant = match?.info?.participants?.find((p) => p.puuid === puuid);
        return participant?.win ? acc + 1 : acc;
      }, 0);

      setSummonerData((prev) => ({ ...prev, tier, rank, winRate: ((wins / matchDetails.length) * 100).toFixed(2) }));
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

    try {
      const response = await fetch(
        `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/${summonerTag}?api_key=${API_KEY}`
      );
      if (!response.ok) throw new Error("Failed to fetch summoner data");

      const accountData = await response.json();
      const { puuid } = accountData;

      const summonerResponse = await fetch(
        `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`
      );
      if (!summonerResponse.ok) throw new Error("Failed to fetch summoner details");

      const summonerInfo = await summonerResponse.json();
      setSummonerData(summonerInfo);
      fetchRankAndWinRate(summonerInfo.id, puuid);
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
          <select className="ml-3 mr-2 p-3" onChange={(e) => setRegion(e.target.value)} value={region}>
            {["br1", "eun1", "euw1", "jp1", "kr", "la1", "la2", "na1", "oc1", "tr1", "ru", "ph2", "sg2", "th2", "tw2", "vn2"].map((reg) => (
              <option key={reg} value={reg}>{reg.toUpperCase()}</option>
            ))}
          </select>

          <input type="text" placeholder="Game Name" value={summonerName} onChange={(e) => setSummonerName(e.target.value)} className="mr-2 p-3" />
          <input type="text" placeholder="Summoner Tag" value={summonerTag} onChange={(e) => setSummonerTag(e.target.value)} className="p-3" />
          <button className="btn btn-ghost p-3" onClick={fetchSummonerData}>.GG</button>
        </div>

        {error && <p className="text-red-500">{error}</p>}
      </div>

      {summonerData && (
        <div className="summoner-details">
          <img src={`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${summonerData.profileIconId}.png`} alt="icon" onError={(e) => (e.target.src = "/fallback-icon.png")} />
          <p><strong>Name:</strong> {`${summonerName}#${summonerTag}`}</p>
          <p><strong>Level:</strong> {summonerData.summonerLevel}</p>
          <p><strong>Rank:</strong> {`${summonerData.tier} ${summonerData.rank}`}</p>
          <p><strong>Win Rate (Last 20):</strong> {`${summonerData.winRate}%`}</p>
        </div>
      )}
    </div>
  );
};

export default App;