# Next.js App Router + Zakeke Minimal Sample

Minimal Next.js 14 (App Router) + TypeScript implementing a single product, embedded Zakeke Customizer, basic cart, and proxy APIs.

## Setup

1) Crea `.env.local` (no se versiona). Usa tus valores reales:

```
ZAKEKE_CLIENT_ID=TU_CLIENT_ID
ZAKEKE_CLIENT_SECRET=TU_CLIENT_SECRET
DEFAULT_CURRENCY=COP
DEFAULT_CULTURE=es-ES
```

2) Install and run:

```
npm i
npm run dev
```

## Functional flow

- `/` muestra el producto y link a `/product/TOTEBAG-001`.
- En producto, botón “Personalizar” abre `/customizer?productid=TOTEBAG-001&quantity=1`.
- Customizer usa token del servidor. Callbacks `getProductInfo`, `addToCart`, `editAddToCart` activos.
- `/cart` muestra preview, totales simples y “Editar diseño”.

## API

- `GET /api/products`, `POST /api/products` (in-memory)
- Catalog API (Basic Auth: user=`ZAKEKE_CLIENT_ID`, pass=`ZAKEKE_CLIENT_SECRET`):
  - `GET /api/catalog?page=&search=`
  - `GET /api/catalog/:code/options`
  - `POST /api/catalog/:code/customizer`
  - `DELETE /api/catalog/:code/customizer`
- Zakeke proxy (server-side):
  - `POST /api/zakeke/token`
  - `GET /api/zakeke/designs/:designId`
  - `POST /api/zakeke/register-order`
  - `GET /api/zakeke/print-files/:designId`

Security: el secret nunca se expone al cliente; requests a `api.zakeke.com` desde el servidor. El archivo `.env.local` ya está ignorado por `.gitignore`.

