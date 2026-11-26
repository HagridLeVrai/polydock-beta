# How files become models

The rules are simple, so that you can predict them and fix the few cases they get wrong:

- A folder holding model files (STL, 3MF, OBJ, STEP) is a model, named after the folder.
  STEP files are turned into a mesh once, with OpenCascade (WebAssembly), for their thumbnail,
  3D view and the slicer; files over 256 MB are only listed.
- A folder whose name only says how the files are prepared (`Supported`, `32mm`, `STL`,
  `v2`, `Lychee`…) is a variant of the model above it: `Dragon/Supported/32mm/body.stl` is the
  `Supported / 32mm` variant of `Dragon`.
- Pictures and notes join the model of their folder, also from `Images` or `Renders`
  subfolders. A folder with pictures only is not a model.
- Files at the root of the library are models of their own; `benchy.stl` and
  `benchy_supported.stl` there make one model with two variants.
- Hidden folders and NAS leftovers (`@eaDir`, `#recycle`…) are skipped.

Corrections stick: a merged model, a moved variant or file, a detached variant or an edited
name stays as you left it, and new files in the same folders follow your choice. Files that
disappear are marked missing rather than deleted, so their tags and collections come back
if a drive was only unplugged.

Each model file is then read in the background: triangle count, size, paint and filament
colours of a 3MF, its author and licence when the slicer saved them, and a SHA-256 for
finding duplicates later. Each file also gets a 512 px thumbnail (painted 3MF files in their
filament colours), and files over 300 000 triangles a simplified copy for the 3D view. STL
files over 512 MB are measured without being loaded whole. Background work lives in a
database table, so it resumes after a restart.

Files imported from the browser go to `<data>/uploads`, which Polydock shows as a library of
its own named Uploads; a dropped folder keeps its structure, and ZIP, RAR (4 and 5) and 7-Zip
archives are unpacked there (plain files only, links left out, 4 GB at most).

Deleting a model or a file moves its files to a hidden `.polydock-trash` folder at the root of
their library, from where they can be restored for 30 days before Polydock erases them. A
library mounted read-only cannot hold a trash: its files are then only hidden from Polydock,
and stay restorable.

