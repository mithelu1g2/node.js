document.addEventListener('DOMContentLoaded', function() {
    // Função genérica para carregar responsáveis no select
    function carregarResponsaveis(selectElementId, responsavelSelecionado = null) {
        fetch('/api/responsaveis')
            .then(response => response.json())
            .then(data => {
                const selectResponsavel = document.getElementById(selectElementId);
                selectResponsavel.innerHTML = ''; // Limpar o conteúdo atual do select

                if (data.success && data.responsaveis.length > 0) {
                    data.responsaveis.forEach(responsavel => {
                        const option = document.createElement('option');
                        option.value = responsavel.id;  // Usamos o ID como valor
                        option.textContent = responsavel.nome;

                        // Pré-selecionar o responsável se necessário (edição)
                        if (responsavelSelecionado && responsavel.id === responsavelSelecionado) {
                            option.selected = true;
                        }
                        selectResponsavel.appendChild(option);
                    });
                } else {
                    const option = document.createElement('option');
                    option.value = "";
                    option.textContent = "Nenhum responsável disponível";
                    selectResponsavel.appendChild(option);
                }
            })
            .catch(error => {
                console.error('Erro ao buscar responsáveis:', error);
                const selectResponsavel = document.getElementById(selectElementId);
                selectResponsavel.innerHTML = '<option value="">Erro ao carregar responsáveis</option>';
            });
    }

    // Fazer a requisição para obter as tarefas
    fetch('/api/tarefas')
        .then(response => response.json())
        .then(data => {
            const tabelaTarefas = document.querySelector('#tabelaTarefas tbody');
            tabelaTarefas.innerHTML = ''; // Limpar o conteúdo atual da tabela

            if (data.success && data.tarefas.length > 0) {
                data.tarefas.forEach(tarefa => {
                    const row = document.createElement('tr');

                    const nomeTarefa = document.createElement('td');
                    nomeTarefa.textContent = tarefa.nome;
                    row.appendChild(nomeTarefa);

                    const descricaoTarefa = document.createElement('td');
                    descricaoTarefa.textContent = tarefa.descricao;
                    row.appendChild(descricaoTarefa);

                    const dataEntrega = document.createElement('td');
                    dataEntrega.textContent = tarefa.data_entrega;
                    row.appendChild(dataEntrega);

                    const responsavel = document.createElement('td');
                    responsavel.textContent = tarefa.responsavel;
                    row.appendChild(responsavel);

                    const statusTarefa = document.createElement('td');
                    statusTarefa.textContent = tarefa.status === 'completa' ? 'Concluída' : 'Incompleta';
                    row.appendChild(statusTarefa);

                    // Botão para editar a tarefa
                    const acoesTd = document.createElement('td');
                    const editarBtn = document.createElement('button');
                    editarBtn.textContent = 'Editar';
                    editarBtn.addEventListener('click', () => {
                        abrirFormularioEdicao(tarefa);
                    });
                    acoesTd.appendChild(editarBtn);

                    // Botão para deletar a tarefa
                    const deletarBtn = document.createElement('button');
                    deletarBtn.textContent = 'Deletar';
                    deletarBtn.addEventListener('click', () => {
                        deletarTarefa(tarefa.id);
                    });
                    acoesTd.appendChild(deletarBtn);

                    row.appendChild(acoesTd);
                    tabelaTarefas.appendChild(row);
                });
            } else {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 6;
                cell.textContent = "Nenhuma tarefa encontrada.";
                row.appendChild(cell);
                tabelaTarefas.appendChild(row);
            }
        })
        .catch(error => {
            console.error('Erro ao buscar tarefas:', error);
            const tabelaTarefas = document.querySelector('#tabelaTarefas tbody');
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.textContent = "Erro ao carregar as tarefas.";
            row.appendChild(cell);
            tabelaTarefas.appendChild(row);
        });

    // Função para abrir o formulário de edição com os dados da tarefa
    function abrirFormularioEdicao(tarefa) {
        document.getElementById('tarefaId').value = tarefa.id;
        document.getElementById('editarNome').value = tarefa.nome;
        document.getElementById('editarDescricao').value = tarefa.descricao;
        document.getElementById('editarDataEntrega').value = tarefa.data_entrega;

        // Carregar os responsáveis e pré-selecionar o responsável da tarefa
        carregarResponsaveis('editarResponsavel', tarefa.responsavel_id); // Passamos o ID do responsável

        document.getElementById('editarStatus').value = tarefa.status;

        document.getElementById('formularioEdicao').style.display = 'block';
    }

    // Fechar formulário de edição
    document.getElementById('cancelarEdicao').addEventListener('click', () => {
        document.getElementById('formularioEdicao').style.display = 'none';
    });

    // Salvar as alterações da tarefa
    document.getElementById('formEditarTarefa').addEventListener('submit', function(e) {
        e.preventDefault();

        const id = document.getElementById('tarefaId').value;
        const nome = document.getElementById('editarNome').value;
        const descricao = document.getElementById('editarDescricao').value;
        const data_entrega = document.getElementById('editarDataEntrega').value;
        const responsavel_id = document.getElementById('editarResponsavel').value; // Pegamos o ID do select
        const status = document.getElementById('editarStatus').value;

        const tarefaAtualizada = { nome, descricao, data_entrega, responsavel_id, status };

        fetch(`/api/tarefas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarefaAtualizada)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Tarefa atualizada com sucesso!');
                document.getElementById('formularioEdicao').style.display = 'none';
                location.reload(); // Recarregar a página para atualizar a lista de tarefas
            } else {
                alert('Erro ao atualizar a tarefa.');
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar a tarefa:', error);
        });
    });

    // Função para deletar a tarefa
    function deletarTarefa(tarefaId) {
        if (confirm("Tem certeza que deseja deletar esta tarefa?")) {
            fetch(`/api/tarefas/${tarefaId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Tarefa deletada com sucesso!');
                    location.reload(); // Recarregar a página após deletar a tarefa
                } else {
                    alert('Erro ao deletar a tarefa.');
                }
            })
            .catch(error => {
                console.error('Erro ao deletar a tarefa:', error);
            });
        }
    }
})