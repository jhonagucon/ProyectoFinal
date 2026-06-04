/**
 * MÉTODOS NUMÉRICOS - CONTROLADOR PRINCIPAL (app.js)
 * Maneja la navegación de pestañas y sincroniza la interacción.
 */

(function() {
    'use strict';

    // Inicialización del sistema
    document.addEventListener("DOMContentLoaded", () => {
        initNavigation();
        initEventListeners();
        
        // Ejecutar simulaciones por primera vez con datos por defecto
        Scenarios.runScenarioA();
        Scenarios.runScenarioB();
        Scenarios.initScenarioC(); // Esto dispara la inicialización de la tabla y corre el Escenario C
        Scenarios.runScenarioD();
        Scenarios.runScenarioE();
        Scenarios.runScenarioF();
        Scenarios.runScenarioG();

        // Efectos de transición suaves en la carga
        document.querySelectorAll('.section').forEach(s => {
            s.style.opacity = '1';
            s.style.transform = 'translateY(0)';
        });
    });

    // Control de Navegación por Pestañas (Tabs)
    function initNavigation() {
        const tabLinks = document.querySelectorAll(".nav-link");
        const sections = document.querySelectorAll(".section");

        tabLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const targetId = link.getAttribute("data-target");

                // Quitar clase activa de todos los enlaces
                tabLinks.forEach(l => l.classList.remove("active"));
                // Ocultar todas las secciones
                sections.forEach(s => s.classList.add("hidden"));

                // Activar este enlace y mostrar la sección objetivo
                link.classList.add("active");
                const targetSec = document.getElementById(targetId);
                targetSec.classList.remove("hidden");

                // Rediseñar los gráficos asociados a la sección activa
                // Esto es crítico para corregir los problemas de renderizado de Canvas/Chart.js cuando cambian de display:none
                if (targetId === "section-scen-a") Scenarios.runScenarioA();
                else if (targetId === "section-scen-b") Scenarios.runScenarioB();
                else if (targetId === "section-scen-c") Scenarios.runScenarioC();
                else if (targetId === "section-scen-d") Scenarios.runScenarioD();
                else if (targetId === "section-scen-e") Scenarios.runScenarioE();
                else if (targetId === "section-scen-f") Scenarios.runScenarioF();
                else if (targetId === "section-scen-g") Scenarios.runScenarioG();

                // Scroll suave al inicio de la sección
                targetSec.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // Vinculación de Eventos en los Controles de Simulación
    function initEventListeners() {
        // Escenario A
        bindControl('scen-a-blockage', 'val-a-blockage', v => (parseFloat(v)*100).toFixed(0) + "%", () => Scenarios.runScenarioA());
        bindControl('scen-a-demand', 'val-a-demand', v => parseFloat(v).toFixed(1) + "x", () => Scenarios.runScenarioA());
        document.getElementById('scen-a-method').addEventListener('change', () => Scenarios.runScenarioA());
        document.getElementById('scen-a-omega').addEventListener('input', () => Scenarios.runScenarioA());
        document.getElementById('btn-recalc-a').addEventListener('click', () => Scenarios.runScenarioA());

        // Escenario B
        bindControl('scen-b-panic', 'val-b-panic', v => "+" + (parseFloat(v)*100).toFixed(0) + "%", () => Scenarios.runScenarioB());
        document.getElementById('scen-b-r0').addEventListener('input', () => Scenarios.runScenarioB());
        document.getElementById('scen-b-in').addEventListener('input', () => Scenarios.runScenarioB());
        document.getElementById('scen-b-out').addEventListener('input', () => Scenarios.runScenarioB());
        document.getElementById('scen-b-rcrit').addEventListener('input', () => Scenarios.runScenarioB());
        document.getElementById('scen-b-h').addEventListener('change', () => Scenarios.runScenarioB());
        document.getElementById('btn-recalc-b').addEventListener('click', () => Scenarios.runScenarioB());

        // Escenario C
        document.getElementById('scen-c-eval-day').addEventListener('input', () => Scenarios.runScenarioC());
        document.getElementById('btn-add-point-c').addEventListener('click', () => Scenarios.addPointC());
        document.getElementById('btn-recalc-c').addEventListener('click', () => Scenarios.runScenarioC());

        // Escenario D
        bindControl('scen-d-n', 'val-d-n', v => v + " intervalos", () => Scenarios.runScenarioD());
        document.getElementById('btn-recalc-d').addEventListener('click', () => Scenarios.runScenarioD());

        // Escenario E
        const caseSelector = document.getElementById('scen-e-case');
        const coeffGroup = document.getElementById('scen-e-coefficients-group');
        const inputA = document.getElementById('scen-e-a');
        const inputB = document.getElementById('scen-e-b');

        caseSelector.addEventListener('change', () => {
            const val = caseSelector.value;
            if (val === 'case1') {
                coeffGroup.style.display = 'block';
                inputA.value = '0';
                inputB.value = '30';
            } else if (val === 'case2') {
                coeffGroup.style.display = 'none';
                inputA.value = '100';
                inputB.value = '300';
            } else if (val === 'case3') {
                coeffGroup.style.display = 'none';
                inputA.value = '-2';
                inputB.value = '0';
            }
            Scenarios.runScenarioE();
        });

        document.getElementById('scen-e-method').addEventListener('change', () => Scenarios.runScenarioE());
        inputA.addEventListener('input', () => Scenarios.runScenarioE());
        inputB.addEventListener('input', () => Scenarios.runScenarioE());
        document.getElementById('scen-e-coeff-a').addEventListener('input', () => Scenarios.runScenarioE());
        document.getElementById('scen-e-coeff-k').addEventListener('input', () => Scenarios.runScenarioE());
        document.getElementById('scen-e-coeff-b').addEventListener('input', () => Scenarios.runScenarioE());
        document.getElementById('scen-e-coeff-c').addEventListener('input', () => Scenarios.runScenarioE());
        document.getElementById('btn-recalc-e').addEventListener('click', () => Scenarios.runScenarioE());

        // Escenario F
        bindControl('scen-f-rumor', 'val-f-rumor', v => "+" + parseFloat(v).toFixed(1) + "%", () => Scenarios.runScenarioF());
        document.getElementById('btn-recalc-f').addEventListener('click', () => Scenarios.runScenarioF());

        // Escenario G
        bindControl('scen-g-param-a', 'val-g-a', v => parseFloat(v).toFixed(2), () => Scenarios.runScenarioG());
        bindControl('scen-g-param-b', 'val-g-b', v => parseFloat(v).toFixed(2), () => Scenarios.runScenarioG());
        bindControl('scen-g-param-c', 'val-g-c', v => parseFloat(v).toFixed(2), () => Scenarios.runScenarioG());
        bindControl('scen-g-param-k', 'val-g-k', v => parseFloat(v).toFixed(2), () => Scenarios.runScenarioG());
        bindControl('scen-g-param-r', 'val-g-r', v => parseFloat(v).toFixed(2), () => Scenarios.runScenarioG());
        
        document.getElementById('scen-g-n0').addEventListener('input', () => Scenarios.runScenarioG());
        document.getElementById('scen-g-m0').addEventListener('input', () => Scenarios.runScenarioG());
        document.getElementById('scen-g-d0').addEventListener('input', () => Scenarios.runScenarioG());
        document.getElementById('scen-g-method').addEventListener('change', () => Scenarios.runScenarioG());
        document.getElementById('scen-g-h').addEventListener('change', () => Scenarios.runScenarioG());
        document.getElementById('btn-recalc-g').addEventListener('click', () => Scenarios.runScenarioG());

        // Manejador del Resize para todos los gráficos
        window.addEventListener('resize', () => {
            Object.values(Scenarios.charts).forEach(chart => {
                if (chart) chart.resize();
            });
        });
    }

    // Asistente para enlazar controles deslizantes (sliders) con etiquetas de valor y callback
    function bindControl(sliderId, labelId, formatFn, callback) {
        const slider = document.getElementById(sliderId);
        const label = document.getElementById(labelId);
        
        if (slider && label) {
            slider.addEventListener('input', () => {
                label.textContent = formatFn(slider.value);
                callback();
            });
        }
    }

})();
