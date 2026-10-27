# SIMUREP — le simulateur du parc électronucléaire français

**→ [simurep.fr](https://simurep.fr)**

SIMUREP permet de piloter les paliers **900 MWe** (CPY et CP0, trois boucles),
**1300 MWe** (P4 et P'4), **N4** et **EPR**, chacun dans sa salle de commande,
depuis la carte de France et le plan de chacun des dix-huit sites en
exploitation.

Ce dépôt sert **uniquement** à publier le site. Il ne contient pas le logiciel.

## Ce qu'il y a ici

`index.html` accueille la navigation. `france.html` et `client.html` sont des
**châssis d'affichage** ; `900/`, `1300/`, `n4/` et `epr/` contiennent les salles
et les postes de conduite. `sources.html`, `mentions-legales.html` et `cgu.html`
sont les pages d'information ; `plans/*.json` et `reseau-400kv.json` sont les bases
géographiques dérivées d'OpenStreetMap, sous ODbL 1.0 (© les contributeurs
d'OpenStreetMap), offertes depuis la page Sources.
Dans les châssis, les fonctions du moteur physique
(`physStep`, `slowStep`, `trips`, `applyEtat`, `gridStep`, `ptrStep`,
`initOperatingPoint`, `electricalSetpoint`) y sont
**vides**, et `setEtat` et `doScram` se bornent à relayer la commande au serveur.
Elles sont retirées à la construction, avant publication.

Le moteur physique — cinétique point, thermohydraulique, xénon, puissance
résiduelle, chaînes de protection — s'exécute sur un **serveur privé** et n'est
pas distribué. Le code source complet vit dans un dépôt privé.

## Licence

**© 2026 AnthoninP — tous droits réservés.**

Œuvre déposée à l'Agence pour la Protection des Programmes (APP Paris),
répertoire IDDN : `IDDN.FR.001.350014.000.S.P.2026.000.21100`

SIMUREP est une œuvre originale protégée par le droit d'auteur (Code de la
propriété intellectuelle). Identité visuelle : logo d'après un dessin
d'AnthoninP, retouché avec un outil de génération d'images ; les icônes du site
en sont des réductions. Toute reproduction, copie, extraction, adaptation,
décompilation, réutilisation ou redistribution, même partielle, est **interdite
sans autorisation écrite préalable** — y compris l'entraînement, la mise au point
ou l'évaluation de modèles d'intelligence artificielle, les droits de fouille de
textes et de données étant expressément réservés (art. L122-5-3 III CPI, voir
[`robots.txt`](robots.txt) et [`/.well-known/tdmrep.json`](.well-known/tdmrep.json)).
Ces restrictions portent sur les éléments dont l'auteur détient les droits : elles ne
limitent ni les exceptions prévues par la loi ni les droits tirés des licences des
données tierces (voir la [page Sources](https://simurep.fr/sources.html) et NOTICE).

Voir [LICENCE.md](LICENCE.md) · [NOTICE](NOTICE) (données tierces et attributions)
· [sources](https://simurep.fr/sources.html)
· [mentions légales](https://simurep.fr/mentions-legales.html)
· [conditions d'utilisation](https://simurep.fr/cgu.html)

L'absence de licence libre est délibérée. Pour toute demande :
**contact@simurep.fr**

## Avertissement

SIMUREP est une œuvre de vulgarisation, construite à partir de sources publiques.
Ce **n'est pas** un outil de formation qualifiante, ni une référence
d'exploitation, ni une reproduction des procédures d'une installation réelle. Il
n'engage et n'est approuvé par aucun exploitant ni aucune autorité.
