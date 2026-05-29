/**
 * ================================================================
 * app.js — Product Manager
 * ================================================================
 * TASK 1 — Estructura y enlace
 * TASK 2 — Captura e interacción con el usuario
 * TASK 3 — Manipulación dinámica del DOM
 * TASK 4 — Persistencia en Local Storage
 * TASK 5 — Integración con Fetch API (JSON Server)
 * TASK 6 — Validaciones y pruebas finales
 * ================================================================
 */

// ================================================================
// TASK 1 — REFERENCIAS AL DOM
// Se capturan todos los elementos una sola vez al inicio.
// ================================================================

const inputName  = document.getElementById('input-name');
const inputPrice = document.getElementById('input-price');
const inputDesc  = document.getElementById('input-desc');
const btnAdd     = document.getElementById('btn-add');
const btnSync    = document.getElementById('btn-sync');
const productList = document.getElementById('product-list');
const statusMsg  = document.getElementById('status-msg');
const productCount = document.getElementById('product-count');
const footerStorage = document.getElementById('footer-storage');

// Modal de edición
const editModal   = document.getElementById('edit-modal');
const editName    = document.getElementById('edit-name');
const editPrice   = document.getElementById('edit-price');
const editDesc    = document.getElementById('edit-desc');
const btnSaveEdit = document.getElementById('btn-save-edit');
const btnCancelEdit = document.getElementById('btn-cancel-edit');

// ================================================================
// TASK 4 — ARREGLO GLOBAL Y CLAVE DE LOCAL STORAGE
// Todos los productos se guardan bajo la clave 'pm_products'.
// ================================================================

const STORAGE_KEY = 'pm_products';

/** Lee el arreglo de productos desde localStorage */
function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

/** Persiste el arreglo completo en localStorage */
function saveToStorage(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    updateFooter(products.length);
    console.log(`[LocalStorage] Guardados ${products.length} productos.`, products);
}

/** Actualiza el contador del footer */
function updateFooter(count) {
    footerStorage.textContent = `localStorage: ${count} items`;
}

// Arreglo en memoria sincronizado con localStorage
let products = loadFromStorage();

// ================================================================
// TASK 2 — VALIDACIÓN DE CAMPOS
// Retorna true si todos los campos son válidos.
// ================================================================

/**
 * Valida un campo individual.
 * @param {HTMLElement} input - elemento de entrada
 * @param {string} errorId    - id del span de error
 * @param {string} msg        - mensaje a mostrar si falla
 * @param {Function} rule     - función que retorna true si el valor es válido
 */
function validateField(input, errorId, msg, rule) {
    const errEl = document.getElementById(errorId);
    if (!rule(input.value)) {
        input.classList.add('error');
        errEl.textContent = msg;
        return false;
    }
    input.classList.remove('error');
    errEl.textContent = '';
    return true;
}

/** Ejecuta todas las validaciones y retorna true si el formulario es válido */
function validateForm() {
    const v1 = validateField(
        inputName, 'err-name',
        'El nombre no puede estar vacío.',
        v => v.trim().length > 0
    );
    const v2 = validateField(
        inputPrice, 'err-price',
        'Ingresa un precio mayor a 0.',
        v => !isNaN(v) && parseFloat(v) > 0
    );
    const v3 = validateField(
        inputDesc, 'err-desc',
        'La descripción no puede estar vacía.',
        v => v.trim().length > 0
    );
    return v1 && v2 && v3;
}

// ================================================================
// TASK 2 — MOSTRAR MENSAJES EN EL DOM
// ================================================================

let msgTimeout;

/**
 * Muestra un mensaje de estado en el panel del formulario.
 * @param {string} text - mensaje a mostrar
 * @param {'success'|'error'|'info'} type - tipo de estilo
 */
function showMessage(text, type = 'success') {
    clearTimeout(msgTimeout);
    statusMsg.textContent = text;
    statusMsg.className = `show msg-${type}`;
    console.log(`[Status ${type.toUpperCase()}] ${text}`);
    msgTimeout = setTimeout(() => {
        statusMsg.className = '';
    }, 3500);
}

// ================================================================
// TASK 3 — MANIPULACIÓN DINÁMICA DEL DOM
// Creación, renderizado y eliminación de elementos <li>.
// ================================================================

/**
 * Crea un elemento <li> para un producto.
 * Usa appendChild() para agregar los nodos internos.
 * @param {Object} product - { id, name, price, desc }
 * @returns {HTMLLIElement}
 */
function createListItem(product) {
    // Contenedor principal del ítem
    const li = document.createElement('li');
    li.dataset.id = product.id;

    // Bloque de información del producto
    const info = document.createElement('div');
    info.className = 'product-info';

    const nameEl = document.createElement('p');
    nameEl.className = 'product-name';
    nameEl.textContent = product.name;

    const priceEl = document.createElement('p');
    priceEl.className = 'product-price';
    priceEl.textContent = `$${parseFloat(product.price).toFixed(2)}`;

    const descEl = document.createElement('p');
    descEl.className = 'product-desc';
    descEl.textContent = product.desc;

    const idEl = document.createElement('p');
    idEl.className = 'product-id';
    idEl.textContent = `id: ${product.id}`;

    // Agregar nodos de info con appendChild()
    info.appendChild(nameEl);
    info.appendChild(priceEl);
    info.appendChild(descEl);
    info.appendChild(idEl);

    // Bloque de acciones (editar / eliminar)
    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = 'editar';
    editBtn.addEventListener('click', () => openEditModal(product.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'borrar';
    // TASK 3 — eliminar elemento al hacer clic
    deleteBtn.addEventListener('click', () => deleteProduct(product.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    // Ensamblar el <li>
    li.appendChild(info);
    li.appendChild(actions);

    return li;
}

/**
 * Renderiza todos los productos del arreglo en el DOM.
 * Limpia la lista antes de re-renderizar.
 */
function renderList() {
    // Limpiar lista actual
    productList.innerHTML = '';

    if (products.length === 0) {
        // Estado vacío
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `<span class="icon">◻</span><p>sin productos todavía.</p>`;
        productList.appendChild(empty);
    } else {
        // Agregar cada item con appendChild()
        products.forEach(product => {
            const li = createListItem(product);
            productList.appendChild(li);
        });
    }

    // Actualizar contador
    productCount.textContent = `${products.length} item${products.length !== 1 ? 's' : ''}`;
    console.log(`[DOM] Lista renderizada con ${products.length} productos.`);
}

// ================================================================
// TASK 3 & 4 — AGREGAR PRODUCTO
// ================================================================

/**
 * Genera un ID único basado en timestamp + random.
 */
function generateId() {
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Agrega un nuevo producto al arreglo, al DOM y al localStorage.
 */
function addProduct() {
    // TASK 2 — validar antes de procesar
    if (!validateForm()) {
        showMessage('Corrige los campos marcados.', 'error');
        return;
    }

    const newProduct = {
        id:    generateId(),
        name:  inputName.value.trim(),
        price: parseFloat(inputPrice.value),
        desc:  inputDesc.value.trim(),
    };

    // Agregar al arreglo global
    products.push(newProduct);

    // TASK 4 — persistir en localStorage
    saveToStorage(products);

    // TASK 3 — agregar al DOM
    renderList();

    // Limpiar formulario
    inputName.value  = '';
    inputPrice.value = '';
    inputDesc.value  = '';

    showMessage(`"${newProduct.name}" agregado correctamente.`, 'success');
    console.log('[ADD] Producto agregado:', newProduct);
}

// ================================================================
// TASK 3 & 4 — ELIMINAR PRODUCTO
// ================================================================

/**
 * Elimina un producto por su ID del arreglo, del DOM y del localStorage.
 * Usa removeChild() para quitar el nodo del DOM.
 * @param {string} id
 */
function deleteProduct(id) {
    // Buscar el nodo en el DOM
    const li = productList.querySelector(`[data-id="${id}"]`);

    // TASK 3 — removeChild() para quitar del DOM
    if (li) productList.removeChild(li);

    // Filtrar del arreglo global
    const removed = products.find(p => p.id === id);
    products = products.filter(p => p.id !== id);

    // TASK 4 — actualizar localStorage
    saveToStorage(products);

    // Re-renderizar para manejar estado vacío
    renderList();

    showMessage(`"${removed?.name}" eliminado.`, 'info');
    console.log('[DELETE] Producto eliminado, id:', id);
}

// ================================================================
// TASK 3 & 4 — EDITAR PRODUCTO (MODAL)
// ================================================================

let editingId = null;

/** Abre el modal con los datos del producto a editar */
function openEditModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingId        = id;
    editName.value   = product.name;
    editPrice.value  = product.price;
    editDesc.value   = product.desc;

    editModal.classList.remove('hidden');
    console.log('[EDIT] Abriendo modal para id:', id);
}

/** Guarda los cambios del modal */
function saveEdit() {
    const product = products.find(p => p.id === editingId);
    if (!product) return;

    product.name  = editName.value.trim()  || product.name;
    product.price = parseFloat(editPrice.value) || product.price;
    product.desc  = editDesc.value.trim()  || product.desc;

    // TASK 4 — persistir cambios
    saveToStorage(products);
    renderList();

    editModal.classList.add('hidden');
    showMessage(`"${product.name}" actualizado.`, 'success');
    console.log('[EDIT] Producto actualizado:', product);
    editingId = null;
}

// Listeners del modal
btnSaveEdit.addEventListener('click', saveEdit);
btnCancelEdit.addEventListener('click', () => {
    editModal.classList.add('hidden');
    editingId = null;
});
editModal.addEventListener('click', e => {
    if (e.target === editModal) {
        editModal.classList.add('hidden');
        editingId = null;
    }
});

// ================================================================
// TASK 5 — INTEGRACIÓN CON FETCH API
// Base URL de JSON Server (npm run server para iniciarlo).
// Operaciones: GET, POST, PUT, DELETE con async/await y try/catch.
// ================================================================

const API_URL = 'http://localhost:3000/products';

/**
 * GET — Obtiene todos los productos desde la API.
 * Reemplaza el estado local con los datos del servidor.
 */
async function getFromAPI() {
    try {
        console.log('[API GET] Solicitando productos...');
        const response = await fetch(API_URL);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        products = data;

        // TASK 4 — sincronizar localStorage con datos del servidor
        saveToStorage(products);
        renderList();

        showMessage(`${data.length} productos cargados desde la API.`, 'success');
        console.log('[API GET] Respuesta del servidor:', data);
    } catch (error) {
        showMessage('No se pudo conectar a la API. ¿Está corriendo JSON Server?', 'error');
        console.error('[API GET] Error:', error.message);
    }
}

/**
 * POST — Envía un producto nuevo al servidor.
 * @param {Object} product
 */
async function postToAPI(product) {
    try {
        console.log('[API POST] Enviando:', product);
        const response = await fetch(API_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(product),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const created = await response.json();
        console.log('[API POST] Creado en servidor:', created);
        return created;
    } catch (error) {
        console.error('[API POST] Error:', error.message);
    }
}

/**
 * PUT — Actualiza un producto existente en el servidor.
 * @param {Object} product
 */
async function putToAPI(product) {
    try {
        console.log('[API PUT] Actualizando:', product);
        const response = await fetch(`${API_URL}/${product.id}`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(product),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const updated = await response.json();
        console.log('[API PUT] Actualizado en servidor:', updated);
        return updated;
    } catch (error) {
        console.error('[API PUT] Error:', error.message);
    }
}

/**
 * DELETE — Elimina un producto del servidor.
 * @param {string} id
 */
async function deleteFromAPI(id) {
    try {
        console.log('[API DELETE] Eliminando id:', id);
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        console.log('[API DELETE] Eliminado del servidor, id:', id);
        return true;
    } catch (error) {
        console.error('[API DELETE] Error:', error.message);
        return false;
    }
}

/**
 * SYNC — Sincroniza el estado local con el servidor:
 *   1. Hace GET para traer los datos del servidor.
 *   2. Hace POST por cada producto local que no exista en el servidor.
 */
async function syncWithAPI() {
    btnSync.classList.add('syncing');
    showMessage('Sincronizando con la API...', 'info');

    try {
        // Paso 1: traer datos actuales del servidor
        console.log('[SYNC] Iniciando sincronización...');
        const response = await fetch(API_URL);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const serverData = await response.json();
        const serverIds  = serverData.map(p => p.id);
        console.log('[SYNC] IDs en servidor:', serverIds);

        // Paso 2: enviar productos locales que no existan en el servidor
        const toUpload = products.filter(p => !serverIds.includes(p.id));
        console.log(`[SYNC] ${toUpload.length} productos nuevos para subir.`);

        for (const product of toUpload) {
            await postToAPI(product);
        }

        // Paso 3: refrescar desde la API
        await getFromAPI();

        showMessage(`Sincronización completa. ${toUpload.length} productos subidos.`, 'success');
        console.log('[SYNC] Sincronización completada.');
    } catch (error) {
        showMessage('Error en la sincronización. ¿Está corriendo JSON Server?', 'error');
        console.error('[SYNC] Error:', error.message);
    } finally {
        btnSync.classList.remove('syncing');
    }
}

// ================================================================
// TASK 6 — CONECTAR TODOS LOS EVENTOS
// ================================================================

// Agregar producto al hacer clic en el botón
btnAdd.addEventListener('click', addProduct);

// Agregar producto al presionar Enter en cualquier campo
[inputName, inputPrice, inputDesc].forEach(el => {
    el.addEventListener('keydown', e => {
        if (e.key === 'Enter') addProduct();
    });
});

// Sincronizar con la API
btnSync.addEventListener('click', syncWithAPI);

// ================================================================
// TASK 4 & 6 — INICIALIZACIÓN
// Al cargar la página se recupera el estado del localStorage
// y se renderiza automáticamente.
// ================================================================

(function init() {
    console.log('[INIT] Cargando productos desde localStorage...');
    console.log('[INIT] Productos encontrados:', products);
    renderList();
    updateFooter(products.length);
    console.log('[INIT] Aplicación lista.');
    console.log('[HINT] Para usar la API, ejecuta: npx json-server --watch db.json --port 3000');
})();
