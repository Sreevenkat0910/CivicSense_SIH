Env vars:
- MONGO_URI=mongodb://127.0.0.1:27017/civicsense
- PORT=4000

Scripts:
- `npm run dev` – start with nodemon
- `npm start` – start server

Supabase:
- Set env vars in `.env`:
  - SUPABASE_URL=your-url
  - SUPABASE_ANON_KEY=your-anon-key
- In Supabase SQL editor, run `src/sql/schema.sql` to create tables and counters.

Endpoints:
- POST /api/users/register
- POST /api/reports

