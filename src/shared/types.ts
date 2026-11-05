/** The contract between the browser and the API. */

export const CATEGORIES = ["job", "game", "community", "guide", "session", "event", "coach", "creator"] as const;
export type Category = (typeof CATEGORIES)[number];

export const SKILLS = [
  "Mechanical Aim",
  "Game Sense",
  "Positioning",
  "Outplay Potential",
  "Tilt Control",
  "Map Knowledge",
  "Support Play",
  "Role Flexibility",
  "Clutch Performance",
  "Shot Calling",
  "VOD Review",
  "Content Creation",
  "Mentoring",
  "Video Editing",
] as const;

export const LINKED_ACCOUNTS = [
  { key: "x", label: "X", group: "personal" },
  { key: "instagram", label: "Instagram", group: "personal" },
  { key: "linkedin", label: "LinkedIn", group: "personal" },
  { key: "ember-arena", label: "Ember Arena", group: "gaming" },
  { key: "vantage-strike", label: "Vantage Strike", group: "gaming" },
  { key: "skyline-royale", label: "Skyline Royale", group: "gaming" },
] as const;

export const THUMBNAILS = ["clash", "river", "forest", "siege"] as const;

export interface Game {
  id: string;
  name: string;
  genre: string;
  description: string;
  banner: string;
}

export interface Team {
  id: string;
  name: string;
  tagline: string;
  banner: string;
  size: string;
  location: string;
  founded: string;
  focusAreas: string[];
  about: string[];
  whatWeDo: string[];
  faqs: { question: string; answer: string }[];
  following?: boolean;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  headline: string;
  bio: string;
}

export interface Listing {
  id: string;
  category: Category;
  teamId: string;
  teamName: string;
  banner: string;
  title: string;
  role: string;
  gameId: string;
  gameName: string;
  payMin: number;
  payMax: number;
  hours: string;
  mode: string;
  schedule: string;
  jobType: string;
  postedDaysAgo: number;
  skills: string[];
  match?: number;
  saved?: boolean;
  applied?: boolean;
}

export interface ListingDetail extends Listing {
  description: string[];
  requirements: string[];
  greatFit: string[];
  offers: string[];
  expectations: string[];
  whyItMatters: string[];
  similar: Listing[];
}

export interface WorkItem {
  id: string;
  team: string;
  period: string;
  location: string;
  duration: string;
}

export interface Award {
  id: string;
  title: string;
  game: string;
  scope: string;
  participants: string;
  description: string;
  medal: "gold" | "silver" | "bronze";
}

export interface Highlight {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  playedOn: string;
  views: string;
}

export interface User {
  id: string;
  email: string;
  isGuest: boolean;
  name: string;
  handle: string;
  about: string;
  country: string;
  avatar: string | null;
  background: string | null;
  skills: string[];
}

export interface Reply {
  id: string;
  body: string;
  createdAt: number;
  author: { name: string; avatar: string | null };
}

export interface FeedPost {
  id: string;
  mine: boolean;
  author: { name: string; avatar: string | null; headline: string };
  title?: string;
  body: string;
  createdAt: number;
  reactions: string[];
  replies: Reply[];
}

export interface HomeData {
  matches: Listing[];
  applied: Listing[];
  suggestedTeams: Team[];
}

export interface Conversation {
  person: Person;
  lastMessage: string;
  lastAt: number;
  unread: number;
}

export interface Message {
  id: string;
  fromUser: boolean;
  body: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  text: string;
  to: string;
  createdAt: number;
}

export interface SearchResults {
  games: Game[];
  listings: Listing[];
  people: Person[];
  teams: Team[];
}

export const REACTIONS = ["trophy", "bookmark"] as const;

export const LIMITS = {
  name: 60,
  handle: 30,
  about: 800,
  country: 60,
  note: 1000,
  post: 2000,
  reply: 800,
  message: 800,
  shortField: 80,
  description: 600,
  /** Avatars and backgrounds are resized in the browser and stored as small data URLs. */
  imageChars: 90_000,
  rowsPerCollection: 40,
  postsPerUser: 50,
  messagesPerThread: 200,
};

export const GUEST_DAYS = 7;
