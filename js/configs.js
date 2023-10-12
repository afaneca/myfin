import { DialogUtils } from "./utils/dialogUtils.js";
import { Localization } from "./utils/localization.js";

export var configs = {
  version: '1.0.0',
  defaultApp: 'login',
  viewsPath: 'views/',
  afterViewCallBacks: [],
  beforeViewCallBacks: [],

  navigateToPage: function () {
    DialogUtils.preventScrollBug()
    if (configs.getCurrentPage() != '') {
      const pageUrl = configs.viewsPath + configs.getCurrentPage() + '.html'

      $.ajax({
        type: 'GET',
        dataType: 'html',
        cache: false,
        url: pageUrl,
        success: function (response) {
          $.each(configs.beforeViewCallBacks, function (index, callBack) {
            callBack()
          })
          $('#main-content').empty().append(response)
          $.each(configs.afterViewCallBacks, function (index, callBack) {
            callBack()
          })
        },
        error: function (response) {
          configs.switchApp(configs.defaultApp)
        },
      })
    }
  },

  goToPage: function (nextPage, args = {}, forceReload = true) {
    DialogUtils.preventScrollBug()
    let newHash = '#!' + nextPage

    if (args && Object.keys(args).length > 0) {
      newHash += '?'
      $.each(args, function (key, val) {
        newHash += key + '=' + val + '&'
      })
    }

    if (newHash == window.location.hash && forceReload === true) {
      $(window).trigger('hashchange')
    }
    else {
      window.location.hash = newHash
    }
    Localization.localize()
  },

  parseParams: function () {
    var params = {}
    // Meter o url todo em minúsculas para ser case insensitive
    var url_lower = window.location.hash.toLowerCase()
    var paramArray = url_lower.split('?')

    // se for verdade, tem parâmetros depois de '?'
    if (paramArray.length > 1) {
      // começa na posição 1 para excluir a parte que está antes do '?'
      for (var i = 1; i < paramArray.length; i++) {

        var varArray = paramArray[i].split('&')

        for (var j = 0; j < varArray.length; j++) {

          var pair = varArray[j].split('=')
          var k = decodeURIComponent(pair[0])
          var v = decodeURIComponent(pair[1])

          params[k] = v
        }
      }
    }
    return params
  },

  switchApp: function (appToLoad, params, newTab) {
    DialogUtils.preventScrollBug()
    var url = appToLoad + '.html'

    if (params != null) {
      url += '#?' + params
    }

    if (newTab != null && newTab) {
      window.open(url, '_blank')
    }
    else {
      window.location = url
    }

    $('body').css('overflow', 'visible')
  },

  loadFirstView: function (pageToLoad) {
    $(document).ready(function () {
      if (window.location.hash == '') {
        configs.goToPage(pageToLoad)
      }
      else {
        configs.navigateToPage()
      }
    })
  },

  getUrlArgs: function () {
    var hash = window.location.hash
    var indexView = hash.indexOf('?')
    if (indexView < 0) {
      return null
    }

    var subStr = hash.substring(indexView + 1, hash.length)
    var args = subStr.split('!')[0]
    var argsArray = args.split('&')
    var myArgs = {}
    for (var index = 0; index < argsArray.length; index++) {
      var arg = argsArray[index].split('=')
      myArgs[arg[0]] = arg[1]
    }
    return myArgs
  },

  getCurrentPage: function () {
    var hash = window.location.hash
    var indexView = hash.indexOf('!')
    if (indexView < 0) {
      return ''
    }

    var subStr = hash.substring(indexView + 1, hash.length)
    var str = subStr.split('?')[0]
    return str
  },

  ensoLoadScripts: function (scripts, callback) {
    if (scripts.length > 0) {
      configs.ensoLoadScriptsRecursive(scripts, 0, callback)
    }
  },

  ensoLoadScriptsRecursive: function (scripts, index, callback) {

    if (index < scripts.length) {
      var path = scripts[index]
      $.getScript(path, function () {
        index++
        if (index < scripts.length) {
          configs.ensoLoadScriptsRecursive(scripts, index, callback)
        }
        else if (callback != null) {
          callback()
        }
      })
    }
    else {
      if (callback != null) {
        callback()
      }
    }
  },

  addAfterViewCallback: function (arg) {
    configs.afterViewCallBacks.push(arg)
  },

  removeAfterViewCallback: function (arg) {
    let index = configs.afterViewCallBacks.indexOf(arg)

    if (index > -1) {
      configs.afterViewCallBacks.splice(index, 1)
    }
  },

  addBeforeViewCallback: function (arg) {
    configs.beforeViewCallBacks.push(arg)
  },

  removeBeforeViewCallback: function (arg) {
    let index = configs.beforeViewCallBacks.indexOf(arg)

    if (index > -1) {
      configs.beforeViewCallBacks.splice(index, 1)
    }
  },

  init: function () {
    $(window).on('hashchange', function () {
      configs.navigateToPage()
    })
  },
}
configs.init()

window.configs = configs
//# sourceURL=configs.js