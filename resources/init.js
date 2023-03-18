'use strict';

/**
 * Запускает добавление модулей
 */

(function () {
  const appPage = $(".nk-app-page");

  const hashStart = window.location.href;


  let checkUpdate = true;
  let startStatus = false;
  let setting = {};
  let user = {};
  let update = {};

  let loadCount = 0;

  chrome.storage.local.get(["nkSetting"], (result) => setting = result.nkSetting);


  /* Сообщение об ошибке по умолчанию */
  const defaultError = "Sorry, something went wrong.";

  /* Заготовки текста */
  const text = {
    getUser: {
      button: "Search for users",
      view: {
        title: "Search for users",
        defaultValue: "To search, start typing Login",
        default: "The request did not find anything",
        deleteUser: "deleted",
        info: {
          access: "Special Permissions",
          createdAt: "Date of registration",
          'rating-pos-full': "Top user place",
          'total-edits': "Made edits",
          'feedback-count': "Resolved possible problems",
          banned: {
            time: "Blocking period",
            user: "Moderator",
            reason: "Reason for blocking"
          },
          noCategoryGroup: 'User has no edits'
        },
      },
      notification: {
        error: {
          default: defaultError
        }
      }
    },
    address: {
      button: "Check address points",
      view: {
        title: "Address points Checking",
        label: {
          street: "Street",
          listAddress: "House numbers"
        },
        button: {
          cancellation: "Cancel",
          check: "Check"
        },
        load: "Check in progress.",
        row: {
          error: "Not added address points",
          not_found: "Non-existent address points",
          warning: "Address points with an error"
        },
        default: {
          error: "All address points added",
          not_found: "All address points exist",
          warning: "There are no errors in the address points"
        }
      },
      notification: {
        success: {
          no_data: "Errors in the address points were not found"
        },
        error: {
          default: defaultError,
          valid: {
            count: "House numbers must be separated by commas",
            road: "House numbers must not contain the name of the road"
          }
        }
      }
    },
    categories: {
      "rd-group": {
        title: "Roads",
      },
      "urban-roadnet-group": {
        title: "Road infrastructure",
      },
      "cond-group": {
        title: "Road signs",
      },
      "parking-group": {
        title: "Parking",
      },
      "urban-group": {
        title: "Territory",
      },
      "bld-group": {
        title: "Buildings",
      },
      "indoor-group": {
        title: "Indoor plans",
      },
      "poi-group": {
        title: "Points of interest",
      },
      "entrance-group": {
        title: "Entrances",
      },
      "addr-group": {
        title: "Address points",
      },
      "fence-group": {
        title: "Fences",
      },
      "ad-group": {
        title: "Administrative division",
      },
      "vegetation-group": {
        title: "Vegetation",
      },
      "relief-group": {
        title: "Terrain",
      },
      "hydro-group": {
        title: "Hydrography",
      },
      "group-edits": {
        title: "Group edits",
      },
      "transport-group": {
        title: "Transport type",
      },
      "transport-metro-group": {
        title: "Rapid transit",
      },
      "transport-airport-group": {
        title: "Rapid transit",
      },
      "transport-railway-group": {
        title: "Railways",
      },
      "transport-waterway-group": {
        title: "Water transport",
      },
    },
    blocked: {
      button: "Choose a template",
      portal: {
        title: "Choose a Blocking Template",
        pattern: [
          "Ignoring comments",
          "Unable to contact the user",
          "Systematic abuse of the rules",
          "Obscene language",
          "Hate speech",
          "Vandalism",
          "Copy a blocked profile"
        ]
      },
      pattern: [
        // Игнорирование замечаний
        {
          text: "Good afternoon, {user_name}!\n\nUnfortunately, you ignore the moderator's comments and continue to make mistakes when edit the map. Please reply to me at [Yandex.Messenger](https://yandex.com/chat#/) and I will remove the blockage early.",
          height: 192,
          term: "Choose any blocking period, but not more than 3 days"
        },

        // Невозможно связаться с пользователем
        {
          text: "Good afternoon, {user_name}!\n\nUnfortunately, I have not been able to contact you through [Yandex.Messenger](https://yandex.com/chat#/). Please remove the restriction and email me, and then I will remove the lock early.",
          height: 192,
          term: "The recommended lockout period for this reason is a day"
        },

        // Систематические нарушения правил
        {
          text: "Good afternoon, {user_name}!\n\nUnfortunately, you make many mistakes when edit objects, despite them being explained to you.\n\nPlease study [rules](https://yandex.com/support/mapeditor/) for the blocking time, so as not to make mistakes in the future.",
          height: 224,
          term: "Choose any blocking period, but not more than 3 days",
          warning: {
            title: "It is desirable to provide links to several edits with errors",
            gaid: "This is necessary so that the user can better understand what mistakes he has made repeatedly.\n\nReferences can be specified after the phrase «... in spite of their explanation to you». On the next line you can write «Here are a few examples of them:» and on a new line provide links to edits with a description of the mistake.\n\nFor the reason for blocking to have a uniform writing style, it is recommended to use a construction of the form:\n— [Short description of the error](link to edit)"
          }
        },

        // Ненормативная лексика
        {
          text: "Good afternoon, {user_name}!\n\nIn Yandex Map Editor prohibits the use of profanity in comments or profile. Please reconsider your attitude to cartography and study [rules] during the blocking period(https://yandex.com/support/mapeditor/)",
          height: 212,
          term: "Choose any blocking period, but not more than 3 days"
        },

        // Высказывания разжигающие вражду
        {
          text: "Good afternoon, {user_name}!\n\nIn Yandex Map Editor prohibits the use of statements directed at inciting hatred or enmity, or at disparagement of a person or group of persons.\n\nPlease reconsider your attitude to cartography and study [rules] during the blocking period(https://yandex.com/support/mapeditor/)",
          height: 258,
          term: "Choose any blocking period, but not more than 3 days"
        },

        // Вандализм
        {
          text: "Good afternoon, {user_name}!\n\nUnfortunately, your edits are considered vandalism, so your profile is permanently blocked.",
          height: 160,
          term: "The recommended blocking period for this reason is forever"
        },

        // Дубликат заблокированного профиля
        {
          text: "Good afternoon, {user_name}!\n\nUnfortunately, your profile is recognized as a copy of another one, of a blocked profile.",
          height: 160,
          term: "The recommended blocking period for this reason is forever",
          warning: {
            title: "It is desirable to provide a link to another profile of this user",
            gaid: "This is to make it easier to find a copy of the profile if a dispute arises.\n\nThe link can be specified instead of the inscription «of a blocked profile».\n\nTo make the reason for blocking have a uniform writing style, it is recommended to use a construction like: [blocked profile](link to profile)"
          }
        }
      ],
      pattern_end: "\n\nYou can always appeal a blocking through [support service](https://yandex.com/support/mapeditor/troubleshooting/fb_nmaps.html)",
    },
    tiles: {
      popup: "Color correction of satellite tiles",
      fulter: {
        brightness: {
          title: "Brightness",
          max: 200,
          min: 0,
          meaning: 100,
          default: 100,
          unit: ""
        },
        contrast: {
          title: "Contrast",
          max: 200,
          min: 0,
          meaning: 100,
          default: 100,
          unit: ""
        },
        grayscale: {
          title: "Black and White Balance",
          max: 100,
          min: 0,
          meaning: 100,
          default: 0,
          unit: ""
        },
        opacity: {
          title: "Opacity",
          max: 100,
          min: 0,
          meaning: 100,
          default: 100,
          unit: ""
        },
        saturate: {
          title: "Saturation",
          max: 1500,
          min: 0,
          meaning: 100,
          default: 100,
          unit: ""
        },
        'hue-rotate': {
          title: "Color Shift",
          max: 350,
          min: 0,
          meaning: 1,
          default: 0,
          unit: "deg"
        },
        invert: {
          title: "Color Inversion",
          max: 100,
          min: 0,
          meaning: 100,
          default: 0,
          unit: ""
        }
      }
    },
    road: {
      l135: {
        title: "резкий поворот налево",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M5.111 7.233l-2.121 7.778 7.778-2.121-2.184-2.184 3.584-3.584c1.324-1.324 1.833-1.115 1.833.745v12.133h2v-12.133c0-3.644-2.665-4.741-5.247-2.159l-3.584 3.584-2.058-2.058z"/></svg>'
      },
      l180: {
        title: "left u-turn",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M6 9h-3l4 7 4-7h-3v-1c0-1.654 1.345-3 3-3 1.654 0 3 1.345 3 3v12h2v-12c0-2.76-2.242-5-5-5-2.76 0-5 2.242-5 5v1z"/></svg>'
      },
      l45: {
        title: "smoothly to the left",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M7.111 10.767l-2.121-7.778 7.778 2.121-2.184 2.184 3.414 3.414c.579.579 1.003 1.597 1.003 2.414v7.878h-2v-7.878c0-.285-.212-.795-.417-1l-3.414-3.414-2.058 2.058z"/></svg>'
      },
      l90: {
        title: "to the left",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M10 10h10v2h-10v3l-7-4 7-4z"/></svg>'
      },
      lr: {
        title: "turn left through the U-turn",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M11 6v-3l-7 4 7 4v-3h3.009c1.653 0 2.991 1.342 2.991 3 0 1.654-1.346 3-3.002 3h-3.992c-2.209 0-4.006 1.786-4.006 3.991v2.009h2v-2.009c0-1.097.899-1.991 2.006-1.991h3.992c2.761 0 5.002-2.242 5.002-5 0-2.762-2.232-5-4.991-5h-3.009z"/></svg>'
      },
      r135: {
        title: "sharply to the right",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M16.889 7.234l2.121 7.778-7.778-2.121 2.184-2.184-3.584-3.584c-1.324-1.324-1.833-1.115-1.833.745v12.133h-2v-12.133c0-3.644 2.665-4.741 5.247-2.159l3.584 3.584 2.058-2.058z"/></svg>'
      },
      r180: {
        title: "right u-turn",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M19 9l-4 7-4-7h3v-1c0-1.654-1.345-3-3-3-1.654 0-3 1.345-3 3v12h-2v-12c0-2.76 2.242-5 5-5 2.76 0 5 2.242 5 5v1h3z"/></svg>'
      },
      r45: {
        title: "smoothly to the right",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M14.889 10.767l2.121-7.778-7.778 2.121 2.184 2.184-3.414 3.414c-.579.579-1.003 1.597-1.003 2.414v7.878h2v-7.878c0-.285.212-.795.417-1l3.414-3.414 2.058 2.058z"/></svg>'
      },
      r90: {
        title: "to the right",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M13 12h-10v-2h10v-3l7 4-7 4v-3z"/></svg>'
      },
      rl: {
        title: "right through the U-turn",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M11 6v-3l7 4-7 4v-3h-3.009c-1.653 0-2.991 1.342-2.991 3 0 1.654 1.346 3 3.002 3h3.992c2.209 0 4.006 1.786 4.006 3.991v2.009h-2v-2.009c0-1.097-.899-1.991-2.006-1.991h-3.992c-2.761 0-5.002-2.242-5.002-5 0-2.762 2.232-5 4.991-5h3.009z"/></svg>'
      },
      s: {
        title: "straight",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v10h-2v-10h-3l4-7 4 7z"/></svg>'
      },
      sl: {
        title: "a little to the left",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M13 9l-4-7-4 7h3v1.506c0 1.601 1.255 3.041 2.846 3.268l3.026.432c.608.087 1.129.684 1.129 1.294v3.5h2v-3.5c0-1.607-1.255-3.046-2.846-3.274l-3.026-.432c-.608-.087-1.129-.684-1.129-1.288v-1.506h3z"/></svg>'
      },
      sr: {
        title: "a little to the right",
        icon: '<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M9 9l4-7 4 7h-3v1.506c0 1.601-1.255 3.041-2.846 3.268l-3.026.432c-.608.087-1.129.684-1.129 1.294v3.5h-2v-3.5c0-1.607 1.255-3.046 2.846-3.274l3.026-.432c.608-.087 1.129-.684 1.129-1.288v-1.506h-3z"/></svg>'
      }
    }
  };


  /**
   * Событие клика на кнопку дополнительных инструментов
   */

  const clickToolsButton = () => {
    const toolsButton = $("body > div.nk-app-view > header > div.nk-app-bar-view > button.nk-button.nk-button_theme_air.nk-button_size_xl.nk-tools-control-view");
    toolsButton.off('click', clickToolsButton);

    const toolsMenu = $(".nk-tools-control-view__tools-menu").parent();

    if (startStatus) window.appChrome.init.getUser(toolsMenu);
  };


  /**
   * Создание нового элемента
   *
   * @param parent - Элемент в который нужно добавить новый элемент
   * @param classList - Список классов
   * @param selector - Класс по которому надо найти и вернуть элемент
   * @param text - Текст в элементе
   * @returns {*|jQuery}
   */

  const creatElement = (parent, classList, selector, text = "") => {
    const newElement = document.createElement("div");

    classList.forEach((className) => {
      newElement.classList.add(className);
    });

    newElement.textContent = text;

    $(parent).append(newElement);
    return $(parent).find(selector);
  };


  /**
   * Отображение всплывающей подсказки
   *
   * @param element - Элемент относительно которого нужно показать подсказку
   * @param text - Текст подсказки
   */

  const popupShow = (element, text) => {
    element.hover(() => {
      const popup = $(".nk-portal-local .nk-popup");
      popup.find(".nk-popup__content").text(text);

      const top = element[0].offsetHeight + element.offset().top + 5;
      let left = window.innerWidth - (window.innerWidth - element.offset().left);

      const innerWidth = popup.width() + left;

      if (innerWidth >= window.innerWidth) {
        popup.removeClass("nk-popup_direction_bottom-left");
        popup.addClass("nk-popup_direction_bottom-right");

        left = left - popup.width() + element.width();
      } else {
        popup.removeClass("nk-popup_direction_bottom-right");
        popup.addClass("nk-popup_direction_bottom-left");
      }

      popup.css({"left": left + "px", "top": top + "px"});
      popup.addClass("nk-popup_visible");
    }, () => {
      const popup = $(".nk-portal-local .nk-popup");
      popup.removeClass("nk-popup_visible");
    });
  };


  /**
   * Симуляция нажатия
   * @param node - Node-элемент на который нужно симулировать нажатие
   * @param eventType - Вид симулироваемоего сиобытия
   */

  const triggerMouseEvent = (node, eventType) => {
    let clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent(eventType, true, true);
    node.dispatchEvent(clickEvent);
  };


  /**
   * Вызывает необходимые события для сиуляции нажатия
   * @param element - Элемент на который нужно симулировать нажатие
   */

  const triggerClick = (element) => {
    triggerMouseEvent(element[0], "mouseover");
    triggerMouseEvent(element[0], "mousedown");
    triggerMouseEvent(element[0], "mouseup");
    triggerMouseEvent(element[0], "click");
  };


  /**
   * Отслеживание загрузки редактора
   *
   * @type {MutationObserver}
   */

  const loadMap = new MutationObserver(() => {
    loadCount++;

    if (loadCount < 3) return;
    loadMap.disconnect();

    /* Добавим всплывающие окна */
    $("body").append('<div class="nk-portal nk-portal-local"><!----><div class="nk-popup nk-popup_direction_bottom-left nk-popup_theme_islands nk-popup_view_tooltip" style="z-index: 111001;"><div class="nk-size-observer"><div class="nk-popup__content"></div></div></div><!----></div><div class="nk-portal nk-select-local"><!----><div class="nk-popup nk-popup_direction_bottom-left nk-popup_theme_islands nk-popup_restrict-height" id="select-status-user"><div class="nk-size-observer"><div class="nk-popup__content"><div class="nk-menu nk-menu_theme_islands nk-menu_mode_check nk-menu_size_m nk-menu_focused nk-select__menu" tabindex="0"><div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_m nk-menu-item_checked nk-select__option" data-value="all">Все</div><div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_m nk-select__option" data-value="active">Активные</div><div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_m nk-select__option" data-value="banned">Заблокированные</div><div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_m nk-select__option" data-value="deleted">Удалённые</div></div></div></div></div><!----><!----><!----></div>');

    /* Критическая ошибка - нет токена */
    if (!JSON.parse(localStorage.getItem("nk:token"))) {
      setTimeout(() => {
        window.appChrome.notification("error", "There was a critical error in the operation of the extension");
      }, 100);
      return;
    }

    /* Ждем клика по аватарке */
    $(".nk-user-bar-view__user-icon").on('click', () => {
      setTimeout(() => {
        const parent = $("body > div:nth-child(9) > div > div > div > div.nk-menu.nk-menu_theme_islands.nk-menu_size_l > div:nth-child(1)");

        const id = chrome.runtime.id;
        parent.append('<div class="nk-menu-item nk-menu-item_theme_islands nk-menu-item_size_l" data-link="chrome-extension://' + id + '/index.html" tabindex="-1">Настройки</div>');
        const button = parent.find('div[data-link="chrome-extension://' + id + '/index.html"]');

        button.hover(() => {
          button.addClass("nk-menu-item_hovered");
        }, () => {
          button.removeClass("nk-menu-item_hovered");
        });

        button.on("click", () => {
          chrome.runtime.sendMessage({method: "openSetting"});
        });
      }, 10);
    });


    /* Редактор загрузился, теперь ожидаем загрузки дополнительных инструментов, для добавления меню */
    setTimeout(() => {
      if (startStatus) {
        const toolsButton = $("body > div.nk-app-view > header > div.nk-app-bar-view > button.nk-button.nk-button_theme_air.nk-button_size_xl.nk-tools-control-view");
        const getUser = hashStart.indexOf("tools/get-user") !== -1 ? hashStart.replace("#!", "") : false;

        if (!!getUser && setting["get-user"] && startStatus) {
          const url = new URL(getUser);
          const getNameUser = getUser.indexOf("name=") !== -1 ? url.searchParams.get('name') : false;

          window.appChrome.getUser(getNameUser);
        }

        toolsButton.on('click', clickToolsButton);

        if (setting["lock-pattern"]) window.appChrome.init.lockPattern();
      }

      const isAddressCheck = hashStart.indexOf("correct=") !== -1 ? hashStart.replace("#!", "") : false;

      if (!!isAddressCheck && setting["check-address"]) {
        const url = new URL(isAddressCheck);
        const getCorrectName = url.searchParams.get('correct');

        window.appChrome.showCorrect(getCorrectName);
      }

      /* Запускаем модули, которые не зависят от дополнительных инструментов */
      if (setting["check-address"]) window.appChrome.init.addressCheck();
      if (setting["get-profile"]) window.appChrome.init.getProfile();
      if (setting["duplicate-addresses"]) window.appChrome.init.addressDuplicate();
      if (setting["tiles"]) window.appChrome.init.tiles();
      if (setting["favorite-objects"]) window.appChrome.init.favoriteObject();
      if (setting["open-service"]) window.appChrome.init.openService();
      if (setting["address"]) window.appChrome.init.address();
    }, 1);

    window.appChrome.init.eventObject(setting);

    setTimeout(() => {
      /* Показываем уведомление, если во время загрузки произошла ошибка, и модуль сообщил о ней */
      chrome.storage.local.get(["nkApp_sendNotificationTile"], (result) => {
        if (!result.nkApp_sendNotificationTile && window.needNotification.status) {
          window.appChrome.notification(window.needNotification.type, window.needNotification.text);
        }
      });
    }, 1000);

    if (update.needUpdate) {
      const manifest = chrome.runtime.getManifest();
      const v = manifest.version_name;

      const infoVersion = !!update.info.length ? update.info : '<span style="color: var(--nk-name-row-layout__name-type--font-color);">No information about the update</span>';

      $("body").append('<div class="nk-portal nk-window-update"><!----><div class="nk-modal nk-modal_theme_islands nk-modal_visible" role="dialog" aria-hidden="false" style="z-index: 10001;"><div class="nk-modal__table"><div class="nk-modal__cell"><div class="nk-modal__content" tabindex="-1"><div class="nk-data-loss-confirmation-view__text nk-section nk-section_level_2"><strong>Доступно обновление расширения</strong><br>Хотите перейти на GitHub, чтобы скачать новую версию?</div><div class="nk-grid nk-sidebar-control nk-section nk-section_level_2 nk-info-update"><div class="nk-grid__col nk-grid__col_span_4"><label style=" color: var(--sidebar-control__label--font-color);">Текущая версия</label></div><div class="nk-grid__col nk-grid__col_span_8">' + v + '</div></div><div class="nk-grid nk-sidebar-control nk-section nk-info-update"><div class="nk-grid__col nk-grid__col_span_4"><label style=" color: var(--sidebar-control__label--font-color);">Доступная версия</label></div><div class="nk-grid__col nk-grid__col_span_8">' + update.lastVersion + '</div></div><div class="nk-grid nk-sidebar-control nk-section nk-info-update"><div class="nk-grid__col nk-grid__col_span_4"><label style=" color: var(--sidebar-control__label--font-color);">Что нового</label></div><div class="nk-grid__col nk-grid__col_span_8">' + infoVersion + '</div></div><div class="nk-form-submit-view nk-form-submit-view_size_l"><button class="nk-button nk-button_theme_islands nk-button_size_l nk-close-window" type="button"><span class="nk-button__text">Напомнить позже</span></button><button class="nk-button nk-button_theme_islands nk-button_size_l nk-button_view_action nk-button_hovered nk-form-submit-view__submit nk-close-window" type="button"><a class="nk-button__text" style="text-decoration: none;color: inherit;" href="https://github.com/Dmitry-407/nmap/releases/latest" target="_blank">Перейти на GitHub</a></button></div></div></div></div></div><!----><!----><!----></div>');

      $(".nk-close-window").on("click", () => {
        const winodw = $(".nk-window-update .nk-modal.nk-modal_theme_islands");
        winodw.removeClass("nk-modal_visible");

        setTimeout(() => {
          winodw.remove()
        }, 3000);
      });
    }else {
      /** Окно с информацией об просьбе заполнить опрос **/

      chrome.storage.local.get(["chromeApp-close"], (result) => {
        if (!result["chromeApp-close"]) {
          $("body").append('<div class="nk-portal nk-window-end"><!----><div class="nk-modal nk-modal_theme_islands nk-modal_visible" role="dialog" aria-hidden="false" style="z-index: 10001;"><div class="nk-modal__table"><div class="nk-modal__cell"><div class="nk-modal__content" tabindex="-1" style="border: none;"><div class="nk-data-loss-confirmation-view__text nk-section nk-section_level_2" style="max-width: 650px;padding: 0;"><img src="https://user-images.githubusercontent.com/52531675/194917839-21c3fb28-f8ad-45d9-926d-d8917b482053.png" style="width: auto;height: 200px;left: 50%;transform: translateX(-50%);position: relative;"/><div style="cursor: default;padding: 12px 12px 0;max-width: 550px;margin: 0 auto;"><h1>Опрос об использовании расширения</h1><p>Спасибо, что Вы используете расширение «Дополнительные инструменты»! Пожалуйста, помогите ему стать ещё лучше, для этого пройдите опрос. Его заполнение займет у Вас примерно 5-10 минут.</p><p style="margin-top: 2em;padding-top: 2em;border-top: 1px solid var(--section--border-color);color: #b2b2b2;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" style="width: 40px; height: 40px; float: left; margin-left: -15px; margin-right: 20px;"><path fill="none" d="M0 0h26v26H0z"/><path fill="#b2b2b2" d="M22.7 11l-3.2 8.7c-.4 1-2.6 4.4-3.6 4-1.1-.4-.5-4.6-.2-5.4l3.2-8.7 3.8 1.4zM19.4 8.1l2.3-6.3c.4-1 1.6-1.8 2.7-1.4 1.1.4 1.5 2 1.2 2.8l-2.3 6.3-3.9-1.4z"/><path fill="none" stroke="#b2b2b2" stroke-width=".94" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M19.9 12.7l-4.2 11.5"/><path fill="none" stroke="#b2b2b2" stroke-width="1.881" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M20.2 1.8l-2.4 6.6"/><path fill="none" stroke="#b2b2b2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M8.6 11.5c-.2-2.7-2.1-5-4.7-2.6C2.3 10.3 1.7 13 1.3 15c-.3 1.3-.6 4.3 1.1 4.9 1.9.7 3.4-1.9 5.2-1.8.2.8-.7 2.3-.2 3 .7 1.1 1.5-.5 2.4-.3.7.1.3.7.7.9.4.2 1 0 1.5.2.6.2.8.6 1.3 1"/></svg>В благодарность за использование «Дополнительных инструментов»,<br>Dmitry Popov</p></div></div><div class="nk-form-submit-view nk-form-submit-view_size_l" style="margin-top: 35px;"><button class="nk-button nk-button_theme_islands nk-button_size_l nk-close-window nk-button_hovered" type="button"><span class="nk-button__text">Закрыть</span></button><button class="nk-button nk-button_theme_islands nk-button_size_l nk-button_view_action nk-button_hovered nk-form-submit-view__submit nk-close-window" type="button"><a class="nk-button__text" style="text-decoration: none;color: inherit;" href="https://forms.gle/34wF2RwuPCCt2hNx7" target="_blank">Пройти опрос</a></button></div></div></div></div></div><!----><!----><!----></div>');

          $(".nk-close-window").on("click", () => {
            const winodw = $(".nk-window-end .nk-modal.nk-modal_theme_islands");
            winodw.removeClass("nk-modal_visible");

            chrome.storage.local.set({ "chromeApp-close": true });

            setTimeout(() => {
              winodw.remove()
            }, 3000);
          });
        }
      });

      /** ----------------------------------------- **/
    }
  });

  const getExpertise = (publicID) => {
    const config = window.appChrome.config;

    const data = [
      {
        "method": "social/getUserExpertise",
        "params": {
          "userPublicId": publicID,
          "token": JSON.parse(localStorage.getItem("nk:token"))
        }
      }
    ];

    $.ajax({
      type: "POST",
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
        'x-kl-ajax-request': 'Ajax_Request',
        'x-csrf-token': config.api.csrfToken,
        'x-lang': 'en'
      },
      url: window.location.origin + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        user.expertise = response.data[0].data;
        window.appChrome.user = user;
      }
    });
  };

  const getStartStatus = () => {
    const config = window.appChrome.config;

    const data = [
      {
        "method": "app/getCurrentUser",
        "params": {
          "token": JSON.parse(localStorage.getItem("nk:token"))
        }
      },
      {
        "method": "app/getCategoriesConfig",
        "params": {
          "token": JSON.parse(localStorage.getItem("nk:token"))
        }
      }
    ];

    $.ajax({
      type: "POST",
      headers: {
        'x-kl-ajax-request': 'Ajax_Request',
        'x-csrf-token': config.api.csrfToken,
        'x-lang': 'en'
      },
      url: window.location.origin + config.api.url + "/batch",
      dataType: "json",
      data: JSON.stringify(data),
      success: function (response) {
        user = response.data[0].data;
        window.appChrome.configGet = response.data[1].data;

        getExpertise(user.publicId);

        startStatus = user.yandex || user.outsourcer || user.moderationStatus === "moderator";

        window.appChrome.user = user;
        window.appChrome.startStatus = startStatus;

        if (checkUpdate) {
          chrome.runtime.sendMessage({method: "checkUpdate", id: user.id}, function (response) {
            update = response;
          });

          checkUpdate = false;
        }
      }
    });

    setTimeout(getStartStatus, 30000);
  };

  $.ajax({
    url: window.location.origin,
    type: "GET",
    success: function(data) {
      const response = new DOMParser().parseFromString(data, "text/html");
      const config = JSON.parse(response.getElementById("config").innerHTML);

      window.appChrome.config = config;
      loadMap.observe(appPage[0], {childList: true});

      if (JSON.parse(localStorage.getItem("nk:token"))) {
        getStartStatus();
      }
    }
  });

  ////////////////////

  window.appChrome = {
    init: {},
    notification: null,
    text: text,
    user: user,
    startStatus: startStatus,
    configGet: {},
    config: {},
    creatElement: creatElement,
    popupShow: popupShow,
    triggerClick: triggerClick
  };

  window.needNotification = {
    status: false
  };
})();
