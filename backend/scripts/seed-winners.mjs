/**
 * One-time seed: inserts winners from data/winners.json
 * Usage: set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (+ optional CAMPAIGN_NAME), then:
 *   node scripts/seed-winners.mjs
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const campaign =
  process.env.CAMPAIGN_NAME || 'Grand Concours';

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);
const raw = readFileSync(join(__dirname, '..', 'data', 'winners.json'), 'utf8');
const rows = JSON.parse(raw).map((w) => ({
  display_name: w.display_name,
  phone_masked: w.phone_masked,
  prize_amount: w.prize_amount,
  campaign_name: campaign,
}));

const { error } = await supabase.from('winners').insert(rows);
if (error) {
  console.error(error);
  process.exit(1);
}
console.log(`Inserted ${rows.length} winners.`);
