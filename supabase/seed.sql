-- Datos de ejemplo para desarrollo local
insert into public.courses (id, title, description, price_ars, status)
values ('00000000-0000-0000-0000-000000000001', 'IA aplicada a productos digitales',
        'Cómo implementar IA dentro de un producto y crear productos digitales usando IA.', 49900, 'published')
on conflict (id) do nothing;

insert into public.lessons (course_id, title, description, keywords, bunny_video_id, position) values
  ('00000000-0000-0000-0000-000000000001', 'Introducción', 'Panorama general del curso.', '{ia,producto}', 'demo-video-1', 1),
  ('00000000-0000-0000-0000-000000000001', 'Casos de uso', 'Dónde aplicar IA en un producto.', '{casos,llm}', 'demo-video-2', 2),
  ('00000000-0000-0000-0000-000000000001', 'Primer prototipo', 'Armamos un prototipo guiado.', '{prototipo}', 'demo-video-3', 3)
on conflict do nothing;
