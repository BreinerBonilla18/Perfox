# Contexto General del Proyecto: Perfox (MVP)

## 1. Visión y Filosofía del Producto
* **Nombre:** Perfox
* **Concepto:** Aplicación móvil de gestión de finanzas personales (Gastos, Ingresos, Ahorros).
* **Propuesta de Valor:** "Cero fricción / Instant-On". No requiere registro ni login. Privacidad 100% local. El usuario abre la app y puede registrar o consultar sus finanzas en menos de 3 segundos.
* **Plataforma:** Móvil (iOS / Android).

## 2. Stack Tecnológico Elegido
* **Framework Mobile:** React Native + Expo
* **Almacenamiento Local:** SQLite
* **ORM:** DrizzleORM (Typing estricto en TypeScript y migraciones simples)
* **Gestión de Estado & Cache Local:** TanStack Query (React Query sobre lecturas SQLite)
* **Estilos:** NativeWind (Tailwind CSS para React Native)

---

## 3. Arquitectura de Navegación y Vistas (Layout Principal)

La aplicación utiliza una navegación inferior fija (**TabBar**) compuesta por 3 opciones principales:

### Tab 1: Dashboard (Pantalla de Inicio / Vista por Defecto)
* **Resumen Superior (Cards Métrica):**
  * Saldo Total Disponible
  * Gastos del Mes Activo
  * Ahorros Acumulados
* **Movimientos Recientes:**
  * Lista corta cronológica de las últimas transacciones.
  * Sistema de filtros rápidos por tipo (Todos / Ingresos / Gastos / Ahorros).
  * Botón **"Ver más"** que redirige a la pantalla extendida de Historial.
* **Acceso Estadístico Rápido (Bottom Sheet):**
  * Al hacer tap directo en la Card de "Gastos del Mes", se despliega un **Bottom Sheet** sin abandonar la pantalla.
  * Muestra el resumen estadístico agrupado por categorías del mes seleccionado (Ícono, Nombre de categoría, Total gastado, Porcentaje respecto al total y Barra de progreso relativa).

### Tab 2: Botón Central "+" (Quick Add - Modal / Bottom Sheet)
* **Comportamiento UX:** No es una pestaña navegable fija, es un detonador de acción que despliega un **Modal / Bottom Sheet flotante**.
* **Flujo de Registro:**
  1. **Selector de Tipo:** Toggle claro entre *Gasto (Egreso)*, *Ingreso* y *Ahorro*.
  2. **Categorización Express:** Desplegable/Grid de categorías (con opción de crear nuevas categorías inline).
  3. **Input Numérico:** Teclado/Input rápido para la cifra.
  4. **Campos Opcionales:** Nota rápida y fecha (por defecto toma el instante actual).
  5. Al guardar, se cierra el modal y se actualiza el Dashboard automáticamente mediante invalidación en TanStack Query.

### Tab 3: Ahorros (Metas Financieras)
* **Listado de Objetivos:** Lista/Cards de metas creadas por el usuario (ej. "Fondo de Emergencia", "Viaje").
* **Visualización:**
  * Nombre de la meta e ícono.
  * Monto acumulado vs. Monto objetivo.
  * Barra de progreso porcentual.
* **Interacción:** Permitir asignar o aportar montos directos desde el saldo disponible hacia la meta de ahorro.

---

## 4. Pantalla Extendida: "Ver Más" (Historial y Análisis)

Accesible desde el botón "Ver más" del Dashboard. Cuenta con un **Segmented Control / Tabs internos** en la parte superior:

1. **Pestaña "Transacciones":** Lista detallada y completa de todos los movimientos registrados, con opciones de filtrado avanzado y búsqueda.
2. **Pestaña "Por Categorías":** Vista dedicada y exhaustiva de las estadísticas del mes (mismos datos del Bottom Sheet rápido, pero estructurada a pantalla completa con navegación entre meses pasados/futuros).

---

## 5. Reglas de Negocio & Persistencia
1. **Modelado Orientado a SQLite:**
   * Tablas principales necesarias: `transactions` (movimientos), `categories` (categorías por defecto y personalizadas) y `savings_goals` (metas de ahorro).
2. **Reactividad con TanStack Query:**
   * Las lecturas a la BD SQLite deben usarse mediante Query Keys bien definidas (ej. `['expenses-by-category', yearMonth]`, `['recent-transactions']`).
   * Toda mutación (insertar/editar/eliminar) debe invalidar las queries asociadas para mantener la interfaz actualizada en tiempo real sin recargar la app.
3. **Manejo de Errores & Respaldo:**
   * Estrategia de respaldo offline para exportar e importar datos locales (JSON/CSV).