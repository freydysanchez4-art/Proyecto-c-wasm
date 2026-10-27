#ifndef CONTACTOS_H
#define CONTACTOS_H

/* En WebAssembly marcamos las funciones para que JavaScript pueda llamarlas */
#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#define EXPORTAR EMSCRIPTEN_KEEPALIVE
#else
#define EXPORTAR
#endif

#define MAX_CONTACTOS  100
#define LARGO_NOMBRE   50
#define LARGO_TELEFONO 20
#define LARGO_CORREO   50

/* Códigos de resultado */
#define CONTACTO_OK   0
#define ERR_LLENO    -1
#define ERR_VACIO    -2
#define ERR_INDICE   -3

typedef struct
{
    char nombre[LARGO_NOMBRE];
    char telefono[LARGO_TELEFONO];
    char correo[LARGO_CORREO];
} Contacto;

EXPORTAR int agregar_contacto(const char *nombre, const char *telefono, const char *correo);
EXPORTAR int editar_contacto(int indice, const char *nombre, const char *telefono, const char *correo);
EXPORTAR int eliminar_contacto(int indice);
EXPORTAR int buscar_contacto(const char *texto, int desde);
EXPORTAR int total_contactos(void);
EXPORTAR const char *obtener_nombre(int indice);
EXPORTAR const char *obtener_telefono(int indice);
EXPORTAR const char *obtener_correo(int indice);
EXPORTAR void vaciar_contactos(void);
EXPORTAR void inicializar_agenda(void);

#endif
