""" backend/app/core/file_analysis.py - PDF fayllarni o'qish va natija olish uchun yordamchi funksiyalar"""
from core.file_reader import read_pdf
from core.chunking import chunk_text
from core.embeddings import create_embedding
from core.vector_store import add_memory

def process_pdf(user_id, path):

    text = read_pdf(path)

    chunks = chunk_text(text)

    for chunk in chunks:

        embedding = create_embedding(chunk)

        add_memory(user_id, chunk, embedding)