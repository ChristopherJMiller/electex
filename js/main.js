function renderEditor(array) {
  $('#editingWindow').empty();
  for (var row in array) {
    var rowObj = $('#baseEditorRow').clone();
    rowObj.attr('id', 'row-' + row);
    rowObj.text(array[row]);
    rowObj.removeAttr('hidden');
    rowObj.appendTo('#editingWindow');
  }
}

$(document).ready(() => {
  var fs = require('graceful-fs');
  var latex = require('gulp-latex');

  var currentLineNum = 1;
  var editorText = [];
  renderEditor(editorText);

  $(document).keyup((event) => {
    console.log(event);
    if (event.which == 13) {
      currentLineNum++;
      return;
    }
    if (event.which == 8) {
      if (editorText[currentLineNum] == "") {
        currentLineNum--;
        return;
      } else {
        editorText[currentLineNum] = editorText[currentLineNum].slice(0, -1);
        renderEditor(editorText);
        return;
      }
    }
    if (editorText[currentLineNum] == null) {
      editorText[currentLineNum] = "";
    }
    editorText[currentLineNum] += event.key;
    renderEditor(editorText);
  });
});
