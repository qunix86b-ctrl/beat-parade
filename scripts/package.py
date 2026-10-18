from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import sys
if sys.argv[1] == 'classes':
    with ZipFile('build/classes.jar', 'w', ZIP_DEFLATED) as z:
        for p in Path('build/classes').rglob('*.class'):
            z.write(p, p.relative_to('build/classes').as_posix())
else:
    with ZipFile('build/unsigned.apk', 'a', ZIP_DEFLATED) as z:
        z.write('build/dex/classes.dex', 'classes.dex')
