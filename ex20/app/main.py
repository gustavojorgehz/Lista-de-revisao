from flask import Flask, jsonify, request
from flask_cors import CORS
from db import conectar, criar_tabela

app = Flask(__name__)


CORS(app, resources={
    r"/alunos.*": {
        "origins": [
            "http://127.0.0.1:5500",
            "http://localhost:5500"
        ]
    }
})

@app.route('/alunos', methods=['GET'])
def get_alunos():
    conexao = conectar()

    alunos = conexao.execute(
        'SELECT * FROM alunos'
    ).fetchall()

    conexao.close()

    return jsonify([dict(aluno) for aluno in alunos]), 200


@app.route('/alunos', methods=['POST'])
def add_aluno():
    dados = request.get_json()

    conexao = conectar()

    cursor = conexao.execute('''
        INSERT INTO alunos (nome, turma, curso)
        VALUES (?, ?, ?)
    ''', (dados['nome'], dados['turma'], dados['curso']))

    conexao.commit()

    novo_aluno = conexao.execute(
        'SELECT * FROM alunos WHERE id = ?',
        (cursor.lastrowid,)
    ).fetchone()

    conexao.close()

    return jsonify(dict(novo_aluno)), 201


@app.route('/alunos/<int:id>', methods=['PUT'])
def edit_aluno(id):
    dados = request.get_json()

    conexao = conectar()

    cursor = conexao.execute('''
        UPDATE alunos
        SET nome = ?, turma = ?, curso = ?
        WHERE id = ?
    ''', (dados['nome'], dados['turma'], dados['curso'], id))

    conexao.commit()

    if cursor.rowcount == 0:
        conexao.close()
        return jsonify({'message': 'Aluno não encontrado!'}), 404

    aluno = conexao.execute(
        'SELECT * FROM alunos WHERE id = ?',
        (id,)
    ).fetchone()

    conexao.close()

    return jsonify(dict(aluno)), 200


@app.route('/alunos/<int:id>', methods=['DELETE'])
def delete_aluno(id):
    conexao = conectar()

    cursor = conexao.execute(
        'DELETE FROM alunos WHERE id = ?',
        (id,)
    )

    conexao.commit()
    conexao.close()

    if cursor.rowcount == 0:
        return jsonify({'message': 'Aluno não encontrado!'}), 404

    return jsonify({
        'message': 'Aluno removido com sucesso!'
    }), 200


@app.route('/alunos', methods=['DELETE'])
def delete_all_alunos():
    conexao = conectar()

    conexao.execute('DELETE FROM alunos')

    conexao.commit()
    conexao.close()

    return jsonify({
        'message': 'Todos os alunos foram removidos com sucesso!'
    }), 200


if __name__ == '__main__':
    criar_tabela()
    app.run(debug=True)
