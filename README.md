# Quintas Mariana

Portal privado para el fraccionamiento Quintas Mariana, construido con Next.js, TypeScript, Tailwind CSS y Supabase.

## Funcionalidades

- Acceso privado usando el número de casa como usuario
- Contraseña temporal obligatoria en el primer acceso
- Directorio vecinal protegido por autenticación y Row Level Security
- Mapa interactivo con 38 lotes: 32 casas y 6 terrenos baldíos
- Avisos persistentes publicados por administración
- Reportes vecinales persistentes con hasta tres fotografías
- Fotografías en un bucket privado de Supabase Storage
- Restablecimiento administrativo a una contraseña temporal
- Cinta con el horario de recolección de basura

Las contraseñas son administradas por Supabase Auth y solo se almacenan como hashes. No pueden consultarse desde la base de datos. Un restablecimiento asigna una nueva contraseña temporal y vuelve a exigir el cambio.

## Variables de entorno

Copia `.env.example` como `.env.local` y completa:

```env
DATABASE_URL="..."
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."
SUPABASE_SECRET_KEY="..."
```

`SUPABASE_SECRET_KEY` y `DATABASE_URL` son secretos del servidor. Nunca deben utilizar el prefijo `NEXT_PUBLIC_` ni incluirse en Git.

## Desarrollo local

```bash
npm install
npm run dev
```

## Primera cuenta

Después de aplicar la migración y configurar la clave administrativa:

```bash
npm run setup:resident-607
```

Esto crea la cuenta administrativa de la Casa 607 con la contraseña temporal `vecino`. El portal exige reemplazarla por una contraseña personal en el primer acceso.

## Validaciones

```bash
npm run lint
npm run build
```

## Despliegue en Vercel

Agrega las mismas cuatro variables en Vercel → Settings → Environment Variables. La migración versionada se encuentra en `supabase/migrations`.
