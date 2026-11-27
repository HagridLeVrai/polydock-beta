# Installer l'application de bureau Polydock

L'application de bureau, c'est Polydock sans Docker : tu l'installes comme n'importe quel
logiciel, elle te demande le dossier de tes modèles et s'ouvre dans sa propre fenêtre. Elle
convient pour essayer Polydock ou l'utiliser sur un seul ordinateur. Pour un NAS ou un
serveur allumé en permanence, [l'image Docker](install.fr.md) reste le meilleur choix.

_In English: [install-desktop.md](install-desktop.md)._

## Télécharger

Prends le fichier de ton système dans la dernière
[release](https://github.com/HagridLeVrai/polydock-beta/releases) :

| Système                            | Fichier                                    |
| ---------------------------------- | ------------------------------------------ |
| Windows 10 et 11 (64 bits)         | `Polydock-<version>-win-x64.exe`           |
| Mac Apple Silicon (M1 et suivants) | `Polydock-<version>-mac-arm64.dmg`         |
| Mac Intel                          | `Polydock-<version>-mac-x64.dmg`           |
| Linux, toute distribution          | `Polydock-<version>-linux-x86_64.AppImage` |
| Debian, Ubuntu, Mint               | `Polydock-<version>-linux-amd64.deb`       |

## Les installateurs ne sont pas encore signés

Polydock n'a pas encore de certificat Microsoft ni Apple, alors Windows et macOS te
préviennent au premier lancement. C'est attendu pendant la bêta.

**Windows.** SmartScreen affiche « Windows a protégé votre ordinateur ». Clique sur
**Informations complémentaires**, puis sur **Exécuter quand même**. L'installation se fait
dans ton compte, sans droits d'administrateur.

**macOS.** Ouvre le `.dmg` et glisse Polydock dans Applications. Au premier lancement, macOS
refuse de l'ouvrir. Va dans **Réglages Système > Confidentialité et sécurité**, descends
jusqu'au message sur Polydock et clique sur **Ouvrir quand même**, puis confirme. Si macOS dit
que l'app « est endommagée », lance cette commande dans le Terminal et rouvre-la :

```sh
xattr -dr com.apple.quarantine /Applications/Polydock.app
```

**Linux.** Rends l'AppImage exécutable (`chmod +x Polydock-*.AppImage`) puis lance-la. Sur
Ubuntu 24.04 et suivants, il faut d'abord `sudo apt install libfuse2t64`. Avec le `.deb` :
`sudo apt install ./Polydock-*.deb`, puis lance Polydock depuis le menu des applications.

## Premier lancement

1. Polydock te demande le dossier où sont tes modèles 3D. Il le lit sur place et ne modifie
   jamais tes fichiers. Tu peux en ajouter d'autres plus tard avec **Fichier > Ajouter un
   dossier de modèles** (**Bibliothèque** sur Mac).
2. Crée ton compte : un pseudo, et un mot de passe si tu veux.
3. Les vignettes apparaissent au fur et à mesure du scan.

Quand tu fermes la fenêtre, Polydock s'arrête (sur Mac, il reste dans le Dock jusqu'à ce que
tu le quittes).

## Depuis ton téléphone ou un autre ordinateur

Par défaut, Polydock n'est visible que sur l'ordinateur où il tourne. Coche **Fichier > Ouvrir
aux autres appareils du réseau** : le menu affiche alors l'adresse à ouvrir depuis les autres
appareils, par exemple `http://192.168.1.20:47300`. Windows demande d'autoriser Polydock dans
le pare-feu : accepte pour les réseaux privés. Mets un mot de passe dans les paramètres de
Polydock si d'autres personnes utilisent ce réseau.

## Où sont tes données

La base, les vignettes et les fichiers importés sont dans le dossier de données, qu'ouvre
**Fichier > Afficher le dossier des données** :

- Windows : `%APPDATA%\Polydock`
- macOS : `~/Library/Application Support/Polydock`
- Linux : `~/.config/Polydock`

Le journal (**Fichier > Afficher le journal**) est dans `logs/polydock.log` de ce dossier :
joins-le quand tu signales un bug.

## Mettre à jour, désinstaller

Pour mettre à jour, installe la nouvelle version par-dessus l'ancienne : tes données sont
gardées. Pour désinstaller, passe par **Paramètres > Applications** sous Windows, mets
l'app à la corbeille sur Mac, supprime l'AppImage ou fais `sudo apt remove polydock` sous
Linux. Le dossier de données reste : supprime-le aussi pour tout effacer.

## Un souci ?

Signale-le dans les [issues](https://github.com/HagridLeVrai/polydock-beta/issues) avec ton
système, la version de Polydock et le journal.
