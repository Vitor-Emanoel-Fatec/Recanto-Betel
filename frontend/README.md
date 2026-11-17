# React + TypeScript + Vite

## Área do responsável

O ícone de usuário no cabeçalho abre o cadastro e o login de responsáveis, usando
os endpoints `POST /api/auth/signup` e `POST /api/auth/signin` da API. Durante o
desenvolvimento, o Vite encaminha `/api` para `http://localhost:3000`. Para usar
outra URL de API, configure `VITE_API_URL` apontando para o prefixo da API (por
exemplo, `https://api.exemplo.com/api`).

O endpoint público `GET /api/auth/terms` fornece a versão e o texto dos termos.
Se a resposta falhar, o cadastro mostra o erro e permite tentar novamente; a
API também rejeita o cadastro sem aceite e grava a versão e o horário aceitos.
Em chamadas entre origens diferentes, configure `FRONTEND_ORIGIN` na API.

## Publicações do Facebook

A seção de notícias usa o [Page Plugin oficial da Meta](https://developers.facebook.com/docs/plugins/page-plugin/)
para a página pública [Recanto Betel Tatuí](https://www.facebook.com/recantobeteltatui).
O iframe só é carregado após a pessoa selecionar “Carregar publicações”; não há
token ou credencial privada. A página oficial continua disponível pelo link
alternativo caso a incorporação não seja exibida.

O Page Plugin é servido pelo iframe oficial, com a aba `timeline`, largura
responsiva limitada a 500 px e cabeçalho reduzido. Na validação do navegador em
16/11/2026, a URL da página foi reconhecida, mas o iframe mostrou somente nome e
seguidores; as publicações não apareceram. O iframe não teve respostas HTTP
falhas, mas o JavaScript interno da Meta registrou erros de elementos/estado.
Logo, o feed continua **não validado**; o link alternativo permanece visível.

A Meta documenta que páginas com restrição de privacidade, idade ou país não
podem ser incorporadas. Um administrador da página deve confirmar essas
restrições e que a linha do tempo está pública. As configurações administrativas
da página não podem ser verificadas pelo site. Se estiverem corretas e o feed
continuar vazio, a causa precisa ser investigada com a Meta; não há scraping ou
conteúdo substituto no portal.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
