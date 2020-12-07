"use strict";

var accountsList1
var entitiesList1
var categoriesList1

var Rules = {
    init: () => {
        Rules.getRules()
    },
    getRules: () => {
        LoadingManager.showLoading()
        RuleServices.getAllRules(
            (resp) => {
                // SUCCESS
                LoadingManager.hideLoading()
                accountsList1 = resp.accounts
                entitiesList1 = resp.entities
                categoriesList1 = resp.categories
                Rules.initRulesTable(resp.rules)
                Rules.renderAddRuleForm(resp.accounts, resp.entities, resp.categories)
            }, (err) => {
                // FAILURE
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente mais tarde!")
            }
        )
    },
    initRulesTable: (rulesArr) => {
        $("#table-wrapper").html(Rules.renderRulesTable(rulesArr))
        tableUtils.setupStaticTable("#rules-table");
    },
    renderRulesTable: (rulesList) => {
        return `
            <table id="rules-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>Condições</th>
                <th>Resultado</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
        ${rulesList.map(rule => Rules.renderRulesRow(rule)).join("")}
        </tbody>
        </table>
        `
    },
    renderRulesRow: (rule) => {
        return `
            <tr data-id='${rule.rule_id}'>
                <td>${Rules.buildConditionsString(rule)}</td>
                <td>${Rules.buildResulstsString(rule)}</td>               
                <td>
                    <i onClick="Rules.showEditRuleModal('${rule.rule_id}', ${rule.matcher_description_operator ? (`'${rule.matcher_description_operator}'`) : null}, ${rule.matcher_description_value ? (`'${rule.matcher_description_value}'`) : null}, 
                    ${rule.matcher_amount_operator ? (`'${rule.matcher_amount_operator}'`) : null}, ${rule.matcher_amount_value ? (`'${rule.matcher_amount_value}'`) : null}, ${rule.matcher_type_operator ? (`'${rule.matcher_type_operator}'`) : null},
                    ${rule.matcher_type_value ? (`'${rule.matcher_type_value}'`) : null}, ${rule.matcher_account_from_id_operator ? (`'${rule.matcher_account_from_id_operator}'`) : null}, ${rule.matcher_account_from_id_value ? (`'${rule.matcher_account_from_id_value}'`) : null},${rule.matcher_account_to_id_operator ? (`'${rule.matcher_account_to_id_operator}'`) : null
        }, ${rule.matcher_account_to_id_value ? (`'${rule.matcher_account_to_id_value}'`) : null}, ${rule.assign_account_from_id ? (`'${rule.assign_account_from_id}'`) : null}, ${rule.assign_account_to_id ? (`'${rule.assign_account_to_id}'`) : null},
                    ${rule.assign_category_id ? (`'${rule.assign_category_id}'`) : null}, ${rule.assign_entity_id ? (`'${rule.assign_entity_id}'`) : null}, ${rule.assign_type ? (`'${rule.assign_type}'`) : null})" class="material-icons table-action-icons">create</i>
                    <i onClick="Rules.showRemoveRuleModal('${rule.rule_id}')" class="material-icons table-action-icons" style="margin-left:10px">delete</i>
                </td>             
            </tr>
        `
    },
    buildConditionsString: rule => {
        let outputStr = ""
        if (rule.matcher_description_operator && rule.matcher_description_operator !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE && rule.matcher_description_value) {
            outputStr += "<u>Descrição</u>: " + rule.matcher_description_operator + " => " + "\"" + rule.matcher_description_value + "\"" + "<br>"
        }

        if (rule.matcher_amount_operator && rule.matcher_amount_operator !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE && rule.matcher_amount_value) {
            outputStr += "<u>Valor</u>: " + rule.matcher_amount_operator + " => " + "\"" + rule.matcher_amount_value + "\"" + "<br>"
        }

        if (rule.matcher_type_operator && rule.matcher_type_operator !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE && rule.matcher_type_value) {
            outputStr += "<u>Tipo</u>: " + rule.matcher_type_operator + " => " + "\"" + rule.matcher_type_value + "\"" + "<br>"
        }

        if (rule.matcher_account_from_id_operator && rule.matcher_account_from_id_operator !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE && rule.matcher_account_from_id_value) {
            outputStr += "<u>Conta Origem</u>: " + rule.matcher_account_from_id_operator + " => " + "\"" + LocalDataManager.getUserAccount(rule.matcher_account_from_id_value).name + "\"" + "<br>"
        }

        if (rule.matcher_account_to_id_operator && rule.matcher_account_to_id_operator !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE && rule.matcher_account_to_id_value) {
            outputStr += "<u>Conta Destino</u>: " + rule.matcher_account_to_id_operator + " => " + "\"" + LocalDataManager.getUserAccount(rule.matcher_account_to_id_value).name + "\"" + "<br>"
        }

        return outputStr
    }, buildResulstsString: rule => {
        let outputStr = ""
        if (rule.assign_category_id && rule.assign_category_id !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
            outputStr += "<u>Atribuir Categoria</u>: " + Rules.getCategoryName(rule.assign_category_id) + "<br>"
        }

        if (rule.assign_entity_id && rule.assign_entity_id !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
            outputStr += "<u>Atribuir Entidade</u>: " + Rules.getEntityName(rule.assign_entity_id) + "<br>"
        }

        if (rule.assign_account_from_id && rule.assign_account_from_id !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
            outputStr += "<u>Atribuir Conta Origem</u>: " + LocalDataManager.getUserAccount(rule.assign_account_from_id).name + "<br>"
        }

        if (rule.assign_account_to_id && rule.assign_account_to_id !== MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
            outputStr += "<u>Atribuir Conta Destino</u>: " + LocalDataManager.getUserAccount(rule.assign_account_to_id).name + "<br>"
        }

        return outputStr
    },
    getCategoryName: (catID) => {
        const category = categoriesList1.find(cat => cat.category_id == catID)
        if (category) return category.name
        return catID
    },
    getEntityName: (entID) => {
        const entity = entitiesList1.find(ent => ent.entity_id == entID)
        if (entity) return entity.name
        return entID
    },
    showEditRuleModal: (ruleID, matcher_description_operator, matcher_description_value, matcher_amount_operator, matcher_amount_value, matcher_type_operator, matcher_type_value,
                        matcher_account_from_id_operator, matcher_account_from_id_value, matcher_account_to_id_operator, matcher_account_to_id_value,
                        assign_account_from_id, assign_account_to_id, assign_category_id, assign_entity_id, assign_type) => {
        // expand add rule form

        Rules.renderAddRuleForm(accountsList1, entitiesList1, categoriesList1, matcher_description_operator, matcher_description_value, matcher_amount_operator, matcher_amount_value, matcher_type_operator, matcher_type_value, matcher_account_from_id_operator, matcher_account_from_id_value,
            matcher_account_to_id_operator, matcher_account_to_id_value, assign_account_from_id, assign_account_to_id, assign_category_id, assign_entity_id, assign_type)
        $('.collapsible').collapsible('open');
        $('#add-rule-btn').text("Atualizar Regra")
        $('#add-rule-collapsible-header').html("<i class='material-icons'>edit</i>Atualizar Regra")

        // set btn onClick
        $('#add-rule-btn').removeAttr('onclick');
        $('#add-rule-btn').on("click", () => {
            Rules.editRule(ruleID)
        })

        // scroll to addRule form
        LayoutUtils.smoothScrollToDiv("#add-rule-collapsible-header")
    },
    editRule: ruleID => {

        const descriptionOperator = $('select#operator-select-description').val()
        const descriptionValue = $('input#value-input-description').val()
        const amountOperator = $('select#operator-select-amount').val()
        const amountValue = $('input#value-input-amount').val()
        const typeOperator = $('select#operator-select-type').val()
        const typeValue = $('select#value-select-type').val()
        const accountFromIDOperator = $('select#operator-select-account-from').val()

        let accountFromIDValue = $('select#operator-select-account-from-value').val()
        if (accountFromIDValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) accountFromIDValue = null

        const accountToIDOperator = $('select#operator-select-account-to').val()

        let accountToIDValue = $('select#value-select-account-to').val()
        if (accountToIDValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) accountToIDValue = null

        let categoryAssignValue = $('select#value-select-category-assign').val()
        if (categoryAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) categoryAssignValue = null

        let entityAssignValue = $('select#value-select-entity-assign').val()
        if (entityAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) entityAssignValue = null

        let accountFromAssignValue = $('select#value-select-account-from-assign').val()
        if (accountFromAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) accountFromAssignValue = null

        let accountToAssignValue = $('select#value-select-account-to-assign').val()
        if (accountToAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) accountToAssignValue = null


        LoadingManager.showLoading()
        RuleServices.editRule(ruleID, descriptionOperator, descriptionValue, amountOperator, amountValue, typeOperator,
            typeValue, accountToIDOperator, accountToIDValue, accountFromIDOperator, accountFromIDValue, categoryAssignValue,
            entityAssignValue, accountToAssignValue, accountFromAssignValue, null,
            (resp) => {
                // SUCCESS
                LoadingManager.hideLoading()
                configs.goToPage("rules", true)
            }, (err) => {
                // FAILURE
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente...")
            })
    },
    showRemoveRuleModal: (ruleID) => {
        $("#modal-global").modal("open")
        let txt = `
                <h4>Remover regra #<b>${ruleID}</b></h4>
                <div class="row">
                    <p>Tem a certeza de que pretende remover esta regra?</p>
                    <b>Esta ação é irreversível!</b>

                </div>
                `;

        let actionLinks = `<a  class="modal-close waves-effect waves-green btn-flat enso-blue-bg enso-border white-text">Cancelar</a>
            <a onClick="Rules.removeRule(${ruleID})"  class="waves-effect waves-red btn-flat enso-salmon-bg enso-border white-text">Remover</a>`;
        $("#modal-global .modal-content").html(txt);
        $("#modal-global .modal-footer").html(actionLinks);
    },
    removeRule: (ruleID) => {
        LoadingManager.showLoading()
        RuleServices.removeRule(ruleID,
            (resp) => {
                // SUCCESS
                LoadingManager.hideLoading()
                configs.goToPage("rules", true)
            }, (err) => {
                // FAILURE
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente...")
            })
    },
    renderAddRuleForm: (accountsList, entitiesList, categoriesList, matcher_description_operator = null, matcher_description_value = null,
                        matcher_amount_operator = null, matcher_amount_value = null, matcher_type_operator = null, matcher_type_value = null,
                        matcher_account_from_id_operator = null, matcher_account_from_id_value = null, matcher_account_to_id_operator = null, matcher_account_to_id_value = null,
                        assign_account_from_id = null, assign_account_to_id = null, assign_category_id = null, assign_entity_id = null, assign_type = null) => {

        $("div#add-rule-form-wrapper").html(
            `
             <!---->
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-description">
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE}" ${(!matcher_description_operator || matcher_description_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'selected' : ''}>Ignorar
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_CONTAINS}" ${(matcher_description_operator && matcher_description_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_CONTAINS) ? 'selected' : ''}>Contém
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_CONTAINS}" ${(matcher_description_operator && matcher_description_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_CONTAINS) ? 'selected' : ''}>Não Contém
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS}" ${(matcher_description_operator && matcher_description_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS) ? 'selected' : ''}>É igual
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS}" ${(matcher_description_operator && matcher_description_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS) ? 'selected' : ''}>Não é igual
                                </option>
                            </select>
                            <label>Descrição</label>
                        </div>
                        <div class="input-field col s10">
                            <input id="value-input-description" type="text" placeholder="Texto da descrição..."
                                    ${(matcher_description_value) ? 'value="' + matcher_description_value + '"' : ''}
                                   ${(!matcher_description_operator || matcher_description_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'disabled' : ''} />
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-amount">
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE}" ${(!matcher_amount_operator || matcher_amount_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'selected' : ''}>Ignorar
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS}" ${(matcher_amount_operator && matcher_amount_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS) ? 'selected' : ''}>É igual
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS}" ${(matcher_amount_operator && matcher_amount_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS) ? 'selected' : ''}>Não é igual
                                </option>
                            </select>
                            <label>Montante</label>
                        </div>
                        <div class="input-field col s10">
                            <input id="value-input-amount" type="number" value="${matcher_amount_value ? matcher_amount_value : '0.00'}" step="0.01"
                             ${(!matcher_amount_operator || matcher_amount_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'disabled' : ''} />
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-type">
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE}" ${(!matcher_type_operator || matcher_type_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'selected' : ''}>Ignorar
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS}" ${(matcher_type_operator && matcher_type_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS) ? 'selected' : ''}>É igual
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS}" ${(matcher_type_operator && matcher_type_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS) ? 'selected' : ''}>Não é igual
                                </option>
                            </select>
                            <label>Tipo de Transação</label>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-type" ${(!matcher_type_operator || matcher_type_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'disabled' : ''}>
                                <option value="" ${(!matcher_type_value) ? 'disabled' : ''}>Ignorar</option>
                                <option value="${MYFIN.TRX_TYPES.EXPENSE}" ${(matcher_type_value && matcher_type_value == MYFIN.TRX_TYPES.EXPENSE) ? 'selected' : ''}>Débito</option>
                                <option value="${MYFIN.TRX_TYPES.INCOME}" ${(matcher_type_value && matcher_type_value == MYFIN.TRX_TYPES.INCOME) ? 'selected' : ''}>Crédito</option>
                                <option value="${MYFIN.TRX_TYPES.TRANSFER}" ${(matcher_type_value && matcher_type_value == MYFIN.TRX_TYPES.TRANSFER) ? 'selected' : ''}>Transferência</option>
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-account-from">
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE}" ${(!matcher_account_from_id_operator || matcher_account_from_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'selected' : ''}>Ignorar
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS}" ${(matcher_account_from_id_operator && matcher_account_from_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS) ? 'selected' : ''}>É igual
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS}" ${(matcher_account_from_id_operator && matcher_account_from_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS) ? 'selected' : ''}>Não é igual
                                </option>
                            </select>
                            <label>Conta Origem</label>
                        </div>
                        <div class="input-field col s10">
                            <select id="operator-select-account-from-value" ${(!matcher_account_from_id_operator || matcher_account_from_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'disabled' : ''}>
                                <option value="" ${!matcher_account_from_id_value ? 'selected' : ''}>Ignorar</option>
                                 ${accountsList.map(acc => Rules.renderAccountsSelectOption(acc.account_id, acc.name, matcher_account_from_id_value)).join("")}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-account-to">
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE}" ${(!matcher_account_to_id_operator || matcher_account_to_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'selected' : ''}>Ignorar
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS}" ${(matcher_account_to_id_operator && matcher_account_to_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_EQUALS) ? 'selected' : ''}>É igual
                                </option>
                                <option value="${MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS}" ${(matcher_account_to_id_operator && matcher_account_to_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_NOT_EQUALS) ? 'selected' : ''}>Não é igual
                                </option>
                            </select>
                            <label>Conta Destino</label>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-account-to" ${(!matcher_account_to_id_operator || matcher_account_to_id_operator == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) ? 'disabled' : ''}>
                                <option value="" ${!matcher_account_to_id_value ? 'selected' : ''}>Ignorar</option>
                                ${accountsList.map(acc => Rules.renderAccountsSelectOption(acc.account_id, acc.name, matcher_account_to_id_value)).join("")}
                            </select>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="input-field col s2">
                            <p>Categoria a atribuir</p>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-category-assign">
                                <option value="" ${!assign_category_id ? 'selected' : ''}>Ignorar</option>
                                ${categoriesList.map(cat => Rules.renderCategoriesSelectOption(cat.category_id, cat.name, assign_category_id)).join("")}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <p>Entidade a atribuir</p>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-entity-assign">
                                <option value="" ${!assign_entity_id ? 'selected' : ''}>Ignorar</option>
                                ${entitiesList.map(ent => Rules.renderEntitiesSelectOption(ent.entity_id, ent.name, assign_entity_id)).join("")}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <p>Conta Origem a atribuir</p>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-account-from-assign">
                                <option value="" ${!assign_account_from_id ? 'selected' : ''}>Ignorar</option>
                                ${accountsList.map(acc => Rules.renderAccountsSelectOption(acc.account_id, acc.name, assign_account_from_id)).join("")}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <p>Conta Destino a atribuir</p>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-account-to-assign">
                                <option value="" ${!assign_account_to_id ? 'selected' : ''}>Ignorar</option>
                                ${accountsList.map(acc => Rules.renderAccountsSelectOption(acc.account_id, acc.name, assign_account_to_id)).join("")}
                            </select>
                        </div>
                    </div>

                    <a id="add-rule-btn" class="waves-effect waves-light btn green-gradient-bg" style="margin: -15px; float:right;"
                       onClick="Rules.addRule()"><i
                            class="material-icons left">add_circle</i>Adicionar Regra</a>
                    <!---->
            `
        )

        $('select#operator-select-description').formSelect();
        $('select#operator-select-description').on('change', function () {
            if (this.value == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
                $('input#value-input-description').val("");
                $('input#value-input-description').prop("disabled", true);
            } else {
                $('input#value-input-description').prop("disabled", false);
            }
        });

        $('select#operator-select-amount').formSelect();
        $('select#operator-select-amount').on('change', function () {
            if (this.value == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
                $('input#value-input-amount').val("0.00");
                $('input#value-input-amount').prop("disabled", true);
            } else {
                $('input#value-input-amount').prop("disabled", false);
            }
        });

        $('select#operator-select-type').formSelect();
        $('select#value-select-type').formSelect();
        $('select#operator-select-type').on('change', function () {
            if (this.value == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
                $('select#value-select-type').prop("disabled", true);
                $('#value-select-type').formSelect('destroy');
                $('#value-select-type').prop('disabled', true);
                $('#value-select-type').formSelect();
            } else {
                $('select#value-select-type').prop("disabled", false);
                $('#value-select-type').formSelect('destroy');
                $('#value-select-type').prop('disabled', false);
                $('#value-select-type').formSelect();
            }
        });


        $('select#operator-select-account-from').formSelect();
        $('select#operator-select-account-from-value').select2();
        $('select#operator-select-account-from').on('change', function () {
            if (this.value == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
                $('#operator-select-account-from-value').select2('destroy');
                $('#operator-select-account-from-value').prop('disabled', true);
                $('#operator-select-account-from-value').select2();
                $('select#operator-select-account-from-value').prop("disabled", true);
            } else {
                $('select#operator-select-account-from-value').prop("disabled", false);
                $('#operator-select-account-from-value').select2('destroy');
                $('#operator-select-account-from-value').prop('disabled', false);
                $('#operator-select-account-from-value').select2();
            }
        });


        $('select#operator-select-account-to').formSelect();
        $('select#value-select-account-to').select2();
        $('select#operator-select-account-to').on('change', function () {
            if (this.value == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) {
                $('#value-select-account-to').select2('destroy');
                $('#value-select-account-to').prop('disabled', true);
                $('#value-select-account-to').select2();
                $('select#value-select-account-to').prop("disabled", true);
            } else {
                $('select#value-select-account-to').prop("disabled", false);
                $('#value-select-account-to').select2('destroy');
                $('#value-select-account-to').prop('disabled', false);
                $('#value-select-account-to').select2();
            }
        });


        $('select#value-select-category-assign').select2()//.formSelect();
        $('select#value-select-entity-assign').select2()//.formSelect();
        $('select#value-select-account-from-assign').select2()//.formSelect();
        $('select#value-select-account-to-assign').select2()//.formSelect();
    },
    addRule: () => {
        const descriptionOperator = $('select#operator-select-description').val()
        const descriptionValue = $('input#value-input-description').val()
        const amountOperator = $('select#operator-select-amount').val()
        const amountValue = $('input#value-input-amount').val()
        const typeOperator = $('select#operator-select-type').val()
        const typeValue = $('select#value-select-type').val()
        const accountFromIDOperator = $('select#operator-select-account-from').val()

        let accountFromIDValue = $('select#operator-select-account-from-value').val()
        if (accountFromIDValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) accountFromIDValue = null
        const accountToIDOperator = $('select#operator-select-account-to').val()

        let accountToIDValue = $('select#value-select-account-to').val()
        if (accountToIDValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) accountToIDValue = null

        let categoryAssignValue = $('select#value-select-category-assign').val()
        if (categoryAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) categoryAssignValue = null

        let entityAssignValue = $('select#value-select-entity-assign').val()
        if (entityAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) entityAssignValue = null

        let accountFromAssignValue = $('select#value-select-account-from-assign').val()
        if (accountFromAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) accountFromAssignValue = null

        let accountToAssignValue = $('select#value-select-account-to-assign').val()
        if (accountToAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) accountToAssignValue = null


        LoadingManager.showLoading()
        RuleServices.addRule(descriptionOperator, descriptionValue, amountOperator, amountValue, typeOperator,
            typeValue, accountToIDOperator, accountToIDValue, accountFromIDOperator, accountFromIDValue, categoryAssignValue,
            entityAssignValue, accountToAssignValue, accountFromAssignValue, null,
            (resp) => {
                // SUCCESS
                LoadingManager.hideLoading()
                configs.goToPage("rules", true)
            }, (err) => {
                // FAILURE
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Ocorreu um erro. Por favor, tente novamente...")
            })
    },
    renderAccountsSelectOption: (account_id, account_name, default_value = MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) => {
        return `
           <option value="${account_id}" ${(default_value == account_id) ? 'selected' : ''}>${account_name}</option>
        `
    },
    renderEntitiesSelectOption: (entity_id, name, default_value = MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) => {
        return `
           <option value="${entity_id}" ${(default_value == entity_id) ? 'selected' : ''}>${name}</option>
        `
    },
    renderCategoriesSelectOption: (category_id, name, default_value = MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) => {
        return `
           <option value="${category_id}" ${(default_value == category_id) ? 'selected' : ''}>${name}</option>
        `
    },
}

//# sourceURL=js/rules.js