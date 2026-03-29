from passlib.hash import bcrypt
import sqlite3

conn = sqlite3.connect('data/alone.db')

users = [
    ('salom',     'Salom2024'),
    ('testuser',  'Test2024'),
    ('testuser2', 'Test2024'),
    ('salom1',    'Salom2024'),
    ('admin',     'Admin2024'),
]

for username, pwd in users:
    h = bcrypt.hash(pwd)
    conn.execute('UPDATE users SET password=? WHERE username=?', (h, username))
    print(f'OK: {username}')

conn.commit()
print('Hammasi yangilandi!')