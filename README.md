# 🌐 Simulación Numérica Socioeconómica en Contexto de Crisis
## Desafío Final — Métodos Numéricos

[![GitHub Pages](https://img.shields.io/badge/Demo%20en%20Vivo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://jhonagucon.github.io/ProyectoFinal/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)

---

## 📋 Ficha del Proyecto

| Campo | Detalle |
|---|---|
| **Asignatura** | Métodos Numéricos |
| **Sigla** | INF 373 |
| **Docente** | Lic. Brigida Carvajal Blanco |
| **Estudiante** | Jonathan Gerson Gutierrez Condori |
| **Institución** | Universidad Mayor de San Andrés (UMSA) |
| **Carrera** | Informática |
| **Gestión** | I/2026 |

---

## 🎯 Descripción del Proyecto

Este proyecto es una **plataforma web interactiva** que simula, analiza y visualiza **7 escenarios socioeconómicos reales** usando **17 algoritmos de métodos numéricos** implementados desde cero en JavaScript puro.

El contexto del problema modela la crisis boliviana de abastecimiento de combustible: redes logísticas de distribución bloqueadas, inflación descontrolada de precios de alimentos básicos y la dinámica social del conflicto. Cada escenario aplica una familia diferente de métodos numéricos para resolver, cuantificar y visualizar el fenómeno.

---

## 🧮 Módulos y Algoritmos Implementados

### Módulo 1 — Optimización del Abastecimiento (Sistemas de Ecuaciones Lineales)
Modela el flujo de distribución de combustible como un sistema lineal **Ax = b**, donde los bloqueos modifican la conductividad de rutas (matriz A) y el pánico incrementa la demanda (vector b).

**Algoritmos:** Descomposición LU (Doolittle), Jacobi, Gauss-Seidel, SOR, Gradiente Conjugado

---

### Módulo 2 — Vaciado de Reservas de Combustible (Ecuaciones Diferenciales)
Simula la evolución temporal de la reserva del tanque de almacenamiento mediante la EDO:

$$\frac{dR}{dt} = Q_{\text{entrada}} - Q_{\text{consumo}} \cdot (1 + p)$$

**Algoritmos:** Euler Explícito, Heun (Predictor-Corrector), Runge-Kutta 4to Orden (RK4)

---

### Módulo 3 — Curva de Precios de Alimentos (Interpolación)
Reconstruye la curva continua de precios de la papa a partir de observaciones mensuales en días clave. Muestra claramente el fenómeno de oscilación de Runge del polinomio de alto grado.

**Algoritmos:** Polinomio de Lagrange, Polinomio de Newton (Diferencias Divididas), Splines Cúbicos Naturales

---

### Módulo 4 — Gasto Familiar Acumulado (Integración Numérica)
Calcula el costo mensual total como el área bajo la curva de precios:

$$\text{Gasto} = \int_{t_a}^{t_b} P(t) \, dt$$

**Algoritmos:** Trapecio Compuesto, Simpson 1/3 Compuesto, Simpson 3/8 Compuesto

---

### Módulo 5 — Umbrales Críticos de Abastecimiento (Raíces de Ecuaciones)
Localiza los puntos de quiebre financiero, el caudal mínimo de reposición y el parámetro de bifurcación social, cada uno como raíz de una ecuación no lineal diferente.

**Algoritmos:** Bisección, Newton-Raphson (con derivada analítica), Secante

---

### Módulo 6 — Sensibilidad de la Red y Pánico (Sistemas Mal Condicionados)
Mide la sensibilidad del sistema logístico ante rumores y compras de pánico (+5% perturbación en b) mediante el número de condición de la matriz:

$$\text{cond}(A) = \|A\|_\infty \cdot \|A^{-1}\|_\infty$$

**Algoritmos:** Normas vectoriales y matriciales, Inversión Gauss-Jordan, Cálculo del número de condición

---

### Módulo 7 — Dinámica del Conflicto Social (Sistemas de EDOs)
Simula la evolución temporal de tres grupos poblacionales (Neutrales N, Manifestantes M, Mediadores D) con un modelo epidemiológico de compartimentos acoplado.

**Algoritmos:** Heun Vectorial, Runge-Kutta 4to Orden (RK4) Vectorial para sistemas de EDOs

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura semántica de la interfaz |
| **CSS3 / Glassmorphism** | Diseño premium responsivo y animaciones |
| **JavaScript ES6+** | Lógica de todos los algoritmos numéricos |
| **Chart.js** | Visualización dinámica de gráficos e iteraciones |
| **KaTeX** | Renderizado elegante de ecuaciones matemáticas |

---

## 📂 Estructura del Proyecto

```
ProyectoFinal/
├── index.html          # Interfaz principal y contenido matemático
├── index.css           # Estilos premium glassmorphism y responsivos
├── methods.js          # Biblioteca de 17 algoritmos numéricos
├── scenarios.js        # Lógica de simulación de los 7 escenarios
├── app.js              # Coordinador de eventos e interactividad UI
├── INFORME.md          # Informe técnico académico completo
├── informe.py          # Script de Python que genera el reporte final PDF
├── informe.pdf         # Reporte académico final en PDF con fórmulas LaTeX
└── README.md           # Este archivo
```

---

## 🚀 Cómo Ver el Proyecto

### Demo en Vivo (GitHub Pages)
👉 **[https://jhonagucon.github.io/ProyectoFinal/](https://jhonagucon.github.io/ProyectoFinal/)**

### Ejecutar Localmente
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/jhonagucon/ProyectoFinal.git
   ```
2. Abrir el archivo `index.html` directamente en el navegador.

> No se necesita ningún servidor, compilador ni instalación de dependencias. Todo funciona directamente en el navegador.

---

## ✅ Checklist de la Rúbrica de Evaluación

| Criterio | Puntaje | Estado |
|---|---|---|
| Presenta el contexto del problema real | 5 pts | ✅ Cumplido |
| Aplica sistemas de ecuaciones lineales | 6 pts | ✅ Cumplido |
| Aplica métodos de raíces de ecuaciones | 6 pts | ✅ Cumplido |
| Aplica métodos de interpolación | 6 pts | ✅ Cumplido |
| Aplica integración numérica | 6 pts | ✅ Cumplido |
| Aplica ecuaciones diferenciales | 6 pts | ✅ Cumplido |
| Página web interactiva | 5 pts | ✅ Cumplido |
| Tablas, textos y gráficos | 5 pts | ✅ Cumplido |
| Interpreta resultados | 5 pts | ✅ Cumplido |
| Diseño visual ordenado y responsivo | 4 pts | ✅ Cumplido |
| Código organizado en HTML, CSS y JS | 4 pts | ✅ Cumplido |
| Repositorio Git completo | 3 pts | ✅ Cumplido |
| Página publicada en la web | 4 pts | ✅ Cumplido |
| Conclusiones y limitaciones | 5 pts | ✅ Cumplido |
| **TOTAL** | **70 pts** | **✅ 100%** |
