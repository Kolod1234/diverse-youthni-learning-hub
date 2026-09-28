"""Import reviewed GCSE visual assets from authenticated Base44 storage."""
import hashlib
import io
import json
import sys
import time
from pathlib import Path
from urllib.request import urlopen
from zipfile import ZipFile

manifest_url, start, end = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
assert manifest_url.startswith("https://base44.app/api/apps/69418fc30769c7d951368216/files/")
destination = Path("/app/public/lesson-assets/gcse-maths")
destination.mkdir(parents=True, exist_ok=True)

def fetch(url):
    last = None
    for attempt in range(5):
        try:
            with urlopen(url, timeout=120) as response:
                return response.read()
        except Exception as exc:
            last = exc
            time.sleep(2 ** attempt)
    raise last

manifest = json.loads(fetch(manifest_url))
assert len(manifest) == 68
assert 0 <= start < end <= len(manifest)
count = 0
for entry in manifest[start:end]:
    assert entry["url"].startswith("https://base44.app/api/apps/69418fc30769c7d951368216/files/")
    archive_blob = fetch(entry["url"])
    assert hashlib.sha256(archive_blob).hexdigest() == entry["sha256"], entry["name"]
    with ZipFile(io.BytesIO(archive_blob)) as archive:
        names = archive.namelist()
        assert names == entry["files"], entry["name"]
        for name in names:
            safe = Path(name)
            assert len(safe.parts) == 1 and safe.suffix == ".webp" and safe.name == name
            image = archive.read(name)
            (destination / name).write_bytes(image)
            count += 1
    print(entry["name"], len(names), "images", flush=True)
print("COMPLETE", start, end, count, "images", flush=True)
