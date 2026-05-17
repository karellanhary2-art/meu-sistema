// Sistema de Navegação e Módulos - Marmoraria Helena

// ===== Módulo Materiais =====
let materiais = [];
let proximoIdMaterial = 1;
window.materiais = materiais; // Compartilha com a nuvem

let sistemaProntoComDados = false;

function salvarNaNuvemSeDisponivel(caminho, dados) {
    if (typeof window.salvarDadosNaNuvem === 'function') {
        window.salvarDadosNaNuvem(caminho, dados);
    }
}

function salvarMateriais() {
    window.materiais = materiais;
    salvarNaNuvemSeDisponivel('marmoraria_materiais', materiais);
    salvarNaNuvemSeDisponivel('marmoraria_proximoIdMaterial', proximoIdMaterial);
}

function carregarMateriais() {
    if (Array.isArray(window.materiais)) {
        materiais = window.materiais;
        return true;
    }
    return false;
}

// ===== Módulo Serviços =====
let servicos = [];
let proximoIdServico = 1;
window.servicos = servicos; // Compartilha com a nuvem

function salvarServicos() {
    window.servicos = servicos;
    salvarNaNuvemSeDisponivel('marmoraria_servicos', servicos);
    salvarNaNuvemSeDisponivel('marmoraria_proximoIdServico', proximoIdServico);
}

function carregarServicos() {
    if (Array.isArray(window.servicos)) {
        servicos = window.servicos;
        return true;
    }
    return false;
}

// ===== Módulo Orçamentos =====
let orcamentos = [];
let proximoIdOrcamento = 1;
let orcamentoAtualId = null; 
window.orcamentos = orcamentos; // Compartilha com a nuvem

function salvarOrcamentos() {
    window.orcamentos = orcamentos;
    salvarNaNuvemSeDisponivel('marmoraria_orcamentos', orcamentos);
    salvarNaNuvemSeDisponivel('marmoraria_proximoIdOrcamento', proximoIdOrcamento);
    salvarNaNuvemSeDisponivel('marmoraria_orcamentoAtualId', orcamentoAtualId || 0);
}

function carregarOrcamentos() {
    if (Array.isArray(window.orcamentos)) {
        orcamentos = window.orcamentos;
        return true;
    }
    return false;
}

function novoOrcamento() {
    orcamentoAtualId = null;
    salvarOrcamentos();
}


// Variáveis globais para acesso pelas funções
var toolbarGlobal = null;
var containerGlobal = null;
var pecaCount = 0;
var cubaCount = 0;

// Funções globais para criação de elementos
function criarSeparadorGlobal() {
    var sep = document.createElement('div');
    sep.className = 'peca-separador';
    sep.innerHTML = '<span>Separador</span><button class="btn-remover-separador">&times;</button>';

    sep.querySelector('.btn-remover-separador').addEventListener('click', function() {
        var nodesParaRemover = [sep];
        var atual = sep.nextSibling;

        // Find the next separator or main toolbar to determine what to remove
        while (atual && atual !== toolbarGlobal) {
            if (atual.classList.contains('peca-separador')) {
                break;
            }
            nodesParaRemover.push(atual);
            atual = atual.nextSibling;
        }

        nodesParaRemover.forEach(function(n) { n.remove(); });
        atualizarResumoOrcamento();
    });

    return sep;
}

function criarToolbarGrupoGlobal() {
    var grupoToolbar = document.createElement('div');
    grupoToolbar.className = 'pecas-toolbar';
    grupoToolbar.innerHTML = '<button class="btn btn-primary btn-adicionar-peca-grupo">Adicionar</button>';

    grupoToolbar.querySelector('.btn-adicionar-peca-grupo').addEventListener('click', function() {
        var peca = criarPecaHTML('', '', '', 1);

        // Find the next separator or main toolbar to insert before
        var proximoElemento = grupoToolbar.nextSibling;
        while (proximoElemento && !proximoElemento.classList.contains('peca-separador') && proximoElemento !== toolbarGlobal) {
            proximoElemento = proximoElemento.nextSibling;
        }

        containerGlobal.insertBefore(peca, proximoElemento || toolbarGlobal);

        setTimeout(function() {
            var el = document.querySelector('.main-content');
            if (el) el.scrollTop = el.scrollHeight;
        }, 50);
    });

    return grupoToolbar;
}

// Função global para calcular peças (movida para fora do DOMContentLoaded)
function calcularPecaGlobal(pecaDiv) {
    var comprimento = parseFloat(pecaDiv.querySelector('.peca-comprimento').value.replace(',', '.')) || 0;
    var largura = parseFloat(pecaDiv.querySelector('.peca-largura').value.replace(',', '.')) || 0;
    var quantidade = parseFloat(pecaDiv.querySelector('.peca-quantidade').value.replace(',', '.')) || 1;

    var valorUnitario = parseFloat(document.getElementById('orc-material-valor').value.replace(',', '.')) || 0;
    var valorCorte45 = getValorCorte45Global();

    var totalM2 = comprimento * largura * quantidade;
    var totalReais = totalM2 * valorUnitario;

    // Adicionar cálculos de Saia e Esp
    var checkSaiaComp = pecaDiv.querySelector('.peca-check-saia-comp').checked;
    var checkSaiaLarg = pecaDiv.querySelector('.peca-check-saia-larg').checked;
    var checkEspComp = pecaDiv.querySelector('.peca-check-esp-comp').checked;
    var checkEspLarg = pecaDiv.querySelector('.peca-check-esp-larg').checked;

    var adicionaisM2 = 0;
    var adicionaisReais = 0;

    if (checkSaiaComp) {
        var saiaCompValor = parseFloat(pecaDiv.querySelector('.peca-saia-comp-valor').value.replace(',', '.')) || 0;
        var saiaCompQtd = parseFloat(pecaDiv.querySelector('.peca-saia-comp-qtd').value.replace(',', '.')) || 1;
        var saiaCompEmMetros = saiaCompValor / 100;
        var m2SaiaComp = saiaCompEmMetros * comprimento * saiaCompQtd;
        adicionaisM2 += m2SaiaComp;
        adicionaisReais += (m2SaiaComp * valorUnitario) + (comprimento * valorCorte45 * saiaCompQtd);
    }

    if (checkSaiaLarg) {
        var saiaLargValor = parseFloat(pecaDiv.querySelector('.peca-saia-larg-valor').value.replace(',', '.')) || 0;
        var saiaLargQtd = parseFloat(pecaDiv.querySelector('.peca-saia-larg-qtd').value.replace(',', '.')) || 1;
        var saiaLargEmMetros = saiaLargValor / 100;
        var m2SaiaLarg = saiaLargEmMetros * largura * saiaLargQtd;
        adicionaisM2 += m2SaiaLarg;
        adicionaisReais += (m2SaiaLarg * valorUnitario) + (largura * valorCorte45 * saiaLargQtd);
    }

    if (checkEspComp) {
        var espCompValor = parseFloat(pecaDiv.querySelector('.peca-esp-comp-valor').value.replace(',', '.')) || 0;
        var espCompQtd = parseFloat(pecaDiv.querySelector('.peca-esp-comp-qtd').value.replace(',', '.')) || 1;
        var espCompEmMetros = espCompValor / 100;
        var m2EspComp = espCompEmMetros * comprimento * espCompQtd;
        adicionaisM2 += m2EspComp;
        adicionaisReais += m2EspComp * valorUnitario;
    }

    if (checkEspLarg) {
        var espLargValor = parseFloat(pecaDiv.querySelector('.peca-esp-larg-valor').value.replace(',', '.')) || 0;
        var espLargQtd = parseFloat(pecaDiv.querySelector('.peca-esp-larg-qtd').value.replace(',', '.')) || 1;
        var espLargEmMetros = espLargValor / 100;
        var m2EspLarg = espLargEmMetros * largura * espLargQtd;
        adicionaisM2 += m2EspLarg;
        adicionaisReais += m2EspLarg * valorUnitario;
    }

    totalM2 += adicionaisM2;
    totalReais += adicionaisReais;

    pecaDiv.querySelector('.peca-total-m2').textContent = totalM2.toFixed(2).replace('.', ',') + ' m²';
    pecaDiv.querySelector('.peca-total-reais').textContent = 'R$ ' + totalReais.toFixed(2).replace('.', ',');
}

// Função global para obter valor de corte 45°
function getValorCorte45Global() {
    var valor45 = 80;
    for (var i = 0; i < servicos.length; i++) {
        if (servicos[i].nome === 'Corte 45°') {
            valor45 = servicos[i].valor;
            break;
        }
    }
    return valor45;
}

// Função global para criar peças (movida para fora do DOMContentLoaded)
function criarPecaHTML(descricao, comprimento, largura, quantidade) {
    pecaCount++;
    var qtd = quantidade || 1;
    var div = document.createElement('div');
    div.className = 'peca-item';
    div.innerHTML =
        '<div class="form-group"><label>Descrição</label><input type="text" class="form-control peca-descricao" placeholder="Descrição" value="' + (descricao || '') + '"></div>' +
        '<div class="form-group"><label>Comprimento</label><input type="text" class="form-control peca-comprimento" placeholder="Comprimento" inputmode="decimal" value="' + (comprimento || '') + '"></div>' +
        '<div class="form-group"><label>Largura</label><input type="text" class="form-control peca-largura" placeholder="Largura" inputmode="decimal" value="' + (largura || '') + '"></div>' +
        '<div class="form-group" style="flex:0.6;"><label>Qtd</label><input type="text" class="form-control peca-quantidade" placeholder="1" inputmode="numeric" value="' + qtd + '"></div>' +
        '<div class="form-group" style="flex:0.8;"><label>M²</label><div class="peca-total-m2" style="padding: 6px 10px; background-color: #fff; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; display: flex; align-items: center;">0,00 m²</div></div>' +
        '<div class="form-group" style="flex:0.9;"><label>Valor</label><div class="peca-total-reais" style="padding: 6px 10px; background-color: #fff; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; display: flex; align-items: center;">R$ 0,00</div></div>' +
        '<button class="btn-remover-peca">&times;</button>' +
        '<div style="flex: 0; width: 100%; display: flex; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0; flex-wrap: wrap;">' +
        '<label style="flex: 1; min-width: 120px; display: flex; align-items: center; margin-bottom: 0; gap: 5px;"><input type="checkbox" class="peca-check-saia-comp"> Saia Comp</label>' +
        '<label style="flex: 1; min-width: 120px; display: flex; align-items: center; margin-bottom: 0; gap: 5px;"><input type="checkbox" class="peca-check-saia-larg"> Saia Larg</label>' +
        '<label style="flex: 1; min-width: 120px; display: flex; align-items: center; margin-bottom: 0; gap: 5px;"><input type="checkbox" class="peca-check-esp-comp"> Esp Comp</label>' +
        '<label style="flex: 1; min-width: 120px; display: flex; align-items: center; margin-bottom: 0; gap: 5px;"><input type="checkbox" class="peca-check-esp-larg"> Esp Larg</label>' +
        '</div>' +
        '<div class="peca-opcoes" style="flex: 0; width: 100%; display: flex; gap: 10px; margin-top: 10px; display: none; flex-wrap: wrap;">' +
        '<div class="peca-opcao-saia-comp" style="flex: 1; min-width: 250px; display: none;"><label>Saia Comp (cm)</label><div style="display: flex; gap: 5px;"><input type="text" class="form-control peca-saia-comp-valor" placeholder="cm" inputmode="decimal" style="flex: 1;"><input type="text" class="form-control peca-saia-comp-qtd" placeholder="Qtd" inputmode="numeric" value="1" style="width: 60px;"></div></div>' +
        '<div class="peca-opcao-saia-larg" style="flex: 1; min-width: 250px; display: none;"><label>Saia Larg (cm)</label><div style="display: flex; gap: 5px;"><input type="text" class="form-control peca-saia-larg-valor" placeholder="cm" inputmode="decimal" style="flex: 1;"><input type="text" class="form-control peca-saia-larg-qtd" placeholder="Qtd" inputmode="numeric" value="1" style="width: 60px;"></div></div>' +
        '<div class="peca-opcao-esp-comp" style="flex: 1; min-width: 250px; display: none;"><label>Esp Comp (cm)</label><div style="display: flex; gap: 5px;"><input type="text" class="form-control peca-esp-comp-valor" placeholder="cm" inputmode="decimal" style="flex: 1;"><input type="text" class="form-control peca-esp-comp-qtd" placeholder="Qtd" inputmode="numeric" value="1" style="width: 60px;"></div></div>' +
        '<div class="peca-opcao-esp-larg" style="flex: 1; min-width: 250px; display: none;"><label>Esp Larg (cm)</label><div style="display: flex; gap: 5px;"><input type="text" class="form-control peca-esp-larg-valor" placeholder="cm" inputmode="decimal" style="flex: 1;"><input type="text" class="form-control peca-esp-larg-qtd" placeholder="Qtd" inputmode="numeric" value="1" style="width: 60px;"></div></div>' +
        '</div>';

    div.querySelector('.btn-remover-peca').addEventListener('click', function() {
        div.remove();
        atualizarResumoOrcamento();
    });

    div.querySelector('.peca-comprimento').addEventListener('input', function() { calcularPecaGlobal(div); atualizarResumoOrcamento(); });
    div.querySelector('.peca-largura').addEventListener('input', function() { calcularPecaGlobal(div); atualizarResumoOrcamento(); });
    div.querySelector('.peca-quantidade').addEventListener('input', function() { calcularPecaGlobal(div); atualizarResumoOrcamento(); });

    var checkSaiaComp = div.querySelector('.peca-check-saia-comp');
    var checkSaiaLarg = div.querySelector('.peca-check-saia-larg');
    var checkEspComp = div.querySelector('.peca-check-esp-comp');
    var checkEspLarg = div.querySelector('.peca-check-esp-larg');
    var opcoes = div.querySelector('.peca-opcoes');

    function atualizarOpcoes() {
        div.querySelector('.peca-opcao-saia-comp').style.display = checkSaiaComp.checked ? 'block' : 'none';
        div.querySelector('.peca-opcao-saia-larg').style.display = checkSaiaLarg.checked ? 'block' : 'none';
        div.querySelector('.peca-opcao-esp-comp').style.display = checkEspComp.checked ? 'block' : 'none';
        div.querySelector('.peca-opcao-esp-larg').style.display = checkEspLarg.checked ? 'block' : 'none';
        opcoes.style.display = (checkSaiaComp.checked || checkSaiaLarg.checked || checkEspComp.checked || checkEspLarg.checked) ? 'flex' : 'none';
        calcularPecaGlobal(div);
        setTimeout(atualizarResumoOrcamento, 50);
    }

    checkSaiaComp.addEventListener('change', atualizarOpcoes);
    checkSaiaLarg.addEventListener('change', atualizarOpcoes);
    checkEspComp.addEventListener('change', atualizarOpcoes);
    checkEspLarg.addEventListener('change', atualizarOpcoes);

    div.querySelector('.peca-saia-comp-valor').addEventListener('input', function() { calcularPecaGlobal(div); setTimeout(atualizarResumoOrcamento, 50); });
    div.querySelector('.peca-saia-comp-qtd').addEventListener('input', function() { calcularPecaGlobal(div); setTimeout(atualizarResumoOrcamento, 50); });
    div.querySelector('.peca-saia-larg-valor').addEventListener('input', function() { calcularPecaGlobal(div); setTimeout(atualizarResumoOrcamento, 50); });
    div.querySelector('.peca-saia-larg-qtd').addEventListener('input', function() { calcularPecaGlobal(div); setTimeout(atualizarResumoOrcamento, 50); });
    div.querySelector('.peca-esp-comp-valor').addEventListener('input', function() { calcularPecaGlobal(div); setTimeout(atualizarResumoOrcamento, 50); });
    div.querySelector('.peca-esp-comp-qtd').addEventListener('input', function() { calcularPecaGlobal(div); setTimeout(atualizarResumoOrcamento, 50); });
    div.querySelector('.peca-esp-larg-valor').addEventListener('input', function() { calcularPecaGlobal(div); setTimeout(atualizarResumoOrcamento, 50); });
    div.querySelector('.peca-esp-larg-qtd').addEventListener('input', function() { calcularPecaGlobal(div); setTimeout(atualizarResumoOrcamento, 50); });

    return div;
}

// Função para resetar completamente o formulário de orçamento
function resetarFormularioOrcamento() {
    // Limpar campos de texto
    document.getElementById('orc-nome').value = '';
    document.getElementById('orc-celular').value = '';
    document.getElementById('orc-endereco').value = '';
    document.getElementById('orc-status').value = 'Orçamento';
    document.getElementById('orc-material').value = '';
    document.getElementById('orc-material-valor').value = '';
    document.getElementById('orc-cortes').value = '';
    document.getElementById('orc-cortes-valor').value = '';
    document.getElementById('orc-observacoes').value = '';

    // Remover todas as peças e cubas atuais e recriar o toolbar
    var pecasContainer = document.getElementById('pecas-container');
    if (pecasContainer) {
        while (pecasContainer.firstChild) {
            pecasContainer.removeChild(pecasContainer.firstChild);
        }

        // Recriar o toolbar com os botões
        var newToolbar = document.createElement('div');
        newToolbar.className = 'pecas-toolbar';
        newToolbar.innerHTML = '<button class="btn btn-primary btn-adicionar-peca">Adicionar</button><button class="btn btn-separador btn-inserir-separador">Separador</button>';

        // Adicionar event listeners aos botões do toolbar
        newToolbar.querySelector('.btn-adicionar-peca').addEventListener('click', function() {
            var peca = criarPecaHTML('', '', '', 1);
            pecasContainer.insertBefore(peca, newToolbar);
        });

        newToolbar.querySelector('.btn-inserir-separador').addEventListener('click', function() {
            var sep = criarSeparadorGlobal();
            var grupoToolbar = criarToolbarGrupoGlobal();
            pecasContainer.insertBefore(sep, newToolbar);
            pecasContainer.insertBefore(grupoToolbar, newToolbar);
        });

        pecasContainer.appendChild(newToolbar);

        // Atualizar as variáveis globais
        toolbarGlobal = newToolbar;
        containerGlobal = pecasContainer;
    }

    var cubasContainer = document.getElementById('cubas-container');
    if (cubasContainer) {
        cubasContainer.innerHTML = '';
    }

    // Resetar contadores
    pecaCount = 0;
    cubaCount = 0;

    // Atualizar o resumo para zeros
    document.getElementById('resumo-pecas').textContent = 'R$ 0,00';
    document.getElementById('resumo-cubas').textContent = 'R$ 0,00';
    document.getElementById('resumo-cortes').textContent = 'R$ 0,00';
    document.getElementById('resumo-subtotal').textContent = 'R$ 0,00';
    document.getElementById('resumo-taxa-cartao').textContent = 'R$ 0,00';
    document.getElementById('resumo-total').textContent = 'R$ 0,00';
    document.getElementById('resumo-cartao-container').style.display = 'none';

    // Resetar o botão de cartão para o estado padrão
    var btnToggleCartao = document.getElementById('btn-toggle-cartao');
    if (btnToggleCartao) {
        btnToggleCartao.classList.add('active');
        btnToggleCartao.textContent = '💳 Cartão (Ativo)';
        var cartaoTaxContainer = document.getElementById('cartao-tax-container');
        if (cartaoTaxContainer) {
            cartaoTaxContainer.style.display = 'flex';
            document.getElementById('cartao-taxa').value = '12';
        }
    }

    // Chamar novoOrcamento para resetar o ID
    novoOrcamento();
}

function fmt(valor) {
    return (!valor || valor === 0) ? '-' : 'R$ ' + valor.toFixed(2).replace('.', ',');
}

function fmtReal(valor) {
    if (!valor || valor === 0) return 'R$ 0,00';
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

function parseValorMonetario(valorText) {
    if (!valorText) return 0;
    var limpo = valorText.toString().replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.').trim();
    var numero = parseFloat(limpo);
    return isNaN(numero) ? 0 : numero;
}

function formatarDataHoraPequena(isoString) {
    if (!isoString) return '-';
    var d = new Date(isoString);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ===== Funções Materiais =====

function abrirModalMaterial(material) {
    document.getElementById('modal-titulo').textContent = material ? 'Editar Material' : 'Novo Material';
    document.getElementById('material-id').value = material ? material.id : '';
    document.getElementById('material-nome').value = material ? material.nome : '';
    document.getElementById('material-valor').value = (material && material.valor > 0) ? material.valor : '';
    document.getElementById('modal-material').style.display = 'flex';
    document.getElementById('material-nome').focus();
}

function fecharModalMaterial() {
    document.getElementById('modal-material').style.display = 'none';
}

function renderTabelaMateriais() {
    const tbody = document.getElementById('tabela-materiais-corpo');
    const vazio = document.getElementById('materiais-vazio');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (materiais.length === 0) { vazio.style.display = 'block'; return; }
    vazio.style.display = 'none';
    materiais.forEach(function(m) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + m.nome + '</td><td>' + fmt(m.valor) + '</td><td><button class="btn-editar" data-id="' + m.id + '" data-tipo="material">Editar</button> <button class="btn-excluir" data-id="' + m.id + '" data-tipo="material">Excluir</button></td>';
        tbody.appendChild(tr);
    });
    document.querySelectorAll('.btn-editar[data-tipo="material"]').forEach(function(b) {
        b.addEventListener('click', function() {
            var id = parseInt(this.getAttribute('data-id'));
            var mat = null;
            for (var i = 0; i < materiais.length; i++) { if (materiais[i].id === id) { mat = materiais[i]; break; } }
            if (mat) abrirModalMaterial(mat);
        });
    });
    document.querySelectorAll('.btn-excluir[data-tipo="material"]').forEach(function(b) {
        b.addEventListener('click', function() {
            var id = parseInt(this.getAttribute('data-id'));
            if (confirm('Excluir este material?')) {
                var novo = [];
                for (var i = 0; i < materiais.length; i++) { if (materiais[i].id !== id) novo.push(materiais[i]); }
                materiais = novo;
                salvarMateriais();
                renderTabelaMateriais();
            }
        });
    });
}

// ===== Funções Serviços =====

function abrirModalServico(servico) {
    document.getElementById('modal-titulo-servico').textContent = servico ? 'Editar Serviço' : 'Novo Serviço';
    document.getElementById('servico-id').value = servico ? servico.id : '';
    document.getElementById('servico-nome').value = servico ? servico.nome : '';
    document.getElementById('servico-valor').value = (servico && servico.valor > 0) ? servico.valor : '';
    document.getElementById('modal-servico').style.display = 'flex';
    document.getElementById('servico-nome').focus();
}

function fecharModalServico() {
    document.getElementById('modal-servico').style.display = 'none';
}

function renderTabelaServicos() {
    const tbody = document.getElementById('tabela-servicos-corpo');
    const vazio = document.getElementById('servicos-vazio');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (servicos.length === 0) { vazio.style.display = 'block'; return; }
    vazio.style.display = 'none';
    servicos.forEach(function(s) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + s.nome + '</td><td>' + fmt(s.valor) + '</td><td><button class="btn-editar" data-id="' + s.id + '" data-tipo="servico">Editar</button> <button class="btn-excluir" data-id="' + s.id + '" data-tipo="servico">Excluir</button></td>';
        tbody.appendChild(tr);
    });
    document.querySelectorAll('.btn-editar[data-tipo="servico"]').forEach(function(b) {
        b.addEventListener('click', function() {
            var id = parseInt(this.getAttribute('data-id'));
            var sv = null;
            for (var i = 0; i < servicos.length; i++) { if (servicos[i].id === id) { sv = servicos[i]; break; } }
            if (sv) abrirModalServico(sv);
        });
    });
    document.querySelectorAll('.btn-excluir[data-tipo="servico"]').forEach(function(b) {
        b.addEventListener('click', function() {
            var id = parseInt(this.getAttribute('data-id'));
            if (confirm('Excluir este serviço?')) {
                var novo = [];
                for (var i = 0; i < servicos.length; i++) { if (servicos[i].id !== id) novo.push(servicos[i]); }
                servicos = novo;
                salvarServicos();
                renderTabelaServicos();
            }
        });
    });
}

// ===== Popula select de materiais no orçamento =====
function popularSelectMateriais() {
    var select = document.getElementById('orc-material');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione...</option>';
    for (var i = 0; i < materiais.length; i++) {
        var opt = document.createElement('option');
        opt.value = materiais[i].id;
        opt.textContent = materiais[i].nome + ' - ' + fmt(materiais[i].valor);
        select.appendChild(opt);
    }
}

// ===== Inicialização =====

document.addEventListener('DOMContentLoaded', function() {

    // ===== NAVEGAÇÃO =====
    var navItems = document.querySelectorAll('.nav-item');
    var pages = document.querySelectorAll('.page');
    var shortcutCards = document.querySelectorAll('.shortcut-card');

    var anosVolume = [2025, 2026];
    var anosMinimizadosIndividual = {};

    function minimizarTodosAnos() {
        anosVolume.forEach(function(ano) {
            anosMinimizadosIndividual[ano] = true;
        });
    }

    function carregarAnosVolume() {
        var salvo = localStorage.getItem('marmoraria_volume_anos');
        if (salvo) {
            try {
                var arr = JSON.parse(salvo);
                if (Array.isArray(arr) && arr.length > 0) {
                    anosVolume = arr.map(function(a) { return parseInt(a); }).filter(function(a) { return !isNaN(a); });
                }
            } catch (e) {}
        }
        if (anosVolume.indexOf(2025) === -1) anosVolume.push(2025);
        if (anosVolume.indexOf(2026) === -1) anosVolume.push(2026);
        anosVolume.sort(function(a, b) { return a - b; });
    }

    function salvarAnosVolume() {
        localStorage.setItem('marmoraria_volume_anos', JSON.stringify(anosVolume));
    }

    function irPara(pagina) {
        navItems.forEach(function(i) { i.classList.remove('active'); });
        pages.forEach(function(p) { p.classList.remove('active'); });
        var nav = document.querySelector('.nav-item[data-page="' + pagina + '"]');
        if (nav) nav.classList.add('active');
        var pg = document.getElementById('pagina-' + pagina);
        if (pg) pg.classList.add('active');
    }

    navItems.forEach(function(item) {
        item.addEventListener('click', function() {
            var pagina = this.getAttribute('data-page');
            irPara(pagina);

            // Se for para a página de orçamento, sempre resetar o formulário
            if (pagina === 'orcamento') {
                resetarFormularioOrcamento();
            }

            // Se for para o histórico, renderizar os orçamentos já salvos
            if (pagina === 'historico') {
                renderTabelaOrcamentos();
            }

            if (pagina === 'volume') {
                minimizarTodosAnos();
                renderResumoVolume();
            }
        });
    });
    shortcutCards.forEach(function(card) {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            var pagina = this.getAttribute('data-navigate');
            irPara(pagina);

            // Se for para a página de orçamento, sempre resetar o formulário
            if (pagina === 'orcamento') {
                resetarFormularioOrcamento();
            }

            // Se for para o histórico, renderizar os orçamentos já salvos
            if (pagina === 'historico') {
                renderTabelaOrcamentos();
            }

            if (pagina === 'volume') {
                minimizarTodosAnos();
                renderResumoVolume();
            }
        });
    });

    carregarAnosVolume();

    const materiaisPadrao = [
        { id: 1, nome: 'Amarelo Icaraí', valor: 500 },
        { id: 2, nome: 'Andorinha', valor: 450 },
        { id: 3, nome: 'Bege Bahia', valor: 600 },
        { id: 4, nome: 'Branco Dallas', valor: 500 },
        { id: 5, nome: 'Branco Flameado', valor: 600 },
        { id: 6, nome: 'Branco Fortaleza', valor: 500 },
        { id: 7, nome: 'Branco Itaunas Escovado', valor: 650 },
        { id: 8, nome: 'Branco Itaúna', valor: 600 },
        { id: 9, nome: 'Branco Paraná', valor: 1500 },
        { id: 10, nome: 'Corumbá', valor: 400 },
        { id: 11, nome: 'Florença', valor: 600 },
        { id: 12, nome: 'Mármore Branco', valor: 500 },
        { id: 13, nome: 'Ocre', valor: 400 },
        { id: 14, nome: 'Ornamental', valor: 500 },
        { id: 15, nome: 'Preto Indiano', valor: 500 },
        { id: 16, nome: 'Preto São Gabriel', valor: 600 },
        { id: 17, nome: 'Preto São Gabriel Escovado', valor: 700 },
        { id: 18, nome: 'Preto Via Láctea', valor: 700 },
        { id: 19, nome: 'Quartzo', valor: 1000 },
        { id: 20, nome: 'Verde Ubatuba', valor: 450 }
    ];

    const servicosPadrao = [
        { id: 1, nome: 'Corte 45°', valor: 80 },
        { id: 2, nome: 'Corte', valor: 100 },
        { id: 3, nome: 'Cuba Oval', valor: 150 },
        { id: 4, nome: 'Cuba Inox 1 ou 2', valor: 300 },
        { id: 5, nome: 'Cuba Sobrepor', valor: 400 }
    ];

    function sincronizarDadosDoFirebaseERenderizar() {
        carregarMateriais();
        carregarServicos();
        carregarOrcamentos();

        if (!Array.isArray(materiais) || materiais.length === 0) {
            materiais = materiaisPadrao.slice();
            proximoIdMaterial = 21;
            salvarMateriais();
        } else {
            proximoIdMaterial = materiais.reduce(function(maxId, item) {
                return Math.max(maxId, Number(item.id) || 0);
            }, 0) + 1;
        }

        if (!Array.isArray(servicos) || servicos.length === 0) {
            servicos = servicosPadrao.slice();
            proximoIdServico = 6;
            salvarServicos();
        } else {
            proximoIdServico = servicos.reduce(function(maxId, item) {
                return Math.max(maxId, Number(item.id) || 0);
            }, 0) + 1;
        }

        if (!Array.isArray(orcamentos)) {
            orcamentos = [];
        }
        proximoIdOrcamento = orcamentos.reduce(function(maxId, item) {
            return Math.max(maxId, Number(item.id) || 0);
        }, 0) + 1;

        window.materiais = materiais;
        window.servicos = servicos;
        window.orcamentos = orcamentos;

        renderTabelaMateriais();
        renderTabelaServicos();
        popularSelectMateriais();
        popularSelectCortes();
        renderTabelaOrcamentos();
        renderResumoVolume();

        sistemaProntoComDados = true;
    }

    window.inicializarSistemaMarmoraria = function() {
        sincronizarDadosDoFirebaseERenderizar();
    };

    function inicializarAlteracaoSenha() {
        var btnAlterarSenha = document.getElementById('btn-alterar-senha');
        var inputNovaSenha = document.getElementById('nova-senha-sistema');
        var feedbackSenha = document.getElementById('config-senha-feedback');

        if (!btnAlterarSenha || !inputNovaSenha || !feedbackSenha) return;

        function salvarNovaSenha() {
            var novaSenha = (inputNovaSenha.value || '').trim();
            if (!novaSenha) {
                feedbackSenha.textContent = 'Digite uma nova senha válida.';
                feedbackSenha.style.color = '#c62828';
                return;
            }

            salvarNaNuvemSeDisponivel('marmoraria_config/senha', novaSenha);
            feedbackSenha.textContent = 'Senha alterada com sucesso!';
            feedbackSenha.style.color = '#2e7d32';
            inputNovaSenha.value = '';
        }

        btnAlterarSenha.addEventListener('click', salvarNovaSenha);
        inputNovaSenha.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') salvarNovaSenha();
        });
    }

    inicializarAlteracaoSenha();

    // Fallback para garantir funcionamento mesmo sem callback do Firebase
    setTimeout(function() {
        if (!sistemaProntoComDados) {
            sincronizarDadosDoFirebaseERenderizar();
        }
    }, 500);

    document.getElementById('btn-adicionar-material').addEventListener('click', function() { abrirModalMaterial(null); });
    document.querySelector('#modal-material .modal-close').addEventListener('click', fecharModalMaterial);
    document.getElementById('btn-cancelar-modal').addEventListener('click', fecharModalMaterial);
    document.getElementById('btn-salvar-material').addEventListener('click', function() {
        if (!sistemaProntoComDados) { alert('Aguarde o carregamento dos dados da nuvem.'); return; }
        var idHidden = document.getElementById('material-id');
        var nome = document.getElementById('material-nome').value.trim();
        var valorStr = document.getElementById('material-valor').value.replace(',', '.');
        if (!nome) { alert('Preencha o nome.'); return; }
        if (!valorStr) { alert('Preencha o valor.'); return; }
        var valor = parseFloat(valorStr);
        if (isNaN(valor) || valor <= 0) { alert('Valor inválido.'); return; }
        var existe = idHidden.value;
        if (existe) {
            var idNum = parseInt(existe);
            for (var i = 0; i < materiais.length; i++) { if (materiais[i].id === idNum) { materiais[i].nome = nome; materiais[i].valor = valor; break; } }
        } else {
            materiais.push({ id: proximoIdMaterial++, nome: nome, valor: valor });
        }
        salvarMateriais();
        popularSelectMateriais();
        fecharModalMaterial();
        renderTabelaMateriais();
        idHidden.value = ''; document.getElementById('material-nome').value = ''; document.getElementById('material-valor').value = '';
    });

    // ===== SERVIÇOS =====

    document.getElementById('btn-adicionar-servico').addEventListener('click', function() { abrirModalServico(null); });
    document.querySelector('#modal-servico .modal-close-servico').addEventListener('click', fecharModalServico);
    document.getElementById('btn-cancelar-modal-servico').addEventListener('click', fecharModalServico);
    document.getElementById('btn-salvar-servico').addEventListener('click', function() {
        if (!sistemaProntoComDados) { alert('Aguarde o carregamento dos dados da nuvem.'); return; }
        var idHidden = document.getElementById('servico-id');
        var nome = document.getElementById('servico-nome').value.trim();
        var valorStr = document.getElementById('servico-valor').value.replace(',', '.');
        if (!nome) { alert('Preencha o nome do serviço.'); return; }
        if (!valorStr) { alert('Preencha o valor.'); return; }
        var valor = parseFloat(valorStr);
        if (isNaN(valor) || valor <= 0) { alert('Valor inválido.'); return; }
        var existe = idHidden.value;
        if (existe) {
            var idNum = parseInt(existe);
            for (var i = 0; i < servicos.length; i++) { if (servicos[i].id === idNum) { servicos[i].nome = nome; servicos[i].valor = valor; break; } }
        } else {
            servicos.push({ id: proximoIdServico++, nome: nome, valor: valor });
        }
        salvarServicos();
        fecharModalServico();
        renderTabelaServicos();
        idHidden.value = ''; document.getElementById('servico-nome').value = ''; document.getElementById('servico-valor').value = '';
    });

    // ===== ORÇAMENTO - Select de Materiais =====

    document.getElementById('orc-material').addEventListener('change', function() {
        var selectedId = parseInt(this.value);
        var valorInput = document.getElementById('orc-material-valor');
        if (selectedId) {
            for (var i = 0; i < materiais.length; i++) {
                if (materiais[i].id === selectedId) {
                    valorInput.value = materiais[i].valor.toString().replace('.', ',');
                    break;
                }
            }
        } else {
            valorInput.value = '';
        }
        var pecas = document.querySelectorAll('.peca-item');
        pecas.forEach(function(peca) { calcularPecaGlobal(peca); });
        atualizarResumoOrcamento();
    });

    document.getElementById('orc-material-valor').addEventListener('input', function() {
        var pecas = document.querySelectorAll('.peca-item');
        pecas.forEach(function(peca) { calcularPecaGlobal(peca); });
        atualizarResumoOrcamento();
    });

    // ===== PEÇAS (METRAGEM) =====
    var pecaCount = 0;
    var toolbar;
    var cubaCount = 0;

    function popularSelectServicos() {
        var select = document.createElement('select');
        select.className = 'form-control cuba-servico';
        select.innerHTML = '<option value="">Selecione um serviço...</option>';

        for (var i = 0; i < servicos.length; i++) {
            var opt = document.createElement('option');
            opt.value = servicos[i].id;
            opt.textContent = servicos[i].nome + ' - ' + fmt(servicos[i].valor);
            select.appendChild(opt);
        }

        return select;
    }

    function calcularCuba(cubaDiv) {
        var servicoSelect = cubaDiv.querySelector('.cuba-servico');
        var quantidade = parseFloat(cubaDiv.querySelector('.cuba-quantidade').value.replace(',', '.')) || 1;

        var valorUnitario = 0;
        var servicoNome = '';

        if (servicoSelect.value) {
            var selectedId = parseInt(servicoSelect.value);
            for (var i = 0; i < servicos.length; i++) {
                if (servicos[i].id === selectedId) {
                    valorUnitario = servicos[i].valor;
                    servicoNome = servicos[i].nome;
                    break;
                }
            }
        }

        var total = valorUnitario * quantidade;

        cubaDiv.querySelector('.cuba-total').textContent = fmt(total);
        cubaDiv.querySelector('.cuba-servico-nome').textContent = servicoNome || 'Nenhum serviço selecionado';
    }

    function criarCubaHTML() {
        cubaCount++;
        var div = document.createElement('div');
        div.className = 'cuba-item';
        div.innerHTML =
            '<div class="form-group" style="flex: 2;">' +
            '<label>Serviço</label>' +
            '<div class="cuba-servico-container"></div>' +
            '</div>' +
            '<div class="form-group" style="flex: 0.8;">' +
            '<label>Quantidade</label>' +
            '<input type="text" class="form-control cuba-quantidade" placeholder="1" inputmode="numeric" value="1">' +
            '</div>' +
            '<div class="form-group" style="flex: 1;">' +
            '<label>Total</label>' +
            '<div class="cuba-total">R$ 0,00</div>' +
            '</div>' +
            '<button class="btn-remover-cuba">&times;</button>' +
            '<div style="flex: 1; padding: 6px 10px; background-color: #fff; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; display: flex; align-items: center;">' +
            '<span class="cuba-servico-nome">Nenhum serviço selecionado</span>' +
            '</div>';

        // Adicionar o select de serviços
        var servicoContainer = div.querySelector('.cuba-servico-container');
        var servicoSelect = popularSelectServicos();
        servicoContainer.appendChild(servicoSelect);

        div.querySelector('.btn-remover-cuba').addEventListener('click', function() {
            div.remove();
            atualizarResumoOrcamento();
        });

        servicoSelect.addEventListener('change', function() {
            calcularCuba(div);
            atualizarResumoOrcamento();
        });

        div.querySelector('.cuba-quantidade').addEventListener('input', function() {
            calcularCuba(div);
            atualizarResumoOrcamento();
        });

        // Calcular inicialmente
        calcularCuba(div);

        return div;
    }

    function getValorCorte45() {
        var valor45 = 80;
        for (var i = 0; i < servicos.length; i++) {
            if (servicos[i].nome === 'Corte 45°') {
                valor45 = servicos[i].valor;
                break;
            }
        }
        return valor45;
    }

    function calcularPeca(pecaDiv) {
        var comprimento = parseFloat(pecaDiv.querySelector('.peca-comprimento').value.replace(',', '.')) || 0;
        var largura = parseFloat(pecaDiv.querySelector('.peca-largura').value.replace(',', '.')) || 0;
        var quantidade = parseFloat(pecaDiv.querySelector('.peca-quantidade').value.replace(',', '.')) || 1;

        var valorUnitario = parseFloat(document.getElementById('orc-material-valor').value.replace(',', '.')) || 0;
        var valorCorte45 = getValorCorte45();

        var totalM2 = comprimento * largura * quantidade;
        var totalReais = totalM2 * valorUnitario;

        // Adicionar cálculos de Saia e Esp
        var checkSaiaComp = pecaDiv.querySelector('.peca-check-saia-comp').checked;
        var checkSaiaLarg = pecaDiv.querySelector('.peca-check-saia-larg').checked;
        var checkEspComp = pecaDiv.querySelector('.peca-check-esp-comp').checked;
        var checkEspLarg = pecaDiv.querySelector('.peca-check-esp-larg').checked;

        var adicionaisM2 = 0;
        var adicionaisReais = 0;

        if (checkSaiaComp) {
            var saiaCompValor = parseFloat(pecaDiv.querySelector('.peca-saia-comp-valor').value.replace(',', '.')) || 0;
            var saiaCompQtd = parseFloat(pecaDiv.querySelector('.peca-saia-comp-qtd').value.replace(',', '.')) || 1;
            var saiaCompEmMetros = saiaCompValor / 100;
            var m2SaiaComp = saiaCompEmMetros * comprimento * saiaCompQtd;
            adicionaisM2 += m2SaiaComp;
            adicionaisReais += (m2SaiaComp * valorUnitario) + (comprimento * valorCorte45 * saiaCompQtd);
        }

        if (checkSaiaLarg) {
            var saiaLargValor = parseFloat(pecaDiv.querySelector('.peca-saia-larg-valor').value.replace(',', '.')) || 0;
            var saiaLargQtd = parseFloat(pecaDiv.querySelector('.peca-saia-larg-qtd').value.replace(',', '.')) || 1;
            var saiaLargEmMetros = saiaLargValor / 100;
            var m2SaiaLarg = saiaLargEmMetros * largura * saiaLargQtd;
            adicionaisM2 += m2SaiaLarg;
            adicionaisReais += (m2SaiaLarg * valorUnitario) + (largura * valorCorte45 * saiaLargQtd);
        }

        if (checkEspComp) {
            var espCompValor = parseFloat(pecaDiv.querySelector('.peca-esp-comp-valor').value.replace(',', '.')) || 0;
            var espCompQtd = parseFloat(pecaDiv.querySelector('.peca-esp-comp-qtd').value.replace(',', '.')) || 1;
            var espCompEmMetros = espCompValor / 100;
            var m2EspComp = espCompEmMetros * comprimento * espCompQtd;
            adicionaisM2 += m2EspComp;
            adicionaisReais += m2EspComp * valorUnitario;
        }

        if (checkEspLarg) {
            var espLargValor = parseFloat(pecaDiv.querySelector('.peca-esp-larg-valor').value.replace(',', '.')) || 0;
            var espLargQtd = parseFloat(pecaDiv.querySelector('.peca-esp-larg-qtd').value.replace(',', '.')) || 1;
            var espLargEmMetros = espLargValor / 100;
            var m2EspLarg = espLargEmMetros * largura * espLargQtd;
            adicionaisM2 += m2EspLarg;
            adicionaisReais += m2EspLarg * valorUnitario;
        }

        totalM2 += adicionaisM2;
        totalReais += adicionaisReais;

        pecaDiv.querySelector('.peca-total-m2').textContent = totalM2.toFixed(2).replace('.', ',') + ' m²';
        pecaDiv.querySelector('.peca-total-reais').textContent = 'R$ ' + totalReais.toFixed(2).replace('.', ',');
    }

    function criarSeparador() {
        var sep = document.createElement('div');
        sep.className = 'peca-separador';
        sep.innerHTML = '<span>Separador</span><button class="btn-remover-separador">&times;</button>';

        sep.querySelector('.btn-remover-separador').addEventListener('click', function() {
            var container = document.getElementById('pecas-container');
            var nodesParaRemover = [sep];
            var atual = sep.nextSibling;

            // Find the next separator or main toolbar to determine what to remove
            while (atual && atual !== toolbar) {
                if (atual.classList.contains('peca-separador')) {
                    break;
                }
                nodesParaRemover.push(atual);
                atual = atual.nextSibling;
            }

            nodesParaRemover.forEach(function(n) { n.remove(); });
            atualizarResumoOrcamento();
        });

        return sep;
    }

    function criarToolbarGrupo() {
        var grupoToolbar = document.createElement('div');
        grupoToolbar.className = 'pecas-toolbar';
        grupoToolbar.innerHTML = '<button class="btn btn-primary btn-adicionar-peca-grupo">Adicionar</button>';

        grupoToolbar.querySelector('.btn-adicionar-peca-grupo').addEventListener('click', function() {
            var peca = criarPecaHTML('', '', '', 1);

            // Find the next separator or main toolbar to insert before
            var proximoElemento = grupoToolbar.nextSibling;
            while (proximoElemento && !proximoElemento.classList.contains('peca-separador') && proximoElemento !== toolbar) {
                proximoElemento = proximoElemento.nextSibling;
            }

            container.insertBefore(peca, proximoElemento || toolbar);

            setTimeout(function() {
                var el = document.querySelector('.main-content');
                if (el) el.scrollTop = el.scrollHeight;
            }, 50);
        });

        return grupoToolbar;
    }

    var container = document.getElementById('pecas-container');
    if (container) {
        toolbar = document.createElement('div');
        toolbar.className = 'pecas-toolbar';
        toolbar.innerHTML = '<button class="btn btn-primary btn-adicionar-peca">Adicionar</button><button class="btn btn-separador btn-inserir-separador">Separador</button>';

        toolbar.querySelector('.btn-adicionar-peca').addEventListener('click', function() {
            var peca = criarPecaHTML('', '', '', 1);
            container.insertBefore(peca, toolbar);
            // Remover o scroll automático para não atrapalhar o usuário
            // setTimeout(function() {
            //     var el = document.querySelector('.main-content');
            //     if (el) el.scrollTop = el.scrollHeight;
            // }, 50);
        });

        toolbar.querySelector('.btn-inserir-separador').addEventListener('click', function() {
            var sep = criarSeparador();
            var grupoToolbar = criarToolbarGrupo();
            container.insertBefore(sep, toolbar);
            container.insertBefore(grupoToolbar, toolbar);
            // Remover o scroll automático para não atrapalhar o usuário
            // setTimeout(function() {
            //     var el = document.querySelector('.main-content');
            //     if (el) el.scrollTop = el.scrollHeight;
            // }, 50);
        });

        container.appendChild(toolbar);

        // Inicializar as variáveis globais
        toolbarGlobal = toolbar;
        containerGlobal = container;
    }

    // ===== CUBAS =====
    var cubasContainer = document.getElementById('cubas-container');
    if (cubasContainer) {
        document.querySelector('.btn-adicionar-cuba').addEventListener('click', function() {
            var cuba = criarCubaHTML();
            cubasContainer.appendChild(cuba);

            // Remover o scroll automático para não atrapalhar o usuário
            // setTimeout(function() {
            //     var el = document.querySelector('.main-content');
            //     if (el) el.scrollTop = el.scrollHeight;
            // }, 50);
        });
    }

    // ===== FORMA DE PAGAMENTO - CARTÃO =====
    var btnToggleCartao = document.getElementById('btn-toggle-cartao');
    var cartaoTaxContainer = document.getElementById('cartao-tax-container');
    var cartaoTaxaInput = document.getElementById('cartao-taxa');

    if (btnToggleCartao && cartaoTaxContainer) {
        btnToggleCartao.addEventListener('click', function() {
            btnToggleCartao.classList.toggle('active');

            if (btnToggleCartao.classList.contains('active')) {
                cartaoTaxContainer.style.display = 'flex';
                btnToggleCartao.textContent = '💳 Cartão (Ativo)';
            } else {
                cartaoTaxContainer.style.display = 'none';
                btnToggleCartao.textContent = '💳 Cartão';
            }

            // Atualizar o resumo do orçamento quando o cartão for ativado/desativado
            atualizarResumoOrcamento();
        });

        // Inicializar com o botão ativo por padrão
        btnToggleCartao.classList.add('active');
        cartaoTaxContainer.style.display = 'flex';
        btnToggleCartao.textContent = '💳 Cartão (Ativo)';

        // Permitir edição manual da taxa
        cartaoTaxaInput.addEventListener('input', function() {
            // Garantir que apenas números sejam inseridos
            this.value = this.value.replace(/[^0-9]/g, '');
            // Atualizar o resumo quando a taxa for alterada
            atualizarResumoOrcamento();
        });
    }

    // ===== CORTES =====
    function popularSelectCortes() {
        var select = document.getElementById('orc-cortes');
        if (select) {
            select.innerHTML = '<option value="">Selecione um serviço de corte...</option>';

            for (var i = 0; i < servicos.length; i++) {
                var opt = document.createElement('option');
                opt.value = servicos[i].id;
                opt.textContent = servicos[i].nome + ' - ' + fmt(servicos[i].valor);
                select.appendChild(opt);
            }

            select.addEventListener('change', function() {
                var selectedId = parseInt(this.value);
                var valorInput = document.getElementById('orc-cortes-valor');

                if (selectedId) {
                    for (var i = 0; i < servicos.length; i++) {
                        if (servicos[i].id === selectedId) {
                            valorInput.value = fmt(servicos[i].valor);
                            break;
                        }
                    }
                } else {
                    valorInput.value = '';
                }

                // Atualizar o resumo quando o corte for alterado
                atualizarResumoOrcamento();
            });
        }
    }

    // ===== RESUMO DO ORÇAMENTO =====
    function calcularTotalPecas() {
        var total = 0;
        var pecas = document.querySelectorAll('.peca-item');

        pecas.forEach(function(peca) {
            var totalReaisText = peca.querySelector('.peca-total-reais').textContent;
            var valor = parseFloat(totalReaisText.replace('R$ ', '').replace(',', '.')) || 0;
            total += valor;
        });

        return total;
    }

    function calcularTotalCubas() {
        var total = 0;
        var cubas = document.querySelectorAll('.cuba-item');

        cubas.forEach(function(cuba) {
            var totalText = cuba.querySelector('.cuba-total').textContent;
            var valor = parseFloat(totalText.replace('R$ ', '').replace(',', '.')) || 0;
            total += valor;
        });

        return total;
    }

    function calcularTotalCortes() {
        var valorText = document.getElementById('orc-cortes-valor').value;
        return parseFloat(valorText.replace('R$ ', '').replace(',', '.')) || 0;
    }

    function atualizarResumoOrcamento() {
        // Calcular totais individuais
        var totalPecas = calcularTotalPecas();
        var totalCubas = calcularTotalCubas();
        var totalCortes = calcularTotalCortes();

        // Atualizar os valores individuais no resumo
        document.getElementById('resumo-pecas').textContent = fmtReal(totalPecas);
        document.getElementById('resumo-cubas').textContent = fmtReal(totalCubas);
        document.getElementById('resumo-cortes').textContent = fmtReal(totalCortes);

        // Calcular subtotal
        var subtotal = totalPecas + totalCubas + totalCortes;
        document.getElementById('resumo-subtotal').textContent = fmtReal(subtotal);

        // Verificar se o cartão está ativo
        var cartaoAtivo = btnToggleCartao && btnToggleCartao.classList.contains('active');
        var taxaCartao = parseFloat(cartaoTaxaInput.value) || 12;
        var taxaValor = 0;

        if (cartaoAtivo && subtotal > 0) {
            taxaValor = subtotal * (taxaCartao / 100);
            document.getElementById('resumo-taxa-cartao').textContent = fmtReal(taxaValor);
            document.getElementById('resumo-cartao-container').style.display = 'flex';
        } else {
            document.getElementById('resumo-cartao-container').style.display = 'none';
        }

        // Calcular total final
        var totalFinal = subtotal + taxaValor;
        document.getElementById('resumo-total').textContent = fmtReal(totalFinal);
    }

    window.atualizarResumoOrcamento = atualizarResumoOrcamento;

    // Função para atualizar o resumo quando peças ou cubas são adicionadas/removidas
    function observarMudancasNoOrcamento() {
        // Observar mudanças nas peças
        var pecasContainer = document.getElementById('pecas-container');
        if (pecasContainer) {
            pecasContainer.addEventListener('DOMSubtreeModified', function() {
                atualizarResumoOrcamento();
            });
        }

        // Observar mudanças nas cubas
        var cubasContainer = document.getElementById('cubas-container');
        if (cubasContainer) {
            cubasContainer.addEventListener('DOMSubtreeModified', function() {
                atualizarResumoOrcamento();
            });
        }
    }

        // Inicializar as funções
        popularSelectCortes();
        observarMudancasNoOrcamento();

        // Carregamento e renderização inicial dos orçamentos agora ocorre em
        // `window.inicializarSistemaMarmoraria()` para sincronizar com Firebase.

        // Função para salvar orçamento
        function salvarOrcamento() {
            // Verificar se já existe um orçamento sendo editado
            var orcamentoExistente = null;
            if (orcamentoAtualId) {
                for (var i = 0; i < orcamentos.length; i++) {
                    if (orcamentos[i].id === orcamentoAtualId) {
                        orcamentoExistente = orcamentos[i];
                        break;
                    }
                }
            }

            // Coletar dados do orçamento
            var orcamento = {
                id: orcamentoAtualId || proximoIdOrcamento++,
                data: new Date().toISOString(),
                nome: document.getElementById('orc-nome').value || 'Cliente não especificado',
                celular: document.getElementById('orc-celular').value || 'Não informado',
                endereco: document.getElementById('orc-endereco').value || 'Não informado',
                status: document.getElementById('orc-status').value,
                material: document.getElementById('orc-material').selectedOptions[0]?.text || 'Material não selecionado',
                materialId: document.getElementById('orc-material').value,
                materialValor: document.getElementById('orc-material-valor').value,
                pecas: [],
                cubas: [],
                cortes: document.getElementById('orc-cortes').value,
                cortesValor: document.getElementById('orc-cortes-valor').value,
                observacoes: document.getElementById('orc-observacoes').value || 'Nenhuma observação',
                totalPecas: document.getElementById('resumo-pecas').textContent,
                totalCubas: document.getElementById('resumo-cubas').textContent,
                totalCortes: document.getElementById('resumo-cortes').textContent,
                subtotal: document.getElementById('resumo-subtotal').textContent,
                taxaCartao: document.getElementById('resumo-cartao-container').style.display === 'flex' ?
                            document.getElementById('resumo-taxa-cartao').textContent : 'R$ 0,00',
                totalFinal: document.getElementById('resumo-total').textContent
            };

            // Coletar peças
            var pecas = document.querySelectorAll('.peca-item');
            pecas.forEach(function(peca) {
                var pecaData = {
                    descricao: peca.querySelector('.peca-descricao').value || 'Peça sem descrição',
                    comprimento: peca.querySelector('.peca-comprimento').value || '0',
                    largura: peca.querySelector('.peca-largura').value || '0',
                    quantidade: peca.querySelector('.peca-quantidade').value || '1',
                    totalM2: peca.querySelector('.peca-total-m2').textContent,
                    totalReais: peca.querySelector('.peca-total-reais').textContent,
                    saiaComp: peca.querySelector('.peca-check-saia-comp').checked,
                    saiaCompValor: peca.querySelector('.peca-saia-comp-valor').value || '0',
                    saiaCompQtd: peca.querySelector('.peca-saia-comp-qtd').value || '1',
                    saiaLarg: peca.querySelector('.peca-check-saia-larg').checked,
                    saiaLargValor: peca.querySelector('.peca-saia-larg-valor').value || '0',
                    saiaLargQtd: peca.querySelector('.peca-saia-larg-qtd').value || '1',
                    espComp: peca.querySelector('.peca-check-esp-comp').checked,
                    espCompValor: peca.querySelector('.peca-esp-comp-valor').value || '0',
                    espCompQtd: peca.querySelector('.peca-esp-comp-qtd').value || '1',
                    espLarg: peca.querySelector('.peca-check-esp-larg').checked,
                    espLargValor: peca.querySelector('.peca-esp-larg-valor').value || '0',
                    espLargQtd: peca.querySelector('.peca-esp-larg-qtd').value || '1'
                };
                orcamento.pecas.push(pecaData);
            });

            // Coletar cubas
            var cubas = document.querySelectorAll('.cuba-item');
            cubas.forEach(function(cuba) {
                var cubaData = {
                    servico: cuba.querySelector('.cuba-servico').value || '',
                    servicoNome: cuba.querySelector('.cuba-servico-nome').textContent,
                    quantidade: cuba.querySelector('.cuba-quantidade').value || '1',
                    total: cuba.querySelector('.cuba-total').textContent
                };
                orcamento.cubas.push(cubaData);
            });

            // Se já existe um orçamento, atualizar. Senão, adicionar novo.
            if (orcamentoExistente) {
                // Atualizar o orçamento existente
                for (var i = 0; i < orcamentos.length; i++) {
                    if (orcamentos[i].id === orcamentoAtualId) {
                        orcamentos[i] = orcamento;
                        break;
                    }
                }
                alert('Orçamento atualizado com sucesso!');
            } else {
                // Adicionar novo orçamento
                orcamentos.push(orcamento);
                alert('Orçamento salvo com sucesso!');
            }

            salvarOrcamentos();
            renderTabelaOrcamentos();
        }

        // Adicionar botão de salvar
        var btnSalvarOrcamento = document.createElement('button');
        btnSalvarOrcamento.id = 'btn-salvar-orcamento';
        btnSalvarOrcamento.className = 'btn btn-primary';
        btnSalvarOrcamento.textContent = '💾 Salvar Orçamento';
        btnSalvarOrcamento.style.marginLeft = '10px';

        var btnGerarPDF = document.getElementById('btn-gerar-pdf');
        if (btnGerarPDF) {
            btnGerarPDF.parentNode.insertBefore(btnSalvarOrcamento, btnGerarPDF.nextSibling);
        }

        // Adicionar evento ao botão de salvar
        document.getElementById('btn-salvar-orcamento').addEventListener('click', salvarOrcamento);

        // Função para renderizar tabela de orçamentos no histórico
        function renderTabelaOrcamentos() {
            const tbody = document.getElementById('tabela-orcamentos-corpo');
            const vazio = document.getElementById('orcamentos-vazio');
            if (!tbody) return;

            tbody.innerHTML = '';
            if (orcamentos.length === 0) {
                if (vazio) vazio.style.display = 'block';
                return;
            }
            if (vazio) vazio.style.display = 'none';

            // Ordenar por data (mais recente primeiro)
            orcamentos.sort(function(a, b) {
                return new Date(b.data) - new Date(a.data);
            });

            orcamentos.forEach(function(orcamento) {
                var tr = document.createElement('tr');
                var dataFormatada = formatarDataHoraPequena(orcamento.data);

                tr.innerHTML = `
                    <td>${orcamento.nome}<span class="historico-data-salvamento">${dataFormatada}</span></td>
                    <td>${orcamento.material}</td>
                    <td>${orcamento.totalFinal}</td>
                    <td>${orcamento.status}</td>
                    <td>
                        <button class="btn-abrir-orcamento" data-id="${orcamento.id}">📋 Abrir</button>
                        <button class="btn-excluir-orcamento" data-id="${orcamento.id}">❌ Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Adicionar eventos aos botões
            document.querySelectorAll('.btn-abrir-orcamento').forEach(function(b) {
                b.addEventListener('click', function() {
                    var id = parseInt(this.getAttribute('data-id'));
                    abrirOrcamento(id);
                });
            });

            document.querySelectorAll('.btn-excluir-orcamento').forEach(function(b) {
                b.addEventListener('click', function() {
                    var id = parseInt(this.getAttribute('data-id'));
                    if (confirm('Excluir este orçamento?')) {
                        excluirOrcamento(id);
                    }
                });
            });
        }

        function criarResumoVazioMes() {
            return {
                total: 0,
                status: {
                    'Orçamento': 0,
                    'Cancelado': 0,
                    'Aprovado': 0
                }
            };
        }

        function getMapaResumoVolume() {
            var mapa = {};
            anosVolume.forEach(function(ano) {
                mapa[ano] = [];
                for (var i = 0; i < 12; i++) mapa[ano].push(criarResumoVazioMes());
            });

            orcamentos.forEach(function(orc) {
                if (!orc || !orc.data) return;
                var d = new Date(orc.data);
                if (isNaN(d.getTime())) return;
                var ano = d.getFullYear();
                var mes = d.getMonth();
                if (!mapa[ano]) return;

                var total = parseValorMonetario(orc.totalFinal);
                mapa[ano][mes].total += total;

                var st = (orc.status || '').trim();
                if (mapa[ano][mes].status[st] === undefined) mapa[ano][mes].status[st] = 0;
                mapa[ano][mes].status[st] += total;
            });

            return mapa;
        }

        function renderResumoVolume() {
            var container = document.getElementById('volume-anos-container');
            if (!container) return;

            var meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            var mapa = getMapaResumoVolume();

            container.innerHTML = '';
            anosVolume.forEach(function(ano) {
                var bloco = document.createElement('div');
                bloco.className = 'volume-ano-bloco';

                var titulo = document.createElement('div');
                titulo.className = 'volume-ano-titulo';
                titulo.innerHTML = '<span>Ano ' + ano + '</span>';

                var acoesAno = document.createElement('div');
                acoesAno.className = 'volume-ano-acoes';

                var btnToggleAno = document.createElement('button');
                btnToggleAno.className = 'btn-ano-toggle';
                btnToggleAno.title = 'Minimizar/Expandir este ano';
                var anoMinimizado = !!anosMinimizadosIndividual[ano];
                btnToggleAno.textContent = anoMinimizado ? '+' : '-';
                btnToggleAno.addEventListener('click', function() {
                    anosMinimizadosIndividual[ano] = !anosMinimizadosIndividual[ano];
                    renderResumoVolume();
                });

                var btnExcluirAno = document.createElement('button');
                btnExcluirAno.className = 'btn-ano-excluir';
                btnExcluirAno.title = 'Excluir ano';
                btnExcluirAno.textContent = 'X';
                btnExcluirAno.addEventListener('click', function() {
                    var confirma = confirm('Tem certeza que deseja excluir o ano ' + ano + '?');
                    if (!confirma) return;

                    anosVolume = anosVolume.filter(function(a) { return a !== ano; });
                    delete anosMinimizadosIndividual[ano];
                    salvarAnosVolume();
                    renderResumoVolume();
                });
                acoesAno.appendChild(btnToggleAno);
                acoesAno.appendChild(btnExcluirAno);
                titulo.appendChild(acoesAno);
                bloco.appendChild(titulo);

                var grid = document.createElement('div');
                grid.className = 'volume-meses-grid';

                for (var i = 0; i < 12; i++) {
                    var mesInfo = mapa[ano] && mapa[ano][i] ? mapa[ano][i] : criarResumoVazioMes();
                    var card = document.createElement('div');
                    card.className = 'volume-mes-card';
                    card.innerHTML =
                        '<div class="volume-mes-nome">' + meses[i] + '</div>' +
                        '<div class="volume-mes-total"><strong>Total:</strong> ' + fmtReal(mesInfo.total) + '</div>' +
                        '<div class="volume-status-list">' +
                            '<div>Orçamento: ' + fmtReal(mesInfo.status['Orçamento'] || 0) + '</div>' +
                            '<div>Cancelado: ' + fmtReal(mesInfo.status['Cancelado'] || 0) + '</div>' +
                            '<div>Aprovado: ' + fmtReal(mesInfo.status['Aprovado'] || 0) + '</div>' +
                        '</div>';
                    grid.appendChild(card);
                }

                bloco.appendChild(grid);

                if (anosMinimizadosIndividual[ano]) {
                    bloco.classList.add('minimizado');
                }

                container.appendChild(bloco);
            });
        }

        var btnAdicionarAno = document.getElementById('btn-adicionar-ano');
        if (btnAdicionarAno) {
            btnAdicionarAno.addEventListener('click', function() {
                var entrada = prompt('Digite o ano (ex: 2027):');
                if (!entrada) return;
                var ano = parseInt(entrada.trim());
                if (isNaN(ano) || ano < 1900 || ano > 9999) {
                    alert('Ano inválido.');
                    return;
                }
                if (anosVolume.indexOf(ano) !== -1) {
                    alert('Esse ano já está na lista.');
                    return;
                }
                anosVolume.push(ano);
                anosVolume.sort(function(a, b) { return a - b; });
                salvarAnosVolume();
                renderResumoVolume();
            });
        }

        minimizarTodosAnos();
        renderResumoVolume();

        // Função para abrir um orçamento salvo
        function abrirOrcamento(id) {
            var orcamento = null;
            for (var i = 0; i < orcamentos.length; i++) {
                if (orcamentos[i].id === id) {
                    orcamento = orcamentos[i];
                    break;
                }
            }

            if (!orcamento) {
                alert('Orçamento não encontrado!');
                return;
            }

            // Limpar campos atuais
            document.getElementById('orc-nome').value = '';
            document.getElementById('orc-celular').value = '';
            document.getElementById('orc-endereco').value = '';
            document.getElementById('orc-status').value = 'Orçamento';
            document.getElementById('orc-material').value = '';
            document.getElementById('orc-material-valor').value = '';
            document.getElementById('orc-cortes').value = '';
            document.getElementById('orc-cortes-valor').value = '';
            document.getElementById('orc-observacoes').value = '';

            // Remover todas as peças e cubas atuais e recriar o toolbar
            var pecasContainer = document.getElementById('pecas-container');
            if (pecasContainer) {
                while (pecasContainer.firstChild) {
                    pecasContainer.removeChild(pecasContainer.firstChild);
                }

                // Recriar o toolbar com os botões
                var newToolbar = document.createElement('div');
                newToolbar.className = 'pecas-toolbar';
                newToolbar.innerHTML = '<button class="btn btn-primary btn-adicionar-peca">Adicionar</button><button class="btn btn-separador btn-inserir-separador">Separador</button>';

                // Adicionar event listeners aos botões do toolbar
                newToolbar.querySelector('.btn-adicionar-peca').addEventListener('click', function() {
                    var peca = criarPecaHTML('', '', '', 1);
                    pecasContainer.insertBefore(peca, newToolbar);
                });

                newToolbar.querySelector('.btn-inserir-separador').addEventListener('click', function() {
                    var sep = criarSeparadorGlobal();
                    var grupoToolbar = criarToolbarGrupoGlobal();
                    pecasContainer.insertBefore(sep, newToolbar);
                    pecasContainer.insertBefore(grupoToolbar, newToolbar);
                });

                pecasContainer.appendChild(newToolbar);

                // Atualizar as variáveis globais
                toolbarGlobal = newToolbar;
                containerGlobal = pecasContainer;
            }

            var cubasContainer = document.getElementById('cubas-container');
            if (cubasContainer) {
                cubasContainer.innerHTML = '';
            }

            // Preencher os campos com os dados do orçamento
            document.getElementById('orc-nome').value = orcamento.nome;
            document.getElementById('orc-celular').value = orcamento.celular;
            document.getElementById('orc-endereco').value = orcamento.endereco;
            document.getElementById('orc-status').value = orcamento.status;
            document.getElementById('orc-material').value = orcamento.materialId;
            document.getElementById('orc-material-valor').value = orcamento.materialValor;
            document.getElementById('orc-cortes').value = orcamento.cortes;
            document.getElementById('orc-cortes-valor').value = orcamento.cortesValor;
            document.getElementById('orc-observacoes').value = orcamento.observacoes;

            // Adicionar peças
            orcamento.pecas.forEach(function(peca) {
                var pecaDiv = criarPecaHTML(
                    peca.descricao,
                    peca.comprimento,
                    peca.largura,
                    peca.quantidade
                );

                // Configurar os checkboxes e campos de Saia/Esp
                if (peca.saiaComp) {
                    pecaDiv.querySelector('.peca-check-saia-comp').checked = true;
                    pecaDiv.querySelector('.peca-saia-comp-valor').value = peca.saiaCompValor;
                    pecaDiv.querySelector('.peca-saia-comp-qtd').value = peca.saiaCompQtd;
                }
                if (peca.saiaLarg) {
                    pecaDiv.querySelector('.peca-check-saia-larg').checked = true;
                    pecaDiv.querySelector('.peca-saia-larg-valor').value = peca.saiaLargValor;
                    pecaDiv.querySelector('.peca-saia-larg-qtd').value = peca.saiaLargQtd;
                }
                if (peca.espComp) {
                    pecaDiv.querySelector('.peca-check-esp-comp').checked = true;
                    pecaDiv.querySelector('.peca-esp-comp-valor').value = peca.espCompValor;
                    pecaDiv.querySelector('.peca-esp-comp-qtd').value = peca.espCompQtd;
                }
                if (peca.espLarg) {
                    pecaDiv.querySelector('.peca-check-esp-larg').checked = true;
                    pecaDiv.querySelector('.peca-esp-larg-valor').value = peca.espLargValor;
                    pecaDiv.querySelector('.peca-esp-larg-qtd').value = peca.espLargQtd;
                }

                // Atualizar a exibição das opções
                var checkSaiaComp = pecaDiv.querySelector('.peca-check-saia-comp');
                var checkSaiaLarg = pecaDiv.querySelector('.peca-check-saia-larg');
                var checkEspComp = pecaDiv.querySelector('.peca-check-esp-comp');
                var checkEspLarg = pecaDiv.querySelector('.peca-check-esp-larg');
                var opcoes = pecaDiv.querySelector('.peca-opcoes');

                pecaDiv.querySelector('.peca-opcao-saia-comp').style.display = checkSaiaComp.checked ? 'block' : 'none';
                pecaDiv.querySelector('.peca-opcao-saia-larg').style.display = checkSaiaLarg.checked ? 'block' : 'none';
                pecaDiv.querySelector('.peca-opcao-esp-comp').style.display = checkEspComp.checked ? 'block' : 'none';
                pecaDiv.querySelector('.peca-opcao-esp-larg').style.display = checkEspLarg.checked ? 'block' : 'none';
                opcoes.style.display = (checkSaiaComp.checked || checkSaiaLarg.checked || checkEspComp.checked || checkEspLarg.checked) ? 'flex' : 'none';

                // Calcular a peça
                calcularPecaGlobal(pecaDiv);

                // Adicionar ao container
                container.insertBefore(pecaDiv, newToolbar);
            });

            // Adicionar cubas
            orcamento.cubas.forEach(function(cuba) {
                var cubaDiv = criarCubaHTML();
                cubaDiv.querySelector('.cuba-servico').value = cuba.servico;
                cubaDiv.querySelector('.cuba-quantidade').value = cuba.quantidade;

                // Atualizar o nome do serviço e calcular
                var servicoSelect = cubaDiv.querySelector('.cuba-servico');
                var event = new Event('change');
                servicoSelect.dispatchEvent(event);

                cubasContainer.appendChild(cubaDiv);
            });

            // Atualizar o resumo
            atualizarResumoOrcamento();

            // Definir o ID do orçamento atual (para permitir atualização)
            orcamentoAtualId = orcamento.id;
            salvarOrcamentos();

            // Ir para a página de orçamento
            irPara('orcamento');

            alert('Orçamento carregado com sucesso!');
        }

        // Função para excluir um orçamento
        function excluirOrcamento(id) {
            var novoArray = [];
            for (var i = 0; i < orcamentos.length; i++) {
                if (orcamentos[i].id !== id) {
                    novoArray.push(orcamentos[i]);
                }
            }
            orcamentos = novoArray;
            salvarOrcamentos();
            renderTabelaOrcamentos();
            alert('Orçamento excluído com sucesso!');
        }

        // Inicializar a tabela de histórico quando a página de histórico for carregada
        document.getElementById('pagina-historico').addEventListener('DOMNodeInserted', function() {
            renderTabelaOrcamentos();
        });

        // Função para gerar PDF
        document.getElementById('btn-gerar-pdf').addEventListener('click', function() {
        // Criar um novo documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Obter dados do orçamento
        const nomeCliente = document.getElementById('orc-nome').value || 'Cliente não especificado';
        const celular = document.getElementById('orc-celular').value || 'Não informado';
        const endereco = document.getElementById('orc-endereco').value || 'Não informado';
        const status = document.getElementById('orc-status').value;
        const material = document.getElementById('orc-material').selectedOptions[0]?.text || 'Material não selecionado';
        const observacoes = document.getElementById('orc-observacoes').value || 'Nenhuma observação';

        // Obter valores do resumo
        const pecasValor = document.getElementById('resumo-pecas').textContent;
        const cubasValor = document.getElementById('resumo-cubas').textContent;
        const cortesValor = document.getElementById('resumo-cortes').textContent;
        const subtotal = document.getElementById('resumo-subtotal').textContent;
        const taxaCartao = document.getElementById('resumo-cartao-container').style.display === 'flex' ?
                          document.getElementById('resumo-taxa-cartao').textContent : 'R$ 0,00';
        const totalFinal = document.getElementById('resumo-total').textContent;

        // Configurar fonte e estilos
        doc.setFont('helvetica');
        doc.setFontSize(10);

        // Cabeçalho
        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Marmoraria Helena', 105, 12, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Orçamento', 105, 17, { align: 'center' });

        // Data e hora
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const horaAtual = new Date().toLocaleTimeString('pt-BR');
        doc.setFontSize(10);
        doc.text(`Data: ${dataAtual} | Hora: ${horaAtual}`, 195, 25, { align: 'right' });

        // Informações do cliente
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Informações do Cliente', 15, 35);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        let yPos = 40;
        doc.text(`Nome: ${nomeCliente}`, 15, yPos);
        yPos += 5;
        doc.text(`Celular: ${celular}`, 15, yPos);
        yPos += 5;
        doc.text(`Endereço: ${endereco}`, 15, yPos);
        yPos += 5;
        doc.text(`Status: ${status}`, 15, yPos);
        yPos += 8;

        // Material selecionado
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Material Selecionado', 15, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(material, 15, yPos);
        yPos += 8;

        // Detalhes do orçamento
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Detalhes do Orçamento', 15, yPos);
        yPos += 5;

        // Tabela de itens
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Cabeçalho da tabela
        doc.setFillColor(52, 152, 219);
        doc.rect(15, yPos, 180, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('Item', 20, yPos + 4);
        doc.text('Valor', 175, yPos + 4, { align: 'right' });
        yPos += 6;

        // Itens do orçamento
        doc.setTextColor(0, 0, 0);
        const itens = [
            { nome: 'Peças (Metragem)', valor: pecasValor },
            { nome: 'Cubas', valor: cubasValor },
            { nome: 'Cortes', valor: cortesValor }
        ];

        itens.forEach(item => {
            doc.text(item.nome, 20, yPos + 4);
            doc.text(item.valor, 175, yPos + 4, { align: 'right' });
            yPos += 6;
        });

        // Adicionar detalhes de Saia/Esp das peças
        const pecas = document.querySelectorAll('.peca-item');
        pecas.forEach(function(peca, index) {
            const descricao = peca.querySelector('.peca-descricao').value || `Peça ${index + 1}`;
            const checkSaiaComp = peca.querySelector('.peca-check-saia-comp').checked;
            const checkSaiaLarg = peca.querySelector('.peca-check-saia-larg').checked;
            const checkEspComp = peca.querySelector('.peca-check-esp-comp').checked;
            const checkEspLarg = peca.querySelector('.peca-check-esp-larg').checked;

            const detalhes = [];
            if (checkSaiaComp) {
                const saiaCompValor = peca.querySelector('.peca-saia-comp-valor').value || '0';
                const saiaCompQtd = peca.querySelector('.peca-saia-comp-qtd').value || '1';
                detalhes.push(`Saia Comp: ${saiaCompValor}cm x ${saiaCompQtd}`);
            }
            if (checkSaiaLarg) {
                const saiaLargValor = peca.querySelector('.peca-saia-larg-valor').value || '0';
                const saiaLargQtd = peca.querySelector('.peca-saia-larg-qtd').value || '1';
                detalhes.push(`Saia Larg: ${saiaLargValor}cm x ${saiaLargQtd}`);
            }
            if (checkEspComp) {
                const espCompValor = peca.querySelector('.peca-esp-comp-valor').value || '0';
                const espCompQtd = peca.querySelector('.peca-esp-comp-qtd').value || '1';
                detalhes.push(`Esp Comp: ${espCompValor}cm x ${espCompQtd}`);
            }
            if (checkEspLarg) {
                const espLargValor = peca.querySelector('.peca-esp-larg-valor').value || '0';
                const espLargQtd = peca.querySelector('.peca-esp-larg-qtd').value || '1';
                detalhes.push(`Esp Larg: ${espLargValor}cm x ${espLargQtd}`);
            }

            if (detalhes.length > 0) {
                doc.text(`  ${descricao}: ${detalhes.join(', ')}`, 20, yPos + 4);
                yPos += 6;
            }
        });

        // Subtotal
        doc.setFont('helvetica', 'bold');
        doc.text('Subtotal:', 20, yPos + 4);
        doc.text(subtotal, 175, yPos + 4, { align: 'right' });
        yPos += 6;

        // Taxa de cartão (se aplicável)
        if (taxaCartao !== 'R$ 0,00') {
            doc.text('Taxa Cartão:', 20, yPos + 4);
            doc.text(taxaCartao, 175, yPos + 4, { align: 'right' });
            yPos += 6;
        }

        // Total final
        doc.setFillColor(231, 76, 60);
        doc.rect(15, yPos, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text('TOTAL FINAL:', 20, yPos + 6);
        doc.text(totalFinal, 175, yPos + 6, { align: 'right' });
        yPos += 15; // Aumentado de 10 para 15 para mais espaço

        // Observações
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Observações', 15, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Quebrar texto de observações em linhas
        const maxWidth = 180;
        const lines = doc.splitTextToSize(observacoes, maxWidth);
        doc.text(lines, 15, yPos + 5);
        yPos += (lines.length * 5) + 5;

        // Rodapé
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Marmoraria Helena - Sistema de Orçamentos', 105, 285, { align: 'center' });
        doc.text('Este é um documento gerado automaticamente', 105, 290, { align: 'center' });

        // Salvar o PDF
        const nomeArquivo = `Orcamento_${nomeCliente.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
        doc.save(nomeArquivo);
    });

    console.log('Sistema inicializado!');
});
