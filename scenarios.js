/**
 * MÉTODOS NUMÉRICOS - MOTOR DE ESCENARIOS (scenarios.js)
 * Orquesta la preparación de datos y las simulaciones interactivas A-G.
 */

const Scenarios = {

    // Instancias de Gráficos de Chart.js
    charts: {},

    // =========================================================================
    // ESCENARIO A: Red de Transporte (Sistemas Lineales)
    // =========================================================================
    runScenarioA() {
        // Matriz original A (logística de 3 plantas a 3 zonas)
        // Predeterminada y diagonalmente dominante para asegurar la convergencia
        const A_base = [
            [10, 2, 1],
            [1, 12, 3],
            [2, 1, 8]
        ];

        // Vector de demanda base b
        const b_base = [150, 200, 100];

        // Obtener perturbaciones de los controles de UI
        const bloqueo = parseFloat(document.getElementById('scen-a-blockage').value); // 0 (sin bloqueo) a 0.8 (bloqueo severo)
        const demandaEscala = parseFloat(document.getElementById('scen-a-demand').value); // 1.0 a 1.5

        // Modificar A por bloqueo (el bloqueo afecta las rutas de transporte reduciendo la conductividad/capacidad en la matriz)
        // Reducimos los coeficientes de acoplamiento fuera de la diagonal y aumentamos la resistencia
        const A = [
            [A_base[0][0], A_base[0][1] * (1 - bloqueo), A_base[0][2] * (1 - bloqueo)],
            [A_base[1][0] * (1 - bloqueo), A_base[1][1], A_base[1][2] * (1 - bloqueo)],
            [A_base[2][0] * (1 - bloqueo), A_base[2][1] * (1 - bloqueo), A_base[2][2]]
        ];

        // Incrementar la demanda en b
        const b = b_base.map(val => val * demandaEscala);

        const method = document.getElementById('scen-a-method').value;
        const omega = parseFloat(document.getElementById('scen-a-omega').value) || 1.25;
        const tol = 1e-6;
        const maxIter = 100;
        const x0 = [0, 0, 0];

        let result;
        let methodLabel = "";

        try {
            if (method === 'LU') {
                const res = NumericalMethods.solveLU(A, b);
                result = { x: res.x, iterations: 1, errors: [0] };
                methodLabel = "LU (Directo)";
            } else if (method === 'Jacobi') {
                result = NumericalMethods.solveJacobi(A, b, x0, maxIter, tol);
                methodLabel = "Jacobi (Iterativo)";
            } else if (method === 'Gauss-Seidel') {
                result = NumericalMethods.solveGaussSeidel(A, b, x0, maxIter, tol);
                methodLabel = "Gauss-Seidel (Iterativo)";
            } else if (method === 'SOR') {
                result = NumericalMethods.solveSOR(A, b, omega, x0, maxIter, tol);
                methodLabel = `SOR (w=${omega}) (Iterativo)`;
            } else if (method === 'CG') {
                result = NumericalMethods.solveConjugateGradient(A, b, x0, maxIter, tol);
                methodLabel = "Gradiente Conjugado";
            }

            // Mostrar resultados en UI
            document.getElementById('scen-a-val-x1').textContent = result.x[0].toFixed(4);
            document.getElementById('scen-a-val-x2').textContent = result.x[1].toFixed(4);
            document.getElementById('scen-a-val-x3').textContent = result.x[2].toFixed(4);
            document.getElementById('scen-a-val-iter').textContent = result.iterations;

            // Verificar Ax = b para ver el residuo
            const residuo = [];
            for (let i = 0; i < A.length; i++) {
                let Ax_i = 0;
                for (let j = 0; j < A[i].length; j++) Ax_i += A[i][j] * result.x[j];
                residuo.push(Math.abs(Ax_i - b[i]));
            }
            const normResiduo = NumericalMethods.normInfVector(residuo);
            document.getElementById('scen-a-val-residual').textContent = normResiduo.toExponential(4);

            // Generar tabla de la matriz y el vector
            let matrixHTML = "";
            for (let i = 0; i < A.length; i++) {
                matrixHTML += `<tr>
                    <td>Fila ${i+1}</td>
                    <td>${A[i][0].toFixed(2)}</td>
                    <td>${A[i][1].toFixed(2)}</td>
                    <td>${A[i][2].toFixed(2)}</td>
                    <td class="text-accent">${b[i].toFixed(2)}</td>
                </tr>`;
            }
            document.getElementById('scen-a-matrix-body').innerHTML = matrixHTML;

            // Renderizar gráfico de convergencia
            this.renderChartConvergence('chart-scen-a', result.errors, methodLabel);

        } catch (e) {
            console.error(e);
            alert("Error resolviendo el sistema: " + e.message);
        }
    },

    renderChartConvergence(canvasId, errors, label) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const labels = errors.map((_, i) => i + 1);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Error Residual ||x_k - x_{k-1}|| (${label})`,
                    data: errors,
                    borderColor: '#22d3ee',
                    backgroundColor: 'rgba(34, 211, 238, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    pointRadius: errors.length > 30 ? 0 : 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                        ticks: { color: '#a3a3a3', font: { family: 'JetBrains Mono', size: 10 } },
                        title: { display: true, text: 'Iteración', color: '#a3a3a3' }
                    },
                    y: {
                        type: 'logarithmic',
                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                        ticks: { color: '#a3a3a3', font: { family: 'JetBrains Mono', size: 10 } },
                        title: { display: true, text: 'Error (Escala Log)', color: '#a3a3a3' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f4f4f5' } }
                }
            }
        });
    },

    // =========================================================================
    // ESCENARIO B: Vaciado de Reservas (EDO)
    // =========================================================================
    runScenarioB() {
        const R0 = parseFloat(document.getElementById('scen-b-r0').value) || 1000; // Reserva inicial
        const entrada = parseFloat(document.getElementById('scen-b-in').value) || 80; // Entrada diaria
        const consumoBase = parseFloat(document.getElementById('scen-b-out').value) || 120; // Consumo diario base
        const panico = parseFloat(document.getElementById('scen-b-panic').value) || 0; // Incremento por pánico
        const R_critica = parseFloat(document.getElementById('scen-b-rcrit').value) || 150; // Nivel crítico

        const h = parseFloat(document.getElementById('scen-b-h').value) || 0.1; // Tamaño de paso
        const tf = 15; // Simular 15 días

        // EDO: dR/dt = entrada - consumoBase * (1 + panico)
        const consumoReal = consumoBase * (1 + panico);
        const f = (t, r) => {
            // La reserva no puede ser negativa en la realidad física, pero permitimos que la simulación lo muestre
            return entrada - consumoReal;
        };

        // Resolver con los 3 métodos
        const euler = NumericalMethods.solveODE_Euler(f, 0, tf, R0, h);
        const heun = NumericalMethods.solveODE_Heun(f, 0, tf, R0, h);
        const rk4 = NumericalMethods.solveODE_RK4(f, 0, tf, R0, h);

        // Encontrar día crítico para cada método (cuando R(t) <= R_critica)
        const findCritDay = (sol) => {
            for (let i = 0; i < sol.t.length; i++) {
                if (sol.y[i] <= R_critica) {
                    return sol.t[i].toFixed(2) + " días";
                }
            }
            return "> 15 días (Estable)";
        };

        document.getElementById('scen-b-crit-euler').textContent = findCritDay(euler);
        document.getElementById('scen-b-crit-heun').textContent = findCritDay(heun);
        document.getElementById('scen-b-crit-rk4').textContent = findCritDay(rk4);

        // Llenar tabla comparativa paso a paso (mostrar primeros 15 pasos para no saturar)
        let tbodyHTML = "";
        const limitSteps = Math.min(euler.t.length, 25);
        for (let i = 0; i < limitSteps; i++) {
            const isCrit = rk4.y[i] <= R_critica ? "class='row-danger'" : "";
            tbodyHTML += `<tr ${isCrit}>
                <td>t = ${euler.t[i].toFixed(1)}</td>
                <td>${euler.y[i].toFixed(2)}</td>
                <td>${heun.y[i].toFixed(2)}</td>
                <td class="text-accent">${rk4.y[i].toFixed(2)}</td>
            </tr>`;
        }
        if (euler.t.length > 25) {
            tbodyHTML += `<tr><td colspan="4" class="text-center text-muted">... mostrando primeros 25 pasos de simulación ...</td></tr>`;
        }
        document.getElementById('scen-b-table-body').innerHTML = tbodyHTML;

        // Renderizar gráfico
        this.renderChartODE('chart-scen-b', euler, heun, rk4, R_critica);
    },

    renderChartODE(canvasId, euler, heun, rk4, rCrit) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        // Crear una línea horizontal para el nivel crítico
        const rCritLine = euler.t.map(() => rCrit);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: euler.t.map(t => t.toFixed(2)),
                datasets: [
                    {
                        label: 'Euler',
                        data: euler.y,
                        borderColor: '#fb7185',
                        borderWidth: 1.5,
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'Heun',
                        data: heun.y,
                        borderColor: '#a78bfa',
                        borderWidth: 1.5,
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'RK4 (Orden 4)',
                        data: rk4.y,
                        borderColor: '#22d3ee',
                        borderWidth: 2.5,
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'Límite Crítico',
                        data: rCritLine,
                        borderColor: '#eab308',
                        borderDash: [5, 5],
                        borderWidth: 1.5,
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                        ticks: { color: '#a3a3a3', font: { family: 'JetBrains Mono', size: 10 } },
                        title: { display: true, text: 'Tiempo (Días)', color: '#a3a3a3' }
                    },
                    y: {
                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                        ticks: { color: '#a3a3a3', font: { family: 'JetBrains Mono', size: 10 } },
                        title: { display: true, text: 'Reserva (Barriles)', color: '#a3a3a3' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f4f4f5' } }
                }
            }
        });
    },

    // =========================================================================
    // ESCENARIO C: Curva de Precios (Interpolación)
    // =========================================================================
    // Datos globales para la tabla editable de interpolación
    pointsC: [
        { day: 1, price: 8 },
        { day: 5, price: 10 },
        { day: 10, price: 13 },
        { day: 15, price: 16 },
        { day: 20, price: 19 },
        { day: 30, price: 22 }
    ],

    initScenarioC() {
        this.renderTableC();
        this.runScenarioC();
    },

    renderTableC() {
        let rows = "";
        this.pointsC.forEach((pt, i) => {
            rows += `<tr>
                <td>Punto ${i+1}</td>
                <td><input type="number" class="table-input" value="${pt.day}" onchange="Scenarios.updatePointC(${i}, 'day', this.value)"></td>
                <td><input type="number" class="table-input" value="${pt.price}" onchange="Scenarios.updatePointC(${i}, 'price', this.value)"></td>
                <td><button class="ctrl-btn btn-danger" onclick="Scenarios.deletePointC(${i})">Eliminar</button></td>
            </tr>`;
        });
        document.getElementById('scen-c-table-body').innerHTML = rows;
    },

    updatePointC(index, field, value) {
        this.pointsC[index][field] = parseFloat(value) || 0;
        // Ordenar por día para evitar problemas de interpolación
        this.pointsC.sort((a, b) => a.day - b.day);
        this.renderTableC();
        this.runScenarioC();
        // Recalcular escenarios D y E que dependen de esta curva
        this.runScenarioD();
        this.runScenarioE();
    },

    deletePointC(index) {
        if (this.pointsC.length <= 3) {
            alert("Se requieren al menos 3 puntos para realizar splines cúbicos.");
            return;
        }
        this.pointsC.splice(index, 1);
        this.renderTableC();
        this.runScenarioC();
        this.runScenarioD();
        this.runScenarioE();
    },

    addPointC() {
        const lastPt = this.pointsC[this.pointsC.length - 1];
        this.pointsC.push({
            day: lastPt ? lastPt.day + 5 : 35,
            price: lastPt ? lastPt.price + 2 : 25
        });
        this.renderTableC();
        this.runScenarioC();
        this.runScenarioD();
        this.runScenarioE();
    },

    runScenarioC() {
        const xs = this.pointsC.map(p => p.day);
        const ys = this.pointsC.map(p => p.price);

        // Crear evaluadores de polinomios
        const evalLagrange = NumericalMethods.interpolateLagrange(xs, ys);
        const newtonObj = NumericalMethods.interpolateNewton(xs, ys);
        const splineObj = NumericalMethods.interpolateSpline(xs, ys);

        // Muestrear a lo largo del mes [1, 30] (o desde min a max día)
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const plotX = [];
        const plotLagrange = [];
        const plotNewton = [];
        const plotSpline = [];

        const steps = 100;
        for (let i = 0; i <= steps; i++) {
            const x = minX + (i / steps) * (maxX - minX);
            plotX.push(x);
            plotLagrange.push(evalLagrange(x));
            plotNewton.push(newtonObj.evaluate(x));
            plotSpline.push(splineObj.evaluate(x));
        }

        // Evaluar en día específico (estimación)
        const inputDay = parseFloat(document.getElementById('scen-c-eval-day').value) || 12;
        const valLag = evalLagrange(inputDay);
        const valNew = newtonObj.evaluate(inputDay);
        const valSpl = splineObj.evaluate(inputDay);

        document.getElementById('scen-c-val-lagrange').textContent = valLag.toFixed(2) + " Bs";
        document.getElementById('scen-c-val-newton').textContent = valNew.toFixed(2) + " Bs";
        document.getElementById('scen-c-val-spline').textContent = valSpl.toFixed(2) + " Bs";

        // Guardar estimadores en global para su uso en escenarios D y E
        this.evalSplinePrecios = splineObj.evaluate;
        this.evalLagrangePrecios = evalLagrange;
        this.evalNewtonPrecios = newtonObj.evaluate;
        this.minDayC = minX;
        this.maxDayC = maxX;

        // Renderizar coeficientes de diferencias divididas de Newton en UI
        let tableNewtonHTML = "<thead><tr><th>Día (x)</th><th>Precio (y)</th>";
        for (let j = 1; j < xs.length; j++) {
            tableNewtonHTML += `<th>Diff ${j}</th>`;
        }
        tableNewtonHTML += "</tr></thead><tbody>";
        for (let i = 0; i < xs.length; i++) {
            tableNewtonHTML += `<tr><td>${xs[i]}</td>`;
            for (let j = 0; j < xs.length - i; j++) {
                tableNewtonHTML += `<td>${newtonObj.table[i][j].toFixed(4)}</td>`;
            }
            // Espacios vacíos
            for (let j = xs.length - i; j < xs.length; j++) {
                tableNewtonHTML += `<td>-</td>`;
            }
            tableNewtonHTML += "</tr>";
        }
        tableNewtonHTML += "</tbody>";
        document.getElementById('scen-c-newton-table').innerHTML = tableNewtonHTML;

        // Renderizar coeficientes de los Splines Cúbicos
        let tableSplineHTML = "";
        splineObj.coefficients.forEach((s, idx) => {
            tableSplineHTML += `<tr>
                <td>S_${idx}</td>
                <td>[${s.x0}, ${s.x1}]</td>
                <td>${s.a.toFixed(4)}</td>
                <td>${s.b.toFixed(4)}</td>
                <td>${s.c.toFixed(4)}</td>
                <td>${s.d.toFixed(4)}</td>
            </tr>`;
        });
        document.getElementById('scen-c-spline-table-body').innerHTML = tableSplineHTML;

        // Renderizar gráfico
        this.renderChartInterpolation('chart-scen-c', plotX, plotLagrange, plotNewton, plotSpline, xs, ys);
    },

    renderChartInterpolation(canvasId, plotX, plotLagrange, plotNewton, plotSpline, xs, ys) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: plotX.map(x => x.toFixed(1)),
                datasets: [
                    {
                        label: 'Lagrange (Alto Grado)',
                        data: plotLagrange,
                        borderColor: '#fb7185',
                        borderWidth: 1.5,
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'Newton (Diff. Divididas)',
                        data: plotNewton,
                        borderColor: '#a78bfa',
                        borderWidth: 1.5,
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'Splines Cúbicos Naturales',
                        data: plotSpline,
                        borderColor: '#22d3ee',
                        borderWidth: 2.5,
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'Puntos Experimentales',
                        data: plotX.map(x => {
                            const idx = xs.indexOf(x);
                            return idx !== -1 ? ys[idx] : null;
                        }),
                        borderColor: '#eab308',
                        backgroundColor: '#eab308',
                        type: 'scatter',
                        pointRadius: 6,
                        showLine: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                        ticks: { color: '#a3a3a3', font: { family: 'JetBrains Mono', size: 10 } },
                        title: { display: true, text: 'Tiempo (Días del Mes)', color: '#a3a3a3' }
                    },
                    y: {
                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                        ticks: { color: '#a3a3a3', font: { family: 'JetBrains Mono', size: 10 } },
                        title: { display: true, text: 'Precio de la Papa (Bs.)', color: '#a3a3a3' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f4f4f5' } }
                }
            }
        });
    },

    // =========================================================================
    // ESCENARIO D: Costo Acumulado e Integración
    // =========================================================================
    runScenarioD() {
        if (!this.evalSplinePrecios) {
            // Si la curva spline no está inicializada
            return;
        }

        const a = this.minDayC;
        const b = this.maxDayC;
        const n = parseInt(document.getElementById('scen-d-n').value) || 12;

        // Función del precio (usamos el Spline Cúbico por ser el más estable)
        const f = this.evalSplinePrecios;

        // Resolver integrales
        const trap = NumericalMethods.integrateTrapezoidal(f, a, b, n);
        const simp13 = NumericalMethods.integrateSimpson13(f, a, b, n);
        const simp38 = NumericalMethods.integrateSimpson38(f, a, b, n);

        // Línea base de gasto (si los precios se hubieran mantenido constantes en el día mínimo)
        const precioInicial = f(a);
        const gastoBase = precioInicial * (b - a); // Costo constante acumulado

        // Pérdida del poder adquisitivo basada en Simpson 1/3 (el más común y exacto)
        const perdidaBs = simp13 - gastoBase;
        const perdidaPct = (perdidaBs / gastoBase) * 100;

        // Mostrar resultados en UI
        document.getElementById('scen-d-val-trap').textContent = trap.toFixed(4) + " Bs.";
        document.getElementById('scen-d-val-simp13').textContent = simp13.toFixed(4) + " Bs.";
        document.getElementById('scen-d-val-simp38').textContent = simp38.toFixed(4) + " Bs.";
        
        document.getElementById('scen-d-val-base').textContent = gastoBase.toFixed(2) + " Bs.";
        document.getElementById('scen-d-val-loss-bs').textContent = perdidaBs.toFixed(2) + " Bs.";
        document.getElementById('scen-d-val-loss-pct').textContent = perdidaPct.toFixed(2) + "%";

        // Llenar tabla de particiones paso a paso para Simpson 1/3
        const stepSize = (b - a) / n;
        let tbodyHTML = "";
        for (let i = 0; i <= n; i++) {
            const xi = a + i * stepSize;
            const yi = f(xi);
            let factor = "2";
            if (i === 0 || i === n) factor = "1 (Extremo)";
            else if (i % 2 !== 0) factor = "4 (Impar)";

            tbodyHTML += `<tr>
                <td>i = ${i}</td>
                <td>${xi.toFixed(2)}</td>
                <td>${yi.toFixed(4)} Bs.</td>
                <td>${factor}</td>
            </tr>`;
        }
        document.getElementById('scen-d-table-body').innerHTML = tbodyHTML;
    },

    // =========================================================================
    // ESCENARIO E: Umbrales Críticos (Raíces de Ecuaciones)
    // =========================================================================
    runScenarioE() {
        const caseVal = (document.getElementById('scen-e-case') || {}).value || 'case1';

        // --- Definir función f, f', etiquetas y rango de ploteo según el caso ---
        let f, df, funcLabel, xLabel, xAxisLabel, rMin, rMax;

        if (caseVal === 'case1') {
            // CASO 1: Umbral financiero familiar  f(t) = A·e^(k·t) - B·t - C = 0
            // Representa la diferencia acumulada entre el gasto en canasta básica y el ingreso mensual
            const A_c = parseFloat(document.getElementById('scen-e-coeff-a').value) || 150;
            const K_c = parseFloat(document.getElementById('scen-e-coeff-k').value) || 0.08;
            const B_c = parseFloat(document.getElementById('scen-e-coeff-b').value) || 25;
            const C_c = parseFloat(document.getElementById('scen-e-coeff-c').value) || 200;
            f = (t) => A_c * Math.exp(K_c * t) - B_c * t - C_c;
            df = (t) => A_c * K_c * Math.exp(K_c * t) - B_c;
            funcLabel = 'f(t) = A·eᵏᵗ − B·t − C';
            xLabel = 'Día de Quiebre Financiero';
            xAxisLabel = 'Tiempo (Días)';
            rMin = -5; rMax = 35;

        } else if (caseVal === 'case2') {
            // CASO 2: Tasa crítica de reposición de combustible  g(Q) = Q·T - C·(1+p)·T = 0
            // Encuentra el caudal de entrada mínimo Q que iguala exactamente el consumo total acumulado
            // Simplificado como: g(Q) = ln(Q) - Q/50 - 2  (función no lineal interesante)
            f = (Q) => Math.log(Q) - Q / 50 - 2;
            df = (Q) => 1/Q - 1/50;
            funcLabel = 'g(Q) = ln(Q) − Q/50 − 2';
            xLabel = 'Caudal Crítico de Reposición (L/día)';
            xAxisLabel = 'Caudal Q (L/día)';
            rMin = 80; rMax = 310;

        } else {
            // CASO 3: Umbral de opinión social  h(x) = x³ - x - 1 = 0
            // Modela el punto de bifurcación del modelo NMD donde el sistema cambia de estabilidad
            // (raíz de un polinomio cúbico característico del sistema no lineal)
            f = (x) => x*x*x - x - 1;
            df = (x) => 3*x*x - 1;
            funcLabel = 'h(x) = x³ − x − 1';
            xLabel = 'Parámetro de Bifurcación';
            xAxisLabel = 'x (Parámetro de Estabilidad)';
            rMin = -2.5; rMax = 2.5;
        }

        const method = document.getElementById('scen-e-method').value;
        const paramA = parseFloat(document.getElementById('scen-e-a').value);
        const paramB = parseFloat(document.getElementById('scen-e-b').value);
        const tol = 1e-6;
        const maxIter = 60;

        let result;
        try {
            if (method === 'bisection') {
                result = NumericalMethods.rootBisection(f, paramA, paramB, tol, maxIter);
            } else if (method === 'newton') {
                result = NumericalMethods.rootNewtonRaphson(f, df, paramA, tol, maxIter);
            } else if (method === 'secant') {
                result = NumericalMethods.rootSecant(f, paramA, paramB, tol, maxIter);
            }

            // Mostrar resultados
            const rootDisplay = isNaN(result.root) ? '— Sin convergencia' : result.root.toFixed(6);
            document.getElementById('scen-e-val-root').textContent = rootDisplay;
            document.getElementById('scen-e-val-iter').textContent = result.iterations;

            // Actualizar el label del resultado dinámicamente
            const rootLabelEl = document.querySelector('[data-e-root-label]');
            if (rootLabelEl) rootLabelEl.textContent = xLabel;

            // Tabla de iteraciones
            let tbodyHTML = '';
            result.history.forEach(row => {
                const errorStr = row.error === undefined || isNaN(row.error) ? '—' : row.error.toExponential(4);
                const fcStr = isNaN(row.fc) ? '—' : row.fc.toExponential(4);
                const xrStr = isNaN(row.xr) ? '—' : row.xr.toFixed(6);
                if (method === 'bisection') {
                    tbodyHTML += `<tr>
                        <td>${row.iter}</td>
                        <td>${row.a.toFixed(5)}</td>
                        <td>${row.b.toFixed(5)}</td>
                        <td class="text-accent">${xrStr}</td>
                        <td>${fcStr}</td>
                        <td>${errorStr}</td>
                    </tr>`;
                } else {
                    tbodyHTML += `<tr>
                        <td>${row.iter}</td>
                        <td colspan="2" class="text-center text-muted">—</td>
                        <td class="text-accent">${xrStr}</td>
                        <td>${fcStr}</td>
                        <td>${errorStr}</td>
                    </tr>`;
                }
            });
            document.getElementById('scen-e-table-body').innerHTML = tbodyHTML;

            // Orden de convergencia experimental
            let convergenceRate = 'Pocas iteraciones';
            const hist = result.history;
            if (hist.length >= 3) {
                const e1 = hist[hist.length - 3].error;
                const e2 = hist[hist.length - 2].error;
                const e3 = hist[hist.length - 1].error;
                if (e1 > 0 && e2 > 0 && e3 > 0 && Math.abs(Math.log(e2 / e1)) > 1e-12) {
                    const p = Math.log(e3 / e2) / Math.log(e2 / e1);
                    if (isFinite(p) && p > 0) {
                        const methodName = method === 'bisection' ? '≈ 1.0 (Lineal)' :
                                           method === 'newton'    ? '≈ 2.0 (Cuadrática)' :
                                           method === 'secant'    ? '≈ 1.62 (Superlineal)' : p.toFixed(4);
                        convergenceRate = p.toFixed(4) + ' ' + (method !== 'bisection' ? methodName : '');
                    }
                }
            }
            document.getElementById('scen-e-val-rate').textContent = convergenceRate;

            // Graficar
            this.renderChartRoot('chart-scen-e', f, rMin, rMax, result.root, funcLabel, xAxisLabel);

        } catch (err) {
            console.error('Escenario E Error:', err);
            document.getElementById('scen-e-val-root').textContent = '— Error: ' + err.message;
            document.getElementById('scen-e-val-iter').textContent = '—';
            document.getElementById('scen-e-table-body').innerHTML =
                `<tr><td colspan="6" class="text-center text-rose">${err.message}</td></tr>`;
        }
    },

    renderChartRoot(canvasId, f, rMin, rMax, root, funcLabel, xAxisLabel) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        const steps = 200;
        const plotX = [], plotY = [], zeroLine = [];
        for (let i = 0; i <= steps; i++) {
            const x = rMin + (i / steps) * (rMax - rMin);
            const y = f(x);
            plotX.push(x);
            plotY.push(isFinite(y) && Math.abs(y) < 1e9 ? y : null);
            zeroLine.push(0);
        }

        // Punto de la raíz en y=0
        const rootPointData = plotX.map(x => (Math.abs(x - root) < (rMax - rMin) / steps * 1.5 ? 0 : null));

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: plotX.map(x => x.toFixed(2)),
                datasets: [
                    {
                        label: funcLabel,
                        data: plotY,
                        borderColor: '#a78bfa',
                        borderWidth: 2.5,
                        fill: false,
                        pointRadius: 0,
                        tension: 0.1
                    },
                    {
                        label: 'Eje y = 0',
                        data: zeroLine,
                        borderColor: 'rgba(148, 163, 184, 0.25)',
                        borderWidth: 1,
                        borderDash: [4, 4],
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: `Raíz ≈ ${isNaN(root) ? '—' : root.toFixed(4)}`,
                        data: rootPointData,
                        borderColor: '#eab308',
                        backgroundColor: '#eab308',
                        type: 'scatter',
                        pointRadius: 10,
                        pointStyle: 'star',
                        showLine: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                        ticks: { color: '#a3a3a3', font: { family: 'JetBrains Mono', size: 10 }, maxTicksLimit: 12 },
                        title: { display: true, text: xAxisLabel, color: '#94a3b8' }
                    },
                    y: {
                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                        ticks: { color: '#a3a3a3', font: { family: 'JetBrains Mono', size: 10 } },
                        title: { display: true, text: 'f(x)', color: '#94a3b8' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f4f4f5' } },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y !== null ? ctx.parsed.y.toFixed(4) : '—'}`
                        }
                    }
                }
            }
        });
    },

    // =========================================================================
    // ESCENARIO F: Rumores (Sistemas Mal Condicionados)
    // =========================================================================
    runScenarioF() {
        // Matriz A altamente mal condicionada (filas casi paralelas)
        // Representa la sensibilidad elástica del mercado a compras de pánico
        const A = [
            [10.0, 9.9],
            [9.9, 9.8]
        ];

        // Vector b original (demanda estándar)
        const b = [19.9, 19.7];

        // Calcular número de condición exacto
        const condNum = NumericalMethods.getConditionNumber(A);
        document.getElementById('scen-f-val-cond').textContent = condNum.toFixed(2);

        // Obtener perturbación (rumor) en porcentaje del control deslizante
        const perturbacionPct = parseFloat(document.getElementById('scen-f-rumor').value); // e.g. 0 a 10%
        const delta_b1 = (perturbacionPct / 100) * b[0];
        const delta_b2 = -(perturbacionPct / 100) * b[1]; // Direcciones opuestas amplifican el error en este sistema

        // Vector b perturbado
        const b_pert = [b[0] + delta_b1, b[1] + delta_b2];

        // Resolver ambos sistemas mediante LU
        const solOrig = NumericalMethods.solveLU(A, b).x;
        const solPert = NumericalMethods.solveLU(A, b_pert).x;

        // Calcular diferencias relativas
        const delta_x = [solPert[0] - solOrig[0], solPert[1] - solOrig[1]];
        
        const norm_b = NumericalMethods.normInfVector(b);
        const norm_db = NumericalMethods.normInfVector([delta_b1, delta_b2]);
        const rel_db = norm_db / norm_b;

        const norm_x = NumericalMethods.normInfVector(solOrig);
        const norm_dx = NumericalMethods.normInfVector(delta_x);
        const rel_dx = norm_dx / norm_x;

        // Mostrar resultados en UI
        document.getElementById('scen-f-orig-x1').textContent = solOrig[0].toFixed(4);
        document.getElementById('scen-f-orig-x2').textContent = solOrig[1].toFixed(4);
        
        document.getElementById('scen-f-pert-x1').textContent = solPert[0].toFixed(4);
        document.getElementById('scen-f-pert-x2').textContent = solPert[1].toFixed(4);

        document.getElementById('scen-f-rel-db').textContent = (rel_db * 100).toFixed(4) + "%";
        document.getElementById('scen-f-rel-dx').textContent = (rel_dx * 100).toFixed(4) + "%";

        // Explicación de la amplificación
        const amplificacion = rel_dx / (rel_db || 1e-12);
        document.getElementById('scen-f-amp-factor').textContent = amplificacion.toFixed(2) + " veces";

        // Renderizar gráfico de comparación de barras
        this.renderChartCondition('chart-scen-f', solOrig, solPert);
    },

    renderChartCondition(canvasId, orig, pert) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Producto 1 (x1)', 'Producto 2 (x2)'],
                datasets: [
                    {
                        label: 'Solución Normal (Original)',
                        data: orig,
                        backgroundColor: 'rgba(52, 211, 153, 0.6)',
                        borderColor: '#34d399',
                        borderWidth: 1.5
                    },
                    {
                        label: 'Solución Perturbada (Por Rumores)',
                        data: pert,
                        backgroundColor: 'rgba(251, 113, 133, 0.6)',
                        borderColor: '#fb7185',
                        borderWidth: 1.5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                        ticks: { color: '#a3a3a3' }
                    },
                    y: {
                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                        ticks: { color: '#a3a3a3' },
                        title: { display: true, text: 'Distribución (Flujo)', color: '#a3a3a3' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f4f4f5' } }
                }
            }
        });
    },

    // =========================================================================
    // ESCENARIO G: Difusión de Descontento (Sistemas EDOs)
    // =========================================================================
    runScenarioG() {
        // Población inicial (N0 + M0 + D0 = 100%)
        const N0 = parseFloat(document.getElementById('scen-g-n0').value) || 0.95;
        const M0 = parseFloat(document.getElementById('scen-g-m0').value) || 0.05;
        const D0 = parseFloat(document.getElementById('scen-g-d0').value) || 0.0;
        const Y0 = [N0, M0, D0];

        // Parámetros dinámicos del conflicto
        const a = parseFloat(document.getElementById('scen-g-param-a').value) || 0.8; // Contagio
        const b = parseFloat(document.getElementById('scen-g-param-b').value) || 0.1; // Calma
        const c = parseFloat(document.getElementById('scen-g-param-c').value) || 0.4; // Diálogo
        const k = parseFloat(document.getElementById('scen-g-param-k').value) || 0.2; // Reacción
        const r = parseFloat(document.getElementById('scen-g-param-r').value) || 0.15; // Desgaste

        const h = parseFloat(document.getElementById('scen-g-h').value) || 0.2;
        const tf = 30; // Simular 30 días de evolución del descontento

        // Sistema EDO: Y = [N, M, D]
        // N' = -a * N * M + b * D
        // M' =  a * N * M - c * M * D
        // D' =  k * M - r * D
        const F = (t, Y) => {
            const N = Y[0];
            const M = Y[1];
            const D = Y[2];

            const dN = -a * N * M + b * D;
            const dM = a * N * M - c * M * D;
            const dD = k * M - r * D;

            return [dN, dM, dD];
        };

        const method = document.getElementById('scen-g-method').value;
        let sol;

        if (method === 'heun') {
            sol = NumericalMethods.solveSystemODE_Heun(F, 0, tf, Y0, h);
        } else {
            sol = NumericalMethods.solveSystemODE_RK4(F, 0, tf, Y0, h);
        }

        // Obtener valores finales e interpretar
        const lastIdx = sol.t.length - 1;
        const N_fin = sol.y[0][lastIdx];
        const M_fin = sol.y[1][lastIdx];
        const D_fin = sol.y[2][lastIdx];

        document.getElementById('scen-g-val-n').textContent = (N_fin * 100).toFixed(2) + "%";
        document.getElementById('scen-g-val-m').textContent = (M_fin * 100).toFixed(2) + "%";
        document.getElementById('scen-g-val-d').textContent = (D_fin * 100).toFixed(2) + "%";

        // Interpretación del estado final del conflicto
        let interpretStr = "";
        if (M_fin < 0.05) {
            interpretStr = "Conflicto Social Resuelto: Las protestas se han pacificado por completo debido al diálogo y retorno a la neutralidad.";
        } else if (M_fin > 0.40) {
            interpretStr = "Crisis de Desestabilización: Conflicto masificado. Los manifestantes superan el 40% de la población. La mediación no da abasto.";
        } else {
            interpretStr = "Equilibrio Inestable: Conflicto contenido. El malestar social persiste en niveles manejables con constante mediación institucional.";
        }
        document.getElementById('scen-g-interpret').textContent = interpretStr;

        // Renderizar gráfico multivariable de Chart.js
        this.renderChartSystemODE('chart-scen-g', sol);
    },

    renderChartSystemODE(canvasId, sol) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        if (this.charts[canvasId]) this.charts[canvasId].destroy();

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sol.t.map(t => t.toFixed(1)),
                datasets: [
                    {
                        label: 'Ciudadanos Neutrales (N)',
                        data: sol.y[0],
                        borderColor: '#22d3ee',
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'Manifestantes Activos (M)',
                        data: sol.y[1],
                        borderColor: '#fb7185',
                        borderWidth: 2.5,
                        fill: false,
                        pointRadius: 0
                    },
                    {
                        label: 'Mediadores / Diálogo (D)',
                        data: sol.y[2],
                        borderColor: '#eab308',
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                        ticks: { color: '#a3a3a3', font: { family: 'JetBrains Mono', size: 10 } },
                        title: { display: true, text: 'Tiempo (Días)', color: '#a3a3a3' }
                    },
                    y: {
                        grid: { color: 'rgba(148, 163, 184, 0.05)' },
                        ticks: { color: '#a3a3a3', font: { family: 'JetBrains Mono', size: 10 } },
                        title: { display: true, text: 'Fracción de la Población', color: '#a3a3a3' },
                        min: 0,
                        max: 1.0
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f4f4f5' } }
                }
            }
        });
    }
};
