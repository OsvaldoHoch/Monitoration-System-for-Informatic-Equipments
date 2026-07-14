// ⚠️ SUBSTITUA PELO IP REAL DO SEU COMPUTADOR SERVIDOR (O que você pegou no ipconfig)
    const IP_SERVIDOR = "172.30.0.119"; 
    const URL_API = `http://${IP_SERVIDOR}:5000/api/monitoramento/status`;

    async function atualizarPainel() {
        const tabelaCorpo = document.getElementById("tabelaCorpo");
        const totalMaquinas = document.getElementById("totalMaquinas");
        // const msgErro = document.getElementById("msgErro");

        try {
            const response = await fetch(URL_API);
            
            if (!response.ok) throw new Error("Erro na resposta da API");

            const dados = await response.json();
            
            // Oculta mensagem de erro se a conexão voltou a funcionar
            // msgErro.style.display = "none";

            // Se não houver computadores registrados no banco
            if (dados.length === 0) {
                A.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #777;">Nenhum notebook enviando sinal no momento.</td></tr>`;
                totalMaquinas.textContent = "0 Máquinas Ativas";
                return;
            }

            // Limpa a tabela para renderizar as novas linhas
            tabelaCorpo.innerHTML = "";
            let onlineCount = 0;

            dados.forEach(maquina => {
                const classeStatus = maquina.Status.toLowerCase() === "online" ? "online" : "offline";
                if(maquina.Status.toLowerCase() === "online") onlineCount++;

                totalMaquinas.style.backgroundColor = "#28a745"; // Verde
                totalMaquinas.style.color = "white";

                const linha = document.createElement("tr");
                linha.innerHTML = `
                    <td><strong>${maquina.Hostname}</strong></td>
                    <td>${maquina.Professor}</td>
                    <td>${maquina.Turma}</td>
                    <td>${maquina.Aluno}</td>
                    <td><span class="badge ${classeStatus}">${maquina.Status}</span></td>
                `;
                tabelaCorpo.appendChild(linha);
            });

            totalMaquinas.textContent = `${onlineCount} Online de ${dados.length} máquinas monitoradas`;

        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            msgErro.style.display = "block";
            totalMaquinas.textContent = "Erro de conexão";
            totalMaquinas.style.backgroundColor = "#dc3545"; // Vermelho
            totalMaquinas.style.color = "white";
        }
    }

    // Executa a função imediatamente ao abrir a página
    atualizarPainel();

    // Configura para rodar e atualizar de forma automática a cada 5 segundos (5000ms)
    setInterval(atualizarPainel, 5000);