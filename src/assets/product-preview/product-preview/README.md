# Imagens do Product Showcase

Coloque aqui os prints reais do sistema (recomendo 1600x1000px, formato .png ou .webp):

- dashboard.png
- clientes.png
- demandas.png
- agenda.png
- financeiro.png

Depois, em `src/components/landing/ProductShowcase.tsx`, importe cada imagem e
preencha o campo `image` do item correspondente no array `items`:

```tsx
import dashboardImg from "@/assets/product-preview/dashboard.png";
import clientesImg from "@/assets/product-preview/clientes.png";

const items: ShowcaseItem[] = [
  { key: "dashboard", ..., image: dashboardImg },
  { key: "clientes", ..., image: clientesImg },
  // ...
];
```

Enquanto `image` estiver `null`, o componente mostra uma prévia ilustrativa
equivalente (skeleton de cards, tabela, kanban, calendário ou lista financeira),
então nada quebra visualmente até você ter os prints prontos.
