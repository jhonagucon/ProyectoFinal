/**
 * MÉTODOS NUMÉRICOS - BIBLIOTECA MATEMÁTICA CENTRAL (methods.js)
 * Proyecto: Simulación Numérica de Abastecimiento, Precios y Conflicto Social
 * Implementación académica detallada de algoritmos desde cero.
 */

const NumericalMethods = {

    // =========================================================================
    // 1. SISTEMAS DE ECUACIONES LINEALES
    // =========================================================================

    /**
     * Resuelve un sistema Ax = b mediante descomposición LU (Doolittle).
     * Retorna { x, L, U }
     */
    solveLU(A, b) {
        const n = A.length;
        // Inicializar matrices L y U
        const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
        const U = Array.from({ length: n }, () => Array(n).fill(0));

        // Descomposición LU
        for (let i = 0; i < n; i++) {
            // U_ij
            for (let k = i; k < n; k++) {
                let sum = 0;
                for (let j = 0; j < i; j++) sum += L[i][j] * U[j][k];
                U[i][k] = A[i][k] - sum;
            }
            // L_ji
            for (let k = i + 1; k < n; k++) {
                let sum = 0;
                for (let j = 0; j < i; j++) sum += L[k][j] * U[j][i];
                if (Math.abs(U[i][i]) < 1e-12) {
                    throw new Error("División entre cero en LU: Pivote nulo. Se requiere pivoteo.");
                }
                L[k][i] = (A[k][i] - sum) / U[i][i];
            }
        }

        // Sustitución hacia adelante Ly = b
        const y = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < i; j++) sum += L[i][j] * y[j];
            y[i] = b[i] - sum;
        }

        // Sustitución hacia atrás Ux = x
        const x = Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            let sum = 0;
            for (let j = i + 1; j < n; j++) sum += U[i][j] * x[j];
            x[i] = (y[i] - sum) / U[i][i];
        }

        return { x, L, U };
    },

    /**
     * Resuelve Ax = b iterativamente usando Jacobi.
     * Retorna { x, iterations, errors }
     */
    solveJacobi(A, b, x0 = null, maxIter = 100, tol = 1e-6) {
        const n = A.length;
        let x = x0 ? [...x0] : Array(n).fill(0);
        let xNew = Array(n).fill(0);
        const errors = [];
        let iter = 0;

        for (iter = 1; iter <= maxIter; iter++) {
            for (let i = 0; i < n; i++) {
                let sum = 0;
                for (let j = 0; j < n; j++) {
                    if (i !== j) sum += A[i][j] * x[j];
                }
                if (Math.abs(A[i][i]) < 1e-12) {
                    throw new Error(`Elemento diagonal nulo en fila ${i+1} en Jacobi.`);
                }
                xNew[i] = (b[i] - sum) / A[i][i];
            }

            // Calcular error absoluto/infinito
            let diff = 0;
            for (let i = 0; i < n; i++) {
                diff = Math.max(diff, Math.abs(xNew[i] - x[i]));
            }
            errors.push(diff);
            x = [...xNew];

            if (diff < tol) break;
        }

        return { x, iterations: iter > maxIter ? maxIter : iter, errors };
    },

    /**
     * Resuelve Ax = b iterativamente usando Gauss-Seidel.
     * Retorna { x, iterations, errors }
     */
    solveGaussSeidel(A, b, x0 = null, maxIter = 100, tol = 1e-6) {
        const n = A.length;
        let x = x0 ? [...x0] : Array(n).fill(0);
        const errors = [];
        let iter = 0;

        for (iter = 1; iter <= maxIter; iter++) {
            let maxDiff = 0;
            for (let i = 0; i < n; i++) {
                let sum = 0;
                for (let j = 0; j < n; j++) {
                    if (i !== j) sum += A[i][j] * x[j];
                }
                const oldVal = x[i];
                x[i] = (b[i] - sum) / A[i][i];
                maxDiff = Math.max(maxDiff, Math.abs(x[i] - oldVal));
            }
            errors.push(maxDiff);

            if (maxDiff < tol) break;
        }

        return { x, iterations: iter > maxIter ? maxIter : iter, errors };
    },

    /**
     * Resuelve Ax = b iterativamente usando SOR (Sobrerrelajación Sucesiva).
     * Retorna { x, iterations, errors }
     */
    solveSOR(A, b, omega = 1.25, x0 = null, maxIter = 100, tol = 1e-6) {
        const n = A.length;
        let x = x0 ? [...x0] : Array(n).fill(0);
        const errors = [];
        let iter = 0;

        for (iter = 1; iter <= maxIter; iter++) {
            let maxDiff = 0;
            for (let i = 0; i < n; i++) {
                let sum = 0;
                for (let j = 0; j < n; j++) {
                    if (i !== j) sum += A[i][j] * x[j];
                }
                const gsVal = (b[i] - sum) / A[i][i];
                const oldVal = x[i];
                x[i] = (1 - omega) * oldVal + omega * gsVal;
                maxDiff = Math.max(maxDiff, Math.abs(x[i] - oldVal));
            }
            errors.push(maxDiff);

            if (maxDiff < tol) break;
        }

        return { x, iterations: iter > maxIter ? maxIter : iter, errors };
    },

    /**
     * Resuelve Ax = b usando el Método del Gradiente Conjugado.
     * Nota: A debe ser simétrica y definida positiva.
     * Retorna { x, iterations, errors }
     */
    solveConjugateGradient(A, b, x0 = null, maxIter = 100, tol = 1e-6) {
        const n = A.length;
        let x = x0 ? [...x0] : Array(n).fill(0);

        // r = b - A*x
        let r = Array(n).fill(0);
        for (let i = 0; i < n; i++) {
            let Ax = 0;
            for (let j = 0; j < n; j++) Ax += A[i][j] * x[j];
            r[i] = b[i] - Ax;
        }

        let p = [...r];
        let rsold = this._dotProduct(r, r);
        const errors = [];
        let iter = 0;

        for (iter = 1; iter <= maxIter; iter++) {
            // Ap = A * p
            const Ap = Array(n).fill(0);
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) Ap[i] += A[i][j] * p[j];
            }

            const pAp = this._dotProduct(p, Ap);
            if (Math.abs(pAp) < 1e-15) break;

            const alpha = rsold / pAp;

            // x = x + alpha * p
            // r = r - alpha * Ap
            for (let i = 0; i < n; i++) {
                x[i] += alpha * p[i];
                r[i] -= alpha * Ap[i];
            }

            const rsnew = this._dotProduct(r, r);
            const err = Math.sqrt(rsnew);
            errors.push(err);

            if (err < tol) break;

            const beta = rsnew / rsold;
            for (let i = 0; i < n; i++) {
                p[i] = r[i] + beta * p[i];
            }
            rsold = rsnew;
        }

        return { x, iterations: iter > maxIter ? maxIter : iter, errors };
    },

    _dotProduct(u, v) {
        let sum = 0;
        for (let i = 0; i < u.length; i++) sum += u[i] * v[i];
        return sum;
    },

    // =========================================================================
    // 2. RAÍCES DE ECUACIONES
    // =========================================================================

    /**
     * Método de Bisección
     * Retorna { root, iterations, history }
     */
    rootBisection(f, a, b, tol = 1e-5, maxIter = 100) {
        let fa = f(a);
        let fb = f(b);
        if (fa * fb > 0) {
            throw new Error(`La función no cambia de signo en el intervalo dado [${a}, ${b}]. f(a)=${fa}, f(b)=${fb}`);
        }

        const history = [];
        let c = a;
        let iter = 0;

        for (iter = 1; iter <= maxIter; iter++) {
            c = (a + b) / 2;
            let fc = f(c);
            let err = Math.abs(b - a) / 2;

            history.push({ iter, a, b, xr: c, fc, error: err });

            if (Math.abs(fc) < 1e-15 || err < tol) break;

            if (fa * fc < 0) {
                b = c;
                fb = fc;
            } else {
                a = c;
                fa = fc;
            }
        }

        return { root: c, iterations: iter, history };
    },

    /**
     * Método de Newton-Raphson
     * Retorna { root, iterations, history }
     */
    rootNewtonRaphson(f, df, x0, tol = 1e-5, maxIter = 100) {
        let x = x0;
        const history = [];
        let iter = 0;

        for (iter = 1; iter <= maxIter; iter++) {
            const fx = f(x);
            const dfx = df(x);

            if (Math.abs(dfx) < 1e-12) {
                throw new Error("Derivada nula o extremadamente pequeña en Newton-Raphson.");
            }

            const xNext = x - fx / dfx;
            const err = Math.abs(xNext - x);

            history.push({ iter, xr: x, fc: fx, dfc: dfx, error: err });

            x = xNext;
            if (err < tol) break;
        }

        return { root: x, iterations: iter, history };
    },

    /**
     * Método de la Secante
     * Retorna { root, iterations, history }
     */
    rootSecant(f, x0, x1, tol = 1e-5, maxIter = 100) {
        let xm1 = x0;
        let x = x1;
        const history = [];
        let iter = 0;

        for (iter = 1; iter <= maxIter; iter++) {
            const fxm1 = f(xm1);
            const fx = f(x);

            if (Math.abs(fx - fxm1) < 1e-12) {
                throw new Error("División por cero en el método de la Secante.");
            }

            const xNext = x - fx * (x - xm1) / (fx - fxm1);
            const err = Math.abs(xNext - x);

            history.push({ iter, xr: x, fc: fx, error: err });

            xm1 = x;
            x = xNext;

            if (err < tol) break;
        }

        return { root: x, iterations: iter, history };
    },

    // =========================================================================
    // 3. INTERPOLACIÓN
    // =========================================================================

    /**
     * Interpolación por Polinomio de Lagrange.
     * Retorna un evaluador f(x)
     */
    interpolateLagrange(xs, ys) {
        return (x) => {
            let totalSum = 0;
            const n = xs.length;
            for (let i = 0; i < n; i++) {
                let term = ys[i];
                for (let j = 0; j < n; j++) {
                    if (i !== j) {
                        term *= (x - xs[j]) / (xs[i] - xs[j]);
                    }
                }
                totalSum += term;
            }
            return totalSum;
        };
    },

    /**
     * Interpolación por Diferencias Divididas de Newton.
     * Retorna { evaluate, coefs, table }
     */
    interpolateNewton(xs, ys) {
        const n = xs.length;
        // Crear tabla de diferencias divididas
        const table = Array.from({ length: n }, () => Array(n).fill(0));
        
        // Primera columna es y
        for (let i = 0; i < n; i++) table[i][0] = ys[i];

        // Llenar columnas siguientes
        for (let j = 1; j < n; j++) {
            for (let i = 0; i < n - j; i++) {
                table[i][j] = (table[i + 1][j - 1] - table[i][j - 1]) / (xs[i + j] - xs[i]);
            }
        }

        // Los coeficientes a_i están en la primera fila de la tabla
        const coefs = table[0];

        const evaluate = (x) => {
            let result = coefs[0];
            let product = 1;
            for (let i = 1; i < n; i++) {
                product *= (x - xs[i - 1]);
                result += coefs[i] * product;
            }
            return result;
        };

        return { evaluate, coefs, table };
    },

    /**
     * Interpolación por Splines Cúbicos Naturales.
     * Retorna { evaluate, coefficients }
     * Coeficientes para cada intervalo: S_i(x) = a_i + b_i(x - x_i) + c_i(x - x_i)^2 + d_i(x - x_i)^3
     */
    interpolateSpline(xs, ys) {
        const n = xs.length - 1; // Número de intervalos
        const h = Array(n).fill(0);
        for (let i = 0; i < n; i++) h[i] = xs[i + 1] - xs[i];

        // 1. Coeficientes a_i = y_i
        const a = [...ys];

        // 2. Resolver sistema tridiagonal para c_i
        const alpha = Array(n).fill(0);
        for (let i = 1; i < n; i++) {
            alpha[i] = (3 / h[i]) * (a[i + 1] - a[i]) - (3 / h[i - 1]) * (a[i] - a[i - 1]);
        }

        const l = Array(xs.length).fill(1);
        const mu = Array(xs.length).fill(0);
        const z = Array(xs.length).fill(0);

        l[0] = 1;
        mu[0] = 0;
        z[0] = 0;

        for (let i = 1; i < n; i++) {
            l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
            mu[i] = h[i] / l[i];
            z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
        }

        l[xs.length - 1] = 1;
        z[xs.length - 1] = 0;

        const c = Array(xs.length).fill(0);
        const b = Array(n).fill(0);
        const d = Array(n).fill(0);

        for (let j = n - 1; j >= 0; j--) {
            c[j] = z[j] - mu[j] * c[j + 1];
            b[j] = (a[j + 1] - a[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
            d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
        }

        // Formar el arreglo de coeficientes de cada spline
        const coefficients = [];
        for (let i = 0; i < n; i++) {
            coefficients.push({
                x0: xs[i],
                x1: xs[i + 1],
                a: a[i],
                b: b[i],
                c: c[i],
                d: d[i]
            });
        }

        const evaluate = (x) => {
            // Encontrar el intervalo apropiado
            let i = 0;
            if (x <= xs[0]) i = 0;
            else if (x >= xs[n]) i = n - 1;
            else {
                for (let k = 0; k < n; k++) {
                    if (x >= xs[k] && x <= xs[k + 1]) {
                        i = k;
                        break;
                    }
                }
            }
            const s = coefficients[i];
            const dx = x - s.x0;
            return s.a + s.b * dx + s.c * dx * dx + s.d * dx * dx * dx;
        };

        return { evaluate, coefficients };
    },

    // =========================================================================
    // 4. INTEGRACIÓN NUMÉRICA
    // =========================================================================

    /**
     * Integración por la Regla del Trapecio Compuesto.
     */
    integrateTrapezoidal(f, a, b, n) {
        const h = (b - a) / n;
        let sum = 0.5 * (f(a) + f(b));
        for (let i = 1; i < n; i++) {
            sum += f(a + i * h);
        }
        return sum * h;
    },

    /**
     * Integración por la Regla de Simpson 1/3 Compuesto.
     * n debe ser par.
     */
    integrateSimpson13(f, a, b, n) {
        if (n % 2 !== 0) n++; // Asegurar que sea par
        const h = (b - a) / n;
        let sum = f(a) + f(b);

        for (let i = 1; i < n; i++) {
            const coeff = i % 2 === 0 ? 2 : 4;
            sum += coeff * f(a + i * h);
        }
        return (h / 3) * sum;
    },

    /**
     * Integración por la Regla de Simpson 3/8 Compuesto.
     * n debe ser múltiplo de 3.
     */
    integrateSimpson38(f, a, b, n) {
        // Redondear n al múltiplo de 3 más cercano
        const rem = n % 3;
        if (rem !== 0) n = n + (3 - rem);
        const h = (b - a) / n;
        let sum = f(a) + f(b);

        for (let i = 1; i < n; i++) {
            const coeff = i % 3 === 0 ? 2 : 3;
            sum += coeff * f(a + i * h);
        }
        return (3 * h / 8) * sum;
    },

    // =========================================================================
    // 5. ECUACIONES DIFERENCIALES ORDINARIAS (EDO)
    // =========================================================================

    /**
     * Resuelve una EDO y' = f(t, y) con y(t0) = y0.
     * Retorna { t: [], y: [] }
     */
    solveODE_Euler(f, t0, tf, y0, h) {
        const t = [];
        const y = [];
        let currT = t0;
        let currY = y0;

        while (currT <= tf + 1e-12) {
            t.push(currT);
            y.push(currY);
            currY = currY + h * f(currT, currY);
            currT += h;
        }
        return { t, y };
    },

    solveODE_Heun(f, t0, tf, y0, h) {
        const t = [];
        const y = [];
        let currT = t0;
        let currY = y0;

        while (currT <= tf + 1e-12) {
            t.push(currT);
            y.push(currY);
            
            const k1 = f(currT, currY);
            const yPred = currY + h * k1;
            const k2 = f(currT + h, yPred);
            
            currY = currY + (h / 2) * (k1 + k2);
            currT += h;
        }
        return { t, y };
    },

    solveODE_RK4(f, t0, tf, y0, h) {
        const t = [];
        const y = [];
        let currT = t0;
        let currY = y0;

        while (currT <= tf + 1e-12) {
            t.push(currT);
            y.push(currY);
            
            const k1 = f(currT, currY);
            const k2 = f(currT + h / 2, currY + (h * k1) / 2);
            const k3 = f(currT + h / 2, currY + (h * k2) / 2);
            const k4 = f(currT + h, currY + h * k3);
            
            currY = currY + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
            currT += h;
        }
        return { t, y };
    },

    /**
     * Resuelve un sistema de EDOs Y' = F(t, Y) con Y(t0) = Y0.
     * Y es un array de variables de estado.
     * Retorna { t: [], y: [[], [], ...] }
     */
    solveSystemODE_Heun(F, t0, tf, Y0, h) {
        const t = [];
        const y = Array.from({ length: Y0.length }, () => []);
        let currT = t0;
        let Y = [...Y0];

        while (currT <= tf + 1e-12) {
            t.push(currT);
            for (let i = 0; i < Y.length; i++) y[i].push(Y[i]);

            const k1 = F(currT, Y);
            const YPred = Y.map((yi, idx) => yi + h * k1[idx]);
            const k2 = F(currT + h, YPred);

            Y = Y.map((yi, idx) => yi + (h / 2) * (k1[idx] + k2[idx]));
            currT += h;
        }
        return { t, y };
    },

    solveSystemODE_RK4(F, t0, tf, Y0, h) {
        const t = [];
        const y = Array.from({ length: Y0.length }, () => []);
        let currT = t0;
        let Y = [...Y0];

        while (currT <= tf + 1e-12) {
            t.push(currT);
            for (let i = 0; i < Y.length; i++) y[i].push(Y[i]);

            const k1 = F(currT, Y);
            
            const Y_k2 = Y.map((yi, idx) => yi + (h * k1[idx]) / 2);
            const k2 = F(currT + h / 2, Y_k2);

            const Y_k3 = Y.map((yi, idx) => yi + (h * k2[idx]) / 2);
            const k3 = F(currT + h / 2, Y_k3);

            const Y_k4 = Y.map((yi, idx) => yi + h * k3[idx]);
            const k4 = F(currT + h, Y_k4);

            Y = Y.map((yi, idx) => yi + (h / 6) * (k1[idx] + 2 * k2[idx] + 2 * k3[idx] + k4[idx]));
            currT += h;
        }
        return { t, y };
    },

    // =========================================================================
    // 6. HERRAMIENTAS DE ÁLGEBRA DE MATRICES (PARA MAL CONDICIONAMIENTO)
    // =========================================================================

    /**
     * Calcula la norma infinita de un vector.
     */
    normInfVector(v) {
        return Math.max(...v.map(Math.abs));
    },

    /**
     * Calcula la norma 1 de una matriz (suma máxima por columnas).
     */
    norm1Matrix(A) {
        const n = A.length;
        let maxColSum = 0;
        for (let j = 0; j < n; j++) {
            let colSum = 0;
            for (let i = 0; i < n; i++) colSum += Math.abs(A[i][j]);
            maxColSum = Math.max(maxColSum, colSum);
        }
        return maxColSum;
    },

    /**
     * Calcula la norma infinita de una matriz (suma máxima por filas).
     */
    normInfMatrix(A) {
        let maxRowSum = 0;
        for (let i = 0; i < A.length; i++) {
            let rowSum = 0;
            for (let j = 0; j < A[i].length; j++) rowSum += Math.abs(A[i][j]);
            maxRowSum = Math.max(maxRowSum, rowSum);
        }
        return maxRowSum;
    },

    /**
     * Invierte una matriz n x n mediante eliminación de Gauss-Jordan.
     */
    invertMatrix(A) {
        const n = A.length;
        // Clonar A y adjuntar matriz identidad
        const M = Array.from({ length: n }, (_, i) => [
            ...A[i],
            ...Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
        ]);

        for (let i = 0; i < n; i++) {
            // Encontrar pivote máximo
            let maxEl = Math.abs(M[i][i]);
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(M[k][i]) > maxEl) {
                    maxEl = Math.abs(M[k][i]);
                    maxRow = k;
                }
            }

            // Intercambiar filas
            const temp = M[maxRow];
            M[maxRow] = M[i];
            M[i] = temp;

            if (Math.abs(M[i][i]) < 1e-15) {
                throw new Error("La matriz es singular y no se puede invertir.");
            }

            // Hacer 1 en la diagonal
            const diagVal = M[i][i];
            for (let j = i; j < 2 * n; j++) {
                M[i][j] /= diagVal;
            }

            // Eliminar otras columnas
            for (let k = 0; k < n; k++) {
                if (k !== i) {
                    const factor = M[k][i];
                    for (let j = i; j < 2 * n; j++) {
                        M[k][j] -= factor * M[i][j];
                    }
                }
            }
        }

        // Extraer la parte derecha (la inversa)
        const inv = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                inv[i][j] = M[i][j + n];
            }
        }
        return inv;
    },

    /**
     * Calcula el número de condición de una matriz usando la norma infinita.
     */
    getConditionNumber(A) {
        try {
            const invA = this.invertMatrix(A);
            const normA = this.normInfMatrix(A);
            const normInvA = this.normInfMatrix(invA);
            return normA * normInvA;
        } catch (e) {
            return Infinity; // Singular
        }
    }
};
