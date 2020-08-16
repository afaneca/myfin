"use strict";

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
            <table id="accounts-table" class="display browser-defaults" style="width:100%">
        <thead>
            <tr>
                <th>Operador</th>
                <th>Descrição</th>
                <th>Operador</th>
                <th>Montante</th>
                <th>Operador</th>
                <th>Tipo</th>
                <th>Operador</th>
                <th>Conta Origem</th>
                <th>Operador</th>
                <th>Conta Destino</th>
                <th>Regra</th>
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
                <td>${rule.matcher_description_operator}</td>
                <td>${rule.matcher_description_value}</td>
                <td>${rule.matcher_amount_operator}</td>
                <td>${rule.matcher_amount_value}</td>
                <td>${rule.matcher_type_operator}</td>
                <td>${rule.matcher_type_value}</td>
                <td>${rule.matcher_account_from_id_operator}</td>
                <td>${rule.matcher_account_from_id_value}</td>
                <td>${rule.matcher_account_to_id_operator}</td>
                <td>${rule.matcher_account_to_id_value}</td>
                <td></td>               
                <td>
                    <i onClick="Rules.showEditRuleModal('${rule.rule_id}')" class="material-icons table-action-icons">create</i>
                    <i onClick="Rules.showRemoveRuleModal('${rule.rule_id}')" class="material-icons table-action-icons" style="margin-left:10px">delete</i>
                </td>             
            </tr>
        `
    },
    showEditRuleModal: (ruleID) => {

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
    renderAddRuleForm: (accountsList, entitiesList, categoriesList) => {
        $("div#add-rule-form-wrapper").html(
            `
             <!---->
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-description">
                                <option value="IG" selected>Ignorar
                                </option>
                                <option value="CONTAINS">Contém</option>
                                <option value="NOTCONTAINS">Não contém
                                </option>
                                <option value="EQ">Igual</option>
                                <option value="NEQ">Não é igual
                                </option>
                            </select>
                            <label>Descrição</label>
                        </div>
                        <div class="input-field col s10">
                            <input id="value-input-description" type="text" placeholder="Texto da descrição..."
                                   disabled/>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-amount">
                                <option value="IG" selected>Ignorar
                                </option>
                                <option value="EQ">Igual</option>
                                <option value="NEQ">Não é igual
                                </option>
                            </select>
                            <label>Montante</label>
                        </div>
                        <div class="input-field col s10">
                            <input id="value-input-amount" type="number" value="0.00" step="0.01" disabled/>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-type">
                                <option value="IG" selected>Ignorar
                                </option>
                                <option value="EQ">Igual</option>
                                <option value="NEQ">Não é igual
                                </option>
                            </select>
                            <label>Tipo de Transação</label>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-type" disabled>
                                <option value="" selected>Ignorar</option>
                                <option value="E">Débito</option>
                                <option value="I">Crédito</option>
                                <option value="T">Transferência</option>
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-account-from">
                                <option value="IG" selected>Ignorar
                                </option>
                                <option value="EQ">Igual</option>
                                <option value="NEQ">Não é igual
                                </option>
                                </option>
                            </select>
                            <label>Conta Origem</label>
                        </div>
                        <div class="input-field col s10">
                            <select id="operator-select-account-from-value" disabled>
                                <option value="" selected>Ignorar</option>
                                 ${accountsList.map(acc => Rules.renderAccountsSelectOption(acc.account_id, acc.name)).join("")}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <select id="operator-select-account-to">
                                <option value="IG" selected>Ignorar
                                </option>
                                <option value="EQ">Igual</option>
                                <option value="NEQ">Não é igual
                                </option>
                            </select>
                            <label>Conta Destino</label>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-account-to" disabled>
                                <option value="" selected>Ignorar</option>
                                ${accountsList.map(acc => Rules.renderAccountsSelectOption(acc.account_id, acc.name)).join("")}
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
                                <option value="" selected>Ignorar</option>
                                ${categoriesList.map(cat => Rules.renderCategoriesSelectOption(cat.category_id, cat.name)).join("")}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <p>Entidade a atribuir</p>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-entity-assign">
                                <option value="" selected>Ignorar</option>
                                ${entitiesList.map(ent => Rules.renderEntitiesSelectOption(ent.entity_id, ent.name)).join("")}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <p>Conta Origem a atribuir</p>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-account-from-assign">
                                <option value="" selected>Ignorar</option>
                                ${accountsList.map(acc => Rules.renderAccountsSelectOption(acc.account_id, acc.name)).join("")}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="input-field col s2">
                            <p>Conta Destino a atribuir</p>
                        </div>
                        <div class="input-field col s10">
                            <select id="value-select-account-to-assign">
                                <option value="" selected>Ignorar</option>
                                ${accountsList.map(acc => Rules.renderAccountsSelectOption(acc.account_id, acc.name)).join("")}
                            </select>
                        </div>
                    </div>

                    <a class="waves-effect waves-light btn green-gradient-bg" style="margin: -15px; float:right;"
                       onClick="Rules.addRule()"><i
                            class="material-icons left">add_circle</i>Adicionar Conta</a>
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
        const accountToIDOperator = $('select#value-select-account-to').val()

        let accountToIDValue = $('select#operator-select-account-to').val()
        if (accountToIDValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) accountToIDValue = null

        let categoryAssignValue = $('select#value-select-category-assign').val()
        if (categoryAssignValue == MYFIN.RULES_OPERATOR.DEFAULT_RULES_OPERATOR_IGNORE) categoryAssignValue = null
        debugger
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
    renderAccountsSelectOption: (account_id, account_name) => {
        return `
           <option value="${account_id}">${account_name}</option>
        `
    },
    renderEntitiesSelectOption: (entity_id, name) => {
        return `
           <option value="${entity_id}">${name}</option>
        `
    },
    renderCategoriesSelectOption: (category_id, name) => {
        return `
           <option value="${category_id}">${name}</option>
        `
    },
}

//# sourceURL=js/rules.js