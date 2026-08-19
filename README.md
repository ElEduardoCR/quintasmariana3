# Quintas Mariana

Panel comunitario para el fraccionamiento Quintas Mariana. La primera versión reúne avisos generales, actividad reciente y un mapa vecinal interactivo basado en la distribución proporcionada.

## Funcionalidades

- 38 lotes representados en un mapa vectorial adaptable
- 32 casas y 6 terrenos baldíos diferenciados visualmente
- Directorio vecinal progresivo, comenzando con la casa 607
- Búsqueda por número de casa o familia
- Filtros por estado del lote
- Publicación local de avisos y reportes vecinales con fotografías
- Cinta informativa con el horario de recolección de basura
- Diseño responsivo para escritorio, tableta y móvil

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Validaciones

```bash
npm run lint
npm run build
```

## Despliegue en Vercel

Importa este repositorio en Vercel. El framework se detecta automáticamente como Next.js y no requiere configuración adicional para esta versión.

## Tecnologías

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React

## Alta de vecinos

Los residentes se registran directamente en `src/lib/neighborhood-data.ts`, dentro de `residentDirectory`. Las casas sin alta aparecen como pendientes y no muestran información inventada.
