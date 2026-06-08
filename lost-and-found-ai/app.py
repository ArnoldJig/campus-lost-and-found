import os
import io
import clip
import torch
import numpy as np
import psycopg2
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from pathlib import Path
load_dotenv(dotenv_path=Path(__file__).parent / '.env')

app = Flask(__name__)
CORS(app)

print("Loading CLIP model...")
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)
print("CLIP model loaded!")

def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

def get_embedding(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_tensor = preprocess(image).unsqueeze(0).to(device)
    with torch.no_grad():
        embedding = model.encode_image(image_tensor)
    embedding = embedding / embedding.norm(dim=-1, keepdim=True)
    return embedding.cpu().numpy().flatten().tolist()

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def text_similarity(item1, item2):
    score = 0
    if item1['category_id'] and item2['category_id']:
        if str(item1['category_id']) == str(item2['category_id']):
            score += 0.5
    if item1['color'] and item2['color']:
        if item1['color'].lower() == item2['color'].lower():
            score += 0.3
    if item1['location'] and item2['location']:
        words1 = set(item1['location'].lower().split())
        words2 = set(item2['location'].lower().split())
        if words1 & words2:
            score += 0.2
    return min(score, 1.0)

@app.route('/embed', methods=['POST'])
def embed_item():
    try:
        item_id = request.form.get('item_id')
        image = request.files.get('image')

        if not image or not item_id:
            return jsonify({'error': 'item_id and image are required'}), 400

        image_bytes = image.read()
        embedding = get_embedding(image_bytes)

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "UPDATE items SET embedding = %s WHERE id = %s",
            (str(embedding), item_id)
        )
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({'message': 'Embedding saved', 'item_id': item_id})
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/match', methods=['POST'])
def match_item():
    try:
        item_id = request.json.get('item_id')
        if not item_id:
            return jsonify({'error': 'item_id is required'}), 400

        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, type, title, color, location, category_id, embedding
            FROM items WHERE id = %s
        """, (item_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({'error': 'Item not found'}), 404

        item = {
            'id': str(row[0]),
            'type': row[1],
            'title': row[2],
            'color': row[3],
            'location': row[4],
            'category_id': row[5],
            'embedding': row[6]
        }

        if not item['embedding']:
            return jsonify({'error': 'Item has no embedding yet'}), 400

        opposite_type = 'found' if item['type'] == 'lost' else 'lost'
        cur.execute("""
            SELECT id, type, title, color, location, category_id, embedding, image_url
            FROM items
            WHERE type = %s AND embedding IS NOT NULL AND id != %s
        """, (opposite_type, item_id))

        rows = cur.fetchall()
        cur.close()
        conn.close()

        matches = []
        query_embedding = eval(item['embedding'])

        for r in rows:
            candidate = {
                'id': str(r[0]),
                'type': r[1],
                'title': r[2],
                'color': r[3],
                'location': r[4],
                'category_id': r[5],
                'embedding': r[6],
                'image_url': r[7]
            }

            if not candidate['embedding']:
                continue

            candidate_embedding = eval(candidate['embedding'])
            img_score = cosine_similarity(query_embedding, candidate_embedding)
            txt_score = text_similarity(item, candidate)
            confidence = (img_score * 0.7) + (txt_score * 0.3)

            matches.append({
                'item_id': candidate['id'],
                'title': candidate['title'],
                'image_url': candidate['image_url'],
                'image_score': round(img_score, 3),
                'text_score': round(txt_score, 3),
                'confidence_score': round(confidence, 3)
            })

        matches.sort(key=lambda x: x['confidence_score'], reverse=True)
        top_matches = matches[:3]

        return jsonify({'matches': top_matches})

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def health():
    return jsonify({'message': 'AI matching service is running'})

if __name__ == '__main__':
    app.run(port=5001, debug=True, use_reloader=False)