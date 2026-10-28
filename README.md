# pcwong.net

A minimalist, Instagram-inspired photography portfolio and journal built with [Zola](https://www.getzola.org/) 0.23. No reels, comments, likes, or DMs.

## Run

```powershell
zola serve   # http://127.0.0.1:1111
zola build   # writes the site to public/
```

The theme choice is saved per address. Use one address (for example `http://127.0.0.1:1111`) so it carries across pages.

## Add a post

1. Create a page bundle: `content/posts/<slug>/`
2. Copy the photos into that folder (`.jpg`, `.png`, or `.webp`). Use numbered names such as `img1.jpg`, `img2.jpg`; they display in that order.
3. Create `index.md`:

```toml
+++
title = "Title"
date = 2026-10-28T09:00:00
[taxonomies]
tags = ["landscape", "fog"]
+++

The caption is the Markdown body and is the only text. The feed clamps long captions to three lines with a "View more" toggle. The post page shows all of it. The timeline, search, and meta description use the opening text.
```

Posts sort by `date`, newest first. They appear on the home feed and on the paginated `/posts/` archive (`transparent = true` in `content/posts/_index.md` passes them up to the home feed).

## Structure

| Path | Purpose |
| --- | --- |
| `config.toml` | Site settings, taxonomies (`paginate_by`), search index format |
| `content/_index.md` | Home feed (`paginate_by` = posts per page) |
| `content/posts/` | Post bundles. `_index.md` sets `page_template = "post.html"` and the `/posts/` archive template |
| `content/timeline/` | Timeline page |
| `templates/base.html` | Nav, search, theme toggle, inline pre-paint theme script |
| `templates/index.html` | Home feed |
| `templates/partials/card.html` | Floating post card with carousel |
| `templates/partials/feed.html` | Card list plus "Load older posts" |
| `templates/posts.html` | `/posts/` archive, same feed layout |
| `templates/post.html` | Single post page |
| `templates/timeline.html` | Vertical chronological list |
| `templates/tags.html` | Tag list (served via `tags/list.html`) |
| `templates/taxonomy_single.html` | Tag archive, same feed layout as home |
| `static/css/style.css` | Theme variables (`:root` and `[data-theme="dark"]`) and layout |
| `static/js/theme.js` | Light/dark toggle, persisted in `localStorage`, follows the system until chosen |
| `static/js/search.js` | Client-side search over captions, titles, and tags |
| `static/js/feed.js` | Carousel controls, "View more" captions, and "Load older posts" |

## Search

`build_search_index = true` makes Zola write `search_index.en.json` and `elasticlunr.min.js` to the output. Tags are not part of Zola's index, so `base.html` also emits a small `#post-index` JSON block that `search.js` matches against.

## Deploy

`static/CNAME` contains `pcwong.net` for GitHub Pages. Publish the contents of `public/` after `zola build`.
