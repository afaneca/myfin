"use strict";

var Profile = {
    init: () => {
        $("button#change_pw_btn").on("click", function (event) {
            event.preventDefault();
            Profile.onChangePasswordBtnClick()
        })

        Profile.initChangeThemeOptions()
        LoadingManager.showLoading()
        StatServices.getUserCounterStats(
            (resp) => {
                // SUCCESS
                LoadingManager.hideLoading()
                Profile.fillStatsForNerds(resp)
            }, (err) => {
                // FAILURE
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Aconteceu algo de errado. Por favor, tente novamente.")
            }
        )
    },
    fillStatsForNerds: (statsData) => {
        if (statsData.nr_of_trx)
            $("span#counter_created_trx").text(statsData.nr_of_trx)
        if (statsData.nr_of_entities)
            $("span#counter_created_entities").text(statsData.nr_of_entities)
        if (statsData.nr_of_categories)
            $("span#counter_created_categories").text(statsData.nr_of_categories)
        if (statsData.nr_of_accounts)
            $("span#counter_created_accounts").text(statsData.nr_of_accounts)
        if (statsData.nr_of_budgets)
            $("span#counter_created_budgets").text(statsData.nr_of_budgets)
        if (statsData.nr_of_rules)
            $("span#counter_created_rules").text(statsData.nr_of_rules)

    },
    onChangePasswordBtnClick: () => {
        const oldPassword = $("input#current_pw").val();
        const newPassword1 = $("input#new_pw").val();
        const newPassword2 = $("input#new_pw_repeat").val();

        if (!ValidationUtils.checkIfFieldsAreFilled([oldPassword, newPassword1, newPassword2])) {
            DialogUtils.showErrorMessage("Preencha todos os campos e tente novamente.")
            return;
        }

        if (newPassword1 !== newPassword2) {
            DialogUtils.showErrorMessage("As passwords não coincidem. Por favor, verifique o seu input e tente novamente.")
            return;
        }

        LoadingManager.showLoading()
        UserServices.changeUserPassword(oldPassword, newPassword1,
            (resp) => {
                LoadingManager.hideLoading()
                DialogUtils.showSuccessMessage("Password atualizada com sucesso. Por favor, volte a iniciar sessão.")
                resetSession()
            }, (err) => {
                LoadingManager.hideLoading()
                DialogUtils.showErrorMessage("Aconteceu algo de errado. Por favor, tente novamente.")
            })
    },
    initChangeThemeOptions: () => {
        const currentTheme = LayoutUtils.getCurrentThemeName()
        let html = `<p>
                        <label>
                            <input name="theme-group" type="radio" value="${MYFIN.APP_THEMES.DARK_GRAY}" ${(currentTheme === MYFIN.APP_THEMES.DARK_GRAY) ? " checked " : ""} />
                            <span>Dark Gray</span>
                        </label>
                    </p>
                    <p>
                        <label>
                            <input name="theme-group" type="radio" value="${MYFIN.APP_THEMES.DARK_BLUE}"  ${(currentTheme === MYFIN.APP_THEMES.DARK_BLUE) ? " checked " : ""} />
                            <span>Dark Blue</span>
                        </label>
                    </p>`

        $("#change-theme-radio-group-wrapper").html(html)
        $("#change-theme-btn").on("click", () => {
            const selectedTheme = $("input:radio[name ='theme-group']:checked").val()
            LayoutUtils.changeTheme(selectedTheme)
        })
    }
}


//# sourceURL=js/profile.js