-- RLS: el alumno solo ve lo suyo; el catálogo publicado es legible; las escrituras sensibles
-- se hacen solo con el rol de servicio (que ignora RLS).
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.purchases enable row level security;
alter table public.enrollments enable row level security;
alter table public.payment_events enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.certificates enable row level security;

-- profiles
create policy profiles_select_own on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- courses: catálogo publicado visible para todos; el Admin gestiona todo
create policy courses_select_published on public.courses for select
  using (status = 'published' or public.is_admin()
    or exists (select 1 from public.enrollments e where e.course_id = courses.id and e.user_id = auth.uid() and e.active));
create policy courses_admin_all on public.courses for all using (public.is_admin()) with check (public.is_admin());

-- lessons: solo alumnos habilitados o Admin; los metadatos del video se sirven por el servidor
create policy lessons_select_enrolled on public.lessons for select
  using (public.is_admin()
    or exists (select 1 from public.enrollments e where e.course_id = lessons.course_id and e.user_id = auth.uid() and e.active));
create policy lessons_admin_all on public.lessons for all using (public.is_admin()) with check (public.is_admin());

-- purchases / enrollments / certificates: solo lectura de lo propio
create policy purchases_select_own on public.purchases for select using (user_id = auth.uid() or public.is_admin());
create policy enrollments_select_own on public.enrollments for select using (user_id = auth.uid() or public.is_admin());
create policy certificates_select_own on public.certificates for select using (user_id = auth.uid() or public.is_admin());

-- lesson_progress: el alumno lee y escribe su progreso, solo si está habilitado
create policy progress_select_own on public.lesson_progress for select using (user_id = auth.uid());
create policy progress_write_own on public.lesson_progress for all
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.lessons l
      join public.enrollments e on e.course_id = l.course_id
      where l.id = lesson_progress.lesson_id and e.user_id = auth.uid() and e.active
    )
  );

-- payment_events: sin políticas => solo accesible con rol de servicio
