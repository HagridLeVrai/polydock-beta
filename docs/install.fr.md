# Installer Polydock

Polydock tourne dans un seul conteneur Docker : le serveur et l'interface web ensemble, avec
sa base de données à l'intérieur. Tu lui indiques le dossier où sont déjà tes modèles ; il ne
les déplace ni ne les modifie jamais. Ce guide couvre [Docker Compose](#docker-compose)
(n'importe quelle machine Linux, un Raspberry Pi, un PC Windows ou un Mac avec Docker
Desktop), [Synology](#synology), [Unraid](#unraid) et
[une bibliothèque dans un stockage S3](#modèles-dans-un-stockage-compatible-s3).

_In English: [install.md](install.md)._

## Ce qu'il te faut

- Une machine 64 bits avec Docker : x86-64 (Intel, AMD) ou ARM64 (Raspberry Pi 4 ou 5 avec
  un système 64 bits, Synology ARM récents, Mac Apple Silicon). L'ARM 32 bits n'est pas pris
  en charge.
- 1 Go de mémoire libre, 2 Go si tu as des fichiers STEP (leur conversion en demande).
- De la place pour les données de Polydock : quelques pour cent de ta bibliothèque
  (vignettes, et versions allégées des gros modèles).
- Un navigateur avec WebGL 2 : tout Chrome, Edge, Firefox ou Safari récent, sur ordinateur ou
  mobile.

## L'essai le plus rapide

```sh
docker run -d --name polydock -p 3000:3000 \
  -v /chemin/vers/tes/modeles:/library:ro \
  -v polydock-data:/data \
  ghcr.io/hagridlevrai/polydock:beta
```

Ouvre `http://<adresse de la machine>:3000`. Polydock demande ton nom et un mot de passe
facultatif, puis scanne le dossier. Les vignettes apparaissent au fur et à mesure ; quelques
milliers de fichiers prennent quelques minutes sur un NAS.

## Docker Compose

La méthode conseillée, car les réglages restent écrits dans un seul fichier.

1. Crée un dossier, par exemple `~/polydock`, et enregistre-y
   [`deploy/docker-compose.yml`](../deploy/docker-compose.yml).
2. Remplace `/path/to/your/models` dans la ligne `- /path/to/your/models:/library:ro` par le
   vrai chemin de tes modèles.
3. Dans ce dossier, lance :

   ```sh
   docker compose up -d
   docker compose logs -f    # Ctrl+C pour arrêter de suivre ; Polydock continue de tourner
   ```

4. Ouvre `http://<adresse de la machine>:3000`.

**Plusieurs dossiers.** Monte chacun sous `/library` et liste-les, avec un nom si tu veux :

```yaml
environment:
  POLYDOCK_LIBRARIES: "Figurines=/library/figurines:Décors=/library/decors"
volumes:
  - /mnt/nas/figurines:/library/figurines:ro
  - /mnt/nas/decors:/library/decors:ro
  - polydock-data:/data
```

**Lecture seule ou non.** Avec `:ro`, Polydock ne peut rien changer à tes fichiers, et
supprimer un modèle dans Polydock le masque seulement. Sans `:ro`, la suppression déplace les
fichiers dans un dossier caché `.polydock-trash` à la racine de la bibliothèque, d'où tu peux
les restaurer pendant 30 jours. Les fichiers importés depuis le navigateur vont toujours dans
le dossier de données de Polydock, jamais dans ta bibliothèque.

## Synology

Pour DSM 7.2 et plus récent, avec **Container Manager** (à installer depuis le Centre de
paquets).

1. Dans **File Station**, crée un dossier pour les données de Polydock, par exemple
   `docker/polydock/data`. Tes modèles restent où ils sont, par exemple dans `modeles-3d`.
2. Trouve les identifiants de ton utilisateur : dans **Panneau de configuration > Terminal et
   SNMP**, active SSH, connecte-toi avec `ssh toi@nas` et lance `id`. Ça affiche quelque chose
   comme `uid=1026(toi) gid=100(users)`. (Tu peux désactiver SSH ensuite.)
3. Dans **Container Manager > Projet > Créer** : nomme-le `polydock`, choisis le dossier
   `docker/polydock` comme chemin, prends **Créer docker-compose.yml** et colle :

   ```yaml
   services:
     polydock:
       image: ghcr.io/hagridlevrai/polydock:beta
       container_name: polydock
       restart: unless-stopped
       user: "1026:100" # l'uid et le gid affichés par `id`
       ports:
         - "3000:3000"
       environment:
         TZ: Europe/Paris
       volumes:
         - /volume1/modeles-3d:/library:ro
         - /volume1/docker/polydock/data:/data
   ```

   Adapte `/volume1/modeles-3d` à ton dossier partagé (File Station indique le volume dans les
   propriétés du dossier).
4. Termine l'assistant ; le projet démarre. Ouvre `http://<adresse du nas>:3000`.

Les dossiers de vignettes `@eaDir` de Synology et `#recycle` sont ignorés. La surveillance des
dossiers ne marche pas toujours sur les volumes Synology ; Polydock rescanne aussi toutes les
heures (`POLYDOCK_SCAN_INTERVAL`, en minutes, pour changer ça), et **Paramètres >
Bibliothèques > Rescanner** est immédiat.

Pour mettre à jour : dans **Container Manager > Image**, l'image de Polydock affiche **Mise à
jour disponible** quand une nouvelle version sort ; ou en SSH, lance
`docker compose pull && docker compose up -d` dans le dossier du projet.

## Unraid

1. Télécharge [`deploy/unraid/polydock.xml`](../deploy/unraid/polydock.xml) dans
   `/boot/config/plugins/dockerMan/templates-user/` sur ton serveur (par exemple avec le
   plugin **Dynamix File Manager**, ou `wget` dans le terminal d'Unraid).
2. Dans **Docker > Add Container**, choisis **Polydock** dans la liste **Template**.
3. Mets **Models** sur ton partage (par exemple `/mnt/user/3d-models`) et laisse **Data** sur
   `/mnt/user/appdata/polydock`. Applique.
4. Ouvre l'interface web depuis le menu de l'icône du conteneur.

Le modèle fait tourner Polydock en `nobody:users` (99:100), comme la plupart des conteneurs
Unraid, donc le dossier appdata et tes partages ont les bons droits.

## Premier lancement

Polydock demande ton nom et, si tu veux, un mot de passe. Sans mot de passe, quiconque
atteint le port ouvre ta bibliothèque, ce qui va très bien sur un réseau domestique. **Mets-en
un avant de rendre Polydock accessible depuis Internet**, idéalement derrière un proxy inverse
en HTTPS (plus bas). Les sessions durent 30 jours. Mot de passe, langue, thème et imprimante
se changent ensuite dans **Paramètres**.

## Modèles dans un stockage compatible S3

Une bibliothèque peut aussi vivre dans un bucket : AWS S3, Backblaze B2, Cloudflare R2,
Wasabi, MinIO, Garage ou le service S3 d'un NAS. Polydock la lit (sans jamais y écrire), garde
les vignettes et sa base en local, et ne télécharge un fichier que quand il le lit ou le sert.

```yaml
environment:
  POLYDOCK_LIBRARIES: "/library:Cloud=s3://mon-bucket/modeles-3d"
  POLYDOCK_S3_ENDPOINT: https://s3.eu-central-003.backblazeb2.com # à omettre pour AWS
  POLYDOCK_S3_REGION: eu-central-003
  POLYDOCK_S3_ACCESS_KEY_ID: ton-identifiant
  POLYDOCK_S3_SECRET_ACCESS_KEY: ton-secret
```

- La clé n'a besoin que de lister et lire le bucket.
- Avec un endpoint personnalisé, Polydock utilise les adresses `endpoint/bucket/clé`, que
  tous les stockages compatibles acceptent. Mets `POLYDOCK_S3_PATH_STYLE: "false"` pour des
  adresses `bucket.endpoint`.
- Un bucket ne peut pas être surveillé : les changements apparaissent au rescan horaire ou
  avec **Paramètres > Bibliothèques > Rescanner**.
- Supprimer dans Polydock masque les fichiers ; efface-les toi-même du bucket si tu veux
  qu'ils disparaissent.

## Accéder à Polydock hors de chez toi

Polydock parle en HTTP simple sur le port 3000. Pour t'en servir à l'extérieur, mets devant un
proxy inverse en HTTPS, ou passe par un VPN (Tailscale, WireGuard) et garde-le privé. Avec
[Caddy](https://caddyserver.com), toute la configuration tient en trois lignes :

```
modeles.exemple.fr {
	reverse_proxy polydock:3000
}
```

Nginx Proxy Manager, Traefik et le proxy inverse de Synology (**Panneau de configuration >
Portail de connexion > Avancé > Proxy inversé**) marchent pareil : renvoie vers le port 3000,
et autorise des envois de quelques gigaoctets si tu importes de grosses archives
(`client_max_body_size 4g;` dans Nginx). Avec une configuration Nginx écrite à la main,
transmets aussi l'hôte d'origine (`proxy_set_header Host $host;`) : Polydock refuse les
modifications dont l'origine ne correspond pas.

« Envoyer au slicer » ouvre Bambu Studio, OrcaSlicer ou PrusaSlicer sur l'ordinateur où tourne
ton navigateur, avec un lien que le slicer télécharge depuis Polydock. Ça marche sur ton
réseau local et derrière un proxy inverse, tant que cet ordinateur atteint l'adresse de
Polydock.

## Mettre à jour

```sh
docker compose pull
docker compose up -d
```

La base se met à jour toute seule au démarrage. Tes fichiers, tags, collections et schémas de
couleurs restent. Pour rester sur une version précise plutôt que la dernière, utilise un tag
comme `ghcr.io/hagridlevrai/polydock:0.1.0` à la place de `latest`.

## Sauvegarder

Tout ce que Polydock sait est dans son dossier de données (`/data` dans le conteneur) : la
base `polydock.db`, les schémas de couleurs, les fichiers importés et les vignettes. Pour le
sauvegarder, arrête le conteneur et copie le dossier, ou laisse l'outil de sauvegarde de ton
NAS l'inclure. Les vignettes et versions allégées (`derived/`) peuvent être ignorées :
Polydock les refait.

Tes modèles eux-mêmes ne sont jamais stockés dans le dossier de données (sauf les fichiers
importés depuis le navigateur, dans `uploads/`).

## En cas de problème

Commence par les journaux : `docker compose logs polydock` (ou **Journal** du conteneur dans
Container Manager ou Unraid). Ensuite :

| Tu vois                                                                | Que faire                                                                                                                                                                                                   |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Polydock cannot write to its data folder`                             | L'utilisateur du conteneur ne peut pas écrire dans le dossier monté sur `/data`. Mets `user:` au propriétaire du dossier (`id` le donne) ou fais un `chown` du dossier.                                     |
| La bibliothèque reste vide                                             | Vérifie le chemin à gauche de `:/library`, et que l'utilisateur du conteneur peut le lire. **Paramètres > Bibliothèques** montre ce que contient chacune ; les journaux disent `Cannot read …` par dossier. |
| `The library folder … cannot be read`                                  | Le dossier n'est pas monté là où `POLYDOCK_LIBRARIES` l'indique. Les chemins de `POLYDOCK_LIBRARIES` sont ceux du conteneur (`/library/…`).                                                                 |
| Un fichier affiche une erreur sur sa fiche                             | Il est abîmé, ou dans une variante de format que Polydock ne lit pas encore. Le message dit pourquoi ; les autres fichiers ne sont pas touchés.                                                             |
| Les nouveaux fichiers mettent du temps à apparaître                    | Les partages réseau ne signalent pas toujours les changements. **Paramètres > Bibliothèques > Rescanner**, ou baisse `POLYDOCK_SCAN_INTERVAL`.                                                              |
| La vue 3D reste grise ou vide                                          | Le navigateur n'a pas WebGL 2 (appareil très ancien, ou accélération matérielle désactivée dans ses réglages).                                                                                              |
| Les journaux montrent `S3 403 SignatureDoesNotMatch` ou `AccessDenied` | Vérifie la clé, la région et l'endpoint. Pour un stockage qui veut des adresses `bucket.endpoint`, mets `POLYDOCK_S3_PATH_STYLE: "false"`.                                                                  |

Tous les réglages sont décrits dans la [référence de configuration](configuration.md)
(en anglais).
