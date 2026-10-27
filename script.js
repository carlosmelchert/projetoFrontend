document.addEventListener('DOMContentLoaded', () => {

  const campoId = document.getElementById('id-input');
  const campoData = document.getElementById('data-input');

  if (campoId && campoData && !window.location.search.includes('id=')) {
    campoId.value = '#' + Math.floor(1000 + Math.random() * 9000);
    campoData.value = new Date().toLocaleDateString('pt-BR');
  }

  const inputTitulo = document.getElementById('titulo-input');
  const contadorTitulo = document.getElementById('contador-titulo');
  const inputConteudo = document.getElementById('conteudo-input');
  const contadorConteudo = document.getElementById('contador-conteudo');

  if (inputTitulo && contadorTitulo) {
    inputTitulo.addEventListener('input', () => {
      contadorTitulo.textContent = `${inputTitulo.value.length} / 50`;
    });
  }

  if (inputConteudo && contadorConteudo) {
    inputConteudo.addEventListener('input', () => {
      contadorConteudo.textContent = `${inputConteudo.value.length} / 1000`;
    });
  }

  const formularioCriar = document.querySelector('.formulario:not(#form-editar)');

  if (formularioCriar && document.querySelector('button[type="submit"]')) {
    formularioCriar.addEventListener('submit', (e) => {
      e.preventDefault();

      const checkboxesMarcadas = document.querySelectorAll('input[name="areas"]:checked');
      const areasSelecionadas = Array.from(checkboxesMarcadas).map(cb => cb.value);

      if (areasSelecionadas.length === 0) {
        alert('Por favor, selecione pelo menos uma área.');
        return;
      }

      const novaAtualizacao = {
        id: document.getElementById('id-input').value,
        titulo: document.getElementById('titulo-input').value,
        areas: areasSelecionadas,
        conteudo: document.getElementById('conteudo-input').value,
        data: document.getElementById('data-input').value
      };

      const atualizacoes = JSON.parse(localStorage.getItem('atualizacoes')) || [];
      atualizacoes.push(novaAtualizacao);
      localStorage.setItem('atualizacoes', JSON.stringify(atualizacoes));

      window.location.href = 'feed.html';
    });
  }

  const tabelaBody = document.querySelector('tbody');
  const filtroBusca = document.getElementById('filtro-busca');
  const filtroArea = document.getElementById('filtro-area');

  if (tabelaBody) {
    const renderizarTabela = () => {
      const atualizacoes = JSON.parse(localStorage.getItem('atualizacoes')) || [];
      const termo = filtroBusca ? filtroBusca.value.toLowerCase() : '';
      const areaSelec = filtroArea ? filtroArea.value : '';

      const filtradas = atualizacoes.filter(item => {
        const bateTexto = (item.id || '').toLowerCase().includes(termo) ||
                          (item.titulo || '').toLowerCase().includes(termo) ||
                          (item.data || '').includes(termo);

        const areasItem = Array.isArray(item.areas) ? item.areas : [item.area || '-'];
        const bateArea = areaSelec === '' || areasItem.includes(areaSelec);

        return bateTexto && bateArea;
      });

      if (filtradas.length > 0) {
        tabelaBody.innerHTML = '';
        filtradas.forEach(item => {
          const areasTexto = Array.isArray(item.areas) ? item.areas.join(', ') : (item.area || '-');
          const conteudoTexto = item.conteudo || '-';
          const previa = conteudoTexto.length > 35 ? conteudoTexto.substring(0, 35) + '...' : conteudoTexto;

          const linha = document.createElement('tr');
          linha.innerHTML = `
            <td>${item.id}</td>
            <td>${item.titulo}</td>
            <td>${previa}</td>
            <td>${areasTexto}</td>
            <td>${item.data}</td>
            <td class="coluna-acao">
              <a href="visualizar-atualizacao.html?id=${encodeURIComponent(item.id)}" class="btn-acessar">Acessar</a>
            </td>
          `;
          tabelaBody.appendChild(linha);
        });
      } else {
        tabelaBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #666;">Nenhuma atualização encontrada.</td></tr>`;
      }
    };

    if (filtroBusca) filtroBusca.addEventListener('input', renderizarTabela);
    if (filtroArea) filtroArea.addEventListener('change', renderizarTabela);
    renderizarTabela();
  }

  const btnExcluir = document.getElementById('btn-excluir');
  const btnEditarLink = document.getElementById('btn-editar-link');

  if (btnExcluir || btnEditarLink) {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    const atualizacoes = JSON.parse(localStorage.getItem('atualizacoes')) || [];
    const item = atualizacoes.find(i => i.id === idParam);

    if (item) {
      if (document.getElementById('id-input')) document.getElementById('id-input').value = item.id;
      if (document.getElementById('titulo-input')) document.getElementById('titulo-input').value = item.titulo;
      if (document.getElementById('area-input')) {
        document.getElementById('area-input').value = Array.isArray(item.areas) ? item.areas.join(', ') : (item.area || '-');
      }
      if (document.getElementById('conteudo-input')) document.getElementById('conteudo-input').value = item.conteudo;
      if (document.getElementById('data-input')) document.getElementById('data-input').value = item.data;

      if (btnEditarLink) {
        btnEditarLink.href = `editar-atualizacao.html?id=${encodeURIComponent(item.id)}`;
      }

      if (btnExcluir) {
        btnExcluir.addEventListener('click', () => {
          if (confirm('Tem certeza que deseja excluir esta atualização permanentemente?')) {
            const listaFiltrada = atualizacoes.filter(i => i.id !== idParam);
            localStorage.setItem('atualizacoes', JSON.stringify(listaFiltrada));
            window.location.href = 'feed.html';
          }
        });
      }
    }
  }

  const formEditar = document.getElementById('form-editar');

  if (formEditar) {
    const urlParams = new URLSearchParams(window.location.search);
    const idEdicao = urlParams.get('id');
    const atualizacoes = JSON.parse(localStorage.getItem('atualizacoes')) || [];
    const item = atualizacoes.find(i => i.id === idEdicao);

    if (item) {
      document.getElementById('id-input').value = item.id;
      document.getElementById('titulo-input').value = item.titulo;
      document.getElementById('conteudo-input').value = item.conteudo;
      document.getElementById('data-input').value = item.data;

      const areasItem = Array.isArray(item.areas) ? item.areas : [item.area];
      document.querySelectorAll('input[name="areas"]').forEach(cb => {
        cb.checked = areasItem.includes(cb.value);
      });

      if (contadorTitulo) contadorTitulo.textContent = `${item.titulo.length} / 50`;
      if (contadorConteudo) contadorConteudo.textContent = `${item.conteudo.length} / 1000`;
    }

    formEditar.addEventListener('submit', (e) => {
      e.preventDefault();

      const checkboxesMarcadas = document.querySelectorAll('input[name="areas"]:checked');
      const areasSelecionadas = Array.from(checkboxesMarcadas).map(cb => cb.value);

      if (areasSelecionadas.length === 0) {
        alert('Por favor, selecione pelo menos uma área.');
        return;
      }

      const indice = atualizacoes.findIndex(i => i.id === idEdicao);

      if (indice !== -1) {
        atualizacoes[indice].titulo = document.getElementById('titulo-input').value;
        atualizacoes[indice].areas = areasSelecionadas;
        atualizacoes[indice].conteudo = document.getElementById('conteudo-input').value;

        localStorage.setItem('atualizacoes', JSON.stringify(atualizacoes));
        window.location.href = 'feed.html';
      }
    });
  }

});