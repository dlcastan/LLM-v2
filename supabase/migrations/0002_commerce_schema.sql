-- Compras, habilitaciones, eventos de pago, progreso y certificados (data-model.md)
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  mp_preference_id text,
  mp_payment_id text unique,
  amount numeric not null check (amount >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'reverted', 'duplicate', 'rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  reverted_at timestamptz,
  notified_at timestamptz
);

create index purchases_user_idx on public.purchases(user_id);
create index purchases_status_idx on public.purchases(status, created_at);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  purchase_id uuid not null references public.purchases(id),
  active boolean not null default true,
  unique (user_id, course_id)
);

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  mp_payment_id text not null,
  mp_status text not null,
  date_last_updated text not null,
  raw jsonb not null default '{}',
  processed_at timestamptz not null default now(),
  unique (mp_payment_id, mp_status, date_last_updated)
);

create table public.lesson_progress (
  user_id uuid not null references public.profiles(id),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  watched boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);
