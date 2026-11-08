/**
 * The shared catalog. Every team, game, person and listing is invented; none represents a real
 * organization or person. It lives in code, so reading it uses none of the database allowance.
 */
import type { Category, FeedPost, Game, Listing, ListingDetail, Person, Team } from "../src/shared/types";

export const GAMES: Game[] = [
  {
    id: "wrackline",
    name: "Wrackline",
    genre: "MOBA",
    tagline: "The tide rewrites the map every six minutes.",
    description: "Five-on-five on a drowned coast. Every six minutes the tide comes in and the lanes disappear.",
    banner: "wrackline",
    studio: "Slackwater Studios",
    released: "2015",
    format: "5v5, best of 3 (finals best of 5)",
    platforms: "PC",
    about: [
      "Two crews fight over a chain of islands off a drowned coast, and the sea doesn't take sides. At low tide the seabed is dry and three lanes run together across the sand. At high tide the map breaks into islands, joined only by bridges and whatever boats are still afloat.",
      "The tide follows a published table, so nobody is ever surprised by it. Good crews start their fights a minute before the water moves, and the best Anchors can tell you how much sand is left without looking at the clock.",
    ],
    rolesTitle: "Roles",
    roles: [
      { name: "Anchor", detail: "The support. Keeps the crew together and decides when it's safe to cross." },
      { name: "Channel", detail: "Mid lane, the only one that never dries out. Games are usually decided here." },
      { name: "Breakwater", detail: "The frontline. Takes the first hit so nobody else has to." },
      { name: "Diver", detail: "The roamer. Works the wrecks and tide pools at low water, and gets out before it rises." },
      { name: "Harpoon", detail: "The late-game damage. Weak until the second tide, terrifying after the third." },
    ],
    maps: ["Saint Brine", "The Narrows", "Gull Reach"],
    circuit: [
      { name: "The Spring Tide", detail: "The world championship, every October. Sixteen crews play for a ship's bell, and the winners ring it on stage." },
      { name: "Neap Split", detail: "The regional season, February to June, named after the weakest tide of the month. It decides who goes to the Spring Tide." },
      { name: "Circuito Brasil and Cono Sur League", detail: "South America's two top leagues, with a promotion path from the open ladder." },
    ],
    slang: [
      { term: "The bell", meaning: "The ten-second warning before the tide turns. Shouting it on comms means stop whatever you're doing." },
      { term: "Beached", meaning: "Caught on the wrong island when the water comes in." },
      { term: "Wet pull", meaning: "Starting a fight as the water rises, so the losers have nowhere to run." },
      { term: "Reading the table", meaning: "Planning a whole game around the tide times. Also what you tell a teammate to go and do." },
    ],
  },
  {
    id: "deadband",
    name: "Deadband",
    genre: "Tactical shooter",
    tagline: "Plant the jammer, and they can't hear each other.",
    description: "Round-based five-on-five. Plant the jammer and the other team loses its voice chat and its radar.",
    banner: "deadband",
    studio: "Ninth Relay",
    released: "2016",
    format: "5v5, first to 13 rounds",
    platforms: "PC",
    about: [
      "Attackers carry a jammer into one of two relay rooms, and defenders have to stop it from being planted. Once it's down, a 40-second countdown starts and the defending team loses its voice chat, its minimap and its teammate outlines until the jammer is destroyed or the round ends.",
      "That silence is the reason people watch. A retake is five players who can't speak, moving on what they agreed before the round and what they can hear through the walls. By tradition, casters stop talking too, until someone wins.",
    ],
    rolesTitle: "Roles",
    roles: [
      { name: "Caller", detail: "The in-game leader. Runs the round, and prepares the team for when nobody can call anything." },
      { name: "Entry", detail: "First through the door. Trades their life for space and information." },
      { name: "Carrier", detail: "Holds the jammer and decides, as late as possible, which room it goes to." },
      { name: "Lurker", detail: "Works alone on the far side of the map and punishes the rotation." },
      { name: "Longshot", detail: "Holds the long sightlines with the rifle that decides the round's economy." },
    ],
    maps: ["Old Exchange", "Kilo Tower", "Salt Station", "Relay Nine"],
    circuit: [
      { name: "Last Transmission", detail: "The world final, every December. Its last-round silence is the most clipped moment in the game." },
      { name: "Longwave Masters", detail: "Three international events a year, each hosted by a different city." },
      { name: "Shortwave Open", detail: "An open qualifier anyone can enter. It's where unsigned teams get noticed." },
    ],
    slang: [
      { term: "Going dark", meaning: "Getting jammed. \"Dark in five\" means get to your position now." },
      { term: "Last words", meaning: "The final callout before the jam hits. Good teams rehearse theirs." },
      { term: "Silent retake", meaning: "Winning the round back after being jammed. The play everyone wants on their highlight reel." },
      { term: "Static", meaning: "The hiss you hear near a planted jammer. Players use it to find it without a radar." },
    ],
  },
  {
    id: "curfew",
    name: "Curfew",
    genre: "Battle royale",
    tagline: "Stay out past dark. Be the last one standing at dawn.",
    description: "Twenty-five squads, one city, and a curfew that closes it block by block until the sun comes up.",
    banner: "curfew",
    studio: "Sodium Lamp",
    released: "2019",
    format: "25 squads of 4, six matches a night",
    platforms: "PC and consoles",
    about: [
      "Each match is one night in a port city, from sundown to sunrise in 28 minutes. As it goes on, sirens sound and one district after another goes under curfew: lights out, gates down, and patrol drones that shoot on sight.",
      "The closures are announced, so the game rewards logistics as much as aim. Squads plan their night around train lines, rooftops and gate codes, and the best Navigators know three ways out of every block. Whoever's still standing when the sun comes up wins.",
    ],
    rolesTitle: "Roles",
    roles: [
      { name: "Navigator", detail: "The in-game leader. Calls every rotation and makes the decision before the sirens do." },
      { name: "Pointman", detail: "Goes first into every building and every fight." },
      { name: "Spotter", detail: "Holds the rooftops and feeds the squad positions." },
      { name: "Fixer", detail: "Keeps everyone alive and supplied. Carries the gate codes, so don't lose your Fixer." },
    ],
    maps: ["Port Verity", "Mount Sable", "The Terraces"],
    circuit: [
      { name: "Last Call Invitational", detail: "The year's biggest LAN. Twenty-five squads play eighteen matches over three nights." },
      { name: "Night Shift League", detail: "The weekly pro league, played Thursday to Saturday, always after dark in the host city." },
      { name: "Dawn Cup", detail: "Monthly open tournaments for amateur squads, with a route into the league." },
    ],
    slang: [
      { term: "Sunrise", meaning: "A match win. \"We got three sunrises tonight\" is a very good night." },
      { term: "Caught out", meaning: "Still inside a district when it closes." },
      { term: "Gate camp", meaning: "Waiting at a district's exit for squads running from the sirens." },
      { term: "Early bed", meaning: "Getting eliminated in the first ten minutes." },
    ],
  },
  {
    id: "railhead",
    name: "Railhead",
    genre: "Real-time strategy",
    tagline: "Your army only goes as far as your tracks.",
    description: "One-on-one strategy on the frontier. Your army only goes as far as the rails you lay behind it.",
    banner: "railhead",
    studio: "Narrow Gauge",
    released: "2017",
    format: "1v1, best of 5",
    platforms: "PC",
    about: [
      "Two rival railway companies race across an invented frontier in the 1880s, laying track as they fight. Every soldier, shell and barrel of fuel reaches the front by train, so an army that outruns its railway starves within a minute.",
      "That makes Railhead a game about cutting lines more than winning battles. Top players keep a second line hidden behind the first, and will happily lose a fight to blow up one bridge.",
    ],
    rolesTitle: "Companies",
    roles: [
      { name: "Consolidated Northern", detail: "Slow, heavy trains and the best artillery in the game." },
      { name: "Sierra & Coast", detail: "Light track laid fast. Wins early, or not at all." },
      { name: "The Free Haulers", detail: "Lays almost nothing. Steals and repairs the enemy's track instead." },
    ],
    maps: ["Black Ridge", "The Long Bend", "Three Bridges", "Salt Flats"],
    circuit: [
      { name: "The Golden Spike", detail: "The world final, every November. The winner's name is stamped into a real rail spike and added to the trophy." },
      { name: "Junction League", detail: "A season-long league, played online, for the top 32 players in the world." },
      { name: "Whistle Stop Series", detail: "Weekend opens in a different city each month. Anyone can enter." },
    ],
    slang: [
      { term: "Running dry", meaning: "An army whose supply line has been cut." },
      { term: "Ghost line", meaning: "A hidden second railway, built in case the first one gets cut." },
      { term: "Spiking", meaning: "Sending a small squad behind enemy lines to tear up track." },
      { term: "End of the line", meaning: "What players type when they resign." },
    ],
  },
];

const gameName = (id: string) => (GAMES.find((game) => game.id === id) as Game).name;

export const TEAMS: Team[] = [
  {
    id: "gambiarra",
    name: "Gambiarra",
    tag: "GMB",
    tagline: "It shouldn't work. It works.",
    banner: "team-gambiarra",
    location: "Recife, Brazil",
    founded: "2018",
    size: "51-200 employees",
    league: "Circuito Brasil",
    gameIds: ["wrackline"],
    gameName: gameName("wrackline"),
    colors: "Yellow and black",
    supporters: "A Fita (\"the Tape\")",
    focusAreas: ["Player Development", "Coaching", "Community Growth"],
    about: [
      "A gambiarra is the Brazilian word for a fix that shouldn't hold but does: a phone charger taped to a fan, a TV antenna made from a coat hanger. In 2018, five Wrackline players from Recife took it as their team name after qualifying for their first regional final on a router held together with electrical tape.",
      "The style stuck along with the name. Gambiarra is known for drafts nobody has prepared for and for winning games the analysts can't quite explain afterwards. Behind the chaos is a serious academy, which has sent eleven players to international rosters. On match days, fans wrap yellow tape around their wrists.",
    ],
    whatWeDo: [
      "Field a Wrackline roster in Circuito Brasil, with an academy team in Recife",
      "Scout the ladders of Brazil's Northeast, where most organizations don't look",
      "Run free weekend bootcamps for players who can't pay for a coach",
      "Publish our strangest drafts after every split, since someone will figure them out anyway",
    ],
    honorsTitle: "Honors",
    honors: [
      { year: "2025", title: "Circuito Brasil, Neap Split", result: "Champions" },
      { year: "2024", title: "The Spring Tide", result: "Quarterfinals" },
      { year: "2022", title: "Copa Nordeste", result: "Champions" },
    ],
    rosterTitle: "Wrackline roster",
    roster: [
      { handle: "tapioca", role: "Anchor", country: "Brazil" },
      { handle: "Caju", role: "Channel", country: "Brazil" },
      { handle: "Bigorna", role: "Breakwater", country: "Brazil" },
      { handle: "mandacaru", role: "Diver", country: "Portugal" },
      { handle: "Lampião", role: "Harpoon", country: "Brazil" },
    ],
    faqs: [
      { question: "How do you pronounce the name?", answer: "Gahm-bee-AH-ha. English-speaking casters have been getting it wrong since 2018, and we've stopped correcting them." },
      { question: "Do I have to live in Recife?", answer: "The first team and academy train here, in a house near Boa Viagem. Analysts, editors and community staff can work from anywhere." },
      { question: "Is the team hiring?", answer: "Yes. Open roles are listed below, and we read every application, especially the strange ones." },
    ],
  },
  {
    id: "halifax-undertow",
    name: "Halifax Undertow",
    tag: "HFX",
    tagline: "Calm on top. Everything's happening underneath.",
    banner: "team-undertow",
    location: "Halifax, Canada",
    founded: "2021",
    size: "11-50 employees",
    league: "Night Shift League",
    gameIds: ["curfew"],
    gameName: gameName("curfew"),
    colors: "Navy and foam white",
    supporters: "Section 902",
    focusAreas: ["Competitive Play", "Streaming", "Live Events"],
    about: [
      "The Undertow launched in 2021 as Atlantic Canada's first professional esports franchise, on the idea that nobody out here should have to fly to Toronto to watch a final. Home matches are played in a converted ferry terminal on the Halifax waterfront, which has fewer seats than most LAN venues and a louder crowd. The supporters' section is named after the local area code.",
      "On the server, HFX plays quiet, patient Curfew: few early fights, long rotations, and a habit of turning up in the last district with more players alive than anyone counted on.",
    ],
    whatWeDo: [
      "Field a Curfew squad in the Night Shift League, all season, from our home venue",
      "Host the Maritime Open, the biggest LAN east of Montreal",
      "Run high school leagues across the Maritimes",
      "Keep production in-house, from the camera crew to the clip editors",
    ],
    honorsTitle: "Honors",
    honors: [
      { year: "2025", title: "Last Call Invitational", result: "Runners-up" },
      { year: "2024", title: "Night Shift League, Fall", result: "Champions" },
      { year: "2023", title: "Maritime Open", result: "Champions" },
    ],
    rosterTitle: "Curfew squad",
    roster: [
      { handle: "bluenose", role: "Navigator", country: "Canada" },
      { handle: "Fogbank", role: "Pointman", country: "Canada" },
      { handle: "dory", role: "Spotter", country: "Ireland" },
      { handle: "donair", role: "Fixer", country: "Canada" },
    ],
    faqs: [
      { question: "Why a ferry terminal?", answer: "It was empty, it was cheap, and it holds 900 people who like yelling. The acoustics are terrible in the best way." },
      { question: "Why is your Fixer called donair?", answer: "It's the official food of Halifax. That's a real thing, and anyone here will be happy to tell you about the sauce." },
      { question: "Is the team hiring?", answer: "Yes, see below. Most roles are on the waterfront during the season, and a few are remote." },
    ],
  },
  {
    id: "b2",
    name: "B2",
    tag: "B2",
    tagline: "We never really left the basement.",
    banner: "team-b2",
    location: "Seoul, South Korea",
    founded: "2017",
    size: "51-200 employees",
    league: "Longwave Masters",
    gameIds: ["deadband"],
    gameName: gameName("deadband"),
    colors: "Black and amber",
    supporters: "Seat 41",
    focusAreas: ["Tactical Analysis", "Coaching", "Player Development"],
    about: [
      "B2 is named after the second basement of a building in Sillim-dong, Seoul, home to the PC bang where its founders worked the night shift and played after closing. When they won their first open in 2017, the prize money went towards the back rent.",
      "The first team has since moved above ground, but the academy still trains in the same forty seats, and every new signing works a week of night shifts there before their first scrim. The thinking is that nobody who has cleaned those keyboards at 5 a.m. is going to skip a VOD review. Fans call themselves Seat 41.",
    ],
    whatWeDo: [
      "Compete in the Longwave Masters with a five-player roster and a full analysis staff",
      "Run the B2 Academy out of the original PC bang, open every night",
      "Drill silent retakes until nobody needs to talk through them",
      "Put every new signing on the night shift for their first week",
    ],
    honorsTitle: "Honors",
    honors: [
      { year: "2025", title: "Longwave Masters, Busan", result: "Champions" },
      { year: "2024", title: "Last Transmission", result: "Runners-up" },
      { year: "2019", title: "Shortwave Open, Korea", result: "Champions" },
    ],
    rosterTitle: "Deadband roster",
    roster: [
      { handle: "Banjang", role: "Caller", country: "South Korea" },
      { handle: "Yagan", role: "Entry", country: "South Korea" },
      { handle: "Sillim", role: "Carrier", country: "South Korea" },
      { handle: "Cheongso", role: "Lurker", country: "South Korea" },
      { handle: "ramyeon", role: "Longshot", country: "South Korea" },
    ],
    faqs: [
      { question: "What does the name mean?", answer: "Basement level two. It's the button you press in the elevator to get to where we started." },
      { question: "Is the night shift real?", answer: "Yes. One week, paid, for everyone from rookies to the head coach. You'll learn where the spare mice are." },
      { question: "Is the team hiring?", answer: "Yes. Apply in English or Korean. The first team room runs on a mix of the two." },
    ],
  },
  {
    id: "kaamos",
    name: "Kaamos",
    tag: "KMS",
    tagline: "Almost two months without sun. Plenty of time to practice.",
    banner: "team-kaamos",
    location: "Rovaniemi, Finland",
    founded: "2020",
    size: "11-50 employees",
    league: "Junction League",
    gameIds: ["railhead"],
    gameName: gameName("railhead"),
    colors: "Midnight blue and ice",
    supporters: "Kaamosklubi",
    focusAreas: ["Player Development", "Mental Coaching"],
    about: [
      "Kaamos is the Finnish word for the polar night, the stretch of winter when the sun stays below the horizon. The team was started in 2020 by two Railhead players from Utsjoki, Finland's northernmost municipality, where that lasts almost two months and there isn't much to do but practice.",
      "It now runs out of Rovaniemi and still keeps things small: three players on multi-year contracts, in a scene where most teams sign by the month. All three live within walking distance of the team house and its sauna, where most of the strategic arguments get settled.",
    ],
    whatWeDo: [
      "Keep three Railhead players on long contracts, with a staff built around their preparation",
      "Publish an open replay library, with every supply line annotated",
      "Host a Whistle Stop weekend in Rovaniemi every January",
      "Plan the season around the dark, with sleep coaching and mental performance staff",
    ],
    honorsTitle: "Honors",
    honors: [
      { year: "2025", title: "Junction League, Season 7", result: "Champions" },
      { year: "2024", title: "The Golden Spike", result: "World champion" },
      { year: "2023", title: "Whistle Stop Tampere", result: "Champions" },
    ],
    rosterTitle: "Railhead players",
    roster: [
      { handle: "ahkio", role: "Consolidated Northern", country: "Finland" },
      { handle: "Routa", role: "The Free Haulers", country: "Finland" },
      { handle: "Tykky", role: "Sierra & Coast", country: "Estonia" },
    ],
    faqs: [
      { question: "Do I have to move to Rovaniemi?", answer: "Players do. Staff can visit, but everyone should come once in December, if only to understand the name." },
      { question: "Why only three players?", answer: "In a one-on-one game, three people who trust each other's preparation beat ten who don't. We've never released a player mid-contract." },
      { question: "Is the team hiring?", answer: "Rarely, which is why it's worth applying when we are." },
    ],
  },
  {
    id: "atletico-latencia",
    name: "Atlético Latencia",
    tag: "CAL",
    tagline: "Winning on 180 ping since 2016.",
    banner: "team-latencia",
    location: "Buenos Aires, Argentina",
    founded: "2016",
    size: "11-50 employees",
    league: "Liga Austral",
    gameIds: ["deadband", "wrackline"],
    gameName: gameName("deadband"),
    colors: "Maroon and cream",
    supporters: "La Banda del Lag",
    focusAreas: ["Community Growth", "Creative Culture", "Live Events"],
    about: [
      "Club Atlético Latencia was founded in 2016 in a cyber in Boedo, Buenos Aires, by friends tired of playing on servers 9,000 kilometers away. Every match was an away match, so they named the club after the one opponent they faced every single time.",
      "It's organized like the neighborhood futbol clubs that inspired the name: about 4,000 members pay a small monthly fee and vote on the big decisions, including, after one heated assembly, the color of the away jersey. Fans bring drums to LANs, and the club still keeps the cyber open, with free hours for members under 18.",
    ],
    whatWeDo: [
      "Field a Deadband first team in Liga Austral, and a Wrackline academy whose derby with Gambiarra is the loudest match in the region",
      "Give every member a vote, from the budget to the jerseys",
      "Organize the Copa Boedo, our open tournament, every March",
      "Run a weekly scrim league for amateur teams across the Southern Cone",
    ],
    honorsTitle: "Honors",
    honors: [
      { year: "2025", title: "Shortwave Open, Americas", result: "Champions" },
      { year: "2024", title: "Liga Austral, Clausura", result: "Champions" },
      { year: "2023", title: "Longwave Masters, Americas Qualifier", result: "Runners-up" },
    ],
    rosterTitle: "Deadband first team",
    roster: [
      { handle: "ráfaga", role: "Caller", country: "Argentina" },
      { handle: "Chori", role: "Entry", country: "Argentina" },
      { handle: "Tano", role: "Carrier", country: "Uruguay" },
      { handle: "sube", role: "Lurker", country: "Argentina" },
      { handle: "Fernet", role: "Longshot", country: "Argentina" },
    ],
    faqs: [
      { question: "Is the 180 ping real?", answer: "It was. We play on regional servers now, at about 30. We kept the slogan because nobody wanted to be the one to move to change it." },
      { question: "Can anyone become a member?", answer: "Yes, from anywhere. Members vote at the yearly assembly, which is livestreamed and always runs long." },
      { question: "Is the team hiring?", answer: "Yes, and the members get to read the job post before you do. They have opinions." },
    ],
  },
  {
    id: "second-monitor",
    name: "Second Monitor",
    tag: "2ND",
    tagline: "What you watch while you're supposed to be working.",
    banner: "team-second-monitor",
    location: "Remote, six countries",
    founded: "2021",
    size: "11-50 employees",
    league: "Second Division (organizers)",
    gameIds: ["wrackline", "deadband"],
    gameName: gameName("wrackline"),
    colors: "Coral and off-white",
    supporters: "The Alt-Tabbers",
    focusAreas: ["Content Creation", "Streaming", "Creative Culture"],
    about: [
      "Second Monitor began as a group chat of streamers who kept turning up on each other's channels. It's now a creator-owned collective with no office and no first team, just about a dozen people in six countries who each own a share.",
      "What it makes is explanation. Its best-known show, Tide Table, breaks down a whole Wrackline match in twenty minutes and is watched by plenty of people who've never played. Its amateur league, the Second Division, is where several Neap Split players were first noticed.",
    ],
    whatWeDo: [
      "Make Tide Table, our weekly Wrackline breakdown, and Dark in Five, the Deadband version",
      "Run the Second Division, an amateur league with proper broadcasts",
      "Split revenue evenly between members, and publish how",
      "Pay freelance editors on time, which shouldn't be a selling point",
    ],
    honorsTitle: "Milestones",
    honors: [
      { year: "2025", title: "The Spring Tide watch party", result: "410K peak viewers" },
      { year: "2025", title: "Tide Table", result: "1.2M subscribers" },
      { year: "2023", title: "Second Division, first season", result: "64 teams" },
    ],
    rosterTitle: "On screen",
    roster: [
      { handle: "priyatime", role: "Host, Tide Table", country: "United Kingdom" },
      { handle: "oatmeal", role: "Caster", country: "Ireland" },
      { handle: "sidequest", role: "Analyst", country: "Netherlands" },
      { handle: "lenacuts", role: "Editor", country: "Germany" },
    ],
    faqs: [
      { question: "Do you have a pro team?", answer: "No. We've been offered a league slot twice and voted no twice. We'd rather explain the games than lose them on stream." },
      { question: "How do I join?", answer: "Existing members vote new ones in, usually after working together on a few projects. Open roles are listed below, and they're a good way to start." },
    ],
  },
];

/** What each team tells applicants. Used to write its listings, so they don't all read alike. */
const HIRING: Record<string, { contact: string; culture: string; stakes: string }> = {
  gambiarra: {
    contact: "mara",
    culture: "We'd rather hire someone with a strange idea and the discipline to test it than someone who copies whatever won last week.",
    stakes: "Gambiarra's academy has sent eleven players to international rosters, and the people in this role are a big part of why",
  },
  "halifax-undertow": {
    contact: "nadia",
    culture: "Quiet people do well here. We value players and staff who prepare properly and don't need to be the loudest voice in the room.",
    stakes: "We're the only franchise in Atlantic Canada, so for a lot of local kids this team is what esports looks like",
  },
  b2: {
    contact: "devon",
    culture: "We care about routine more than talent. Everybody reviews their own VODs, on time, including the people who've won things.",
    stakes: "The academy copies whatever the first team does, so the standard you set here reaches all forty seats",
  },
  kaamos: {
    contact: "yuki",
    culture: "We're a small group who see each other every day through a long, dark winter, so who you are matters as much as what you can do.",
    stakes: "With three players and long contracts, every hire changes the whole team's year",
  },
  "atletico-latencia": {
    contact: "rafa",
    culture: "We're a club before we're a company. People here show up for the members, the cyber and each other, not just for results.",
    stakes: "Four thousand members pay for this club and vote on its future, and you'd answer to them",
  },
  "second-monitor": {
    contact: "priya",
    culture: "Nobody here has a manager. You'd be trusted to plan your own work, and expected to tell people when it's late.",
    stakes: "Every member owns a share, so good work here pays everyone back directly",
  },
};

/** The one thing a player of each game has to be able to do. */
const GAME_KNOW_HOW: Record<string, string> = {
  wrackline: "You can plan a whole game around the tide table",
  deadband: "You stay useful when the comms go dark",
  curfew: "You know more than one way out of every district in Port Verity",
  railhead: "You can watch two supply lines while fighting on a third front",
};

export const PEOPLE: Person[] = [
  { id: "mara", name: "Mara Quinn", role: "Recruiter at Gambiarra", headline: "Finding players before the ladder does", bio: "Former semi-pro who now scouts the ladders of northeast Brazil for Gambiarra." },
  { id: "devon", name: "Devon Achebe", role: "Head coach at B2", headline: "Making teams comfortable in the silence", bio: "Eight seasons coaching tactical shooters, now leading B2's Deadband roster in Seoul. Direct, kind, obsessed with fundamentals." },
  { id: "yuki", name: "Yuki Tanabe", role: "Analyst at Kaamos", headline: "Turning replays into habits", bio: "Performance analyst who maps every supply line in every Railhead replay. Moved to Rovaniemi for the job and stayed for the sauna." },
  { id: "rafa", name: "Rafa Moreno", role: "Captain at Atlético Latencia", headline: "Building the South American scene, one scrim at a time", bio: "Plays as ráfaga. Deadband Caller, club member since 2016, and a loud voice for regional esports." },
  { id: "nadia", name: "Nadia Farouk", role: "Talent manager at Halifax Undertow", headline: "Contracts, careers, and common sense", bio: "Manages the Undertow's Curfew squad, and helps players read contracts and plan careers." },
  { id: "tomas", name: "Tomas Lind", role: "Mental performance coach", headline: "Tilt is a training problem", bio: "Sports psychologist working with esports rosters, including Kaamos through the polar night." },
  { id: "priya", name: "Priya Raman", role: "Host at Second Monitor", headline: "Explaining Wrackline to people who've never played it", bio: "Hosts Tide Table, Second Monitor's weekly Wrackline breakdown, and owns a share of the collective." },
  { id: "kofi", name: "Kofi Mensah", role: "Academy player at B2", headline: "Week three of the night shift", bio: "Deadband Entry in the B2 Academy, sharing what it takes to go pro, mostly from behind a PC bang counter." },
  { id: "lena", name: "Lena Brandt", role: "Video editor", headline: "Turning chaos into clips people actually finish", bio: "Freelance editor for esports creators. Cuts Tide Table for Second Monitor." },
];

/**
 * What an AI character knows, so they talk about this world instead of inventing their own: a line on
 * every game and team, and the full story of their own team and its main game. Sending only that keeps
 * each reply cheap.
 */
export function worldBriefFor(person: Person): string {
  const home = TEAMS.find((team) => `${person.role} ${person.bio}`.includes(team.name));
  const game = home && GAMES.find((candidate) => candidate.id === home.gameIds[0]);
  return [
    `Games: ${GAMES.map((item) => `${item.name} (${item.genre}): ${item.description}`).join(" ")}`,
    `Teams: ${TEAMS.map((team) => `${team.name} (${team.location}, ${team.gameName}): ${team.tagline}`).join(" ")}`,
    home ? `Your team, ${home.name}: ${home.about.join(" ")}` : "",
    game ? `${game.name}: ${game.about.join(" ")}` : "",
    game ? `${game.rolesTitle}: ${game.roles.map((role) => `${role.name}: ${role.detail}`).join(" ")}` : "",
    game ? `Terms players use: ${game.slang.map((item) => `${item.term}: ${item.meaning}`).join(" ")}` : "",
  ].filter(Boolean).join("\n");
}

interface Seed {
  id: string;
  category: Category;
  teamId: string;
  title: string;
  role: string;
  gameId: string;
  /** The picture on the listing's card: one of the game's scenes. */
  art: string;
  pay: [number, number];
  hours: string;
  mode: string;
  schedule: string;
  jobType?: string;
  days: number;
  skills: string[];
  summary: string;
}

const SEEDS: Seed[] = [
  { id: "starting-anchor", category: "job", teamId: "gambiarra", title: "Starting Anchor, Wrackline", role: "Pro Player | Wrackline", gameId: "wrackline", art: "wrackline", pay: [90, 140], hours: "35 hrs/wk", mode: "Hybrid", schedule: "Weekends", days: 2, skills: ["Support Play", "Map Knowledge", "Role Flexibility", "Shot Calling"], summary: "Our Anchor calls every crossing. We need someone who knows the tide table cold, protects the Harpoon, and doesn't panic when the bell rings with two teammates on the wrong island." },
  { id: "curfew-navigator", category: "job", teamId: "halifax-undertow", title: "Navigator, Curfew", role: "Pro Player | Curfew", gameId: "curfew", art: "curfew", pay: [50, 70], hours: "40 hrs/wk", mode: "Hybrid", schedule: "Evenings", days: 4, skills: ["Shot Calling", "Game Sense", "Positioning", "Tilt Control"], summary: "Call the rotations for a four-player squad in the Night Shift League. You'll know three ways out of every block, and you'll make the decision before the sirens do." },
  { id: "entry-fragger", category: "job", teamId: "b2", title: "Entry Fragger, Deadband", role: "Pro Player | Deadband", gameId: "deadband", art: "deadband-exchange", pay: [110, 170], hours: "40 hrs/wk", mode: "On-site", schedule: "Any time", days: 1, skills: ["Mechanical Aim", "Outplay Potential", "Clutch Performance", "Map Knowledge"], summary: "First through the door, every round. We want aim backed by discipline, and someone who still follows the plan once the comms go dark. Your first week is on the night shift." },
  { id: "academy-channel", category: "job", teamId: "atletico-latencia", title: "Academy Channel Laner, Wrackline", role: "Academy Player | Wrackline", gameId: "wrackline", art: "wrackline-narrows", pay: [25, 45], hours: "30 hrs/wk", mode: "Hybrid", schedule: "Evenings", days: 6, skills: ["Mechanical Aim", "Game Sense", "VOD Review"], summary: "A paid path into competitive Wrackline for a hungry ranked player. You'd play the Channel for the club's academy, and the derby against Gambiarra's will be the loudest match of your life." },
  { id: "railhead-pro", category: "job", teamId: "kaamos", title: "Pro Player, Railhead", role: "Pro Player | Railhead", gameId: "railhead", art: "railhead-snow", pay: [70, 115], hours: "35 hrs/wk", mode: "On-site", schedule: "Weekdays", days: 9, skills: ["Game Sense", "Tilt Control", "Clutch Performance"], summary: "One player, a three-year contract, and a staff built around your preparation. We've never released a player mid-contract. You'd move to Rovaniemi, and the sauna is included." },
  { id: "head-coach-deadband", category: "coach", teamId: "atletico-latencia", title: "Head Coach, Deadband", role: "Coach | Deadband", gameId: "deadband", art: "deadband", pay: [60, 95], hours: "40 hrs/wk", mode: "Remote", schedule: "Weekdays", days: 3, skills: ["Mentoring", "VOD Review", "Shot Calling", "Tilt Control"], summary: "Build the training culture of a young first team that learned to play on 180 ping. You'd also present your plan to the club's members, who will have questions." },
  { id: "wrackline-analyst", category: "coach", teamId: "gambiarra", title: "Performance Analyst, Wrackline", role: "Analyst | Wrackline", gameId: "wrackline", art: "wrackline-bell", pay: [40, 65], hours: "30 hrs/wk", mode: "Remote", schedule: "Flexible", days: 11, skills: ["VOD Review", "Game Sense", "Mentoring"], summary: "Turn hours of replays into three things players can fix this week. Explaining our drafts to the rest of the staff is the harder half of the job." },
  { id: "tide-table-cohost", category: "creator", teamId: "second-monitor", title: "Co-Host, Tide Table", role: "Creator | Wrackline", gameId: "wrackline", art: "wrackline", pay: [30, 80], hours: "20 hrs/wk", mode: "Remote", schedule: "Flexible", days: 5, skills: ["Content Creation", "Game Sense"], summary: "Co-host our weekly Wrackline breakdown. You'd tell the story behind the match for an audience that has often never played it, and you'd own a share of what we make." },
  { id: "clip-editor", category: "creator", teamId: "halifax-undertow", title: "Short-Form Video Editor", role: "Creator | Curfew", gameId: "curfew", art: "curfew-dawn", pay: [28, 50], hours: "20 hrs/wk", mode: "Remote", schedule: "Flexible", days: 8, skills: ["Video Editing", "Content Creation"], summary: "Turn six-match nights into short clips people actually finish. We're after the moment a squad gets caught out, more than the kill feed." },
  { id: "retake-clinic", category: "session", teamId: "b2", title: "Silent Retake Clinic, 1-on-1 Session", role: "Paid session | Deadband", gameId: "deadband", art: "deadband-tower", pay: [20, 35], hours: "1 hr", mode: "Remote", schedule: "Any time", jobType: "Single session", days: 2, skills: ["Mechanical Aim", "Mentoring"], summary: "Run focused retake sessions for players climbing the ranked ladder. There's one rule: neither of you is allowed to talk during the round." },
  { id: "tilt-workshop", category: "session", teamId: "kaamos", title: "Tilt Control Workshop Host", role: "Paid session | Any game", gameId: "railhead", art: "railhead-yard", pay: [35, 60], hours: "2 hrs/wk", mode: "Remote", schedule: "Evenings", jobType: "Part time", days: 7, skills: ["Tilt Control", "Mentoring"], summary: "Host a weekly group session on staying sharp through a bad week, from a town where it's dark by mid-afternoon." },
  { id: "copa-boedo-caster", category: "event", teamId: "atletico-latencia", title: "Caster, Copa Boedo", role: "Event | Deadband", gameId: "deadband", art: "deadband", pay: [40, 60], hours: "3 days", mode: "LAN", schedule: "Weekend", jobType: "Single event", days: 10, skills: ["Content Creation", "Game Sense"], summary: "Call the finals of our open tournament, live on a stage in Boedo, with drums. And yes, you have to stop talking during the retakes." },
  { id: "maritime-open-admin", category: "event", teamId: "halifax-undertow", title: "Tournament Admin, Maritime Open", role: "Event | Curfew", gameId: "curfew", art: "curfew-gate", pay: [25, 40], hours: "4 days", mode: "LAN", schedule: "Weekend", jobType: "Single event", days: 12, skills: ["Map Knowledge", "Role Flexibility"], summary: "Keep twenty-five squads on schedule for three nights in a converted ferry terminal. Last year's final started on time, and we'd like to do that again." },
  { id: "community-lead", category: "community", teamId: "second-monitor", title: "Community Lead", role: "Community | Wrackline", gameId: "wrackline", art: "wrackline-narrows", pay: [22, 38], hours: "25 hrs/wk", mode: "Remote", schedule: "Flexible", days: 4, skills: ["Content Creation", "Mentoring"], summary: "Run the place where our viewers, players and creators meet every day, and help keep the Second Division on schedule." },
  { id: "scrim-organizer", category: "community", teamId: "atletico-latencia", title: "Scrim League Organizer", role: "Community | Deadband", gameId: "deadband", art: "deadband-exchange", pay: [18, 30], hours: "15 hrs/wk", mode: "Remote", schedule: "Evenings", days: 13, skills: ["Shot Calling", "Mentoring"], summary: "Keep a weekly league running for about thirty amateur teams across the Southern Cone, and settle the arguments about whose internet really went down." },
  { id: "guide-writer", category: "guide", teamId: "gambiarra", title: "Anchor Guide Writer", role: "Guide | Wrackline", gameId: "wrackline", art: "wrackline-bell", pay: [25, 40], hours: "10 hrs/wk", mode: "Remote", schedule: "Flexible", days: 6, skills: ["Support Play", "Map Knowledge", "Content Creation"], summary: "Write the Anchor guide you wish you'd had when you started: how to read the table, when to cross, and when to leave someone on the island." },
  { id: "map-guide", category: "guide", teamId: "b2", title: "Map Strategy Author", role: "Guide | Deadband", gameId: "deadband", art: "deadband-tower", pay: [30, 45], hours: "10 hrs/wk", mode: "Remote", schedule: "Flexible", days: 15, skills: ["Map Knowledge", "VOD Review"], summary: "Explain the setups pros use on Old Exchange and Kilo Tower, in a way a ranked player can use tonight." },
];

function toListing(seed: Seed): Listing {
  const owner = TEAMS.find((candidate) => candidate.id === seed.teamId) as Team;
  const game = GAMES.find((candidate) => candidate.id === seed.gameId) as Game;
  return {
    id: seed.id,
    category: seed.category,
    teamId: owner.id,
    teamName: owner.name,
    banner: seed.art,
    title: seed.title,
    role: seed.role,
    gameId: game.id,
    gameName: game.name,
    payMin: seed.pay[0],
    payMax: seed.pay[1],
    hours: seed.hours,
    mode: seed.mode,
    schedule: seed.schedule,
    jobType: seed.jobType ?? "Full Time / Part Time",
    postedDaysAgo: seed.days,
    skills: seed.skills,
  };
}

export const LISTINGS: Listing[] = SEEDS.map(toListing).sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);

export function listingDetail(id: string): Omit<ListingDetail, "similar"> | null {
  const seed = SEEDS.find((candidate) => candidate.id === id);
  if (!seed) return null;
  const listing = toListing(seed);
  const hiring = HIRING[listing.teamId];
  return {
    ...listing,
    description: [
      seed.summary,
      hiring.culture,
      `You'd work with our ${listing.gameName} staff on a clear plan for the season, with honest feedback every week.`,
    ],
    requirements: [
      `Proven experience in ${listing.gameName}, at ranked or tournament level`,
      GAME_KNOW_HOW[listing.gameId],
      ...listing.skills.slice(0, 2).map((skill) => `Strong ${skill.toLowerCase()}`),
      "Clear communication in voice comms and written notes",
      "Available for practice blocks and occasional LAN events",
    ],
    greatFit: [
      "You read the game ahead of the moment, and explain your reasoning",
      "You'd rather fix a habit than blame a teammate",
      "You care about the project, the people, and the win rate",
    ],
    offers: [
      `$${listing.payMin}-${listing.payMax} per hour, agreed before you start`,
      "Access to our coaches, analysts and review tools",
      "Visibility through team content, if you want it",
      "A community with heart, strategy, and a vision beyond the meta",
    ],
    expectations: [
      "Showing up prepared, including on bad days",
      "Competitive drive with a respectful attitude",
      `Commitment of about ${listing.hours}`,
    ],
    whyItMatters: [
      hiring.stakes,
      `This role shapes how ${listing.teamName} plays, trains and talks to its community`,
    ],
  };
}

const RETAKE_LIST = [
  "How we write our last words before each round",
  "The three retake shapes every player has to know by heart",
  "Why our Caller stopped trying to call anything after the jam",
  "What to do with a team that hates this for the first month",
];

export const SHARED_POSTS: (Omit<FeedPost, "mine" | "replies" | "reactions" | "author"> & { personId: string })[] = [
  {
    id: "seed-regionals",
    personId: "devon",
    title: "How we won six of our last eight silent retakes in Busan",
    body: `We used to treat going dark as bad luck. This split we started practicing it: every scrim block at B2 now ends with ten rounds where we mute ourselves on purpose. In this post, I'm sharing:\n\n${RETAKE_LIST.map((item) => `- ${item}`).join("\n")}\n\nIf you're a coach, or want to become one, drop your questions below. Happy to share what worked and what didn't.`,
    createdAt: Date.UTC(2026, 9, 28),
  },
  {
    id: "seed-first-contract",
    personId: "nadia",
    title: "Read this before you sign your first contract",
    body: "I've reviewed hundreds of player contracts. Three clauses cause most of the regret:\n\n- Buyouts that make it impossible to leave\n- Prize splits that aren't written down\n- Content rights that outlive the contract\n\nAsk about all three. A good team won't mind the questions.",
    createdAt: Date.UTC(2026, 9, 25),
  },
  {
    id: "seed-ping",
    personId: "rafa",
    title: "We play on 30 ping now. We kept the name.",
    body: "People ask why a club on regional servers still calls itself Latencia. For years, every team from here learned to shoot where an enemy was going to be, to call everything a beat early, and to lose without blaming the connection.\n\nThat's still how we teach it at the cyber. If you're learning on a bad connection somewhere, it isn't wasted time. Stay with it.",
    createdAt: Date.UTC(2026, 9, 23),
  },
  {
    id: "seed-tilt",
    personId: "tomas",
    title: "Tilt is a training problem",
    body: "Players treat tilt like weather: something that just happens. It isn't. You can practice recovering from a bad round the same way you practice aim.\n\nTry this tonight: after each loss, write one sentence about what you controlled. That's the whole drill.",
    createdAt: Date.UTC(2026, 9, 21),
  },
];

/** Greetings and fallbacks, used when a message arrives without AI or the model is unavailable. */
export const FALLBACK_REPLIES = [
  "Thanks for the message! I'm away from my desk, but I've noted this and I'll follow up soon.",
  "Good question. Let me check with the staff and come back to you with a proper answer.",
  "Appreciate you reaching out. Send me your availability this week and we'll take it from there.",
];

/** The person who talks to applicants for a team. */
export function teamContact(teamId: string): Person {
  return PEOPLE.find((person) => person.id === HIRING[teamId].contact) as Person;
}

export function recruiterFor(listing: Listing): Person {
  return teamContact(listing.teamId);
}

/**
 * Cleans up a model's chat message. Messages show as plain text, so Markdown would appear as
 * literal asterisks, and GLM sometimes drops the final mark of a Spanish "¡...!".
 */
export function tidyReply(reply: string): string {
  const clean = reply.replace(/\*\*|__/g, "").trim();
  const closes = (opening: string, closing: string) => clean.lastIndexOf(opening) > clean.lastIndexOf(closing);
  if (closes("¡", "!")) return `${clean}!`;
  if (closes("¿", "?")) return `${clean}?`;
  return clean;
}

export const personAvatar = (id: string) => `/images/people/${id}.webp`;

/** Share of a listing's skills that a player has, from 0 to 100. */
export function matchScore(listingSkills: string[], userSkills: string[]): number {
  if (listingSkills.length === 0) return 0;
  const owned = new Set(userSkills.map((skill) => skill.toLowerCase()));
  const hits = listingSkills.filter((skill) => owned.has(skill.toLowerCase())).length;
  return Math.round((hits / listingSkills.length) * 100);
}
