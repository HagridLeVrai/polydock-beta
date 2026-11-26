# Installing Polydock

Polydock runs as one Docker container: the server and the web interface together, with its
database inside. You point it at the folder where your models already are; it never moves or
changes them. This guide covers [Docker Compose](#docker-compose) (any Linux machine, a
Raspberry Pi, a Windows or Mac PC with Docker Desktop), [Synology](#synology),
[Unraid](#unraid), and [a library in S3 storage](#models-in-s3-compatible-storage).

_En français : [install.fr.md](install.fr.md)._

## What you need

- A 64-bit machine with Docker: x86-64 (Intel, AMD) or ARM64 (Raspberry Pi 4 or 5 with a
  64-bit OS, recent Synology ARM models, Apple Silicon). 32-bit ARM is not supported.
- 1 GB of free memory, 2 GB if you keep STEP files (converting them takes room).
- Disk space for Polydock's data: a few percent of your library (thumbnails, and light
  versions of large models).
- A browser with WebGL 2: any recent Chrome, Edge, Firefox or Safari, on desktop or mobile.

## The quickest try

```sh
docker run -d --name polydock -p 3000:3000 \
  -v /path/to/your/models:/library:ro \
  -v polydock-data:/data \
  ghcr.io/hagridlevrai/polydock:beta
```

Open `http://<the machine's address>:3000`. Polydock asks for your name and an optional
password, then scans the folder. Thumbnails appear as the files are read; a library of a few
thousand files takes a few minutes on a NAS.

## Docker Compose

The recommended way, because the settings stay written down in one file.

1. Create a folder, for example `~/polydock`, and save
   [`deploy/docker-compose.yml`](../deploy/docker-compose.yml) in it.
2. Edit the line `- /path/to/your/models:/library:ro` with the real path of your models.
3. In that folder, run:

   ```sh
   docker compose up -d
   docker compose logs -f    # Ctrl+C to stop following; Polydock keeps running
   ```

4. Open `http://<the machine's address>:3000`.

**Several folders.** Mount each one under `/library` and list them, named if you like:

```yaml
environment:
  POLYDOCK_LIBRARIES: "Figurines=/library/figurines:Terrain=/library/terrain"
volumes:
  - /mnt/nas/figurines:/library/figurines:ro
  - /mnt/nas/terrain:/library/terrain:ro
  - polydock-data:/data
```

**Read-only or not.** With `:ro`, Polydock cannot change your files at all, and deleting a
model in Polydock only hides it. Without `:ro`, deleting moves the files to a hidden
`.polydock-trash` folder at the root of the library, from where you can restore them for 30
days. Files you import from the browser always go to Polydock's data folder, never into your
library.

## Synology

Tested approach for DSM 7.2 and later, with **Container Manager** (install it from the
Package Center).

1. In **File Station**, create a folder for Polydock's data, for example
   `docker/polydock/data`. Your models can stay where they are, for example `3d-models`.
2. Find your user's IDs: in **Control Panel > Terminal & SNMP**, enable SSH, connect with
   `ssh you@nas` and run `id`. It prints something like `uid=1026(you) gid=100(users)`. (You
   can disable SSH again afterwards.)
3. In **Container Manager > Project > Create**: name it `polydock`, choose the
   `docker/polydock` folder as its path, pick **Create docker-compose.yml** and paste:

   ```yaml
   services:
     polydock:
       image: ghcr.io/hagridlevrai/polydock:beta
       container_name: polydock
       restart: unless-stopped
       user: "1026:100"          # the uid and gid that `id` printed
       ports:
         - "3000:3000"
       environment:
         TZ: Europe/Paris
       volumes:
         - /volume1/3d-models:/library:ro
         - /volume1/docker/polydock/data:/data
   ```

   Adjust `/volume1/3d-models` to your shared folder (File Station shows the volume in the
   folder's properties).
4. Finish the wizard; the project starts. Open `http://<nas address>:3000`.

Synology's `@eaDir` thumbnail folders and `#recycle` are skipped automatically. Folder
watching does not always work on Synology volumes; Polydock also rescans every hour (set
`POLYDOCK_SCAN_INTERVAL` in minutes to change that), and **Settings > Libraries > Rescan** is
immediate.

To update: in **Container Manager > Image**, Polydock's image shows **Update available** when a
new version is out; or over SSH, run `docker compose pull && docker compose up -d` in the
project folder.

## Unraid

1. Download [`deploy/unraid/polydock.xml`](../deploy/unraid/polydock.xml) to
   `/boot/config/plugins/dockerMan/templates-user/` on your server (for example with the
   **Dynamix File Manager** plugin, or `wget` in the Unraid terminal).
2. In **Docker > Add Container**, pick **Polydock** in the **Template** list.
3. Set **Models** to your share (for example `/mnt/user/3d-models`) and keep **Data** on
   `/mnt/user/appdata/polydock`. Apply.
4. Open the web interface from the container's icon menu.

The template runs Polydock as `nobody:users` (99:100), like most Unraid containers, so the
appdata folder and your shares have the right permissions.

## First launch

Polydock asks for your name and, optionally, a password. Without a password anyone who can
reach the port opens your library, which is fine on a home network. **Set one before making
Polydock reachable from the internet**, ideally behind a reverse proxy with HTTPS (below).
Sessions last 30 days. You can change the password, the language, the theme and your
printer later in **Settings**.

## Models in S3-compatible storage

A library can also live in a bucket: AWS S3, Backblaze B2, Cloudflare R2, Wasabi, MinIO,
Garage or a NAS's S3 service. Polydock reads it (never writes to it), keeps the thumbnails
and its database locally, and downloads a file only when it reads or serves it.

```yaml
environment:
  POLYDOCK_LIBRARIES: "/library:Cloud=s3://my-bucket/3d-models"
  POLYDOCK_S3_ENDPOINT: https://s3.eu-central-003.backblazeb2.com # leave out for AWS
  POLYDOCK_S3_REGION: eu-central-003
  POLYDOCK_S3_ACCESS_KEY_ID: your-key-id
  POLYDOCK_S3_SECRET_ACCESS_KEY: your-secret
```

- The key only needs to list and read the bucket.
- With a custom endpoint, Polydock uses path-style addresses (`endpoint/bucket/key`), which
  every S3-compatible store accepts. Set `POLYDOCK_S3_PATH_STYLE: "false"` for
  `bucket.endpoint` addresses.
- Buckets cannot be watched: changes show up at the hourly rescan or with **Settings >
  Libraries > Rescan**.
- Deleting in Polydock hides the files; delete them in the bucket yourself if you want them
  gone.

## Reaching Polydock from outside your home

Polydock speaks plain HTTP on port 3000. To use it away from home, put a reverse proxy with
HTTPS in front, or use a VPN (Tailscale, WireGuard) and keep it private. With
[Caddy](https://caddyserver.com), the whole configuration is:

```
models.example.com {
	reverse_proxy polydock:3000
}
```

Nginx Proxy Manager, Traefik and Synology's own reverse proxy (**Control Panel > Login
Portal > Advanced > Reverse Proxy**) work the same way: forward to port 3000, and allow
uploads of a few gigabytes if you import large archives (`client_max_body_size 4g;` in
Nginx). With a hand-written Nginx configuration, also pass the original host
(`proxy_set_header Host $host;`): Polydock refuses changes whose origin does not match it.

"Send to slicer" opens Bambu Studio, OrcaSlicer or PrusaSlicer on the computer where your
browser runs, with a link the slicer downloads from Polydock. It works on your home network
and behind a reverse proxy, as long as that computer can reach Polydock's address.

## Updating

```sh
docker compose pull
docker compose up -d
```

The database upgrades itself at start. Your files, tags, collections and colour schemes stay.
To stay on a given version rather than the latest, use a tag such as
`ghcr.io/hagridlevrai/polydock:0.1.0` in place of `latest`.

## Backing up

Everything Polydock knows is in its data folder (`/data` in the container): the database
`polydock.db`, colour schemes, imported files and thumbnails. To back it up, stop the
container and copy the folder, or let your NAS's backup tool include it. Thumbnails and light
versions (`derived/`) can be skipped: Polydock makes them again.

Your models themselves are never stored in the data folder (except files imported from the
browser, in `uploads/`).

## When something goes wrong

Start with the logs: `docker compose logs polydock` (or the container's **Log** in Container
Manager or Unraid). Then:

| You see                                                        | What to do                                                                                                                                                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Polydock cannot write to its data folder`                     | The container's user cannot write to the folder mounted on `/data`. Set `user:` to the folder's owner (`id` gives it) or `chown` the folder.                                                              |
| The library stays empty                                        | Check the path on the left of `:/library`, and that the container's user can read it (`ls` it over SSH). **Settings > Libraries** shows what each library holds; the logs say `Cannot read …` per folder. |
| `The library folder … cannot be read`                          | The folder is not mounted where `POLYDOCK_LIBRARIES` says. Paths in `POLYDOCK_LIBRARIES` are inside the container (`/library/…`).                                                                         |
| A file shows an error on its model page                        | It is damaged or in a format variant Polydock does not read yet. The message says why; the other files are not affected.                                                                                  |
| New files take time to appear                                  | Network shares do not always report changes. Use **Settings > Libraries > Rescan**, or lower `POLYDOCK_SCAN_INTERVAL`.                                                                                    |
| The 3D view stays grey or blank                                | The browser has no WebGL 2 (very old device, or hardware acceleration turned off in the browser's settings).                                                                                              |
| The logs show `S3 403 SignatureDoesNotMatch` or `AccessDenied` | Check the key, the region and the endpoint. For a store that needs `bucket.endpoint` addresses, set `POLYDOCK_S3_PATH_STYLE: "false"`.                                                                    |

Every setting is described in the [configuration reference](configuration.md).
