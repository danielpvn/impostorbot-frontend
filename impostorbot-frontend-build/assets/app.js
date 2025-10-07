// Utils
const onlyDigits = (v = "") => String(v).replace(/\D/g, "");
const maskBRPhone = (v = "") => {
  const d = onlyDigits(v).slice(0, 11); // Aceita até 11 dígitos (2 DDD + 9 número)
  const len = d.length;
  if (len === 0) return "";
  if (len <= 2) return `(${d}`;
  if (len <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
};
const isValidBRPhone = (v = "") => onlyDigits(v).length === 11; // Valida 11 dígitos

// DOM refs
const nome = document.getElementById("nome");
const fone = document.getElementById("fone");
const foneStatus = document.getElementById("foneStatus");
const btnAdd = document.getElementById("btnAdd");
const btnClear = document.getElementById("btnClear");
const list = document.getElementById("list");
const count = document.getElementById("count");
const tema = document.getElementById("tema");
const btnStart = document.getElementById("btnStart");
document.getElementById("server").textContent = new URL(window.API_BASE).host;

let jogadores = [];

// Mask + status
fone.addEventListener("input", (e) => {
  e.target.value = maskBRPhone(e.target.value);
  if (isValidBRPhone(e.target.value)) {
    foneStatus.textContent = "✅ Número válido";
    foneStatus.style.color = "#059669"; // green-600
  } else if (e.target.value.length > 0) {
    foneStatus.textContent = "⚠️ Número incompleto";
    foneStatus.style.color = "#e11d48"; // rose-600
  } else {
    foneStatus.textContent = "";
  }
});

function renderList() {
  count.textContent = String(jogadores.length);
  if (jogadores.length === 0) {
    list.className = "list empty";
    list.textContent = "Nenhum jogador adicionado ainda.";
    return;
  }
  list.className = "list";
  list.innerHTML = "";
  jogadores.forEach((j, i) => {
    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = `<div><div>${j.nome}</div><div class="sub">+${j.numero}</div></div>`;
    const remove = document.createElement("button");
    remove.className = "remove";
    remove.textContent = "Remover";
    remove.onclick = () => { jogadores.splice(i,1); renderList(); };
    row.appendChild(remove);
    list.appendChild(row);
  });
}

btnAdd.onclick = async () => {
  const n = nome.value.trim();
  const d = onlyDigits(fone.value);
  if (!n || d.length !== 11) { alert("Preencha nome e número válidos."); return; }

  // Remove o dígito 9 antes de enviar ao backend
  const dWithoutNine = d.slice(0, 2) + d.slice(3);

  try {
    btnAdd.disabled = true;
    await fetch(`${window.API_BASE}/entrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: n, numero: `+55${dWithoutNine}` })
    });
    jogadores.unshift({ nome: n, numero: d });
    nome.value = ""; fone.value = ""; foneStatus.textContent = "";
    renderList();
  } catch (e) {
    alert("Falha ao adicionar jogador. Verifique a API.");
  } finally {
    btnAdd.disabled = false;
  }
};

btnClear.onclick = () => { jogadores = []; renderList(); };

btnStart.onclick = async () => {
  if (jogadores.length < 3) { alert("Adicione pelo menos 3 jogadores!"); return; }
  try {
    btnStart.disabled = true;
    const t = tema.value.trim();
    await fetch(`${window.API_BASE}/iniciar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tema: t || undefined })
    });
    alert("Rodada iniciada! As perguntas foram enviadas no WhatsApp.");
  } catch (e) {
    alert("Erro ao conectar com o servidor.");
  } finally {
    btnStart.disabled = false;
  }
};

// initial
renderList();
