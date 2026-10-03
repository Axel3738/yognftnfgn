# Inbränd svensk text i källvideorna (OCR 4 fps, kallskanning.py 2026-10-03)

Alla sju bär det svenska priset inbränt i bild. Två olika sorter:

## A. Stor pristext i egen stil (ska ritas om på engelska)
| Video | Tid | Ruta (720×1280) | Svensk text | Stil |
|---|---|---|---|---|
| OB_111 | 11,5–15,25 s | [76, 314, 634, 442] | "1 129 kr (regular 1 469 kr), save 340 kr (23 %)." | två rader, vit fet versalgemen med mörk kant, centrerad, ingen platta (himmel bakom) |
| OB_113 | 9,75–14,5 s | [101, 268, 626, 431] | "1 129 kronor / spara 340 kronor / 23 procent rabatt" | tre rader, vit fet med mjuk skugga, centrerad |
| OB_114 | 9,5–14,25 s | [101, 747, 623, 922] | "1 129 kronor / spara 340 kronor / 23 procent rabatt" | tre rader, vit fet med mjuk skugga, centrerad |

## B. Redan suddad röd pop-text + vitt captionpiller (pillret byts av no-precis.py)
| Video | Suddad röd pop (tid, ruta) | Captionpillret (cy, höjd) |
|---|---|---|
| OB_117 | ~8,75–13,75 s, [90, 260, 630, 530] | cy 1029, 46–64 px |
| OB_118 | ~12,25–16,75 s, [95, 130, 640, 330] | cy 1029, 39–63 px |
| OB_119 | ~10,75–15,75 s (samma familj) | cy 1031, 47–60 px |
| OB_122 | ~10,25–15,5 s, [95, 265, 635, 540] | cy 954, 41–51 px |

⚠️ De fyra i grupp B bär en RÖD pristext som källan själv suddat — den är fortfarande
läsbar som "1 129 kr". Suddet är källans, inte vårt. Den måste täckas, inte bara suddas
igen: en svensk prissiffra i en amerikansk annons är fel pris för kunden.
