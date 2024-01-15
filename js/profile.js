import { DialogUtils } from "./utils/dialogUtils.js";
import { ValidationUtils } from "./utils/validationUtils.js";
import { LayoutUtils } from "./utils/layoutUtils.js";
import { LoadingManager } from "./utils/loadingManager.js";
import { AccountServices } from "./services/accountServices.js";
import { StatServices } from "./services/statServices.js";
import { UserServices } from "./services/userServices.js";
import { LocalDataManager } from "./utils/localDataManager.js";
import { Localization } from "./utils/localization.js";
import { ProfileMockDataModalFunc } from "./funcs/profileMockDataModalFunc.js";
import { resetSession } from "./login.js";

export const Profile = {
  init: () => {
    $('#global-web-app-version').text(MYFIN.APP_VERSION);
    $('button#change_pw_btn').on('click', function(event) {
      event.preventDefault();
      Profile.onChangePasswordBtnClick();
    });
    Profile.initChangeLanguageOptions();
    Profile.initChangeThemeOptions();
    LoadingManager.showLoading();
    StatServices.getUserCounterStats(
        (resp) => {
          // SUCCESS
          LoadingManager.hideLoading();
          Profile.fillStatsForNerds(resp);
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage(
              Localization.getString('common.somethingWentWrongTryAgain'));
        },
    );
  },
  fillStatsForNerds: (statsData) => {
    if (statsData.nr_of_trx) {
      $('span#counter_created_trx').text(statsData.nr_of_trx);
    }
    if (statsData.nr_of_entities) {
      $('span#counter_created_entities').text(statsData.nr_of_entities);
    }
    if (statsData.nr_of_categories) {
      $('span#counter_created_categories').text(statsData.nr_of_categories);
    }
    if (statsData.nr_of_accounts) {
      $('span#counter_created_accounts').text(statsData.nr_of_accounts);
    }
    if (statsData.nr_of_budgets) {
      $('span#counter_created_budgets').text(statsData.nr_of_budgets);
    }
    if (statsData.nr_of_rules) {
      $('span#counter_created_rules').text(statsData.nr_of_rules);
    }

    if (statsData.nr_of_tags) {
      $('span#counter_created_tags').text(statsData.nr_of_tags);
    }

  },
  onChangePasswordBtnClick: () => {
    const oldPassword = $('input#current_pw').val();
    const newPassword1 = $('input#new_pw').val();
    const newPassword2 = $('input#new_pw_repeat').val();

    if (!ValidationUtils.checkIfFieldsAreFilled(
        [oldPassword, newPassword1, newPassword2])) {
      DialogUtils.showErrorMessage(
          Localization.getString('common.fillAllFieldsTryAgain'));
      return;
    }

    if (newPassword1 !== newPassword2) {
      DialogUtils.showErrorMessage(
          Localization.getString('profile.passwordsDoNotMatchMessage'));
      return;
    }

    LoadingManager.showLoading();
    UserServices.changeUserPassword(oldPassword, newPassword1,
        (resp) => {
          LoadingManager.hideLoading();
          DialogUtils.showSuccessMessage(
              Localization.getString('profile.changePasswordSuccessMessage'));
          resetSession();
        }, (err) => {
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage(
              Localization.getString('common.somethingWentWrongTryAgain'));
        });
  },
  initChangeLanguageOptions: () => {
    const currentLanguage = LocalDataManager.getCurrentLanguage();
    const languagesList = Object.entries(MYFIN.LOCALES);

    let html = `
        ${languagesList.map(locale => `
          <p>
            <label>
                <input name="locale-group" type="radio" value="${locale[1].code}" ${(currentLanguage ===
        locale[1].code) ? ' checked ' : ''} />
                    <span>${locale[1].name}</span>
            </label>
          </p>
        `).join('')}
    `;

    $('#change-language-radio-group-wrapper').html(html);
    $('#change-language-btn').on('click', () => {
      const selectedLanguage = $('input:radio[name =\'locale-group\']:checked').
          val();
      LocalDataManager.setCurrentLanguage(selectedLanguage);
      i18next.changeLanguage(selectedLanguage, () => {
        Localization.localize();
      });
    });
  },
  initChangeThemeOptions: () => {
    const currentTheme = LayoutUtils.getCurrentThemeName();
    let html = `<p>
                        <label>
                            <input name="theme-group" type="radio" value="${MYFIN.APP_THEMES.DARK_GRAY}" ${(currentTheme ===
        MYFIN.APP_THEMES.DARK_GRAY) ? ' checked ' : ''} />
                            <span>Dark Gray</span>
                        </label>
                    </p>
                    <p>
                        <label>
                            <input name="theme-group" type="radio" value="${MYFIN.APP_THEMES.DARK_BLUE}"  ${(currentTheme ===
        MYFIN.APP_THEMES.DARK_BLUE) ? ' checked ' : ''} />
                            <span>Dark Blue</span>
                        </label>
                    </p>
                   <p>
                        <label>
                            <input name="theme-group" type="radio" value="${MYFIN.APP_THEMES.LIGHT}"  ${(currentTheme ===
        MYFIN.APP_THEMES.LIGHT)
        ? ' checked '
        : ''} />
                            <span>Light</span>
                        </label>
                    </p>
                    <p>
                        <label>
                            <input name="theme-group" type="radio" value="${MYFIN.APP_THEMES.SOLARIZED_GREEN}"  ${(currentTheme ===
        MYFIN.APP_THEMES.SOLARIZED_GREEN) ? ' checked ' : ''} />
                            <span>Solarized Green</span>
                        </label>
                    </p>
                    <p>
                        <label>
                            <input name="theme-group" type="radio" value="${MYFIN.APP_THEMES.MAUVE_THEME}"  ${(currentTheme ===
        MYFIN.APP_THEMES.MAUVE_THEME) ? ' checked ' : ''} />
                            <span>Mauve</span>
                        </label>
                    </p>
                    <p>
                        <label>
                            <input name="theme-group" type="radio" value="${MYFIN.APP_THEMES.NORD_NIGHTFALL}"  ${(currentTheme ===
      MYFIN.APP_THEMES.NORD_NIGHTFALL) ? ' checked ' : ''} />
                            <span>Nord Nightfall</span>
                        </label>
                    </p>
                   `;

    $('#change-theme-radio-group-wrapper').html(html);
    $('#change-theme-btn').on('click', () => {
      const selectedTheme = $('input:radio[name =\'theme-group\']:checked').
          val();
      LayoutUtils.changeTheme(selectedTheme);
    });
  },
  askForRecalculationOfAllAccountsBalances: () => {
    LoadingManager.showLoading();
    AccountServices.recalculateAllUserAccountsBalances(
        (resp) => {
          // SUCCESS
          LoadingManager.hideLoading();
          DialogUtils.showSuccessMessage(
              Localization.getString('common.taskSuccessfullyCompleted'));
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage(
              Localization.getString('common.somethingWentWrongTryAgain'));
        },
    );
  },
  showAutoPopulateWithMockDataConfirmationDialog: () => {
    ProfileMockDataModalFunc.showMockDataConfirmationModal('#modal-global',
        () => Profile.askForAutoPopulationWithMockData());
  },
  askForAutoPopulationWithMockData: () => {
    LoadingManager.showLoading();
    UserServices.populateWithDemoData(
        (resp) => {
          // SUCCESS
          LoadingManager.hideLoading();
          DialogUtils.showSuccessMessage(
              Localization.getString('common.taskSuccessfullyCompleted'));
          resetSession();
        }, (err) => {
          // FAILURE
          LoadingManager.hideLoading();
          DialogUtils.showErrorMessage(
              Localization.getString('common.somethingWentWrongTryAgain'));
        },
    );
  },
};

//# sourceURL=js/profile.js