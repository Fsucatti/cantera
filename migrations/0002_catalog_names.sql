-- The catalog's games, teams and listings got new names and ids. This keeps existing accounts
-- pointing at them, and updates what the sample profile and the AI characters already wrote.
-- People's own posts and messages aren't touched.

-- Listings
UPDATE applications SET listing_id = 'starting-anchor' WHERE listing_id = 'support-main-fa';
UPDATE applications SET listing_id = 'curfew-navigator' WHERE listing_id = 'battle-royale-igl';
UPDATE applications SET listing_id = 'entry-fragger' WHERE listing_id = 'entry-fragger-na';
UPDATE applications SET listing_id = 'academy-channel' WHERE listing_id = 'academy-mid';
UPDATE applications SET listing_id = 'railhead-pro' WHERE listing_id = 'rts-pro';
UPDATE applications SET listing_id = 'head-coach-deadband' WHERE listing_id = 'head-coach-vs';
UPDATE applications SET listing_id = 'wrackline-analyst' WHERE listing_id = 'analyst-ea';
UPDATE applications SET listing_id = 'tide-table-cohost' WHERE listing_id = 'narrative-streamer';
UPDATE applications SET listing_id = 'retake-clinic' WHERE listing_id = 'aim-session';
UPDATE applications SET listing_id = 'tilt-workshop' WHERE listing_id = 'tilt-session';
UPDATE applications SET listing_id = 'copa-boedo-caster' WHERE listing_id = 'open-cup-caster';
UPDATE applications SET listing_id = 'maritime-open-admin' WHERE listing_id = 'lan-admin';

UPDATE saved_listings SET listing_id = 'starting-anchor' WHERE listing_id = 'support-main-fa';
UPDATE saved_listings SET listing_id = 'curfew-navigator' WHERE listing_id = 'battle-royale-igl';
UPDATE saved_listings SET listing_id = 'entry-fragger' WHERE listing_id = 'entry-fragger-na';
UPDATE saved_listings SET listing_id = 'academy-channel' WHERE listing_id = 'academy-mid';
UPDATE saved_listings SET listing_id = 'railhead-pro' WHERE listing_id = 'rts-pro';
UPDATE saved_listings SET listing_id = 'head-coach-deadband' WHERE listing_id = 'head-coach-vs';
UPDATE saved_listings SET listing_id = 'wrackline-analyst' WHERE listing_id = 'analyst-ea';
UPDATE saved_listings SET listing_id = 'tide-table-cohost' WHERE listing_id = 'narrative-streamer';
UPDATE saved_listings SET listing_id = 'retake-clinic' WHERE listing_id = 'aim-session';
UPDATE saved_listings SET listing_id = 'tilt-workshop' WHERE listing_id = 'tilt-session';
UPDATE saved_listings SET listing_id = 'copa-boedo-caster' WHERE listing_id = 'open-cup-caster';
UPDATE saved_listings SET listing_id = 'maritime-open-admin' WHERE listing_id = 'lan-admin';

-- Teams
UPDATE follows SET team_id = 'gambiarra' WHERE team_id = 'ember-foxes';
UPDATE follows SET team_id = 'halifax-undertow' WHERE team_id = 'stormhowl';
UPDATE follows SET team_id = 'b2' WHERE team_id = 'jade-vanguard';
UPDATE follows SET team_id = 'kaamos' WHERE team_id = 'frostline';
UPDATE follows SET team_id = 'atletico-latencia' WHERE team_id = 'dune-raiders';
UPDATE follows SET team_id = 'second-monitor' WHERE team_id = 'voidlight';

-- Linked game accounts
UPDATE linked_accounts SET account_key = 'wrackline' WHERE account_key = 'ember-arena';
UPDATE linked_accounts SET account_key = 'deadband' WHERE account_key = 'vantage-strike';
UPDATE linked_accounts SET account_key = 'curfew' WHERE account_key = 'skyline-royale';

-- Highlight pictures
UPDATE highlights SET thumbnail = 'tide' WHERE thumbnail = 'clash';
UPDATE highlights SET thumbnail = 'shoal' WHERE thumbnail = 'river';
UPDATE highlights SET thumbnail = 'retake' WHERE thumbnail = 'forest';
UPDATE highlights SET thumbnail = 'beached' WHERE thumbnail = 'siege';

-- The sample profile that guests start with
UPDATE highlights SET title = 'Last Tide, Cono Sur Final' WHERE title = 'Final Match, Southern Legends';
UPDATE highlights SET title = 'Neap Split Highlights' WHERE title = 'Mid-Season Highlights';
UPDATE highlights SET title = 'Shortwave Open Run' WHERE title = 'Community Cup Run';
UPDATE highlights SET title = 'Beached and Back' WHERE title = 'Comeback at the Crystal';

UPDATE work_history SET team = 'Atlético Latencia Academy' WHERE team = 'Dune Raiders Academy';
UPDATE work_history SET team = 'Second Division, Second Monitor', period = '2023 - 2024', duration = '1 Year' WHERE team = 'Voidlight' AND period = '2022 - 2024';
UPDATE work_history SET period = '2021 - 2023', duration = '2 Years' WHERE team = 'Open Ladder Collective' AND period = '2021 - 2022';

UPDATE awards SET title = '2025 Cono Sur League, Second Tier', game = 'Wrackline', description = 'Won the final as starting Anchor, after coming through the open qualifiers.' WHERE title = '2025 Southern Legends Championship';
UPDATE awards SET title = '2024 Spring Tide Qualifier', game = 'Wrackline', description = 'Reached the last round of the southern qualifier and lost the deciding game on the final tide.' WHERE title = '2024 Mid-Season Open';
UPDATE awards SET title = '2024 Shortwave Open', game = 'Deadband', description = 'Entered as a stand-in Carrier and made it out of the group stage.' WHERE title = '2024 Community Cup';

UPDATE users SET about = 'Wrackline Anchor from the Cono Sur circuit. I call the crossings, keep my Harpoon out of the water, and review more replays than is probably healthy.'
  WHERE about = 'Competitive Ember Arena support with a deep understanding of team dynamics and high-pressure decision making. Always aiming for the next win, on and off the arena.';

-- What the AI characters already wrote: first the listing titles they quote, then the names.
UPDATE messages SET body = REPLACE(body, 'our support guide', 'our Anchor guide') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Support Main, Ember Arena (Remote/LAN)', 'Starting Anchor, Wrackline') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'In-Game Leader, Skyline Royale', 'Navigator, Curfew') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Academy Mid Laner, Ember Arena', 'Academy Channel Laner, Wrackline') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Head Coach, Vantage Strike', 'Head Coach, Deadband') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, '"Performance Analyst"', '"Performance Analyst, Wrackline"') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Narrative Streamer', 'Co-Host, Tide Table') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Aim Fundamentals, 1-on-1 Session', 'Silent Retake Clinic, 1-on-1 Session') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Caster, Southern Open Cup', 'Caster, Copa Boedo') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Tournament Admin, Skyline Invitational', 'Tournament Admin, Maritime Open') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Support Guide Writer', 'Anchor Guide Writer') WHERE from_user = 0;

UPDATE messages SET body = REPLACE(body, 'Ember Arena', 'Wrackline') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Vantage Strike', 'Deadband') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Skyline Royale', 'Curfew') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Kingsfall', 'Railhead') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Ember Foxes', 'Gambiarra') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Stormhowl', 'Halifax Undertow') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Jade Vanguard', 'B2') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Frostline Esports', 'Kaamos') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Frostline', 'Kaamos') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Dune Raiders', 'Atlético Latencia') WHERE from_user = 0;
UPDATE messages SET body = REPLACE(body, 'Voidlight', 'Second Monitor') WHERE from_user = 0;

UPDATE replies SET body = REPLACE(body, 'Ember Arena', 'Wrackline') WHERE person_id IS NOT NULL;
UPDATE replies SET body = REPLACE(body, 'Vantage Strike', 'Deadband') WHERE person_id IS NOT NULL;
UPDATE replies SET body = REPLACE(body, 'Skyline Royale', 'Curfew') WHERE person_id IS NOT NULL;
UPDATE replies SET body = REPLACE(body, 'Kingsfall', 'Railhead') WHERE person_id IS NOT NULL;
