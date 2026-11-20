---
name: nouvelle-lecon
description: Ajoute une séance du cours de japonais à l'app à partir des pièces jointes au prompt (e-mail de récap, photos du manuel, mini-test), puis ouvre une PR. À utiliser quand l'utilisateur joint un récap de cours, des pages du manuel ou un mini-test, ou demande d'ajouter une leçon.
---

# Nouvelle leçon

Transforme les pièces jointes au prompt en `content/lessons/cours-NN/lesson.json`, puis ouvre une PR. Le merge déploie le site.

## Règles

- Le dépôt est **public**. Ne committe jamais les pièces jointes (`.eml`, photos, PDF). N'écris ni nom, ni adresse e-mail, ni signature d'une personne réelle du cours (professeure, école, élève). Les URL vont uniquement dans `liens`.
- Retranscris fidèlement : n'invente pas de contenu de cours. Si un passage est illisible ou ambigu, signale-le dans la description de la PR au lieu de deviner.
- Le contrat est `src/content/schema.ts`. Lis-le, puis lis la dernière leçon existante comme modèle de ton et de granularité.

## Étapes

1. Lis toutes les pièces jointes. Identifie pour chacune : récap d'un cours, pages du manuel, ou mini-test.
2. Le numéro `NN` est celui de la dernière leçon de `content/lessons/` plus un. Crée `content/lessons/cours-NN/lesson.json`.
3. Remplis la leçon :
   - `date` : date du cours (pas celle de l'e-mail), au format `AAAA-MM-JJ`.
   - `kana` : une chaîne par ligne apprise, hiragana et katakana séparés (`"はひふへほ"`, `"ハヒフヘホ"`). Flashcards et tracés en sont dérivés.
   - `resume` : sections courtes reprenant le plan du récap.
   - `mots` : tout le vocabulaire cité, `jp` tel qu'enseigné. Kanji uniquement avec furigana : `{会社員|かいしゃいん}`.
   - `exercices` : au moins 2 `qcm`, 2 `saisie` et 2 `tuiles` portant sur la grammaire et le vocabulaire du cours. Les exercices du manuel deviennent des `transformation` (`serie` = nom de l'exercice, `exemple` = l'exemple du livre, un exercice par numéro) ; les tableaux de personnages vont dans `fiches`, sans les illustrations.
   - Écris les phrases avec une espace après chaque particule (`わたしは がくせいです`) : l'aide rōmaji s'en sert pour lire は « wa ».
   - `reponses` : en kana, sans rōmaji. Liste chaque variante réellement acceptable. Espaces, ponctuation, katakana/hiragana et じゃ/では sont déjà tolérés par la correction.
   - `prochainCours` : `annonce` = ce que le récap annonce pour la séance suivante, `devoirs` = les devoirs. Rien d'autre.
     Un devoir faisable dans l'app s'écrit `{ "texte": "…", "activites": ["kana", "trace"] }` (parmi `kana` = lecture, `trace` = écriture, `vocabulaire`, `exercices`), sinon c'est une simple chaîne.
4. Un mini-test passé en début de séance évalue le cours **précédent** : ajoute-le dans le champ `miniTest` de la leçon qu'il évalue, pas dans la nouvelle. Ignore les réponses manuscrites et le nom de l'élève. Une question « reliez » devient une série de `qcm`.
5. Vérifie : `npm ci && npm run validate && npm test && npm run build`. Corrige jusqu'à ce que tout passe.
6. Crée la branche `lecon/cours-NN`, committe uniquement `content/lessons/`, pousse, et ouvre une PR avec `gh pr create`. Dans la description : ce qui a été retranscrit, ce qui a été écarté, et les points à relire (lectures incertaines, corrigés à confirmer).

## Ne fais pas

- Ne pousse jamais sur `main`.
- Ne modifie pas le code de l'app pour faire entrer un contenu : si le schéma ne suffit pas, dis-le dans la PR.
