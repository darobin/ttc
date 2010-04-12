
(function ($, GLOBAL) {
    var X5 = function () {};
    X5.prototype = {
        run:    function () {
            $("head").append($("<link/>", { rel: "stylesheet", media: "all", href: "../css/live-x5.css" }));
            var tits = document.title.split(":");
            $("article").prepend("<h1></h1>")
                        .find("h1")
                            .append(tits[0] + ":")
                            .append("<br/>")
                            .append(tits[1]);
            // fix headers?
            // toc?
            this.wcount();
            $(".remove").remove();
        },
        wcount:    function () {
            var txt = $("body")[0].textContent.replace(/\s+/g, " ");
            var signs = txt.length;
            var perc = (signs / 500).toFixed(2);
            var words = txt.split(" ").length;
            $("<div id='wcount'>" + signs + "/" + words + " (" + perc + "%)</div>").appendTo($("article"));
        },
    };
    
    GLOBAL.X5 = new X5();
})(jQuery, this);

jQuery(function () {
    X5.run();
});
