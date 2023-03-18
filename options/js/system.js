'use strict';

/**
* Скрипт для раздела модулей
*/

(function () {
  const tableElement = $(".doc-data");
  const manifest = chrome.runtime.getManifest();
  const ajaxTime = new Date().getTime();

  let setting;
  let browser;
  const userAgent = navigator.userAgent;

  let moduleElement;

  const OS = {
    'win': "Windows",
    'mac': "Mac OS",
    'linux': "Linux"
  };

  /**
   * Создает новую строку в таблице информации
   *
   * @param table - Элемент в который нужно добавить строку
   * @param title - Заголовок
   * @param text - Текст
   */

  const creatRowTable = (table, title, text) => {
    table.append("<div class='doc-row'><div class='doc-title'></div><div class='doc-value'></div></div>");
    const row = table.find(">.doc-row:last-child");

    row.find(".doc-title").text(title);
    row.find(".doc-value").text(text);

    return row;
  };

  creatRowTable(tableElement.find("#info"), "Extension version", manifest.version);


  if (userAgent.indexOf("Firefox") > -1) {
    browser = "Mozilla Firefox " + userAgent.split("Firefox/")[1].split(" ")[0];
  }else if (userAgent.indexOf("Opera") > -1) {
    browser = "Opera " + userAgent.split("Opera/")[1].split(" ")[0];
  }else if (userAgent.indexOf("OPR") > -1) {
    browser = "Opera " + userAgent.split("OPR/")[1].split(" ")[0];
  }else if (userAgent.indexOf("Trident") > -1) {
    browser = "Internet Explorer " + userAgent.split("Trident/")[1].split(" ")[0];
  }else if (userAgent.indexOf("Edge") > -1) {
    browser = "Microsoft Edge " + userAgent.split("Edge/")[1].split(" ")[0];
  }else if (userAgent.indexOf("YaBrowser") > -1) {
    browser = "Yandex Browser " + userAgent.split("YaBrowser/")[1].split(" ")[0];
  }else if (userAgent.indexOf("Chrome") > -1) {
    browser = "Google Chrome " + userAgent.split("Chrome/")[1].split(" ")[0];
  }else if (userAgent.indexOf("Safari") > -1) {
    browser = "Safari " + userAgent.split("Safari/")[1].split(" ")[0];
  }else {
    browser = "Not defined";
  }

  creatRowTable(tableElement.find("#info"), "Browser", browser);


  const osElement = creatRowTable(tableElement.find("#info"), "Operating system", "");
  chrome.runtime.getPlatformInfo((response) => {
    osElement.find(".doc-value").text(OS[response.os]);
  });

  creatRowTable(tableElement.find("#info"), "Cookie support", navigator.cookieEnabled ? "Yes" : "No");

  chrome.storage.local.get(["nkSetting"], (result) => {
    setting = result.nkSetting;
    moduleElement = creatRowTable(tableElement.find("#info"), "Connected modules", "").find(".doc-value");
  });

  $.ajax({
    type: "GET",
    url: "https://mapeditor.yandex.com/",
    dataType: "html",
    success: function (response) {
      const config = JSON.parse(response.split('id="config"')[1].split(">")[1].split("<")[0]);
      const totalTime = new Date().getTime() - ajaxTime;

      tableElement.find("#nk").append("<h2>Yandex Map Editor</h2>");

      creatRowTable(tableElement.find("#nk"), "Loading speed", totalTime + " ms");
      creatRowTable(tableElement.find("#nk"), "Version", config.version);

      const data = [
        {
          "method": "app/getCurrentUser",
          "params": {}
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
        url: "https://mapeditor.yandex.com/" + config.api.url + "/batch",
        dataType: "json",
        data: JSON.stringify(data),
        success: function (response) {
          const user = response.data[0].data;

          let role = "User";

          if (user.moderationStatus === "moderator") {
            role = "Moderator";
          }else if (user.outsourcer) {
            role = "Outsourcer";
          }else if (user.yandex) {
            role = "Yandex Stuff";
          }

          const access = user.moderationStatus === "moderator" || user.outsourcer || user.yandex;
          let is_module = false;

          for (const name in setting) {
            const value = setting[name];

            if (value && (access || (name !== "get-user" && name !== "lock-pattern"))) {
              const active_text = moduleElement.text() ? moduleElement.text() + ", " : "";
              is_module = true;

              moduleElement.text(active_text + name);
            }
          }

          if (!is_module) {
            moduleElement.text("No modules connected");
          }

          creatRowTable(tableElement.find("#nk"), "Role", role);
        }
      });
    }
  });

  const restartSetting = () => {
    chrome.storage.local.clear("nkSetting");
    chrome.storage.local.clear("nkSetting-getUser");
    chrome.storage.local.clear("nkSetting-checkAddress");
    chrome.storage.local.clear("nkSetting-favoriteObjects");

    chrome.runtime.sendMessage({method: "setSetting"}, () => {});

    $("#restart_setting + span").attr("data-info", "Настройки сброшены");
  };

  $("#restart_setting").on("click", restartSetting);
})();