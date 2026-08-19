create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.homes (
  id smallint primary key,
  address_number text not null,
  status text not null check (status in ('occupied', 'vacant')),
  side text not null check (side in ('north', 'east', 'south')),
  created_at timestamptz not null default now()
);

create unique index homes_number_unique
  on public.homes (address_number)
  where address_number <> 'S/N';

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  home_id smallint not null unique references public.homes (id),
  home_number text not null unique check (home_number ~ '^[0-9]{3}$'),
  household_name text not null check (char_length(household_name) between 2 and 100),
  initials text not null check (char_length(initials) between 1 and 4),
  accent text not null default '#376B5B' check (accent ~ '^#[0-9A-Fa-f]{6}$'),
  role text not null default 'resident' check (role in ('resident', 'admin')),
  approved boolean not null default true,
  must_change_password boolean not null default true,
  password_changed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resident_phones (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (user_id) on delete cascade,
  phone_number text not null check (phone_number ~ '^[0-9 +()-]{7,24}$'),
  display_order smallint not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  unique (profile_id, phone_number)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (user_id) on delete restrict,
  description text not null check (char_length(description) between 1 and 500),
  created_at timestamptz not null default now()
);

create index reports_created_at_idx on public.reports (created_at desc);

create table public.report_photos (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

create index report_photos_report_id_idx on public.report_photos (report_id);

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Importante', 'Comunidad', 'Servicios', 'Eventos')),
  title text not null check (char_length(title) between 1 and 70),
  body text not null check (char_length(body) between 1 and 240),
  accent text not null check (accent in ('coral', 'green', 'blue', 'amber')),
  author_id uuid references public.profiles (user_id) on delete set null,
  created_at timestamptz not null default now()
);

create index notices_created_at_idx on public.notices (created_at desc);

create or replace function private.is_active_resident()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
      and approved
      and not must_change_password
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
      and approved
      and not must_change_password
      and role = 'admin'
  );
$$;

revoke all on function private.is_active_resident() from public, anon;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_active_resident() to authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function private.handle_auth_password_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.encrypted_password is distinct from new.encrypted_password then
    update public.profiles
    set must_change_password = false,
        password_changed_at = now(),
        updated_at = now()
    where user_id = new.id;
  end if;

  return new;
end;
$$;

revoke all on function private.handle_auth_password_change() from public, anon, authenticated;

create trigger auth_password_changed
after update of encrypted_password on auth.users
for each row execute function private.handle_auth_password_change();

alter table public.homes enable row level security;
alter table public.profiles enable row level security;
alter table public.resident_phones enable row level security;
alter table public.reports enable row level security;
alter table public.report_photos enable row level security;
alter table public.notices enable row level security;

create policy homes_select_active_residents
on public.homes for select
to authenticated
using ((select private.is_active_resident()));

create policy profiles_select_self_or_active_residents
on public.profiles for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_active_resident())
);

create policy phones_select_self_or_active_residents
on public.resident_phones for select
to authenticated
using (
  profile_id = (select auth.uid())
  or (select private.is_active_resident())
);

create policy reports_select_active_residents
on public.reports for select
to authenticated
using ((select private.is_active_resident()));

create policy reports_insert_active_residents
on public.reports for insert
to authenticated
with check (
  (select private.is_active_resident())
  and author_id = (select auth.uid())
);

create policy report_photos_select_active_residents
on public.report_photos for select
to authenticated
using ((select private.is_active_resident()));

create policy report_photos_insert_own_reports
on public.report_photos for insert
to authenticated
with check (
  (select private.is_active_resident())
  and exists (
    select 1
    from public.reports
    where reports.id = report_photos.report_id
      and reports.author_id = (select auth.uid())
  )
);

create policy notices_select_active_residents
on public.notices for select
to authenticated
using ((select private.is_active_resident()));

create policy notices_insert_admins
on public.notices for insert
to authenticated
with check (
  (select private.is_admin())
  and author_id = (select auth.uid())
);

create policy notices_update_admins
on public.notices for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy notices_delete_admins
on public.notices for delete
to authenticated
using ((select private.is_admin()));

revoke all on public.homes, public.profiles, public.resident_phones,
  public.reports, public.report_photos, public.notices from anon;

grant select on public.homes, public.profiles, public.resident_phones,
  public.reports, public.report_photos, public.notices to authenticated;
grant insert on public.reports, public.report_photos to authenticated;
grant insert, update, delete on public.notices to authenticated;

insert into public.homes (id, address_number, status, side) values
  (1, '627', 'occupied', 'north'),
  (2, '626', 'occupied', 'north'),
  (3, '625', 'occupied', 'north'),
  (4, '624', 'occupied', 'north'),
  (5, '623', 'occupied', 'north'),
  (6, '622', 'occupied', 'north'),
  (7, '621', 'occupied', 'north'),
  (8, '620', 'occupied', 'north'),
  (9, '619', 'occupied', 'north'),
  (10, '618', 'occupied', 'north'),
  (11, '617', 'occupied', 'north'),
  (12, '616', 'occupied', 'north'),
  (13, '615', 'occupied', 'north'),
  (14, '614', 'occupied', 'north'),
  (15, '613', 'occupied', 'north'),
  (16, '612', 'occupied', 'north'),
  (17, '611', 'occupied', 'east'),
  (18, '610', 'occupied', 'east'),
  (19, '609', 'occupied', 'east'),
  (20, '608', 'occupied', 'east'),
  (21, '607', 'occupied', 'east'),
  (22, 'S/N', 'vacant', 'south'),
  (23, '601', 'occupied', 'south'),
  (24, '602', 'vacant', 'south'),
  (25, '603', 'vacant', 'south'),
  (26, '604', 'occupied', 'south'),
  (27, '605', 'occupied', 'south'),
  (28, '606', 'occupied', 'south'),
  (29, '628', 'occupied', 'south'),
  (30, '629', 'occupied', 'south'),
  (31, '630', 'occupied', 'south'),
  (32, '631', 'occupied', 'south'),
  (33, '632', 'occupied', 'south'),
  (34, '633', 'vacant', 'south'),
  (35, '634', 'vacant', 'south'),
  (36, '635', 'occupied', 'south'),
  (37, '636', 'occupied', 'south'),
  (38, 'S/N', 'vacant', 'south');

insert into public.notices (category, title, body, accent, created_at) values
  ('Importante', 'Mantenimiento de cisterna', 'El servicio de agua se pausará el jueves de 9:00 a 12:00 h.', 'coral', now() - interval '2 hours'),
  ('Comunidad', 'Asamblea vecinal', 'Nos vemos este sábado en el parque para revisar las mejoras del acceso.', 'green', now() - interval '1 day'),
  ('Servicios', 'Recolección de ramas', 'Coloca los residuos de jardín frente a tu domicilio antes de las 7:00 h.', 'blue', now() - interval '2 days'),
  ('Eventos', 'Tarde de juegos en el parque', 'Habrá lotería, aguas frescas y actividades para niñas y niños.', 'amber', now() - interval '3 days');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-photos',
  'report-photos',
  false,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
);

create policy report_storage_select_active_residents
on storage.objects for select
to authenticated
using (
  bucket_id = 'report-photos'
  and (select private.is_active_resident())
);

create policy report_storage_insert_own_folder
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'report-photos'
  and (select private.is_active_resident())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy report_storage_delete_own_files
on storage.objects for delete
to authenticated
using (
  bucket_id = 'report-photos'
  and owner_id = (select auth.uid())::text
);
