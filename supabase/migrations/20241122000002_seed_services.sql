-- Seed catalog services from build-spec (PDF page 4 — INSERT repaired).
-- Idempotent: skips rows that already exist by (name, category).

INSERT INTO public.services (name, category, description, base_price, duration_mins, icon)
SELECT v.name, v.category, v.description, v.base_price, v.duration_mins, v.icon
FROM (
  VALUES
    ('Box Braids'::varchar, 'hair'::varchar, 'Protective braiding, all lengths'::text, 85.00::numeric, 180::int, '💇‍♀️'::varchar),
    ('Silk Press', 'hair', 'Smooth, sleek blowout', 65.00, 90, '✨'),
    ('Gel Manicure', 'nails', 'Long-lasting gel polish', 45.00, 60, '💅'),
    ('Acrylic Nails', 'nails', 'Full set, any design', 65.00, 120, '💅'),
    ('Soft Glam Makeup', 'makeup', 'Natural, everyday glam', 75.00, 60, '💄'),
    ('Full Glam Makeup', 'makeup', 'Full coverage, event ready', 120.00, 90, '💄'),
    ('Classic Lashes', 'lashes', 'Natural lash extensions', 70.00, 90, '👁'),
    ('Volume Lashes', 'lashes', 'Full, dramatic volume', 95.00, 120, '👁'),
    ('Swedish Massage', 'massage', 'Relaxing full body', 90.00, 60, '💆‍♀️'),
    ('Deep Tissue Massage', 'massage', 'Targeted muscle relief', 110.00, 60, '💆‍♀️'),
    ('Fade / Haircut', 'barber', 'Clean fade, shape up', 35.00, 45, '💈'),
    ('Beard Trim', 'barber', 'Shape and line up', 25.00, 30, '💈')
) AS v(name, category, description, base_price, duration_mins, icon)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.services s
  WHERE s.name = v.name AND s.category = v.category
);
