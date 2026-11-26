# Configuration

Polydock is set with environment variables on the container. The defaults suit almost everyone; the [install guide](install.md) shows the usual ones in context.

| Variable                                                     | Default                      | Meaning                                                                            |
| ------------------------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------- |
| `POLYDOCK_LIBRARIES`                                         | none (`/library` in Docker)  | Folders to scan, separated by `:` (`;` on Windows), `Name=/path` ok                |
| `POLYDOCK_DATA_DIR`                                          | `./data` (`/data` in Docker) | Database and derived files                                                         |
| `POLYDOCK_WORKERS`                                           | 1 or 2, by CPU count         | Files analysed at once, each in its own worker thread                              |
| `POLYDOCK_SCAN_INTERVAL`                                     | `60`                         | Minutes between automatic rescans; `0` turns them off                              |
| `POLYDOCK_WATCH`                                             | on                           | Rescans a folder as soon as files change in it; `off` to rely on the interval only |
| `POLYDOCK_S3_ENDPOINT`                                       | AWS for the region           | S3-compatible endpoint for `s3://` libraries (`AWS_ENDPOINT_URL` also read)        |
| `POLYDOCK_S3_REGION`                                         | `us-east-1`                  | Region of the bucket (`AWS_REGION` also read)                                      |
| `POLYDOCK_S3_ACCESS_KEY_ID`, `POLYDOCK_S3_SECRET_ACCESS_KEY` | none                         | Key that can list and read the bucket (`AWS_ACCESS_KEY_ID`… also read)             |
| `POLYDOCK_S3_PATH_STYLE`                                     | on with a custom endpoint    | `endpoint/bucket/key` addresses; `false` for `bucket.endpoint`                     |

A library in `POLYDOCK_LIBRARIES` may be a bucket: `Cloud=s3://bucket/prefix`. Polydock only
lists and reads it: it is rescanned on the interval (buckets cannot be watched), each file is
downloaded to a temporary file to be analysed or sent to the slicer, and deleting only hides
files.

On first launch, the web interface asks for the owner's name and an optional password. Without
a password anyone who can reach the port opens the library, which is fine on a home network;
set one before exposing Polydock anywhere else, ideally behind a reverse proxy with HTTPS.
Sessions last 30 days in an HttpOnly cookie, and failed sign-ins are slowed down.

