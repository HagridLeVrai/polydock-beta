# Site vitrine polydock3d.com

Le site public de Polydock, en anglais (`/`) et en français (`/fr/`), avec le design « Atelier »
de l'application. C'est du HTML et du CSS statiques, sans étape de build : tout ce qui est dans
`public/` est publié tel quel par Cloudflare Pages, gratuitement.

```
public/
  index.html        page anglaise ; un navigateur en français est envoyé vers /fr/
  fr/index.html     page française
  404.html          page introuvable, bilingue
  tokens.css        jetons et icônes du design system, copiés de apps/web/src/atelier.css
  site.css          mise en page du site
  main.js           thème, langue, système détecté, liens de la dernière version
  img/              captures (clair et sombre) et images de partage og-en / og-fr
  fonts/            Inter, Bricolage Grotesque, JetBrains Mono (SIL OFL), hébergées ici
  _headers          en-têtes HTTP de Cloudflare (sécurité, cache)
  _redirects        raccourcis : /download, /telecharger, /releases, /github, /feedback, /avis, /issues
```

## Comment ça marche

- **Boutons de téléchargement.** `main.js` interroge l'API publique de GitHub pour trouver la
  dernière version de `HagridLeVrai/polydock-beta` (bêtas comprises) et met à jour les liens
  directs vers chaque installateur. Les liens écrits dans le HTML servent de secours si l'API ne
  répond pas : à chaque nouvelle version, on peut les mettre à jour, mais rien ne casse sinon.
- **Système détecté.** La carte de l'installateur qui correspond à l'ordinateur du visiteur est
  mise en avant, et le bouton du haut dit « Télécharger pour Windows », etc.
- **Service hébergé.** Tant que `HOSTED_URL` est vide en haut de `main.js`, le bouton affiche
  « Bientôt » et mène à la section qui l'annonce. Le jour où le service existe, il suffit d'y
  mettre son adresse.
- **Thème.** Il suit celui de l'appareil ; le bouton soleil/lune le force, et le choix est
  retenu dans le navigateur.

## Voir le site en local

```sh
cd website/public && python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000 (ou http://localhost:8000/fr/).

## Mise en ligne sur Cloudflare Pages

À faire une seule fois, dans le tableau de bord Cloudflare du compte qui gère `polydock3d.com`.

1. **Workers & Pages** > **Create** > onglet **Pages** > **Connect to Git** (si Cloudflare
   propose d'abord un Worker, choisir le lien « Pages » ou « Looking to deploy Pages? »).
2. Connecter GitHub et donner accès au seul dépôt `HagridLeVrai/polydock-beta`.
3. Réglages du build :
   - **Project name** : `polydock3d` (donne l'adresse provisoire `polydock3d.pages.dev`) ;
   - **Production branch** : `main` ;
   - **Framework preset** : `None` ;
   - **Build command** : laisser vide ;
   - **Build output directory** : `website/public`.
4. **Save and Deploy**. Le site est en ligne sur `https://polydock3d.pages.dev` en une minute.
5. Dans le projet : **Custom domains** > **Set up a custom domain** > `polydock3d.com` >
   **Activate domain**. Le domaine étant déjà chez Cloudflare, l'enregistrement DNS est créé
   tout seul. Recommencer avec `www.polydock3d.com`.
6. Facultatif : **Settings** > **Build** > **Build watch paths**, inclure `website/*` pour ne
   pas redéployer quand seuls les guides de la bêta changent.

Ensuite, chaque fusion dans `main` qui touche `website/` met le site à jour, et chaque PR a sa
propre adresse de prévisualisation.

Cloudflare Web Analytics (gratuit, sans cookie) peut être activé dans **Metrics** :
`_headers` autorise déjà son script.

## Changer une capture

Remplacer le fichier dans `img/` en gardant son nom, son format WebP et le ratio 16:10
(1600 x 1000 px). Chaque écran existe en `-light` et en `-dark`.

## Si un script en ligne change

Les deux petits scripts dans le `<head>` des pages sont autorisés par leur empreinte dans la
`Content-Security-Policy` de `_headers`. Après les avoir modifiés, recalculer les empreintes :

```sh
cd website/public && python3 -c "
import re, hashlib, base64
for f in ['index.html', 'fr/index.html', '404.html']:
    for s in re.findall(r'<script>(.*?)</script>', open(f).read(), re.S):
        print(f, 'sha256-' + base64.b64encode(hashlib.sha256(s.encode()).digest()).decode())"
```
