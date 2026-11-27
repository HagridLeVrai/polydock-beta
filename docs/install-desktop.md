# Installing the Polydock desktop app

The desktop app is Polydock without Docker: you install it like any other program, it asks
for the folder of your models and opens in its own window. It suits trying Polydock out or
using it on one computer. For a NAS or a server that is always on, [the Docker
image](install.md) remains the better choice.

_En français : [install-desktop.fr.md](install-desktop.fr.md)._

## Download

Take your system's file from the latest
[release](https://github.com/HagridLeVrai/polydock-beta/releases):

| System                           | File                                       |
| -------------------------------- | ------------------------------------------ |
| Windows 10 and 11 (64-bit)       | `Polydock-<version>-win-x64.exe`           |
| Apple Silicon Mac (M1 and later) | `Polydock-<version>-mac-arm64.dmg`         |
| Intel Mac                        | `Polydock-<version>-mac-x64.dmg`           |
| Linux, any distribution          | `Polydock-<version>-linux-x86_64.AppImage` |
| Debian, Ubuntu, Mint             | `Polydock-<version>-linux-amd64.deb`       |

## The installers are not signed yet

Polydock has no Microsoft or Apple certificate yet, so Windows and macOS warn you the first
time. That is expected during the beta.

**Windows.** SmartScreen says "Windows protected your PC". Click **More info**, then **Run
anyway**. Polydock installs in your account, without administrator rights.

**macOS.** Open the `.dmg` and drag Polydock to Applications. The first time, macOS refuses to
open it. Go to **System Settings > Privacy & Security**, scroll to the message about Polydock,
click **Open Anyway** and confirm. If macOS says the app "is damaged", run this in Terminal and
open it again:

```sh
xattr -dr com.apple.quarantine /Applications/Polydock.app
```

**Linux.** Make the AppImage executable (`chmod +x Polydock-*.AppImage`) and run it. On Ubuntu
24.04 and later, run `sudo apt install libfuse2t64` first. With the `.deb`:
`sudo apt install ./Polydock-*.deb`, then start Polydock from the applications menu.

## First launch

1. Polydock asks for the folder of your 3D models. It reads it in place and never changes your
   files. Add more later with **File > Add a folder of models** (**Library** on a Mac).
2. Create your account: a name, and a password if you want one.
3. Thumbnails appear as the scan goes.

Closing the window stops Polydock (on a Mac it stays in the Dock until you quit it).

## From your phone or another computer

By default only the computer running Polydock can open it. Tick **File > Open to other devices
on the network**: the menu then shows the address to open from other devices, for example
`http://192.168.1.20:47300`. Windows asks to let Polydock through its firewall: allow it on
private networks. Set a password in Polydock's settings if other people use that network.

## Where your data is

The database, thumbnails and imported files are in the data folder, which **File > Show the
data folder** opens:

- Windows: `%APPDATA%\Polydock`
- macOS: `~/Library/Application Support/Polydock`
- Linux: `~/.config/Polydock`

The log (**File > Show the log**) is `logs/polydock.log` in that folder: attach it when you
report a bug.

## Updating, uninstalling

To update, install the new version over the old one: your data is kept. To uninstall, use
**Settings > Apps** on Windows, move the app to the Bin on a Mac, delete the AppImage or run
`sudo apt remove polydock` on Linux. The data folder stays: delete it too to erase everything.

## A problem?

Report it in the [issues](https://github.com/HagridLeVrai/polydock-beta/issues) with your
system, Polydock's version and the log.
