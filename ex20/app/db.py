import sqlite3

def conectar():
    conexao = sqlite3.connect('alunos.db')
    conexao.row_factory = sqlite3.Row

    return conexao

def criar_tabela():
    conexao = conectar()
    cursor = conexao.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alunos ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            turma TEXT NOT NULL,
            curso TEXT NOT NULL
        )
    ''')
    conexao.commit()