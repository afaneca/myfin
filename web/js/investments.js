'use strict';

var Investments = {
  changeTabs: activeID => {
    switch (activeID) {
      case 'tab-inv-dashboard':
        /*Stats.initTabEvolutionOfPatrimony();*/
        window.history.replaceState(null, null, '#!investments?tab=dashboard');
        break;
      case 'tab-inv-assets':
/*
        Stats.initTabProjections();
*/
        window.history.replaceState(null, null, '#!investments?tab=assets');
        break;
      case 'tab-inv-transactions':
        /*Stats.clearCanvasAndTableWrapper('#chart_pie_cat_expenses_evolution_table', 'chart_pie_cat_expenses_evolution');
        $('#chart_pie_cat_expenses_evolution')
          .remove();
        $('#canvas_chart_expenses_evo_wrapper')
          .append(' <canvas id="chart_pie_cat_expenses_evolution" width="800" height="300"></canvas>');
        Stats.initExpensesPerCatEvolution();*/
        window.history.replaceState(null, null, '#!investments?tab=transactions');
        break;
      case 'tab-inv-reports':
       /* Stats.clearCanvasAndTableWrapper('#chart_pie_cat_income_evolution_table', 'chart_pie_cat_income_evolution');
        $('#chart_pie_cat_income_evolution')
          .remove();
        $('#canvas_chart_income_evo_wrapper')
          .append(' <canvas id="chart_pie_cat_income_evolution" width="800" height="300"></canvas>');

        Stats.initIncomePerCatEvolution();*/
        window.history.replaceState(null, null, '#!investments?tab=reports');
        break;
      default:
        break;
    }
  },
};

//# sourceURL=js/investments.js