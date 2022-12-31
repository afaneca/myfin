export const ToggleComponent = {
  /**
   * Returns the html for a toggle component (needs to be html-safe)
   * @param id the id to identify this specific component instance
   * @param wrapperId the element inside which the component will be injected
   * @param optionsList an object with a "name" and "id" attributes
   * @param selectedId
   * @param onSelectedCallback a function with the selected optionId as a param
   */
  buildToggle: (id, wrapperId, optionsList, selectedId, onSelectedCallback) => {
    document.getElementById(wrapperId).innerHTML = `
      <style>
        .toggle-option-wrapper {
            background: var(--main-body-background);
            padding: 0px 10px;
            margin: 1px;
            cursor: pointer;
            opacity: 0.75;
            border-radius: 4px 2px;
        }
        
        .toggle-option-wrapper:hover {
            opacity: 1;
        }
        
        .selected {
            opacity: 1;
        }
      </style>
      
      <div id="toggle-${id}" style="display:flex;align-items: center;justify-content: center;width: fit-content; background: var(--main-body-background);border-radius: 4px;padding:2px;">
        ${optionsList.map(option => ToggleComponentInternals.buildToggleOption(option, selectedId == option.id)).join('')}
      </div>
    `
    // add click listener to all options
    document.querySelectorAll('.toggle-option-wrapper').forEach(elem => elem.addEventListener('click', event => {
      // on option click
      const optionId = event.currentTarget.dataset.optionId
      // update selected option
      ToggleComponent.buildToggle(id, wrapperId, optionsList, optionId, onSelectedCallback)
      // trigger callback listener
      onSelectedCallback(optionId)
    }))
  },
  /**
   * Returns the option id of the selected option
   * @param componentId the component id set when the component was first built
   */
  getSelectedOptionId: (componentId) => {
    const selectedOptionClassName = 'selected'
    const options = document.getElementById(`toggle-${componentId}`).getElementsByClassName('toggle-option-wrapper')

    const selectedOption = [...options].find(opt => opt.classList.contains(selectedOptionClassName))
    return selectedOption.dataset.optionId
  },
}

const ToggleComponentInternals = {
  buildToggleOption: (option, selected) => {
    return `
      <div class="toggle-option-wrapper ${selected ? 'selected blue-gradient-bg' : ''}" data-option-id="${option.id}">
        <p>${option.name}</p>
      </div>
    `
  },
}
//# sourceURL=js/components/toggleComponent.js