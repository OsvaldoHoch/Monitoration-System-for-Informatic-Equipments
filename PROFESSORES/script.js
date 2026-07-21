// URL da sua API de Professores
const API_URL = "http://MININT-CDV84OR.local:5000/api/professores"; 

const modal = document.getElementById("teacherModal");
const modalTitle = document.getElementById("modalTitle");
const form = document.getElementById("teacherForm");
const tabelaCorpo = document.getElementById("tabelaCorpo");

document.addEventListener("DOMContentLoaded", obterProfessores);

async function obterProfessores() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Erro ao buscar dados.");
        const professores = await response.json();
        renderizarTabela(professores);
    } catch (error) {
        tabelaCorpo.innerHTML = `<tr><td colspan="3" style="text-align: center; color: red;">Erro ao carregar dados.</td></tr>`;
    }
}

function renderizarTabela(professores) {
    tabelaCorpo.innerHTML = "";
    
    if (!professores || professores.length === 0) {
        tabelaCorpo.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #777;">Nenhum professor.</td></tr>`;
        return;
    }

    professores.forEach((prof, index) => {
        // CORREÇÃO: Identifica se é objeto ou apenas string (nome)
        const isObj = typeof prof === 'object' && prof !== null;
        
        const id = isObj ? (prof.Id || prof.id || index + 1) : (index + 1);
        const nome = isObj ? (prof.Nome || prof.nome || "Sem Nome") : prof;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${id}</td>
            <td>${nome}</td>
            <td class="actions-cell" style="text-align: center;">
                <button class="btn-edit" onclick="abrirModalEdicao(${id}, '${nome}')">Editar</button>
                <button class="btn-delete" onclick="excluirProfessor(${id})">Excluir</button>
            </td>
        `;
        tabelaCorpo.appendChild(tr);
    });
}

function abrirModalCadastro() {
    modalTitle.textContent = "Cadastrar Novo Professor";
    form.reset();
    document.getElementById("professorId").value = "";
    modal.style.display = "flex";
}

function abrirModalEdicao(id, nome) {
    modalTitle.textContent = "Editar Professor";
    document.getElementById("professorId").value = id;
    document.getElementById("professorNome").value = nome;
    modal.style.display = "flex";
}

function fecharModal() {
    modal.style.display = "none";
}

async function salvarProfessor(event) {
    event.preventDefault();
    const id = document.getElementById("professorId").value;
    const nome = document.getElementById("professorNome").value;

    try {
        let response;
        if (id && id !== "undefined") {
            response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Id: parseInt(id), Nome: nome })
            });
        } else {
            response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Nome: nome })
            });
        }

        if (response.ok) {
            fecharModal();
            obterProfessores();
        } else {
            alert("Erro ao salvar. Verifique se a API está configurada corretamente.");
        }
    } catch (error) {
        alert("Erro de conexão.");
    }
}

async function excluirProfessor(id) {
    // Se o ID for inválido, bloqueia a execução
    if (!id || id === "undefined") {
        alert("ID inválido para exclusão.");
        return;
    }

    if (confirm("Tem certeza que deseja excluir?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (response.ok) {
                obterProfessores();
            } else {
                alert("Erro ao deletar o professor. Verifique se o servidor suporta DELETE.");
            }
        } catch (error) {
            console.error("Erro:", error);
        }
    }
}