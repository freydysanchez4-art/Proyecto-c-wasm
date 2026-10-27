#include <stdio.h>
#include <string.h>
#include "contactos.h"
#include "utilidades.h"

static Contacto agenda[MAX_CONTACTOS];
static int total = 0;

static int indice_valido(int indice)
{
    return indice >= 0 && indice < total;
}

EXPORTAR
void inicializar_agenda(void)
{
    total = 0;
    printf("[C] Agenda de contactos inicializada. Capacidad: %d registros.\n", MAX_CONTACTOS);
}

EXPORTAR
int agregar_contacto(const char *nombre, const char *telefono, const char *correo)
{
    if (total >= MAX_CONTACTOS)
    {
        printf("[C:ERROR] Agenda llena. No se puede registrar a '%s' (max %d).\n", 
               nombre ? nombre : "desconocido", MAX_CONTACTOS);
        return ERR_LLENO;
    }
    if (cadena_vacia(nombre))
    {
        printf("[C:ERROR] Nombre vacio no permitido.\n");
        return ERR_VACIO;
    }

    copiar_texto(agenda[total].nombre, nombre, LARGO_NOMBRE);
    copiar_texto(agenda[total].telefono, telefono, LARGO_TELEFONO);
    copiar_texto(agenda[total].correo, correo, LARGO_CORREO);

    printf("[C:OK] Contacto #%d agregado: %s | Tel: %s | Email: %s\n",
           total + 1, agenda[total].nombre, agenda[total].telefono, agenda[total].correo);

    total++;
    return CONTACTO_OK;
}

EXPORTAR
int editar_contacto(int indice, const char *nombre, const char *telefono, const char *correo)
{
    if (!indice_valido(indice))
    {
        printf("[C:ERROR] Indice invalido para edicion: %d (Total actual: %d).\n", indice, total);
        return ERR_INDICE;
    }
    if (cadena_vacia(nombre))
    {
        printf("[C:ERROR] No se puede dejar el nombre vacio en la edicion.\n");
        return ERR_VACIO;
    }

    copiar_texto(agenda[indice].nombre, nombre, LARGO_NOMBRE);
    copiar_texto(agenda[indice].telefono, telefono, LARGO_TELEFONO);
    copiar_texto(agenda[indice].correo, correo, LARGO_CORREO);

    printf("[C:OK] Contacto #%d actualizado con exito.\n", indice + 1);
    return CONTACTO_OK;
}

EXPORTAR
int eliminar_contacto(int indice)
{
    if (!indice_valido(indice))
    {
        printf("[C:ERROR] Indice invalido para eliminacion: %d.\n", indice);
        return ERR_INDICE;
    }

    char eliminado[LARGO_NOMBRE];
    copiar_texto(eliminado, agenda[indice].nombre, LARGO_NOMBRE);

    /* Desplazar los contactos posteriores una posición hacia adelante */
    for (int i = indice; i < total - 1; i++)
        agenda[i] = agenda[i + 1];

    total--;
    printf("[C:OK] Contacto '%s' (posicion %d) eliminado. Total restante: %d.\n",
           eliminado, indice + 1, total);
    return CONTACTO_OK;
}

EXPORTAR
void vaciar_contactos(void)
{
    int previos = total;
    total = 0;
    printf("[C:INFO] Memoria limpiada. Se eliminaron %d contactos.\n", previos);
}

/* Devuelve el primer índice >= desde cuyo nombre, teléfono o correo coincide con 'texto' */
EXPORTAR
int buscar_contacto(const char *texto, int desde)
{
    if (cadena_vacia(texto))
        return -1;

    for (int i = desde < 0 ? 0 : desde; i < total; i++)
    {
        if (contiene_texto(agenda[i].nombre, texto) ||
            contiene_texto(agenda[i].telefono, texto) ||
            contiene_texto(agenda[i].correo, texto))
        {
            return i;
        }
    }
    return -1;
}

EXPORTAR
int total_contactos(void)
{
    return total;
}

EXPORTAR
const char *obtener_nombre(int indice)
{
    return indice_valido(indice) ? agenda[indice].nombre : "";
}

EXPORTAR
const char *obtener_telefono(int indice)
{
    return indice_valido(indice) ? agenda[indice].telefono : "";
}

EXPORTAR
const char *obtener_correo(int indice)
{
    return indice_valido(indice) ? agenda[indice].correo : "";
}
