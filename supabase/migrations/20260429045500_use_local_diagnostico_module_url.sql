-- El modulo Diagnostico Colectivo vive dentro de SASE y debe lanzarse por el launcher institucional.

update public.modulos_ecosistema
set base_url = '/modulos/colectivo/index.html'
where key = 'diagnostico';
