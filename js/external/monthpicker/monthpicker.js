'use strict';
var Monthpicker = function () {
    function c(a, b) {
        this.selectedMonth = this.selectedYear = this.currentYear = null;
        this.id = c.next_id++;
        c.instances[this.id] = this;
        this.original_input = a;
        
        if (b.defaultMonth) {
            this.selectedMonth = b.defaultMonth
        }
        if (b.defaultYear) {
            this.selectedYear = b.defaultYear;
        }
        this.InitOptions(b);
        this.InitValue();
        this.Init();
        this.RefreshInputs()
    }
    c.Get = function (a) {
        if ("undefined" === typeof a.parentElement.dataset.mp) throw "Unable to retrieve the Monthpicker of element " + a;
        return c.instances[a.parentElement.dataset.mp]
    };
    c.prototype.InitValue = function () {
        var a = new Date;
        this.currentYear = a.getFullYear();
        var b = !1;
        this.original_input.value.match("[0-9]{1,2}/[0-9]{4}") && (b = this.original_input.value.split("/"), this.selectedMonth = parseInt(b[0]), this.currentYear = this.selectedYear = parseInt(b[1]), b = !0);
        this.opts.allowNull || b || (this.selectedMonth = a.getMonth(), this.selectedYear = a.getFullYear(), null !== this.bounds.min.year && (this.selectedYear < this.bounds.min.year ? (this.selectedYear = this.bounds.min.year, this.selectedMonth = this.bounds.min.month ? this.bounds.min.month : 1) : this.selectedYear == this.bounds.min.year &&
            this.selectedMonth < this.bounds.min.month && (this.selectedMonth = this.bounds.min.month)), null !== this.bounds.max.year && (this.selectedYear > this.bounds.max.year ? (this.selectedYear = this.bounds.max.year, this.selectedMonth = this.bounds.max.month ? this.bounds.max.month : 12) : this.selectedYear == this.bounds.max.year && this.selectedMonth > this.bounds.max.month && (this.selectedMonth = this.bounds.max.month)), this.currentYear = this.selectedYear)
    };
    c.prototype.InitOptions = function (a) {
        this.opts = c._clone(c.defaultOpts);
        this.MergeOptions(a);
        this.EvaluateOptions()
    };
    c.prototype.UpdateOptions = function (a) {
        this.MergeOptions(a);
        this.EvaluateOptions();
        this.RefreshUI()
    };
    c.prototype.MergeOptions = function (a) {
        if (a)
            for (var b in a) this.opts[b] = a[b]
    };
    c.prototype.EvaluateOptions = function () {
        var a = {
            min: {
                year: null,
                month: null
            },
            max: {
                year: null,
                month: null
            }
        };
        if (null !== this.opts.minValue || null !== this.opts.minYear)
            if (null !== this.opts.minValue && null !== this.opts.minYear) {
                var b = this.opts.minValue.split("/"),
                    c = parseInt(this.opts.minYear),
                    d = parseInt(b[1]);
                c > d ? (a.min.year =
                    c, a.min.month = 1) : (a.min.year = d, a.min.month = parseInt(b[0]))
            } else null !== this.opts.minValue ? (b = this.opts.minValue.split("/"), a.min.year = parseInt(b[1]), a.min.month = parseInt(b[0])) : (a.min.year = parseInt(this.opts.minYear), a.min.month = 1);
        if (null !== this.opts.maxValue || null !== this.opts.maxYear) null !== this.opts.maxValue && null !== this.opts.maxYear ? (b = this.opts.maxValue.split("/"), c = parseInt(this.opts.maxYear), d = parseInt(b[1]), c < d ? (a.max.year = c, a.max.month = 12) : (a.max.year = d, a.max.month = parseInt(b[0]))) : null !==
            this.opts.maxValue ? (b = this.opts.maxValue.split("/"), a.max.year = parseInt(b[1]), a.max.month = parseInt(b[0])) : (a.max.year = parseInt(this.opts.maxYear), a.max.month = 12);
        this.bounds = a
    };
    c.prototype.RefreshInputs = function () {
        this.selectedYear && this.selectedMonth ? (this.original_input.value = (10 > this.selectedMonth ? "0" + this.selectedMonth : this.selectedMonth.toString()) + "/" + this.selectedYear, this.input.innerHTML = this.opts.monthLabels[this.selectedMonth - 1] + " " + this.selectedYear) : this.input.innerHTML = '<span class="placeholder">' +
            this.original_input.placeholder + "</span>"
    };
    c.prototype.RefreshUI = function () {
        this.UpdateCalendarView();
        null !== this.currentYear && (this.year_input.innerHTML = this.currentYear.toString());
        this.UpdateYearSwitches()
    };
    c.prototype.InitIU = function () {
        this.parent = document.createElement("div");
        this.parent.classList.add("monthpicker");
        this.parent.tabIndex = -1;
        var a = getComputedStyle(this.original_input, null);
        this.parent.style.width = a.getPropertyValue("width");
        "auto" === this.parent.style.width && (this.parent.style.width =
            0 === this.original_input.offsetWidth ? "100px" : this.original_input.offsetWidth + "px");
        this.original_input.parentElement.insertBefore(this.parent, this.original_input);
        this.parent.appendChild(this.original_input);
        this.original_input.style.display = "none";
        this.input = document.createElement("div");
        this.input.classList.add("monthpicker_input");
        this.input.style.height = a.getPropertyValue("height");
        "auto" === this.input.style.height && (this.input.style.height = 0 === this.original_input.offsetHeight ? "20px" : this.original_input.offsetHeight +
            "px");
        this.input.style.padding = a.getPropertyValue("padding");
        this.input.style.border = a.getPropertyValue("border");
        this.parent.appendChild(this.input);
        this.selector = document.createElement("div");
        this.selector.classList.add("monthpicker_selector");
        this.selector.style.display = "none";
        for (var a = "<table><tr><td><span class='yearSwitch down'>&lt;</span></td><td><div class='yearValue'>" + this.currentYear + "</div> </td><td><span class='yearSwitch up'>&gt;</span> </td></tr> ", b = 0; 4 > b; b++) var c = 3 * b,
            d = this.opts.monthLabels.slice(c,
                c + 3),
            a = a + ("<tr><td class='month month" + (c + 1) + "' data-m='" + (c + 1) + "'>" + d[0] + "</td><td class='month month" + (c + 2) + "' data-m='" + (c + 2) + "'>" + d[1] + "</td><td class='month month" + (c + 3) + "' data-m='" + (c + 3) + "'>" + d[2] + "</td></tr>");
        this.selector.innerHTML = a + "</table>";
        this.parent.appendChild(this.selector)
    };
    c.prototype.Init = function () {
        this.InitIU();
        this.year_input = this.selector.querySelector(".yearValue");
        this.parent.dataset.mp = this.id.toString();
        this.parent.addEventListener("focus", function () {
            c.instances[this.dataset.mp].Show()
        },
            !0);
        this.parent.addEventListener("blur", function () {
            c.instances[this.dataset.mp].Hide()
        }, !0);
        this.parent.querySelector(".yearSwitch.down").addEventListener("click", function () {
            c.instances[this.closest(".monthpicker").dataset.mp].PrevYear()
        });
        this.parent.querySelector(".yearSwitch.up").addEventListener("click", function () {
            c.instances[this.closest(".monthpicker").dataset.mp].NextYear()
        });
        for (var a = this.parent.querySelectorAll(".monthpicker_selector>table tr:not(:first-child) td.month"), b = 0; b < a.length; b++) a[b].addEventListener("click",
            function () {
                this.classList.contains("off") || c.instances[this.closest(".monthpicker").dataset.mp].SelectMonth(this.dataset.m)
            })
    };
    c.prototype.SelectMonth = function (a) {
        var b = parseInt(a);
        if (isNaN(b)) throw "Selected month is not a number : " + a;
        if (1 > b || 12 < b) throw "Month is out of range (should be in [1:12], was " + a + ")";
        this.selectedMonth = b;
        this.selectedYear = this.currentYear;
        this.RefreshUI();
        this.RefreshInputs();
        this.ReleaseFocus();
        if (null !== this.opts.onSelect) this.opts.onSelect()
    };
    c.prototype.UpdateCalendarView =
        function () {
            for (var a = this.selector.querySelectorAll(".month"), b = 0; b < a.length; b++) a[b].classList.remove("selected");
            null !== this.selectedYear && this.currentYear === this.selectedYear && a[this.selectedMonth - 1].classList.add("selected");
            for (b = 0; b < a.length; b++) a[b].classList.remove("off");
            if (null !== this.bounds.min.year && this.currentYear <= this.bounds.min.year)
                for (b = 1; b < this.bounds.min.month; b++) a[b - 1].classList.add("off");
            if (null !== this.bounds.max.year && this.currentYear >= this.bounds.max.year)
                for (b = 12; b > this.bounds.max.month; b--) a[b -
                    1].classList.add("off")
        };
    c.prototype.ReleaseFocus = function () {
        this.parent.blur()
    };
    c.prototype.Show = function () {
        this.RefreshUI();
        this.selector.style.display = "block"
    };
    c.prototype.Hide = function () {
        null !== this.selectedYear && (this.currentYear = this.selectedYear);
        this.selector.style.display = "none"
    };
    c.prototype.ShowYear = function (a) {
        this.currentYear = a;
        this.RefreshUI()
    };
    c.prototype.UpdateYearSwitches = function () {
        var a = this.selector.querySelector(".yearSwitch.down"),
            b = this.selector.querySelector(".yearSwitch.up");
        null !== this.bounds.min.year && this.currentYear <= this.bounds.min.year ? a.classList.add("off") : a.classList.remove("off");
        null !== this.bounds.max.year && this.currentYear >= this.bounds.max.year ? b.classList.add("off") : b.classList.remove("off")
    };
    c.prototype.PrevYear = function () {
        this.ShowYear(this.currentYear - 1)
    };
    c.prototype.NextYear = function () {
        this.ShowYear(this.currentYear + 1)
    };
    c._clone = function (a) {
        var b;
        if (null == a || "object" != typeof a) return a;
        if (a instanceof Date) return b = new Date, b.setTime(a.getTime()), b;
        if (a instanceof Array) {
            b = [];
            for (var e = 0, d = a.length; e < d; e++) b[e] = c._clone(a[e]);
            return b
        }
        if (a instanceof Object) {
            b = {};
            for (e in a) a.hasOwnProperty(e) && (b[e] = c._clone(a[e]));
            return b
        }
        throw Error("Unable to copy obj! Its type isn't supported.");
    };
    c.next_id = 1;
    c.instances = [];
    c.defaultOpts = {
        defaultMonth: null,
        defaultYear: null,
        minValue: null,
        minYear: null,
        maxValue: null,
        maxYear: null,
        monthLabels: "Jan Feb Mar Apr May Jun Jui Aug Sep Oct Nov Dec".split(" "),
        onSelect: null,
        onClose: null,
        allowNull: !0
    };
    return c
}();
window.jQuery && (window.jQuery.fn.Monthpicker = function (c, a) {
    var b;
    if ("undefined" === typeof c || "object" === typeof c) b = "ctor";
    else if ("string" === typeof c && "option" === c) b = "option";
    else {
        console.error("Error : Monthpicker - bad argument (1)");
        return
    }
    window.jQuery(this).each(function (e, d) {
        switch (b) {
            case "ctor":
                "INPUT" != d.tagName || "text" != d.getAttribute("type") && null !== d.getAttribute("type") ? console.error("Monthpicker must be called on a text input") : new Monthpicker(d, c);
                break;
            case "option":
                "INPUT" != d.tagName ||
                    "text" != d.getAttribute("type") && null !== d.getAttribute("type") ? console.error("Monthpicker must be called on a text input") : Monthpicker.Get(d).UpdateOptions(a)
        }
    })
});
window.Element && function (c) {
    c.matches = c.matches || c.matchesSelector || c.webkitMatchesSelector || c.msMatchesSelector || function (a) {
        a = (this.parentNode || this.document).querySelectorAll(a);
        for (var b = -1; a[++b] && a[b] != this;);
        return !!a[b]
    }
}(window.Element.prototype);
window.Element && function (c) {
    c.closest = c.closest || function (a) {
        for (var b = this; b.matches && !b.matches(a);) b = b.parentNode;
        return b.matches ? b : null
    }
}(window.Element.prototype);