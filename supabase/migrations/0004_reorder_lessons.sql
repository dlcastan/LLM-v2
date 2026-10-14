-- Reordena las clases de un curso en una sola transacción.
-- La restricción UNIQUE(course_id, position) es DEFERRABLE INITIALLY DEFERRED, por lo que los
-- intercambios de posición no fallan a mitad de la operación (FR-019).
create or replace function public.reorder_lessons(p_course uuid, p_ids uuid[])
returns void language plpgsql security definer set search_path = public as $$
declare
  i int;
begin
  if array_length(p_ids, 1) is null then
    return;
  end if;
  for i in 1 .. array_length(p_ids, 1) loop
    update public.lessons set position = i where id = p_ids[i] and course_id = p_course;
  end loop;
end $$;

revoke all on function public.reorder_lessons(uuid, uuid[]) from public, anon, authenticated;
