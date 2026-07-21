// Constantes de conexão com o seu servidor local
const IP_SERVIDOR = "MININT-CDV84OR.local";
const IP_SERVIDOR_ALT = "192.168.137.102";

// Aponta para as APIs do backend C#
let URL_API = `http://${IP_SERVIDOR}:5000/api/alunos`; 
let URL_TURMAS = `http://${IP_SERVIDOR}:5000/api/turmas`;

const modal = document.getElementById("studentModal");
const studentForm = document.getElementById("studentForm");
const tabelaCorpo = document.getElementById("tabelaCorpo");
const selectTurma = document.getElementById("alunoTurma");

// Carrega os alunos assim que a página abre
document.addEventListener("DOMContentLoaded", () => {
    carregarAlunos();
    carregarTurmasNoSelect();
});

// ==========================================
// BUSCAR E POPULAR SELECT DE TURMAS
// ==========================================
async function carregarTurmasNoSelect() {
    try {
        let response = await fetch(URL_TURMAS);
        if (!response.ok) throw new Error("Erro ao carregar turmas");

        const turmas = await response.json();
        popularSelect(turmas);

    } catch (error) {
        console.warn("Tentando IP alternativo para buscar turmas...");
        try {
            URL_TURMAS = `http://${IP_SERVIDOR}:5000/api/turmas`;
            let responseAlt = await fetch(URL_TURMAS);
            if (!responseAlt.ok) throw new Error("Erro no IP alternativo");
            
            const turmas = await responseAlt.json();
            popularSelect(turmas);
        } catch (err) {
            console.error("Não foi possível carregar as turmas existentes:", err);
        }
    }
}

// Limpa e popula dinamicamente as opções do Select
function popularSelect(turmas) {
    selectTurma.innerHTML = '<option value="" disabled selected>Selecione uma turma...</option>';
    
    if (turmas && turmas.length > 0) {
        turmas.forEach(turma => {
            const option = document.createElement("option");
            option.value = turma;
            option.textContent = turma;
            selectTurma.appendChild(option);
        });
    }
}

// ==========================================
// 1. READ (BUSCAR ALUNOS)
// ==========================================
async function carregarAlunos() {
    const msgErro = document.getElementById("msgErro");

    try {
        let response = await fetch(URL_API);
        if (!response.ok) throw new Error("Erro ao acessar API de Alunos");

        const alunos = await response.json();
        if (msgErro) msgErro.style.display = "none";
        renderizarTabela(alunos);

    } catch (error) {
        console.warn("Tentando IP alternativo para rota de alunos...");
        try {
            URL_API = `http://${IP_SERVIDOR_ALT}:5000/api/alunos`;
            let responseAlt = await fetch(URL_API);
            if (!responseAlt.ok) throw new Error("Erro no IP alternativo");
            
            const alunos = await responseAlt.json();
            if (msgErro) msgErro.style.display = "none";
            renderizarTabela(alunos);
        } catch (err) {
            console.error("Erro de conexão geral:", err);
            if (msgErro) {
                msgErro.style.display = "block";
                msgErro.innerHTML = `<p style="color: #dc3545; font-weight: bold; text-align: center;">Não foi possível conectar ao banco de dados.</p>`;
            }
        }
    }
}

function renderizarTabela(alunos) {
    tabelaCorpo.innerHTML = "";

    if (!alunos || alunos.length === 0) {
        tabelaCorpo.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #777;">Nenhum aluno cadastrado no banco de dados.</td></tr>`;
        return;
    }

    alunos.forEach(aluno => {
        const linha = document.createElement("tr");
        
        const id_aluno = aluno.Id || aluno.id || "";
        const nome_aluno = aluno.Nome || aluno.nome || "";
        const turma_aluno = aluno.Turma || aluno.turma || "";

        const alunoTratado = { id: id_aluno, nome: nome_aluno, turma: turma_aluno };
        const alunoJSON = JSON.stringify(alunoTratado).replace(/"/g, '&quot;');

        linha.innerHTML = `
            <td><strong>${id_aluno}</strong></td>
            <td>${nome_aluno}</td>
            <td>${turma_aluno}</td>
            <td class="actions-cell" style="text-align: center;">
                <button class="btn-edit" onclick="abrirModalEdicao(${alunoJSON})">Editar</button>
                <button class="btn-delete" onclick="excluirAluno('${id_aluno}')">Excluir</button>
            </td>
        `;
        tabelaCorpo.appendChild(linha);
    });
}

// ==========================================
// 2. CREATE & UPDATE (SALVAR / EDITAR ALUNO)
// ==========================================
async function salvarAluno(event) {
    event.preventDefault();
    
    const id = document.getElementById("alunoId").value;
    const alunoData = {
        nome: document.getElementById("alunoNome").value,
        turma: selectTurma.value // Pega o valor selecionado no <select>
    };

    try {
        let response;
        
        if (id && id !== "undefined" && id !== "") {
            response = await fetch(`${URL_API}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(alunoData)
            });
        } else {
            response = await fetch(URL_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(alunoData)
            });
        }

        if (response.ok) {
            fecharModal();
            carregarAlunos(); 
        } else {
            alert("O servidor recusou a gravação dos dados.");
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro de conexão: Verifique o seu servidor backend.");
    }
}

// ==========================================
// 3. DELETE (EXCLUIR ALUNO)
// ==========================================
async function excluirAluno(id) {
    if (confirm("Tem certeza que deseja excluir este aluno definitivamente?")) {
        try {
            const response = await fetch(`${URL_API}/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                carregarAlunos();
            } else {
                alert("Erro ao excluir o aluno do banco.");
            }
        } catch (error) {
            console.error("Erro ao deletar:", error);
        }
    }
}

// --- CONTROLE DOS MODAIS ---
function abrirModalCadastro() {
    document.getElementById("modalTitle").innerText = "Cadastrar Novo Aluno";
    document.getElementById("alunoId").value = ""; 
    studentForm.reset(); 
    carregarTurmasNoSelect(); // Recarrega as turmas para garantir que a lista esteja atualizada
    modal.style.display = "flex";
}

function abrirModalEdicao(aluno) {
    document.getElementById("modalTitle").innerText = "Editar Dados do Aluno";
    document.getElementById("alunoId").value = aluno.id;
    document.getElementById("alunoNome").value = aluno.nome;
    
    // Recarrega as turmas e marca a turma atual do aluno como selecionada no select
    carregarTurmasNoSelect().then(() => {
        selectTurma.value = aluno.turma;
    });
    
    modal.style.display = "flex";
}

function fecharModal() {
    modal.style.display = "none";
}

// --- BARRA DE PESQUISA (FILTRO LOCAL) ---
function filtrarTabela() {
    let input = document.getElementById("textInput");
    let filtro = input.value.toLowerCase().trim();
    let linhas = tabelaCorpo.getElementsByTagName("tr");

    for (let i = 0; i < linhas.length; i++) {
        let colunaNome = linhas[i].getElementsByTagName("td")[1];
        let colunaTurma = linhas[i].getElementsByTagName("td")[2];

        if (colunaNome || colunaTurma) {
            let textName = colunaNome.textContent || colunaNome.innerText;
            let textTurma = colunaTurma.textContent || colunaTurma.innerText;

            if (textName.toLowerCase().indexOf(filtro) > -1 || textTurma.toLowerCase().indexOf(filtro) > -1) {
                linhas[i].style.display = ""; 
            } else {
                linhas[i].style.display = "none"; 
            }
        }
    }
}