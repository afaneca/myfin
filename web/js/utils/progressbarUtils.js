
"use strict";

var i = 0;

var ProgressBarUtils = {
    setupProgressBar: (selector, percentage) => {
        $(selector).attr("width", percentage + "%")
        debugger
        ProgressBarUtils._move(selector)
    },
    _move: (selector) =>  {
      if (i == 0) {
        i = 1;
        var elem = $(selector)//document.getElementById("selector");
        var width = 10;
        var id = setInterval(frame, 10);
        function frame() {
          if (width >= 100) {
            clearInterval(id);
            i = 0;
          } else {
            width++;
            //elem.style.width = width + "%";
            //elem.innerHTML = width + "%";
            elem.attr("width", width + "%")
          }
        }
      }
    },
}

//# sourceURL=js/utils/progressbarUtils.js
