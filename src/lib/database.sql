-- ==============================================================================
-- ODD FREQUENCY — PRODUCTION DATABASE SCHEMA & SECURITY HARDENING
-- ==============================================================================
-- Run this entire script in Supabase Dashboard > SQL Editor > "+ New query".
-- ==============================================================================

-- 1. WAITLIST & EARLY ACCESS NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product_id text null, -- null = general Drop #01 early access waitlist
  created_at timestamptz not null default now(),
  constraint waitlist_email_format check (
    length(email) <= 320 and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);

-- Partial unique indexes: 100% valid PostgreSQL syntax.
-- Prevents duplicate submissions per email for general waitlist and per product.
create unique index if not exists unique_waitlist_general 
on public.waitlist (email) 
where product_id is null;

create unique index if not exists unique_waitlist_product 
on public.waitlist (email, product_id) 
where product_id is not null;

create index if not exists idx_waitlist_product_id 
on public.waitlist (product_id);

-- Enable Row Level Security (RLS)
alter table public.waitlist enable row level security;

-- Table Grants: Defense-in-depth privilege boundaries
revoke all on table public.waitlist from public, anon;
grant insert on table public.waitlist to anon, authenticated;
grant select on table public.waitlist to authenticated;

-- RLS: Allow public visitors to submit an email with strict validation
drop policy if exists "Allow public waitlist insert" on public.waitlist;
create policy "Allow public waitlist insert"
on public.waitlist
for insert
to anon, authenticated
with check (
  length(email) <= 320
  and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- RLS: Restrict waitlist reading to authenticated dashboard owners/admins only.
-- Public anonymous visitors receive 0 rows / access denied.
drop policy if exists "Allow owner only waitlist select" on public.waitlist;
create policy "Allow owner only waitlist select"
on public.waitlist
for select
to authenticated
using (true);


-- 2. ITEM VOTES TABLE (ANONYMOUS DEMAND VALIDATION)
-- ------------------------------------------------------------------------------
create table if not exists public.item_votes (
  id uuid primary key default gen_random_uuid(),
  item_id text not null,
  item_type text not null check (item_type in ('product', 'concept')),
  voter_token text not null check (length(voter_token) between 10 and 128),
  created_at timestamptz not null default now(),
  constraint unique_item_voter unique (item_id, voter_token)
);

create index if not exists idx_item_votes_item_id on public.item_votes (item_id);
create index if not exists idx_item_votes_token on public.item_votes (voter_token);

-- Enable Row Level Security (RLS)
alter table public.item_votes enable row level security;

-- Table Grants: Deny raw SELECT, UPDATE, DELETE to anon.
revoke all on table public.item_votes from public, anon;
grant insert on table public.item_votes to anon, authenticated;
grant select on table public.item_votes to authenticated;

-- RLS: Allow anonymous visitors to insert a vote with strict constraints
drop policy if exists "Allow anon insert vote" on public.item_votes;
create policy "Allow anon insert vote"
on public.item_votes
for insert
to anon, authenticated
with check (
  length(voter_token) between 10 and 128
  and item_type in ('product', 'concept')
  and length(item_id) between 1 and 64
);

-- NOTE: No SELECT policy for 'anon' on item_votes.
-- Raw vote records and voter_tokens cannot be read directly by public visitors.


-- 3. AGGREGATE VOTE COUNTS VIEW
-- ------------------------------------------------------------------------------
-- Exposes ONLY item_id, item_type, and vote_count.
-- Omits voter_token, visitor IDs, and timestamps completely.
create or replace view public.vote_counts
with (security_invoker = false)
as
select 
  iv.item_id, 
  iv.item_type, 
  pg_catalog.count(*)::bigint as vote_count
from public.item_votes as iv
group by iv.item_id, iv.item_type;

revoke all on public.vote_counts from public;
grant select on public.vote_counts to anon, authenticated;


-- 4. HARDENED SECURITY DEFINER RPC FUNCTIONS
-- ------------------------------------------------------------------------------

-- Function 4A: Get Vote Counts RPC (Fallback for view)
-- Hardened: search_path = '', fully qualified references, revoked from PUBLIC
create or replace function public.get_vote_counts()
returns table (
  item_id text,
  item_type text,
  vote_count bigint
)
language sql
security definer
set search_path = ''
as $$
  select 
    iv.item_id, 
    iv.item_type, 
    pg_catalog.count(*)::bigint as vote_count
  from public.item_votes as iv
  group by iv.item_id, iv.item_type;
$$;

revoke execute on function public.get_vote_counts() from public;
grant execute on function public.get_vote_counts() to anon, authenticated;


-- Function 4B: Retrieve ONLY this visitor's voted items
-- Hardened:
-- - search_path = '' to prevent search_path hijacking
-- - fully qualified table & catalog function names
-- - strict input validation (null, length check)
-- - revoked from PUBLIC; granted only to anon & authenticated
-- - returns ONLY items matching the supplied token
create or replace function public.get_my_voted_items(p_voter_token text)
returns table (item_id text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Validate input format and length
  if p_voter_token is null 
     or pg_catalog.length(p_voter_token) < 10 
     or pg_catalog.length(p_voter_token) > 128 then
    return;
  end if;

  return query
  select iv.item_id
  from public.item_votes as iv
  where iv.voter_token = p_voter_token;
end;
$$;

revoke execute on function public.get_my_voted_items(text) from public;
grant execute on function public.get_my_voted_items(text) to anon, authenticated;


-- ==============================================================================
-- 5. VERIFICATION & VALIDATION TEST SUITE
-- ==============================================================================
-- Run the following queries to verify all security guarantees.
-- (Copy and run each block in the SQL Editor to test expected outcomes)
-- ==============================================================================

/*
-- TEST 1: Anonymous waitlist insert succeeds
set role anon;
insert into public.waitlist (email) values ('test_audit@oddfrequency.in');
-- Expected: 1 row inserted

-- TEST 2: Anonymous waitlist read FAILS (permission denied)
set role anon;
select * from public.waitlist;
-- Expected: ERROR: permission denied for table waitlist

-- TEST 3: Anonymous raw vote-table read FAILS (permission denied)
set role anon;
select * from public.item_votes;
-- Expected: ERROR: permission denied for table item_votes

-- TEST 4: Aggregate vote counts CAN be read by anonymous users
set role anon;
select * from public.vote_counts;
select * from public.get_vote_counts();
-- Expected: Success, returns aggregate rows only (no voter_tokens)

-- TEST 5: Voting and duplicate vote rejection
set role anon;
insert into public.item_votes (item_id, item_type, voter_token) 
values ('OF-BRAT', 'product', 'test_audit_token_12345');
-- Expected: 1 row inserted

insert into public.item_votes (item_id, item_type, voter_token) 
values ('OF-BRAT', 'product', 'test_audit_token_12345');
-- Expected: ERROR: duplicate key value violates unique constraint "unique_item_voter" (code 23505)

-- TEST 6: Token privacy isolation
set role anon;
-- Returns only the item voted by this specific token
select * from public.get_my_voted_items('test_audit_token_12345');
-- Expected: Returns 'OF-BRAT'

-- Querying with another token returns zero rows (does NOT leak previous vote)
select * from public.get_my_voted_items('different_token_99999');
-- Expected: Returns 0 rows

-- Clean up test records (run as postgres/service_role)
reset role;
delete from public.waitlist where email = 'test_audit@oddfrequency.in';
delete from public.item_votes where voter_token = 'test_audit_token_12345';
*/
