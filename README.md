# Nihongo

App de révision d'un cours de japonais hebdomadaire : leçons, exercices, mini-tests, tracé des kana et répétition espacée. Site statique (Vue 3 + Vite, PWA).

```bash
npm install
npm run dev        # http://localhost:5173/nihongo/
npm run validate   # vérifie content/lessons/ contre le schéma
npm test
```

Une leçon = `content/lessons/cours-NN/lesson.json`, conforme à `src/content/schema.ts`. Pour en ajouter une avec Claude Code, joins le récap du cours au prompt et lance le skill `nouvelle-lecon`.

Le dépôt est public : ni e-mails, ni scans, ni données personnelles.

## Licences tierces

Les tracés de `src/data/kana-strokes.json` proviennent d'[AnimCJK](https://github.com/parsimonhi/animCJK) (`graphicsJaKana.txt`), sous Arphic Public License.
