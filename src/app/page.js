import Image from "next/image";

const STEAM_API_KEY = "F43969BF9A1DD05A93C5806D719B5B7B"; // Ganti dengan STEAM API KEY kalian, kalian bisa kunjungi website berikut https://steamcommunity.com/dev
const STEAM_ID = "76561199807130441"; // Untuk STEAM ID bisa cek diprofile 

async function getOwnedGames() {
  const res = await fetch(
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&include_appinfo=true&format=json`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.response.games || [];
}

async function getPlayerAchievements(appid) {
  const res = await fetch(
    `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appid}&key=${STEAM_API_KEY}&steamid=${STEAM_ID}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.playerstats || !data.playerstats.achievements) return [];
  return data.playerstats.achievements.filter((ach) => ach.achieved === 1);
}

async function getAchievementSchema(appid) {
  const res = await fetch(
    `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${STEAM_API_KEY}&appid=${appid}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.game?.availableGameStats?.achievements || [];
}

async function getSteamProfile() {
  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.response.players[0];
}

export default async function Home() {
  const steamProfile = await getSteamProfile();
  const games = await getOwnedGames();
  const gamesToShow = games.slice(0, 999);

  const achievementsPerGame = await Promise.all(
    gamesToShow.map(async (game) => {
      const [achievements, schema] = await Promise.all([
        getPlayerAchievements(game.appid),
        getAchievementSchema(game.appid),
      ]);
      const achievementsWithIcon = achievements.map((ach) => {
        const detail = schema.find((s) => s.name === ach.apiname);
        return {
          ...ach,
          icon: detail?.icon,
          name: detail?.displayName || ach.apiname,
          description: detail?.description || "",
        };
      });
      return {
        gameName: game.name,
        achievements: achievementsWithIcon,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 font-sans">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 py-6 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-center font-display">
            About Me
          </h1>
          <p className="mt-2 text-center text-slate-600 text-lg max-w-2xl mx-auto font-light">
            Halo! Saya <span className="font-semibold">fjr</span>, {" "}
            <span className="font-medium">seorang programmer pemula</span> dengan hobi bermain game.
             Saya ingin menunjukkan profil, dan achievement <i>Steam</i> saya. Mari berteman di Steam!.
          </p>
        </div>
      </header>

      <main className="px-4 py-12 flex justify-center font-sans">
        <div className="w-full max-w-5xl space-y-12">
          {/* Steam Profile */}
          <section className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200 p-8 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-center">
            {steamProfile ? (
              <>
                <Image
                  src={steamProfile.avatarfull}
                  alt="Steam Avatar"
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white shadow"
                />
                <div className="space-y-2 text-center sm:text-left">
                  <h2 className="text-3xl font-extrabold flex items-center gap-2 justify-center sm:justify-start font-display">
                    {steamProfile.personaname}
                    <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full text-xs px-3 py-1">
                      Steam
                    </span>
                  </h2>
                  <a
                    href={steamProfile.profileurl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View Profile →
                  </a>
                </div>
              </>
            ) : (
              <p className="text-red-500 text-sm">
                Gagal mengambil data Steam.
              </p>
            )}
          </section>

          {/* Achievements */}
          <section className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200 p-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 font-display">
              <svg
                className="w-6 h-6 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l2.39 7.26H22l-6.19 4.5L17.61 22 12 17.77 6.39 22l1.8-8.24L2 9.26h7.61z" />
              </svg>
              Achievements
            </h2>
            {achievementsPerGame.map((game, idx) => (
              <div key={idx} className="mb-10">
                <h3 className="text-2xl font-semibold mb-4 font-display">
                  {game.gameName}
                </h3>
                {game.achievements.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {game.achievements.map((ach) => (
                      <li
                        key={ach.apiname}
                        className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                      >
                        {ach.icon && (
                          <img
                            src={ach.icon}
                            alt={ach.name}
                            width={48}
                            height={48}
                            className="rounded border border-slate-200"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-base text-slate-800 font-sans leading-tight">
                            {ach.name}{" "}
                            <span className="text-green-500">✅</span>
                          </p>
                          {ach.description && (
                            <p className="text-sm text-slate-500 font-light line-clamp-2">
                              {ach.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-slate-500">
                    Belum ada achievement di game ini.
                  </p>
                )}
              </div>
            ))}
          </section>
        </div>
      </main>

      <footer className="text-center py-6 bg-white/90 border-t border-slate-200 text-slate-600 text-sm">
        &copy; {new Date().getFullYear()} Aruna — Powered by{" "}
        <span className="font-semibold text-blue-600">Steam API</span> &{" "}
        <span className="font-semibold text-black">Next.js</span>
      </footer>
    </div>
  );
}
