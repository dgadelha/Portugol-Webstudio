$(window).bind("load", () => {
  $(".ax5layout").ax5layout();

  $.get("/recursos/ajuda/scripts/topicos.json", data => {
    $(".jstree")
      .on("changed.jstree", (e, data) => {
        if (data.changed.selected.length == 0) {
          return;
        }

        const sid = data.changed.selected[0];
        const html = $(`#${sid}`).attr("data-html");

        $("#mainFrame").attr("src", `${d.baseUrl}resp?file=recursos/ajuda/${html}`);
      })
      .jstree(data);
  });
});
