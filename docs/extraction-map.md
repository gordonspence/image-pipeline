# Extraction map

This first version consolidates patterns from existing applications into a smaller shared contract. It is a fresh implementation informed by those sources, not a wholesale copy of any app's uploader.

| Source | Relevant implementation | Shared pattern | App-specific behavior left out |
| --- | --- | --- | --- |
| Introcard | `apps/portal/src/app/profile/ProfilePhotoControls.tsx`, `photo-processing.ts` | Selection, crop controls, preview lifecycle | Profile state, form save flow, browser-authoritative encoding |
| ATG | `atg-main/lib/product-image-processing.ts` | Sharp orientation, multiple variants, explicit encoding policies | Bottle/can contain canvas, dark background, automatic product polish |
| Tap App | `apps/admin/components/food-photo-upload.tsx`, `lib/food-photo-processing.ts`, Worker photo routes | Strict format/frame/dimension checks, byte budgets, thumbnails, storage failure awareness | Menu/TV framing, gallery, D1 schema, private recrop sources, durable retry ownership |

Changes made for the shared implementation:

- Server processing receives the source and normalized crop rather than a finished browser crop.
- Presets define policy without importing application types, theme colors or database models.
- Optional storage is independent of processing and returns application-neutral asset metadata.
- Authorization and durable idempotency remain explicit host-app responsibilities.
- Product polish, canvas framing and source retention are deferred until their shared contracts are defined.

Before replacing an existing app's pipeline, compare its acceptance policy, dimensions, transparency, crop UX, retained sources and retry semantics. The square product preset is not a drop-in replacement for ATG's portrait contain canvas, and v0 does not replace Tap App's private recrop workflow.
