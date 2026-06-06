# astrofu

> **Astro port of [antfu.me](https://antfu.me)** — a 1:1 clone of Anthony Fu's
> personal site, rebuilt on **Astro + Vue Islands + UnoCSS**.

This repository is a faithful re-implementation of the original Vite-SSG / Vue 3
site at <https://github.com/antfu/antfu.me>, mapped onto the Astro framework
while preserving the look, feel, animations and content.

## Why Astro?

The original site is a SPA built with Vite-SSG + Vue Router auto routes. The
Astro variant:

- ships **less JS** — only interactive components hydrate as islands
- keeps **Vue** for those islands (`@astrojs/vue`), so Anthony's `.vue` SFCs
  can be migrated almost verbatim
- keeps **UnoCSS** and the same presets / web-fonts so the visual language
  is preserved character-for-character (`op50`, `i-ri-arrow-up-line`, …)

## Migration map

| Original (Vite-SSG)                  | astrofu (Astro)                                    |
| ------------------------------------ | -------------------------------------------------- |
| `pages/*.md`, `pages/*.vue`          | `src/pages/*.astro` (+ content collections)        |
| `pages/posts/*.md`                   | `src/content/posts/*.md`                           |
| `src/App.vue` (root layout)          | `src/layouts/Default.astro`                        |
| `src/components/*.vue` (interactive) | `src/components/*.vue` mounted as Astro islands    |
| `src/components/*.vue` (static-only) | rewritten as `src/components/*.astro`              |
| `vite.config.ts` markdown-it stack   | `astro.config.ts` Shiki + rehype/remark plugins    |
| `unocss.config.ts`                   | `uno.config.ts` (identical)                        |
| `vite-ssg` build                     | `astro build` (static)                             |

## Roadmap

- [x] **P0** Scaffold (`package.json`, `astro.config.ts`, `uno.config.ts`, `tsconfig.json`)
- [ ] **P1** Migrate all posts to `src/content/posts/`
- [ ] **P2** Port `prose.css` / `markdown.css` / `slide-enter` animation system
- [ ] **P3** Port `App.vue` shell — `Default.astro`, `NavBar`, `Footer`, `ToggleTheme`
- [ ] **P4** Routing + Markdown pipeline (`/posts`, `/posts/[slug]`, RSS, sitemap)
- [ ] **P5** List components — `ListPosts`, `ListProjects`, `ListTalks`, `ListDemos`
- [ ] **P6** Dedicated pages — `projects`, `talks`, `podcasts`, `use`, `notes`,
        `bookmarks`, `sponsors-list`, `streams`, `media`, `chat`, `404`
- [ ] **P7** Background art — `ArtPlum`, `ArtDots`, `Logo`, `LogoStroke`
- [ ] **P8** Heavy demos — `QRCode*`, `Quansync*`, `Shiki Magic Move`, photo gallery, slides
- [ ] **P9** Tooling — OG image generation, RSS feed, font preloading, sitemap polish

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3333
pnpm build        # → dist/
pnpm preview
```

## Credits

All design, copy, animations and original implementation © Anthony Fu
([@antfu](https://github.com/antfu)). This repository is an unofficial port for
study / experimentation purposes only.

## License

MIT — same as the upstream project.