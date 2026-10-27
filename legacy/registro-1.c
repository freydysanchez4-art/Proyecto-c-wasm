#include <stdio.h>
#include <string.h>

#define ARCHIVO "estudiantes.dat"

typedef struct {
    int id;
    char nombre[50];
    char carrera[50];
    float promedio;
} Estudiante;

void leerTexto(const char *mensaje, char *destino, int tam) {
    printf("%s", mensaje);
    fgets(destino, tam, stdin);
    destino[strcspn(destino, "\n")] = '\0';
}

int existeId(int id) {
    Estudiante e;
    FILE *f = fopen(ARCHIVO, "rb");
    if (f == NULL) return 0;
    while (fread(&e, sizeof(Estudiante), 1, f) == 1) {
        if (e.id == id) {
            fclose(f);
            return 1;
        }
    }
    fclose(f);
    return 0;
}

void registrar() {
    Estudiante e;
    FILE *f;

    printf("ID: ");
    scanf("%d", &e.id);
    getchar(); /* limpia el salto de linea */

    if (existeId(e.id)) {
        printf("Ese ID ya existe.\n");
        return;
    }

    leerTexto("Nombre: ", e.nombre, 50);
    leerTexto("Carrera: ", e.carrera, 50);
    printf("Promedio: ");
    scanf("%f", &e.promedio);
    getchar();

    f = fopen(ARCHIVO, "ab");
    if (f == NULL) {
        printf("No se pudo abrir el archivo.\n");
        return;
    }
    fwrite(&e, sizeof(Estudiante), 1, f);
    fclose(f);
    printf("Estudiante registrado.\n");
}

void listar() {
    Estudiante e;
    FILE *f = fopen(ARCHIVO, "rb");
    if (f == NULL) {
        printf("Aun no hay estudiantes registrados.\n");
        return;
    }
    printf("\n%-6s %-20s %-20s %s\n", "ID", "Nombre", "Carrera", "Promedio");
    while (fread(&e, sizeof(Estudiante), 1, f) == 1) {
        printf("%-6d %-20s %-20s %.2f\n", e.id, e.nombre, e.carrera, e.promedio);
    }
    fclose(f);
}

void buscar() {
    Estudiante e;
    int id, encontrado = 0;
    FILE *f = fopen(ARCHIVO, "rb");
    if (f == NULL) {
        printf("Aun no hay estudiantes registrados.\n");
        return;
    }
    printf("ID a buscar: ");
    scanf("%d", &id);
    getchar();
    while (fread(&e, sizeof(Estudiante), 1, f) == 1) {
        if (e.id == id) {
            printf("%d | %s | %s | %.2f\n", e.id, e.nombre, e.carrera, e.promedio);
            encontrado = 1;
            break;
        }
    }
    if (!encontrado) printf("No se encontro el estudiante.\n");
    fclose(f);
}

int main() {
    int opcion;
    do {
        printf("\n--- REGISTRO ESTUDIANTIL ---\n");
        printf("1. Registrar\n2. Listar\n3. Buscar\n4. Salir\nOpcion: ");
        scanf("%d", &opcion);
        getchar();
        switch (opcion) {
            case 1: registrar(); break;
            case 2: listar(); break;
            case 3: buscar(); break;
            case 4: printf("Hasta luego.\n"); break;
            default: printf("Opcion invalida.\n");
        }
    } while (opcion != 4);
    return 0;
}
