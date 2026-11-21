"""Build the installable skill. Add --kit to also package the prepared public files."""
import argparse
from hashlib import sha256
from os import walk
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / ".agents/skills/wireflow-review"
RELEASE = ROOT / "release"
VERSION = "0.5.0"
OUTPUT = RELEASE / f"wireflow-review-v{VERSION}.zip"
KIT = ROOT / "artifacts/wireflow-skill" / f"wireflow-release-kit-v{VERSION}.zip"

# Only reviewed deliverables go into the public kit.
PUBLIC_FILES = [
    "README.md", "APPLY.md", "index.html", OUTPUT.name,
    "example/brief.md", "example/night-atlas.flow.json", "example/night-atlas.html",
    "media/01-canvas.png", "media/02-floor-plan.png", "media/03-installation.png",
    "media/04-review.png", "media/05-handoff.png", "media/installation-detail.png",
    "media/wireflow-cover.png", "media/night-atlas.mp4", "media/night-atlas.ko.vtt",
]


def skill_files():
    for directory, dirs, files in walk(SKILL):
        dirs[:] = sorted(d for d in dirs if d != "node_modules" and not d.startswith("."))
        for name in sorted(f for f in files if not f.startswith(".")):
            yield Path(directory) / name


def write_zip(output, base, files):
    output.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile(dir=output.parent, delete=False) as temp:
        temporary = Path(temp.name)
    try:
        with ZipFile(temporary, "w", ZIP_DEFLATED) as archive:
            for source in files:
                archive.write(source, source.relative_to(base))
        temporary.chmod(0o644)
        temporary.replace(output)
    finally:
        temporary.unlink(missing_ok=True)


def package(kit=False):
    write_zip(OUTPUT, SKILL.parent, skill_files())
    if kit:
        files = [RELEASE / name for name in sorted(PUBLIC_FILES)]
        sums = RELEASE / "SHA256SUMS"
        sums.write_text("".join(f"{sha256(p.read_bytes()).hexdigest()}  {p.relative_to(RELEASE).as_posix()}\n" for p in files))
        write_zip(KIT, RELEASE, [*files, sums])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kit", action="store_true")
    package(parser.parse_args().kit)
