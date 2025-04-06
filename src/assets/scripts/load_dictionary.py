import sqlite3
import json
import sys
import logging
from pathlib import Path
from typing import List, Dict, Any, Tuple
import re
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

def init_db(db_path: str):
    """Initialize the database with schema."""
    logging.info(f"Initializing database at {db_path}...")
    with sqlite3.connect(db_path) as conn:
        with open('schema.sql', 'r') as f:
            conn.executescript(f.read())
        conn.commit()
    logging.info("Database initialized successfully")

def load_tag_bank(db_path: str, tag_bank_path: str):
    """Load tag definitions from tag bank file."""
    logging.info(f"Loading tag bank from {tag_bank_path}...")
    with open(tag_bank_path, 'r') as f:
        tag_data = json.load(f)

    with sqlite3.connect(db_path) as conn:
        # Process parts of speech
        pos_tags = [(tag[0], tag[2], tag[3], 'partOfSpeech') 
                   for tag in tag_data if len(tag) > 1 and tag[1] == 'partOfSpeech']
        logging.info(f"Loading {len(pos_tags)} parts of speech...")
        conn.executemany(
            "INSERT OR IGNORE INTO parts_of_speech (name, priority_score, description, category) VALUES (?, ?, ?, ?)",
            pos_tags
        )

        # Process fields/domains
        fields = [(tag[0], tag[3]) for tag in tag_data 
                 if len(tag) > 1 and not tag[1] and tag[0] in ['math', 'med', 'comp', 'physics', 'chem', 'biol']]
        logging.info(f"Loading {len(fields)} field categories...")
        conn.executemany(
            "INSERT OR IGNORE INTO fields (name, description) VALUES (?, ?)",
            fields
        )

        # Process dialects
        dialects = [(tag[0], tag[3]) for tag in tag_data 
                   if len(tag) > 1 and tag[0] in ['ksb', 'ktb', 'kyb', 'tsb', 'thb', 'hob']]
        logging.info(f"Loading {len(dialects)} dialects...")
        conn.executemany(
            "INSERT OR IGNORE INTO dialects (name, description) VALUES (?, ?)",
            dialects
        )

        # Process usage types
        usage_types = [(tag[0], tag[3], tag[1]) for tag in tag_data 
                      if len(tag) > 1 and tag[0] in ['col', 'hon', 'arch', 'obs', 'rare', 'uk']]
        logging.info(f"Loading {len(usage_types)} usage types...")
        conn.executemany(
            "INSERT OR IGNORE INTO usage_types (name, description, category) VALUES (?, ?, ?)",
            usage_types
        )

        # Process name types
        name_types = [(tag[0], tag[3]) for tag in tag_data 
                     if len(tag) > 1 and tag[1] == 'name']
        logging.info(f"Loading {len(name_types)} name types...")
        conn.executemany(
            "INSERT OR IGNORE INTO name_types (name, description) VALUES (?, ?)",
            name_types
        )

        conn.commit()
    logging.info("Tag bank loaded successfully")

def parse_structured_content(content: List[Any]) -> Tuple[List[str], List[Tuple[str, str]]]:
    """Parse structured content to extract definitions and examples."""
    definitions = []
    examples = []
    
    def process_content(item: Any):
        if isinstance(item, dict):
            # Handle glossary content (definitions)
            if item.get('data', {}).get('content') == 'glossary':
                if isinstance(item.get('content'), list):
                    for li in item['content']:
                        if isinstance(li, dict) and li.get('tag') == 'li':
                            definitions.append(li.get('content', ''))
            
            # Handle example content
            elif item.get('data', {}).get('content') == 'examples':
                if isinstance(item.get('content'), list):
                    # Examples are pairs of li elements, first Japanese then English
                    content_list = item['content']
                    for i in range(0, len(content_list), 2):
                        if i + 1 < len(content_list):
                            jp_item = content_list[i]
                            en_item = content_list[i + 1]
                            if (isinstance(jp_item, dict) and jp_item.get('tag') == 'li' and
                                isinstance(en_item, dict) and en_item.get('tag') == 'li' and
                                en_item.get('lang') == 'en'):
                                jp_text = jp_item.get('content', '')
                                en_text = en_item.get('content', '')
                                if jp_text and en_text:
                                    examples.append((jp_text, en_text))
            
            # Recursively process nested content
            for value in item.values():
                if isinstance(value, (dict, list)):
                    process_content(value)
        
        elif isinstance(item, list):
            for subitem in item:
                process_content(subitem)
    
    process_content(content)
    return definitions, examples

def load_term_bank(db_path: str, term_bank_path: str):
    """Load dictionary entries from a term bank file."""
    logging.info(f"Loading term bank from {term_bank_path}...")
    with sqlite3.connect(db_path) as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        
        with open(term_bank_path, 'r') as f:
            entries = json.load(f)

        total_entries = len(entries)
        logging.info(f"Found {total_entries} entries to process")

        # First pass: Load all entries, including redirects
        for entry in tqdm(entries, desc="Processing entries", unit="entries"):
            if len(entry) < 7:  # Skip malformed entries
                continue

            term, reading, pos_tags, tags, priority, content, entry_id, *extra = entry

            # Insert main entry
            is_redirect = entry_id < 0
            abs_id = abs(entry_id)
            
            conn.execute("""
                INSERT OR IGNORE INTO entries (id, term, reading, priority_score, news_freq, is_redirect, redirects_to)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (abs_id, term, reading, priority, '⭐' in (extra[0] if len(extra) > 0 else ''), 
                 is_redirect, abs_id if is_redirect else None))

            # For redirects, we don't need to process the rest of the data
            if is_redirect:
                continue

            # Process definitions and examples
            definitions, examples = parse_structured_content(content)
            
            # Insert definitions
            for idx, definition in enumerate(definitions):
                conn.execute("""
                    INSERT OR IGNORE INTO definitions (entry_id, content, position)
                    VALUES (?, ?, ?)
                """, (abs_id, definition, idx))

            # Insert examples
            for idx, (jp, en) in enumerate(examples):
                conn.execute("""
                    INSERT OR IGNORE INTO examples (entry_id, japanese_text, english_text, position)
                    VALUES (?, ?, ?, ?)
                """, (abs_id, jp, en, idx))

            # Insert POS tags
            if isinstance(pos_tags, str):
                pos_list = pos_tags.split(',')
                for pos in pos_list:
                    conn.execute("""
                        INSERT OR IGNORE INTO entry_pos (entry_id, pos_id)
                        SELECT ?, id FROM parts_of_speech WHERE name = ?
                    """, (abs_id, pos.strip()))

            # Process other tags
            if isinstance(tags, str):
                tag_list = tags.split(',')
                for tag in tag_list:
                    tag = tag.strip()
                    # Insert into appropriate tag table based on tag type
                    for table, join_table, id_column in [
                        ('fields', 'entry_fields', 'field_id'),
                        ('dialects', 'entry_dialects', 'dialect_id'),
                        ('usage_types', 'entry_usage', 'usage_type_id'),
                        ('name_types', 'entry_names', 'name_type_id')
                    ]:
                        conn.execute(f"""
                            INSERT OR IGNORE INTO {join_table} (entry_id, {id_column})
                            SELECT ?, id FROM {table} WHERE name = ?
                        """, (abs_id, tag))

            # Process special markers
            if len(extra) > 0 and extra[0]:
                for marker in ['⭐', '⚠️', '⛬', '🅁']:
                    if marker in extra[0]:
                        conn.execute("""
                            INSERT OR IGNORE INTO special_markers (entry_id, marker)
                            VALUES (?, ?)
                        """, (abs_id, marker))

            # Process news frequency rankings
            if len(extra) > 0 and extra[0]:
                news_match = re.search(r'news(\d+)k', extra[0])
                if news_match:
                    rank_num = int(news_match.group(1))
                    conn.execute("""
                        INSERT OR IGNORE INTO news_freq (entry_id, rank_type, rank_start, rank_end)
                        VALUES (?, ?, ?, ?)
                    """, (abs_id, f'news{rank_num}k', (rank_num-1)*1000 + 1, rank_num*1000))

        # Second pass: Process alternative forms
        for entry in tqdm(entries, desc="Processing alternative forms", unit="entries"):
            if len(entry) < 7:
                continue

            term, reading, _, _, _, _, entry_id, *extra = entry
            abs_id = abs(entry_id)

            # Skip redirects for alternative forms
            if entry_id < 0:
                continue

            # Insert alternative form
            conn.execute("""
                INSERT OR IGNORE INTO alternative_forms (entry_id, term, reading)
                VALUES (?, ?, ?)
            """, (abs_id, term, reading))

        conn.commit()
    logging.info("Term bank loaded successfully")

def main():
    if len(sys.argv) < 3:
        print("Usage: python load_dictionary.py <term_bank_file_or_dir> <tag_bank_file>")
        sys.exit(1)

    term_bank_path = sys.argv[1]
    tag_bank_path = sys.argv[2]
    db_path = "dictionary.db"

    # Initialize database
    init_db(db_path)

    # Load tag bank
    load_tag_bank(db_path, tag_bank_path)

    # Load term banks
    if Path(term_bank_path).is_dir():
        term_bank_files = sorted(Path(term_bank_path).glob("term_bank_*.json"))
        for term_bank_file in term_bank_files:
            logging.info(f"Loading term bank from {term_bank_file}...")
            load_term_bank(db_path, str(term_bank_file))
    else:
        load_term_bank(db_path, term_bank_path)

    logging.info("Dictionary loading completed successfully!")

if __name__ == '__main__':
    main() 