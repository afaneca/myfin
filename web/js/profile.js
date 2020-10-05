"use strict";

var Profile = {
    init: () => {
      $("button#change_pw_btn").on("click", function(event){
          event.preventDefault();
          Profile.onChangePasswordBtnClick()
      })
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
    }
}


//# sourceURL=js/profile.js