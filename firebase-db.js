import { initializeApp } from "https://gstatic.com";
import { getDatabase, ref, set, onValue } from "https://gstatic.com";

const firebaseConfig = {
    apiKey: "AIzaSyBQJd24stdXcD3ngwrMXytuVtwHU05DOck",
    authDomain: "://firebaseapp.com",
    databaseURL: "https://firebaseio.com",
    projectId: "meu-sistema-52993",
    storageBucket: "meu-sistema-52993.firebasestorage.app",
    messagingSenderId: "25595083275",
    appId: "1:25595083275:web:224b2d964819148005e50e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Força a função de salvar a ficar global no navegador
window.salvarDadosNaNuvem = function(caminho, dados) {
    set(ref(db, caminho), dados);
};

// Sincroniza os materiais da nuvem garantindo compatibilidade com o script.js
onValue(ref(db, 'marmoraria_materiais'), (snapshot) => {
    const dados = snapshot.val();
    window.materiais = dados || [];
    if (typeof window.atualizarInterfaceMateriais === 'function') {
        window.atualizarInterfaceMateriais();
    }
});

onValue(ref(db, 'marmoraria_servicos'), (snapshot) => {
    const dados = snapshot.val();
    window.servicos = dados || [];
    if (typeof window.atualizarInterfaceServicos === 'function') {
        window.atualizarInterfaceServicos();
    }
});

onValue(ref(db, 'marmoraria_orcamentos'), (snapshot) => {
    const dados = snapshot.val();
    window.orcamentos = dados || [];
    if (typeof window.atualizarInterfaceOrcamentos === 'function') {
        window.atualizarInterfaceOrcamentos();
    }
});
