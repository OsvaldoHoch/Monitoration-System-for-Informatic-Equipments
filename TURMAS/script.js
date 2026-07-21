    const IP_SERVIDOR_ALT = "192.168.137.102";
    const IP_SERVIDOR = "MININT-CDV84OR.local";
    const URL_API = `http://${IP_SERVIDOR}:5000/api/monitoramento/status`;

async function atualizarPainel() {

    const totalMaquinas = document.getElementById("totalMaquinas");
    const msgErro = document.getElementById("msgErro");
    const container = document.getElementById("turmasContainer");

    try{

        const response = await fetch(URL_API);

        if(!response.ok)
            throw new Error("Erro na API");

        const dados = await response.json();

        msgErro.style.display = "none";

        container.innerHTML = "";

        if(dados.length == 0){

            container.innerHTML = `
                <p>Nenhum computador conectado.</p>
            `;

            totalMaquinas.textContent = "0 Máquinas Ativas";

            return;

        }

        let online = 0;

        dados.forEach(maquina=>{

            if(maquina.Status.toLowerCase()=="online")
                online++;
            totalMaquinas.style.backgroundColor = "#28a745"; // Verde
            totalMaquinas.style.color = "white";

        });

        totalMaquinas.textContent =
            `${online} Online de ${dados.length} máquinas monitoradas`;

        criarTabelas(dados);

    }

    catch (error) {
            console.error("Erro ao buscar dados:", error);
            msgErro.style.display = "block";
            totalMaquinas.textContent = "Erro de conexão";
            totalMaquinas.style.backgroundColor = "#dc3545"; // Vermelho
            totalMaquinas.style.color = "white";
        }

}

function criarTabelas(dados){

    const container = document.getElementById("turmasContainer");

    container.innerHTML = "";

    const turmas = [...new Set(dados.map(x=>x.Turma))];

    turmas.sort();

    turmas.forEach(turma=>{

        const computadores =
            dados.filter(x=>x.Turma===turma);

        const card = document.createElement("div");

        card.className="cardTurma";

        let html=`

            <h3 class="table-title">${turma}</h3>

            <table class="tabela">

                <thead>

                    <tr>

                        <th>Computador</th>

                        <th>Professor</th>

                        <th>Aluno</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

        `;

        computadores.forEach(maquina=>{

            const classe =
                maquina.Status.toLowerCase()=="online"
                ? "online"
                : "offline";

            html+=`

                <tr>

                    <td><strong>${maquina.Hostname}</strong></td>

                    <td>${maquina.Professor}</td>

                    <td>${maquina.Aluno}</td>

                    <td>

                        <span class="badge ${classe}">

                            ${maquina.Status}

                        </span>

                    </td>

                </tr>

            `;

        }
    );

        html+=`

                </tbody>

            </table>

        `;

        card.innerHTML = html;

        container.appendChild(card);

    });

}

atualizarPainel();

setInterval(atualizarPainel,5000);




    // BARRA DE PESQUISA 
    function filtrarTabela(){
        // Transforma em letras minúsculas
        let input = document
            .getElementById("textInput");
        let filtro = input
            .value
            .toLowerCase()
            .trim();

        let tabela = document.getElementById("tabela");
        let linhas = tabela
            .getElementsByTagName("tbody")[0]
            .getElementsByTagName("tr");

        for(let i = 0; i < linhas.length; i++) {
            let colunaNome = linhas[i].getElementsByTagName("td")[0];
            let colunaCargo = linhas[i].getElementsByTagName("td")[1];

            if(colunaNome || colunaCargo) {
                let textName = colunaNome.textContent || colunaNome.innerText;
                let textCargo = colunaCargo.textContent || colunaCargo.innerText;

                if(textName.toLowerCase().indexOf(filtro) > -1 || textCargo.toLowerCase().indexOf(filtro) > -1) {
                    linhas[i].style.display=""; //Mostra a linha
                } else {
                    linhas[i].style.display = "none"; //Esconde a linha
                }
            }
        }
    }





// FILTROS ----------------------------------------------------------

function aplicarFiltros() {

    const filtroStatus = document
        .getElementById("filtroStatus")
        .value
        .toLowerCase();

    const filtroTurma = document
        .getElementById("filtroTurma")
        .value;

    const linhas = document.querySelectorAll("#tabelaCorpo tr");

    linhas.forEach(linha => {

        const status = linha.querySelector(".status")
            .textContent
            .trim()
            .toLowerCase();

        const turma = linha.cells[2]
            .textContent
            .trim();

        const passouStatus =
            filtroStatus === "todos" ||
            status === filtroStatus;

        const passouTurma =
            filtroTurma === "todas" ||
            turma === filtroTurma;

        if (passouStatus && passouTurma) {
            linha.style.display = "";
        } else {
            linha.style.display = "none";
        }

    });

}