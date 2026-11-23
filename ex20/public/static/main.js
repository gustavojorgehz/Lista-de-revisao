
const API_URL = 'http://127.0.0.1:5000/alunos';

const studentList = document.getElementById('student-list');
const insertAlunos = document.getElementById('insert-alunos');
const studentForm = document.getElementById('student-form');

const showFormBtn = document.getElementById('show-form-btn');
const showDeleteBtn = document.getElementById('show-delete-btn');

const inputNome = document.getElementById('nome');
const inputTurma = document.getElementById('turma');
const inputCurso = document.getElementById('curso');

let alunoEditando = null;


// Mostrar mensagem na página
function mostrarMensagem(mensagem, tipo = 'info') {
    studentList.innerHTML = '';

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensagem;

    studentList.appendChild(alerta);
}


async function carregarAlunos() {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error('Erro ao buscar alunos');
        }

        const alunos = await resposta.json();

        insertAlunos.innerHTML = '';

        if (alunos.length === 0) {
            mostrarMensagem('Nenhum aluno cadastrado.', 'warning');
            return;
        }

        studentList.innerHTML = '';

        alunos.forEach(aluno => {
            criarCartaoAluno(aluno);
        });

    } catch (erro) {
        console.error(erro);

        mostrarMensagem(
            'Não foi possível conectar à API. Verifique se o Flask está funcionando.',
            'danger'
        );
    }
}


function criarCartaoAluno(aluno) {
    const cartao = document.createElement('div');
    cartao.className = 'card mb-3';

    const corpo = document.createElement('div');
    corpo.className = 'card-body';

    const nome = document.createElement('h2');
    nome.className = 'h5 card-title';
    nome.textContent = aluno.nome;

    const turma = document.createElement('p');
    turma.className = 'card-text';
    turma.textContent = `Turma: ${aluno.turma}`;

    const curso = document.createElement('p');
    curso.className = 'card-text';
    curso.textContent = `Curso: ${aluno.curso}`;

    const botoes = document.createElement('div');


    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn btn-danger me-2';
    btnExcluir.textContent = 'Excluir';

    btnExcluir.addEventListener('click', () => {
        excluirAluno(aluno.id);
    });

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-outline-warning';
    btnEditar.textContent = 'Editar';

    btnEditar.addEventListener('click', () => {
        prepararEdicao(aluno);
    });

    botoes.appendChild(btnExcluir);
    botoes.appendChild(btnEditar);

    corpo.appendChild(nome);
    corpo.appendChild(turma);
    corpo.appendChild(curso);
    corpo.appendChild(botoes);

    cartao.appendChild(corpo);

    insertAlunos.appendChild(cartao);
}


showFormBtn.addEventListener('click', () => {
    studentForm.classList.toggle('d-none');

    if (!studentForm.classList.contains('d-none')) {
        studentForm.reset();
        alunoEditando = null;

        studentForm.querySelector('button[type="submit"]')
            .textContent = 'Cadastrar';

        inputNome.focus();
    }
});


function prepararEdicao(aluno) {
    alunoEditando = aluno.id;

    inputNome.value = aluno.nome;
    inputTurma.value = aluno.turma;
    inputCurso.value = aluno.curso;

    studentForm.classList.remove('d-none');

    studentForm.querySelector('button[type="submit"]')
        .textContent = 'Salvar alterações';

    studentForm.scrollIntoView({
        behavior: 'smooth'
    });
}


studentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const aluno = {
        nome: inputNome.value.trim(),
        turma: inputTurma.value.trim(),
        curso: inputCurso.value.trim()
    };

    if (!aluno.nome || !aluno.turma || !aluno.curso) {
        alert('Preencha todos os campos!');
        return;
    }

    try {
        let resposta;

        if (alunoEditando === null) {
            // POST: cadastrar
            resposta = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(aluno)
            });
        } else {
            // PUT: editar
            resposta = await fetch(`${API_URL}/${alunoEditando}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(aluno)
            });
        }

        if (!resposta.ok) {
            throw new Error('Não foi possível salvar o aluno');
        }

        studentForm.reset();
        studentForm.classList.add('d-none');

        alunoEditando = null;

        studentForm.querySelector('button[type="submit"]')
            .textContent = 'Cadastrar';

        carregarAlunos();

    } catch (erro) {
        console.error(erro);
        alert('Erro ao salvar aluno.');
    }
});


// Excluir um aluno
async function excluirAluno(id) {
    const confirmar = confirm(
        'Deseja realmente excluir este aluno?'
    );

    if (!confirmar) return;

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            throw new Error('Erro ao excluir aluno');
        }

        carregarAlunos();

    } catch (erro) {
        console.error(erro);
        alert('Erro ao excluir aluno.');
    }
}


// Excluir todos os alunos
showDeleteBtn.addEventListener('click', async () => {
    const confirmar = confirm(
        'Tem certeza que deseja excluir TODOS os alunos?'
    );

    if (!confirmar) return;

    try {
        const resposta = await fetch(API_URL, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            throw new Error('Erro ao excluir alunos');
        }

        carregarAlunos();

    } catch (erro) {
        console.error(erro);
        alert('Erro ao excluir todos os alunos.');
    }
});


studentForm.classList.add('d-none');
carregarAlunos();
