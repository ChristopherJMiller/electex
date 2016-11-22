const {clipboard} = require('electron')

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
  PDFJS.workerSrc = 'bower_components/pdfjs-dist/build/pdf.worker.js';

  var currentLineNum = 1;
  var editorText = [];
  renderEditor(editorText);

  $('#run').click(() => {
    var minifiedText = '';
    for (var i in editorText) {
      minifiedText += editorText[i]
    }
    require("latex")([minifiedText]).pipe(fs.createWriteStream("test.pdf"));
    var url = 'file://' + __dirname + '/test.pdf';
    PDFJS.getDocument(url).then((pdf) => {
      //
      // Fetch the first page
      //
      pdf.getPage(1).then((page) => {
        var proportion = $('#viewingWindow').width() / page.getViewport(1).width;
        var viewport = page.getViewport(proportion);
        console.log(viewport);


        //
        // Prepare canvas using PDF page dimensions
        //
        var canvas = document.getElementById('pdfViewer');
        var context = canvas.getContext('2d');
        canvas.height = $('#viewingWindow').height();
        canvas.width = $('#viewingWindow').width();

        //
        // Render PDF page into canvas context
        //
        var renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        page.render(renderContext);
      });
    });
  });

  var functionKey = 0;
  $(document).keydown((event) => {
    switch(event.which) {
      // Control Key
      case 17:
        functionKey = 17;
        break;
      // Enter Key
      case 13:
        currentLineNum++;
        break;
      // Backspace
      case 8:
        if (editorText[currentLineNum] == "") {
          currentLineNum--;
        } else {
          editorText[currentLineNum] = editorText[currentLineNum].slice(0, -1);
          renderEditor(editorText);
        }
        break;
      default:
        if (editorText[currentLineNum] == null) {
          editorText[currentLineNum] = "";
        }
        if (functionKey != 0) {
          switch (event.which) {
            case 86:
              var pasteData = clipboard.readText().split('\n');
              console.log(pasteData);
              for (var i in pasteData) {
                  if (editorText[currentLineNum + i] == null) {
                    editorText[currentLineNum + i] = '';
                  }
                  editorText[currentLineNum + i] += pasteData[i];
              }
              break;
            default:
              editorText[currentLineNum] += event.key;
          }
        }
        break;
    }
    renderEditor(editorText);
  });
});
