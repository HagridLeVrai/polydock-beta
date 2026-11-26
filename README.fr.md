<p align="center"><img src="assets/polydock.svg" width="72" alt=""></p>

# Bêta de Polydock

**Ta bibliothèque de fichiers 3D auto-hébergée, avec un atelier de peinture multicolore.**

_In English: [README.md](README.md)._

Polydock se branche sur le dossier (ou le partage NAS, ou le bucket S3) où sont déjà tes STL,
3MF, OBJ et STEP, sans jamais les déplacer ni les modifier, et en fait une bibliothèque avec
recherche, tags, collections, vignettes et visionneuse 3D. Tu peux peindre un modèle pour
l'impression multimatière (AMS, MMU, changeur d'outils) dans le navigateur, garder plusieurs
schémas de couleurs par fichier, et l'ouvrir dans OrcaSlicer, Bambu Studio ou PrusaSlicer en
un clic.

Ce dépôt accueille la **bêta** : les guides d'installation, et l'endroit où signaler ce qui
coince. Merci de l'essayer.

## Installer

Un seul conteneur Docker, pour amd64 et arm64 :

```sh
docker run -d --name polydock -p 3000:3000 \
  -v /chemin/vers/tes/modeles:/library:ro \
  -v polydock-data:/data \
  ghcr.io/hagridlevrai/polydock:beta
```

Puis ouvre `http://<adresse de la machine>:3000`.

- [Guide d'installation](docs/install.fr.md) : Docker Compose, Synology, Unraid, stockage S3,
  HTTPS, mises à jour, sauvegardes, dépannage.
- [`deploy/docker-compose.yml`](deploy/docker-compose.yml) et le
  [modèle Unraid](deploy/unraid/polydock.xml).
- [Référence de configuration](docs/configuration.md) et
  [comment les fichiers deviennent des modèles](docs/how-files-become-models.md) (en anglais).

Pour mettre à jour : `docker compose pull && docker compose up -d`. Les corrections sortent en
nouvelles versions bêta sous le même tag `:beta`.

## Quoi essayer

1. **Brancher ta collection.** Installe, crée ton compte, vérifie dans **Paramètres >
   Bibliothèques** que tes modèles sont comptés. Parcours, cherche, tague ; corrige un modèle
   mal regroupé (fusionner deux modèles, déplacer un fichier) ; importe un ZIP de Printables
   ou MakerWorld.
2. **Préparer un print multicolore.** Ouvre un modèle dans l'atelier, peins-le avec tes
   filaments, enregistre le schéma, choisis ton imprimante, envoie-le au slicer et imprime-le.
3. **Le retrouver quelques jours plus tard**, et le renvoyer au slicer avec le même schéma.

## Signaler un problème ou une idée

[Ouvre une issue](https://github.com/HagridLeVrai/polydock-beta/issues/new/choose). Pour un
bug, donne la version (**Paramètres > À propos**), ta machine et ton navigateur, ce que tu as
fait, et les journaux (`docker logs polydock`). En français ou en anglais.

Après une semaine d'utilisation, puis à la fin, remplis le
[questionnaire de retour](https://tally.so/r/0VOEoN), environ cinq minutes.

## Limites connues

- **Couleurs dans le slicer** : OrcaSlicer (2.5 et plus) reçoit les couleurs des filaments.
  Bambu Studio et PrusaSlicer reçoivent la peinture, mais les couleurs se règlent à la main.
- **PrusaSlicer** ne s'ouvre pas depuis un lien : le 3MF se télécharge.
- **Les fichiers STEP** ont une vue 3D, une vignette et partent au slicer, mais ne se peignent
  pas encore. Au-delà de 256 Mo, ils sont seulement listés.
- **Les bibliothèques S3** sont en lecture seule, rescannées toutes les heures.
- **Un seul compte** par installation.
- **Pas encore de découpe, texte ni réparation** : ça vient après la bêta.
- Avec le dossier des modèles en lecture seule (`:ro`, conseillé), supprimer dans Polydock
  masque seulement les fichiers.

## À propos

Polydock est un logiciel libre sous licence GNU AGPL v3, développé par une seule personne avec
l'aide d'outils d'IA ; son code source sera publié à la sortie publique. Une version hébergée
payante viendra peut-être, pour qui préfère ne pas gérer de serveur. « Polydock » est une
marque de son auteur.
