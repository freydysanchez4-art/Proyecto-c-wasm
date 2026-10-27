#include "contactos.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifndef __EMSCRIPTEN__
/* ---------- Versión de consola nativa (GCC / Clang) ---------- */

static void leer_linea(const char *pregunta, char *destino, int max) {
  printf("%s", pregunta);
  if (fgets(destino, max, stdin) == NULL)
    destino[0] = '\0';
  destino[strcspn(destino, "\r\n")] = '\0';
}

static int leer_numero(const char *pregunta) {
  char buffer[20];
  leer_linea(pregunta, buffer, sizeof(buffer));
  return atoi(buffer);
}

static void mostrar_contacto(int i) {
  printf("%d) %s | Tel: %s | Email: %s\n", i + 1, obtener_nombre(i),
         obtener_telefono(i), obtener_correo(i));
}

static void pedir_datos(char *n, char *t, char *c) {
  leer_linea("Nombre: ", n, LARGO_NOMBRE);
  leer_linea("Telefono: ", t, LARGO_TELEFONO);
  leer_linea("Correo: ", c, LARGO_CORREO);
}

static void opcion_agregar(void) {
  char n[LARGO_NOMBRE], t[LARGO_TELEFONO], c[LARGO_CORREO];
  pedir_datos(n, t, c);
  agregar_contacto(n, t, c);
}

static void opcion_listar(void) {
  int total = total_contactos();
  if (total == 0) {
    puts("La agenda esta vacia.");
    return;
  }
  printf("\n--- LISTA DE CONTACTOS (%d) ---\n", total);
  for (int i = 0; i < total; i++)
    mostrar_contacto(i);
}

static void opcion_buscar(void) {
  char texto[LARGO_NOMBRE];
  int encontrados = 0;
  leer_linea("Buscar por nombre, tel o correo: ", texto, sizeof(texto));

  for (int i = buscar_contacto(texto, 0); i != -1;
       i = buscar_contacto(texto, i + 1)) {
    mostrar_contacto(i);
    encontrados++;
  }
  if (encontrados == 0)
    puts("Sin resultados encontrados.");
}

static void opcion_editar(void) {
  char n[LARGO_NOMBRE], t[LARGO_TELEFONO], c[LARGO_CORREO];
  int num = leer_numero("Numero del contacto a editar: ");
  if (num < 1 || num > total_contactos()) {
    puts("Numero invalido.");
    return;
  }
  pedir_datos(n, t, c);
  editar_contacto(num - 1, n, t, c);
}

static void opcion_eliminar(void) {
  int num = leer_numero("Numero del contacto a eliminar: ");
  eliminar_contacto(num - 1);
}

int main(void) {
  int opcion;
  inicializar_agenda();
  do {
    puts("\n=================================");
    puts("  GESTOR DE CONTACTOS (C PURO)");
    puts("  UNCSM - Programacion Estructurada");
    puts("=================================");
    puts("1. Agregar contacto");
    puts("2. Listar contactos");
    puts("3. Buscar contacto");
    puts("4. Editar contacto");
    puts("5. Eliminar contacto");
    puts("6. Vaciar agenda");
    puts("0. Salir");
    opcion = leer_numero("Opcion: ");

    switch (opcion) {
    case 1:
      opcion_agregar();
      break;
    case 2:
      opcion_listar();
      break;
    case 3:
      opcion_buscar();
      break;
    case 4:
      opcion_editar();
      break;
    case 5:
      opcion_eliminar();
      break;
    case 6:
      vaciar_contactos();
      break;
    case 0:
      puts("Hasta luego.");
      break;
    default:
      puts("Opcion invalida.");
    }
  } while (opcion != 0);

  return 0;
}

#else
/* ---------- En WebAssembly la interfaz gráfica es la página web ---------- */
int main(void) {
  printf("===================================================\n");
  printf("  GESTOR DE CONTACTOS · LENGUAJE C (WEBASSEMBLY)    \n");
  printf("  Universidad Nacional Casimiro Sotelo Montenegro    \n");
  printf("  Laboratorio de Programacion Estructurada           \n");
  printf("===================================================\n");
  printf("[C:INIT] Modulo Wasm cargado. Memoria lista para operar.\n");
  inicializar_agenda();
  return 0;
}
#endif
