import ast, os, sys

errors = []
ok = 0

for root, dirs, files in os.walk('app'):
    dirs[:] = [d for d in dirs if d != '__pycache__']
    for f in files:
        if f.endswith('.py'):
            path = os.path.join(root, f)
            try:
                ast.parse(open(path, encoding='utf-8', errors='ignore').read())
                ok += 1
            except SyntaxError as e:
                errors.append(f'{path}: {e}')

print(f'\n✅ OK: {ok} fayl')
if errors:
    print(f'❌ XATOLAR: {len(errors)} ta')
    for e in errors:
        print(f'  {e}')
else:
    print('🎉 Barcha fayllar xatosiz!')