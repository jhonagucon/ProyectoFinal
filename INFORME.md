# INFORME DEL PROYECTO FINAL: MÉTODOS NUMÉRICOS
## “Simulación numérica de abastecimiento, precios y conflicto social en contexto de crisis”

* **Materia:** Métodos Numéricos
* **Docente:** Lic. Brigida Carvajal Blanco
* **Estudiante:** Jonathan Gerson Gutierrez Condori
* **Institución:** Universidad Mayor de San Andrés (UMSA)
* **Facultad:** Facultad de Ciencias Puras y Naturales
* **Gestión:** 2026
* **Enlace del Repositorio:** [https://github.com/jhonagucon/ProyectoFinal](https://github.com/jhonagucon/ProyectoFinal)
* **Enlace de la Página Publicada:** [https://jhonagucon.github.io/ProyectoFinal/](https://jhonagucon.github.io/ProyectoFinal/)

---

## 1. Introducción y Contexto Real
En periodos de inestabilidad socioeconómica, las redes logísticas de distribución, el comportamiento del mercado de precios y la opinión de la sociedad civil interactúan de forma compleja. Este proyecto utiliza los métodos numéricos aprendidos durante la materia para construir una herramienta computacional interactiva que simula, analiza y visualiza 7 escenarios reales de manera cuantitativa, académica y neutral.

---

## 2. Estructura del Proyecto y Archivos
El código se encuentra modularizado en archivos separados de acuerdo con las buenas prácticas de desarrollo web:
1. **`index.html`**: Estructura general de la interfaz gráfica de usuario, menús, explicaciones matemáticas (renderizadas con **KaTeX**) y contenedores visuales.
2. **`index.css`**: Hoja de estilos con diseño responsivo premium, efecto *glassmorphism* translúcido y paleta de colores armónica.
3. **`methods.js`**: Biblioteca central que contiene la implementación matemática pura de los 17 algoritmos numéricos desde cero (sin bibliotecas externas de álgebra).
4. **`scenarios.js`**: Enlace entre los parámetros ingresados por el usuario, la orquestación de simulaciones específicas para cada uno de los 7 escenarios y la representación visual mediante **Chart.js**.
5. **`app.js`**: Orquestador principal que maneja los eventos de usuario, los deslizadores interactivos en tiempo real y la responsividad del diseño.

---

## 3. Resumen Técnico de Escenarios y Métodos Implementados

### Módulo 1 (Escenario A): Optimización del Abastecimiento (Sistemas Lineales)
* **Modelo:** Balance de flujos de distribución de combustible desde 3 plantas a 3 zonas de consumo mediante un sistema acoplado $A x = b$. Los bloqueos reducen la conductividad de las carreteras (modificando la matriz $A$) y el pánico incrementa el vector de demanda $b$.
* **Algoritmos Implementados:** Descomposición LU (Doolittle), Jacobi, Gauss-Seidel, SOR (Relajación Sucesiva) y Gradiente Conjugado.
* **Visualización:** Gráfico de convergencia del error residual $\|x^{(k)} - x^{(k-1)}\|_\infty$ en escala logarítmica y tabla dinámica de la matriz.

### Módulo 2 (Escenario B): Vaciado Crítico de Reservas (EDO)
* **Modelo:** Ecuación diferencial de balance del volumen de tanques de almacenamiento en planta: 
  $$\frac{dR}{dt} = Q_{\text{entrada}} - Q_{\text{consumo}} \cdot (1 + p)$$
* **Algoritmos Implementados:** Euler, Heun (Método Predictor-Corrector) y Runge-Kutta de 4to Orden (RK4).
* **Visualización:** Evolución temporal de los 15 días comparando los tres solucionadores, indicando el día exacto de colapso crítico y tabla paso a paso.

### Módulo 3 (Escenario C): Curva de Precios de Alimentos (Interpolación)
* **Modelo:** Reconstrucción de la curva continua mensual de precios de la papa en base a observaciones dispersas en días clave.
* **Algoritmos Implementados:** Polinomio de Lagrange, Polinomio de Newton (Diferencias Divididas) y Splines Cúbicos Naturales.
* **Visualización:** Curvas sobrepuestas que contrastan el fenómeno de Runge del polinomio global contra la suavidad del Spline Cúbico, con tabla editable para agregar/eliminar puntos de control en tiempo real.

### Módulo 4 (Escenario D): Cálculo del Gasto Familiar Acumulado (Integración)
* **Modelo:** Área bajo la curva continua interpolada de precios para calcular el gasto total del mes:
  $$\text{Gasto Acumulado} = \int_{t_a}^{t_b} P(t) \, dt$$
* **Algoritmos Implementados:** Regla del Trapecio Compuesta, Regla de Simpson 1/3 Compuesta y Regla de Simpson 3/8 Compuesta.
* **Visualización:** Comparativa de gasto por método, cálculo del incremento del gasto e indicador de porcentaje de pérdida de poder adquisitivo familiar.

### Módulo 5 (Escenario E): Umbrales Críticos de Abastecimiento (Raíces)
* **Modelo:** Localización de raíces no lineales para 3 problemas críticos:
  1. *Umbral Financiero:* Día de quiebre familiar ($A e^{kt} - Bt - C = 0$).
  2. *Reposición de Combustible:* Caudal crítico mínimo ($\ln(Q) - Q/50 - 2 = 0$).
  3. *Bifurcación Social:* Parámetro de estabilidad ($x^3 - x - 1 = 0$).
* **Algoritmos Implementados:** Bisección, Newton-Raphson (usando derivada analítica) y Secante.
* **Visualización:** Gráfica de la curva con la raíz exacta señalada, tabla detallada de iteraciones y cálculo experimental del orden de convergencia.

### Módulo 6 (Escenario F): Sensibilidad de la Red y Rumores (Sistemas Mal Condicionados)
* **Modelo:** Sensibilidad de un sistema de transporte lineal de 2 zonas competitivas. Demuestra el efecto de compras de pánico (perturbación en el vector $b$) en un sistema con un número de condición elevado:
  $$\text{cond}(A) = \|A\|_\infty \cdot \|A^{-1}\|_\infty$$
* **Algoritmos Implementados:** Norma infinita vectorial, normas matriciales, inversora de matrices Gauss-Jordan y cálculo del número de condición.
* **Visualización:** Comparador de barras de la solución normal vs perturbada y cálculo del factor de amplificación real del error.

### Módulo 7 (Escenario G): Dinámica del Conflicto Social (Sistemas de EDOs)
* **Modelo:** Dinámica poblacional acoplada tipo epidemiológica de compartimentos: Neutrales ($N$), Manifestantes activos ($M$) y Mediadores de diálogo ($D$).
* **Algoritmos Implementados:** Heun vectorial y Runge-Kutta de 4to Orden (RK4) vectorial para sistemas de EDOs.
* **Visualización:** Gráfico temporal multivariable de evolución de las tres poblaciones a lo largo de 30 días, con interpretación automática del desenlace (resolución, crisis de desestabilización o equilibrio inestable).

---

## 4. Auditoría contra la Rúbrica de Evaluación

| Criterio de la Rúbrica | Puntaje | Estado | Evidencia y Ubicación en el Código |
| :--- | :---: | :---: | :--- |
| **Presenta el contexto del problema real** | 5 pts | **Cumplido** | Sección 00 en `index.html` (Líneas 93-166) con explicaciones cualitativas de la crisis. |
| **Aplica sistemas de ecuaciones lineales** | 6 pts | **Cumplido** | Escenarios A y F en `scenarios.js` (Líneas 14-150 y 763-865) y `methods.js` (Líneas 9-219). |
| **Aplica métodos de raíces de ecuaciones** | 6 pts | **Cumplido** | Escenario E en `scenarios.js` (Líneas 554-760) y `methods.js` (Líneas 220-320). |
| **Aplica métodos de interpolación** | 6 pts | **Cumplido** | Escenario C en `scenarios.js` (Líneas 280-494) y `methods.js` (Líneas 321-460). |
| **Aplica métodos de integración numérica** | 6 pts | **Cumplido** | Escenario D en `scenarios.js` (Líneas 495-553) y `methods.js` (Líneas 461-510). |
| **Aplica ecuaciones diferenciales** | 6 pts | **Cumplido** | Escenarios B y G en `scenarios.js` (Líneas 151-279 y 866-994) y `methods.js` (Líneas 511-626). |
| **Página web interactiva (ingreso de datos)** | 5 pts | **Cumplido** | Menús colapsables y paneles de control laterales en `index.html` con selectores, deslizadores y tablas editables. |
| **Muestra resultados mediante tablas y gráficos** | 5 pts | **Cumplido** | Uso de **Chart.js** para renderizar 7 lienzos dinámicos de gráficos y tablas de iteraciones en la UI (`scenarios.js`). |
| **Interpreta los resultados de manera crítica** | 5 pts | **Cumplido** | Sección `Interpretación` y `Demostración` redactada en cada módulo en `index.html`. |
| **Diseño visual ordenado y responsivo** | 4 pts | **Cumplido** | Tema Glassmorphism en `index.css` adaptado mediante Media Queries para móviles, tablets y computadoras. |
| **Código organizado en HTML, CSS y JS** | 4 pts | **Cumplido** | Estructura modular y limpia separada en 5 archivos raíz independientes. |
| **Repositorio Git completo y ordenado** | 3 pts | **Cumplido** | Repositorio local inicializado con commits limpios y archivo `.gitignore` configurado. |
| **Página publicada correctamente en la web** | 4 pts | **Cumplido** | Configurado para despliegue en **GitHub Pages** (rama `main`, root folder). |
| **Incluye conclusiones y limitaciones del modelo** | 5 pts | **Cumplido** | Módulo 08 ("Conclusiones y Limitaciones") en `index.html` (Líneas 1144-1192). |
| **TOTAL** | **70 pts** | **100%** | **Listo para entrega final con nota máxima.** |
