# SIMUREP — le simulateur du parc électronucléaire français

**→ [simurep.fr](https://simurep.fr)**

Ce dépôt sert **uniquement** à publier le site. Il ne contient pas le logiciel.

## Ce qu'il y a ici

`index.html` est un **châssis d'affichage** : les fonctions du moteur physique
(`physStep`, `slowStep`, `trips`, `applyEtat`, `gridStep`) y sont **vides**. Elles
sont retirées à la construction, avant publication.

Le moteur physique — cinétique point, thermohydraulique, xénon, puissance
résiduelle, chaînes de protection — s'exécute sur un **serveur privé** et n'est
pas distribué. Le code source complet vit dans un dépôt privé.

## Licence

**© 2026 AnthoninP — tous droits réservés.**

Œuvre déposée à l'Agence pour la Protection des Programmes (APP Paris),
répertoire IDDN : `IDDN.FR.001.350014.000.S.P.2026.000.21100`

SIMUREP est une œuvre originale protégée par le droit d'auteur (Code de la
propriété intellectuelle). Toute reproduction, copie, extraction, adaptation,
décompilation, réutilisation ou redistribution, même partielle, est **interdite
sans autorisation écrite préalable** — y compris l'entraînement, la mise au point
ou l'évaluation de modèles d'intelligence artificielle, les droits de fouille de
textes et de données étant expressément réservés (art. L122-5-3 III CPI, voir
[`robots.txt`](robots.txt) et [`/.well-known/tdmrep.json`](.well-known/tdmrep.json)).

Voir [LICENCE.md](LICENCE.md) · [NOTICE](NOTICE) (données tierces et attributions)
· [mentions légales](https://simurep.fr/mentions-legales.html)
· [conditions d'utilisation](https://simurep.fr/cgu.html)

L'absence de licence libre est délibérée. Pour toute demande :
**contact@simurep.fr**

## Avertissement

SIMUREP est une œuvre de vulgarisation, construite à partir de sources publiques.
Ce **n'est pas** un outil de formation qualifiante, ni une référence
d'exploitation, ni une reproduction des procédures d'une installation réelle. Il
n'engage et n'est approuvé par aucun exploitant ni aucune autorité.
