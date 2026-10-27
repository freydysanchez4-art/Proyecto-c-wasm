/**
 * Gestor de Contactos — Conexión WebAssembly con C
 * Universidad Nacional Casimiro Sotelo Montenegro (UNCSM)
 * Programación Estructurada
 */

'use strict';

let wasm = null;
let indiceEdicion = -1; // -1 indica modo agregar nuevo, >= 0 indica modo edición

// Referencias del DOM
const $ = (id) => document.getElementById(id);

// Función para imprimir en la consola virtual de C
function salidaC(texto, esError = false) {
    const consola = $('salida-c');
    if (!consola) return;
    
    const linea = document.createElement('div');
    linea.className = esError ? 'linea-consola error' : 'linea-consola';
    linea.textContent = (esError ? '[STDERR] ' : '') + texto;
    consola.appendChild(linea);
    consola.scrollTop = consola.scrollHeight;
}

// Mostrar notificación en la interfaz
function notificar(texto, tipo = 'info') {
    const el = $('mensaje');
    if (!el) return;
    el.textContent = texto;
    el.className = 'mensaje ' + tipo;
    
    if (tipo !== 'error') {
        setTimeout(() => {
            if (el.textContent === texto) {
                el.textContent = '';
                el.className = 'mensaje';
            }
        }, 4000);
    }
}

// Funciones envueltas para C (ccall / cwrap)
let cAgregar, cEditar, cEliminar, cBuscar, cTotal, cNombre, cTelefono, cCorreo, cVaciar, cInicializar;

function vincularFuncionesC() {
    cAgregar = wasm.cwrap('agregar_contacto', 'number', ['string', 'string', 'string']);
    cEditar = wasm.cwrap('editar_contacto', 'number', ['number', 'string', 'string', 'string']);
    cEliminar = wasm.cwrap('eliminar_contacto', 'number', ['number']);
    cBuscar = wasm.cwrap('buscar_contacto', 'number', ['string', 'number']);
    cTotal = wasm.cwrap('total_contactos', 'number', []);
    cNombre = wasm.cwrap('obtener_nombre', 'string', ['number']);
    cTelefono = wasm.cwrap('obtener_telefono', 'string', ['number']);
    cCorreo = wasm.cwrap('obtener_correo', 'string', ['number']);
    cVaciar = wasm.cwrap('vaciar_contactos', 'void', []);
    cInicializar = wasm.cwrap('inicializar_agenda', 'void', []);
}

// Renderizado de la lista de contactos
function renderizarContactos(filtro = '') {
    const lista = $('lista');
    const badgeTotal = $('badgeTotal');
    const barraProgreso = $('progresoAgenda');
    const textoProgreso = $('textoProgreso');
    if (!lista) return;

    lista.innerHTML = '';
    const total = cTotal ? cTotal() : 0;

    if (badgeTotal) badgeTotal.textContent = total;
    if (barraProgreso) barraProgreso.style.width = `${Math.min(100, (total / 100) * 100)}%`;
    if (textoProgreso) textoProgreso.textContent = `${total} / 100 contactos`;

    const textoFiltro = filtro.trim().toLowerCase();
    let mostrados = 0;

    for (let i = 0; i < total; i++) {
        const nom = cNombre(i);
        const tel = cTelefono(i);
        const cor = cCorreo(i);

        // Si hay filtro, verificar coincidencia
        if (textoFiltro) {
            const coincide = nom.toLowerCase().includes(textoFiltro) ||
                             tel.toLowerCase().includes(textoFiltro) ||
                             cor.toLowerCase().includes(textoFiltro);
            if (!coincide) continue;
        }

        mostrados++;

        const li = document.createElement('li');
        li.className = 'contacto-item';
        
        // Obtener iniciales para el avatar
        const iniciales = nom
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(p => p[0].toUpperCase())
            .join('') || '?';

        li.innerHTML = `
            <div class="contacto-avatar">${iniciales}</div>
            <div class="contacto-info">
                <div class="contacto-nombre">
                    <strong>${escaparHTML(nom)}</strong>
                    <span class="contacto-id">#${i + 1}</span>
                </div>
                <div class="contacto-detalles">
                    <span class="contacto-dato"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ${escaparHTML(tel || 'Sin teléfono')}</span>
                    <span class="contacto-dato"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> ${escaparHTML(cor || 'Sin correo')}</span>
                </div>
            </div>
            <div class="contacto-acciones">
                <button class="btn-icono btn-editar" title="Editar contacto" onclick="prepararEdicion(${i})">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icono btn-eliminar" title="Eliminar contacto" onclick="confirmarEliminar(${i})">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
            </div>
        `;
        lista.appendChild(li);
    }

    if (mostrados === 0) {
        lista.innerHTML = `
            <div class="estado-vacio">
                <div class="icono-vacio">📇</div>
                <h4>${total === 0 ? 'No hay contactos registrados' : 'No se encontraron resultados'}</h4>
                <p>${total === 0 ? 'Agrega tu primer contacto desde el formulario o usa datos de ejemplo.' : 'Intenta con otro término de búsqueda.'}</p>
            </div>
        `;
    }
}

// Guardar contacto (Agregar o Editar)
function guardarContacto() {
    if (!wasm) {
        notificar('El módulo WebAssembly aún está cargando...', 'error');
        return;
    }

    const nombre = $('nombre').value.trim();
    const telefono = $('telefono').value.trim();
    const correo = $('correo').value.trim();

    if (!nombre) {
        notificar('El nombre es obligatorio.', 'error');
        $('nombre').focus();
        return;
    }

    if (indiceEdicion >= 0) {
        // Modo edición
        const res = cEditar(indiceEdicion, nombre, telefono, correo);
        if (res === 0) {
            notificar(`Contacto #${indiceEdicion + 1} actualizado correctamente en C.`, 'exito');
            cancelarEdicion();
        } else {
            notificar(`Error al actualizar el contacto en C (código: ${res}).`, 'error');
        }
    } else {
        // Modo nuevo contacto
        const res = cAgregar(nombre, telefono, correo);
        if (res === 0) {
            notificar(`Contacto "${nombre}" guardado en la memoria de WebAssembly.`, 'exito');
            limpiarFormulario();
        } else if (res === -1) {
            notificar('La agenda está llena (límite de 100 contactos alcanzado).', 'error');
        } else {
            notificar(`No se pudo agregar el contacto (código: ${res}).`, 'error');
        }
    }

    renderizarContactos($('buscar') ? $('buscar').value : '');
}

// Cargar contacto al formulario para editar
window.prepararEdicion = function(indice) {
    if (indice < 0 || indice >= cTotal()) return;

    indiceEdicion = indice;
    $('tituloForm').textContent = `Editar contacto #${indice + 1}`;
    $('nombre').value = cNombre(indice);
    $('telefono').value = cTelefono(indice);
    $('correo').value = cCorreo(indice);

    $('btnGuardar').textContent = 'Guardar cambios';
    $('btnCancelar').hidden = false;
    $('nombre').focus();

    $('form-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Cancelar edición
function cancelarEdicion() {
    indiceEdicion = -1;
    $('tituloForm').textContent = 'Nuevo contacto';
    $('btnGuardar').textContent = 'Agregar contacto';
    $('btnCancelar').hidden = true;
    limpiarFormulario();
}

function limpiarFormulario() {
    $('nombre').value = '';
    $('telefono').value = '';
    $('correo').value = '';
}

// Eliminar contacto con confirmación
window.confirmarEliminar = function(indice) {
    const nombre = cNombre(indice);
    if (!confirm(`¿Deseas eliminar a "${nombre}" de la agenda? Esta acción la ejecuta C en memoria.`)) {
        return;
    }

    const res = cEliminar(indice);
    if (res === 0) {
        notificar(`Contacto "${nombre}" eliminado.`, 'info');
        if (indiceEdicion === indice) {
            cancelarEdicion();
        }
    } else {
        notificar('Error al eliminar el contacto en C.', 'error');
    }

    renderizarContactos($('buscar') ? $('buscar').value : '');
};

// Vaciar toda la agenda
function vaciarAgenda() {
    if (cTotal() === 0) {
        notificar('La agenda ya está vacía.', 'info');
        return;
    }

    if (!confirm('¿Estás seguro de que deseas vaciar todos los contactos de la memoria de C?')) {
        return;
    }

    cVaciar();
    cancelarEdicion();
    renderizarContactos();
    notificar('Agenda vaciada por completo en WebAssembly.', 'info');
}

// Cargar lote de datos de ejemplo (Demostración estudiantil)
function cargarEjemplos() {
    if (!wasm) return;

    const ejemplos = [
        { nombre: 'Ana Sofía Morales', tel: '8876-1234', cor: 'ana.morales@uncsm.edu.ni' },
        { nombre: 'Carlos Eduardo Ruiz', tel: '8455-9012', cor: 'carlos.ruiz@gmail.com' },
        { nombre: 'Valeria Patricia Gómez', tel: '7611-3456', cor: 'valeria.gomez@outlook.com' },
        { nombre: 'Ing. Iván Bonilla', tel: '8900-5544', cor: 'ivan.bonilla@uncsm.edu.ni' },
        { nombre: 'Marcos Antonio Silva', tel: '8223-7788', cor: 'marcos.silva@yahoo.com' }
    ];

    let agregados = 0;
    ejemplos.forEach(c => {
        if (cAgregar(c.nombre, c.tel, c.cor) === 0) {
            agregados++;
        }
    });

    notificar(`Se agregaron ${agregados} contactos de prueba a WebAssembly.`, 'exito');
    renderizarContactos();
}

// Exportar contactos a formato CSV
function exportarCSV() {
    const total = cTotal ? cTotal() : 0;
    if (total === 0) {
        notificar('No hay contactos para exportar.', 'error');
        return;
    }

    let csv = '\uFEFFNombre,Teléfono,Correo\n';
    for (let i = 0; i < total; i++) {
        const nom = `"${cNombre(i).replace(/"/g, '""')}"`;
        const tel = `"${cTelefono(i).replace(/"/g, '""')}"`;
        const cor = `"${cCorreo(i).replace(/"/g, '""')}"`;
        csv += `${nom},${tel},${cor}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contactos_uncsm_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notificar('Archivo CSV descargado.', 'exito');
}

// Escapar texto para inserción segura en el DOM
function escaparHTML(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// Inicialización de eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Botones del formulario
    $('btnGuardar').addEventListener('click', guardarContacto);
    $('btnCancelar').addEventListener('click', cancelarEdicion);

    // Enter en los inputs del formulario
    ['nombre', 'telefono', 'correo'].forEach(id => {
        const input = $(id);
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    guardarContacto();
                }
            });
        }
    });

    // Búsqueda en tiempo real
    const inputBuscar = $('buscar');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', (e) => {
            renderizarContactos(e.target.value);
        });
    }

    // Botones de acción general
    const btnEjemplos = $('btnEjemplos');
    if (btnEjemplos) btnEjemplos.addEventListener('click', cargarEjemplos);

    const btnVaciar = $('btnVaciar');
    if (btnVaciar) btnVaciar.addEventListener('click', vaciarAgenda);

    const btnExportar = $('btnExportar');
    if (btnExportar) btnExportar.addEventListener('click', exportarCSV);

    // Acciones de la consola
    const btnLimpiarConsola = $('btnLimpiarConsola');
    if (btnLimpiarConsola) {
        btnLimpiarConsola.addEventListener('click', () => {
            $('salida-c').innerHTML = '';
            salidaC('Consola limpiada. La memoria de WebAssembly permanece intacta.');
        });
    }

    const btnCopiarConsola = $('btnCopiarConsola');
    if (btnCopiarConsola) {
        btnCopiarConsola.addEventListener('click', async () => {
            const texto = $('salida-c').innerText;
            try {
                await navigator.clipboard.writeText(texto);
                notificar('Salida de la consola copiada al portapapeles.', 'exito');
            } catch (err) {
                notificar('No se pudo copiar automáticamente. Selecciona el texto manualmente.', 'error');
            }
        });
    }

    // Inicializar módulo WebAssembly con Emscripten
    if (typeof crearModulo === 'function') {
        $('wasm-status').textContent = 'Compilando y cargando WebAssembly...';
        $('wasm-status').className = 'status-badge cargando';

        crearModulo({
            print: function(texto) {
                salidaC(texto, false);
            },
            printErr: function(texto) {
                salidaC(texto, true);
            }
        }).then(modulo => {
            wasm = modulo;
            vincularFuncionesC();
            
            $('wasm-status').textContent = 'WebAssembly activo (C puro)';
            $('wasm-status').className = 'status-badge listo';
            
            notificar('Sistema listo. Lógica en C ejecutándose en el navegador.', 'exito');
            renderizarContactos();
        }).catch(err => {
            console.error('Error al inicializar Wasm:', err);
            $('wasm-status').textContent = 'Error al cargar WebAssembly';
            $('wasm-status').className = 'status-badge error';
            salidaC('ERROR CRÍTICO: No se pudo cargar el archivo proyecto.wasm: ' + err.message, true);
        });
    } else {
        $('wasm-status').textContent = 'Error: proyecto.js no encontrado';
        $('wasm-status').className = 'status-badge error';
    }
});
