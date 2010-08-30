
// XXX TODO
//  fix headers?
//  toc?

(function ($, GLOBAL) {
    $.fn.renameElement = function (name) {
        return this.each(function () {
            var $newEl = $(this.ownerDocument.createElement(name));
            for (var i = 0, n = this.attributes.length; i < n; i++) {
                var at = this.attributes[i];
                $newEl[0].setAttributeNS(at.namespaceURI, at.name, at.value);
            }
            $(this).contents().clone().appendTo($newEl);
            $(this).replaceWith($newEl);
        });
    };

    $.fn.makeID = function (pfx, txt) {
        // doesn't work like a real jq plugin
        var $el = $(this);
        if ($el.attr("id")) return $el.attr("id");
        var id = "";
        if (!txt) {
            if ($el.attr("title")) txt = $el.attr("title");
            else                   txt = $el.text();
        }
        
        txt = txt.replace(/^\s+/, "").replace(/\s+$/, "");
        id += txt;
        id = id.toLowerCase();
        id = id.split(/[^-.0-9a-z_]/).join("-").replace(/^-+/, "").replace(/-+$/, "");
        if (id.length > 0 && /^[^a-z]/.test(id)) id = "x" + id;
        if (id.length == 0) id = "generatedID";
        if (pfx) id = pfx + "-" + id;
        var inc = 1;
        var doc = $el[0].ownerDocument;
        if (doc.getElementById(id)) {
            while (doc.getElementById(id + "-" + inc)) inc++;
            id = id + "-" + inc;
        }
        $el.attr("id", id);
        return id;
    };

    var X5 = function () {};
    X5.prototype = {
        run:    function () {
            // add CSS and title
            $("head").append($("<link/>", { rel: "stylesheet", media: "all", href: "../css/live-x5.css" }));
            var tits = document.title.split(":");
            if (tits.length == 2) {
                $("article").prepend("<h1></h1>")
                            .find("h1")
                                .append(tits[0] + ":")
                                .append("<br/>")
                                .append(tits[1]);
            }
            else {
                $("article").prepend("<h1></h1>")
                            .find("h1")
                                .append(tits[0]);
            }
            // make quotes work 
            var quotes = $("q");
            quotes.replaceWith(function (idx) {
                return $("<span class='quote'></span>").html($(quotes[idx]).html());
            });
            $(".quote").before("“").after("”");

            // footnotes
            var $fn = $("<section id='footnotes' class='appendix'><h2>Notes</h2><dl/></section>");
            var $fnls = $fn.find("dl");
            $("article").append($fn);
            $("aside").each(function (i, asd) {
                var $asd = $(asd);
                var num = i + 1;
                var $to = $("<span class='foot'><a></a></span>")
                                .find("a")
                                    .text(num)
                                    .attr({href: "#fn-" + num, id: "back-" + num })
                                .end();
                $asd.after($to);
                var $bk = $("<dt><a/></dt>")
                                .find("a")
                                    .text(num)
                                    .attr({href: "#back-" + num, id: "fn-" + num })
                                .end();
                var $dd = $("<dd/>");
                $asd.contents().clone().appendTo($dd);
                $asd.remove();
                $fnls.append($bk);
                $fnls.append($dd);
            });
            // XXX this is the old link-replacement code
            // var $fn = $("<section id='footnotes' class='appendix'><h2>Notes</h2><ul/></section>");
            // var $fnls = $fn.find("ul");
            // $("article").append($fn);
            // $("a[href^='http:']").each(function (i, lnk) {
            //     var $lnk = $(lnk);
            //     var num = i + 1;
            //     var $to = $("<span class='foot'>[<a></a>]</span>")
            //                     .find("a")
            //                         .text(num)
            //                         .attr({href: "#fn-" + num, id: "back-" + num })
            //                     .end();
            //     $lnk.after($to);
            //     var $bk = $("<li><a/> <span></span></li>")
            //                     .find("a")
            //                         .text("^" + num)
            //                         .attr({href: "#back-" + num, id: "fn-" + num })
            //                     .end()
            //                     .find("span")
            //                         .text($lnk.attr("href"))
            //                     .end();
            //     $fnls.append($bk);
            // });

            // add word count
            this.wcount();
            
            // makeTOC
            var $ul = this.makeTOCAtLevel($("article"), [0], 1);
            if ($ul) {
                var $toc = $("<section id='toc' class='introductory'/>").append("<h2>Table des matières</h2>")
                                                   .append($ul);
                if ($("article div.meta").length > 0) $("article div.meta").after($toc);
                else                                  $("article h1:first").after($toc);
            }
            
            // remove things we don't want to keep
            $(".remove").remove();
        },
        wcount:    function () {
            var txt = $("body")[0].textContent.replace(/\s+/g, " ");
            var signs = txt.length;
            var perc = (signs / 500).toFixed(2);
            var words = txt.split(" ").length;
            $("<div id='wcount'>" + signs + "/" + words + " (" + perc + "%)</div>").appendTo($("article"));
        },
        appendixMode:   false,
        lastNonAppendix:    0,
        alphabet:   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        makeTOCAtLevel:    function ($parent, current, level) {
            var $secs = $parent.children("section:not(.introductory)");

            if ($secs.length == 0) return null;
            var $ul = $("<ul class='toc'></ul>");
            for (var i = 0; i < $secs.length; i++) {
                var $sec = $($secs[i]);
                if (!$sec.contents().length) continue;
                var h = $sec.children()[0];
                var ln = h.localName.toLowerCase();
                if (ln != "h2" && ln != "h3" && ln != "h4" && ln != "h5" && ln != "h6") continue;
                var title = h.textContent;
                var $hKids = $(h).contents().clone();
                $hKids.find("a").renameElement("span").attr("class", "formerLink").removeAttr("href");
                $hKids.find("dfn").renameElement("span").removeAttr("id");
                var id = $sec.makeID(null, title);
                current[current.length-1]++;
                var secnos = current.slice();
                if ($sec.hasClass("appendix") && current.length == 1 && !this.appendixMode) {
                    this.lastNonAppendix = current[0];
                    this.appendixMode = true;
                }
                if (this.appendixMode) secnos[0] = this.alphabet.charAt(current[0] - this.lastNonAppendix);
                var secno = secnos.join(".");
                var isTopLevel = secnos.length == 1;
                if (isTopLevel) secno = secno + ".";
                var $span = $("<span class='secno'></span>").text(secno + " ");
                $(h).prepend($span);
                var $a = $("<a/>").attr({ href: "#" + id, 'class' : 'tocxref' })
                                  .append($span.clone())
                                  .append($hKids);
                var $item = $("<li class='tocline'/>").append($a);
                $ul.append($item);
                if (this.maxTocLevel && level >= this.maxTocLevel) continue;
                current.push(0);
                var $sub = this.makeTOCAtLevel($sec, current, level + 1);
                if ($sub) $item.append($sub);
                current.pop();
            }
            return $ul;
        },
        ieDummy:    1
    };
    
    GLOBAL.X5 = new X5();
})(jQuery, this);

jQuery(function () {
    X5.run();
});
