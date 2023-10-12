import { Localization } from "../utils/localization.js";

export const GraphEmptyViewComponent = {
  buildDefaultGraphEmptyView: (label = Localization.getString('common.noDataToDisplay')) => `
    <div style="margin: 0 auto;width: auto;text-align: center;">
        <p>${label}</p>
    </div>
  `,
}

//# sourceURL=js/components/graphEmptyView.js
