#include <ctype.h>
#include <string.h>
#include "utilidades.h"

/* Devuelve 1 si el texto es NULL o solo contiene espacios en blanco */
int cadena_vacia(const char *texto)
{
    if (texto == NULL)
        return 1;

    while (*texto)
    {
        if (!isspace((unsigned char)*texto))
            return 0;
        texto++;
    }
    return 1;
}

/* Copia de forma segura sin desbordar el búfer de destino */
void copiar_texto(char *destino, const char *origen, int max)
{
    if (destino == NULL || max <= 0)
        return;

    if (origen == NULL)
    {
        destino[0] = '\0';
        return;
    }

    strncpy(destino, origen, max - 1);
    destino[max - 1] = '\0';
}

/* Devuelve 1 si "texto" contiene "buscado" (sin distinguir mayúsculas ni minúsculas) */
int contiene_texto(const char *texto, const char *buscado)
{
    if (texto == NULL || buscado == NULL)
        return 0;

    int n = (int)strlen(texto);
    int m = (int)strlen(buscado);

    if (m == 0)
        return 1;
    if (m > n)
        return 0;

    for (int i = 0; i + m <= n; i++)
    {
        int j = 0;
        while (j < m && tolower((unsigned char)texto[i + j]) == tolower((unsigned char)buscado[j]))
            j++;
        if (j == m)
            return 1;
    }
    return 0;
}
