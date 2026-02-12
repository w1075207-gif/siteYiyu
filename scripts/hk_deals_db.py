#!/usr/bin/env python3
import json
import os
import sqlite3

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__) + '/../')
JSON_PATH = os.path.join(PROJECT_ROOT, 'data', 'games.json')
DB_PATH = os.path.join(PROJECT_ROOT, 'data', 'hk_deals.db')
TABLE = 'hk_deals'

SCHEMA = f'''
CREATE TABLE IF NOT EXISTS {TABLE} (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT,
    cover TEXT,
    currency TEXT,
    list_price REAL,
    sale_price REAL,
    discount REAL,
    lowest INTEGER,
    genre TEXT,
    languages TEXT,
    expiry TEXT,
    platform TEXT,
    purchase_link TEXT
);
'''


def load_json():
    with open(JSON_PATH, encoding='utf-8') as fh:
        return json.load(fh)


def normalize_amount(amount):
    try:
        return float(amount)
    except (ValueError, TypeError):
        return None


def ensure_db(conn):
    conn.execute(SCHEMA)


def upsert(conn, row):
    stmt = f'''
    INSERT INTO {TABLE} (id, title, slug, cover, currency, list_price, sale_price,
        discount, lowest, genre, languages, expiry, platform, purchase_link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        title=excluded.title,
        slug=excluded.slug,
        cover=excluded.cover,
        currency=excluded.currency,
        list_price=excluded.list_price,
        sale_price=excluded.sale_price,
        discount=excluded.discount,
        lowest=excluded.lowest,
        genre=excluded.genre,
        languages=excluded.languages,
        expiry=excluded.expiry,
        platform=excluded.platform,
        purchase_link=excluded.purchase_link;
    '''
    conn.execute(stmt, row)


def main():
    data = load_json()
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    ensure_db(conn)
    with conn:
        for entry in data:
            slug = entry.get('slug') or entry.get('title', '').lower().replace(' ', '-')
            languages = ','.join(entry.get('languages') or [])
            row = (
                slug,
                entry.get('title'),
                slug,
                entry.get('cover'),
                entry.get('currency', 'HK$'),
                normalize_amount(entry.get('list_price')),
                normalize_amount(entry.get('sale_price')),
                normalize_amount(entry.get('discount')),
                1 if entry.get('lowest') else 0,
                entry.get('genre'),
                languages,
                entry.get('expiry'),
                entry.get('platform', 'HK'),
                entry.get('link') or entry.get('purchase_link'),
            )
            upsert(conn, row)
    conn.close()
    print(f"Stored {len(data)} HK deals into {DB_PATH}")


if __name__ == '__main__':
    main()
