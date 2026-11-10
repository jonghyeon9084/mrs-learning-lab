"""Fetch pinned official Monaco package, verify npm SHA-512, copy browser files.
No scripts from the downloaded package are executed.
"""
import base64
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import tarfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
VERSION = '0.52.2'
with urllib.request.urlopen(f'https://registry.npmjs.org/monaco-editor/{VERSION}', timeout=30) as response:
    metadata = json.load(response)
with urllib.request.urlopen(metadata['dist']['tarball'], timeout=60) as response:
    archive = response.read()
actual = 'sha512-' + base64.b64encode(hashlib.sha512(archive).digest()).decode()
if actual != metadata['dist']['integrity']:
    raise RuntimeError('Monaco package integrity mismatch')
target = ROOT / 'docs' / 'vendor' / 'monaco'
count = 0
with tarfile.open(fileobj=io.BytesIO(archive), mode='r:gz') as tar:
    for member in tar.getmembers():
        if not member.isfile():
            continue
        if member.name.startswith('package/min/vs/'):
            relative = member.name[len('package/min/'):]
        elif member.name in ('package/LICENSE', 'package/ThirdPartyNotices.txt'):
            relative = member.name[len('package/'):]
        else:
            continue
        parts = PurePosixPath(relative).parts
        if '..' in parts or PurePosixPath(relative).is_absolute():
            raise RuntimeError('Unsafe archive path')
        destination = target.joinpath(*parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(tar.extractfile(member).read())
        count += 1
(target / 'VERSION.txt').write_text(f'Monaco Editor {VERSION}\nSource: https://registry.npmjs.org/monaco-editor/{VERSION}\nIntegrity: {actual}\n', encoding='utf-8')
print(f'Verified Monaco {VERSION}: {count} browser/license files')
