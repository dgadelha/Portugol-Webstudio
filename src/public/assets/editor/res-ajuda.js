$(window).bind("load", function() {
    $(".ax5layout").ax5layout();

    $.get("/recursos/ajuda/scripts/topicos.json", function(data) {
        $(".jstree")
            .on("changed.jstree", function(e, data) {
                if (data.changed.selected.length == 0) return;

                var sid = data.changed.selected[0];
                var html = $("#" + sid).attr("data-html");

                $("#mainFrame").attr("src", d.baseUrl + "resp?file=recursos/ajuda/" + html);
            })
            .jstree(data);
    });
});
