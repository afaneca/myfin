export const GraphEmptyViewComponent = {
  buildDefaultGraphEmptyView: (label = 'Sem dados para apresentar') => `
    <div style="margin: 0 auto;width: auto;text-align: center;">
        <p>${label}</p>
    </div>
  `,
};

//# sourceURL=js/components/graphEmptyView.js
