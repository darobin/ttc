
// XXX TODO
//  fix headers?
//  toc?

(function ($, GLOBAL) {
    var X5 = function () {};
    X5.prototype = {
        run:    function () {
            // add CSS and title
            $("head").append($("<link/>", { rel: "stylesheet", media: "all", href: "../css/live-x5.css" }));
            var tits = document.title.split(":");
            $("article").prepend("<h1></h1>")
                        .find("h1")
                            .append(tits[0] + ":")
                            .append("<br/>")
                            .append(tits[1]);
            // make quotes work 
            var quotes = $("q");
            quotes.replaceWith(function (idx) {
                return $("<span class='quote'></span>").html($(quotes[idx]).html());
            });
            $(".quote").before("“").after("”");
            // add word count
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
