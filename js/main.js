/* global PDFJS */

const {clipboard} = require('electron');
const path = require('path');

function renderEditor(array) {
  $('#editingWindow').empty();
  for (const row in array) {
    if (array[row] !== null) {
      const rowObj = $('#baseEditorRow').clone();
      rowObj.attr('id', 'row-' + row);
      rowObj.children('span').text(row);
      console.log(rowObj);
      rowObj.append(array[row]);
      rowObj.removeAttr('hidden');
      rowObj.appendTo('#editingWindow');
    }
  }
}

$(document).ready(() => {
  const fs = require('graceful-fs');

  PDFJS.workerSrc = 'bower_components/pdfjs-dist/build/pdf.worker.js';

  let currentLineNum = 1;
  const editorText = [];
  renderEditor(editorText);

  $('#run').click(() => {
    let minifiedText = '';
    for (const i in editorText) {
      if (editorText[i] !== null) {
        minifiedText += editorText[i];
      }
    }
    require('latex')([minifiedText]).pipe(fs.createWriteStream('test.pdf'));
    const url = path.join('file://', __dirname, '/test.pdf');
    PDFJS.getDocument(url).then(pdf => {
      //
      // Fetch the first page
      //
      pdf.getPage(1).then(page => {
        const proportion = $('#viewingWindow').width() / page.getViewport(1).width;
        const viewport = page.getViewport(proportion);

        //
        // Prepare canvas using PDF page dimensions
        //
        const canvas = document.getElementById('pdfViewer');
        const context = canvas.getContext('2d');
        canvas.height = $('#viewingWindow').height();
        canvas.width = $('#viewingWindow').width();

        //
        // Render PDF page into canvas context
        //
        const renderContext = {
          canvasContext: context,
          viewport
        };
        page.render(renderContext);
      });
    });
  });

  let functionKey = 0;
  // TODO: Add key up event to resassign functionKey
  $(document).keydown(event => {
    switch (event.which) {
      // Control Key
      case 17:
        functionKey = 17;
        break;
      // Enter Key
      case 13:
        currentLineNum++;
        break;
      case 16:
      // Catch for Shift, boolean attached to event handles it
        break;
      // Backspace
      case 8:
        if (editorText[currentLineNum] === '') {
          currentLineNum--;
        } else {
          editorText[currentLineNum] = editorText[currentLineNum].slice(0, -1);
          renderEditor(editorText);
        }
        break;
      default:
        if (editorText[currentLineNum] === undefined) {
          editorText[currentLineNum] = '';
        }
        if (functionKey == 0) {
          switch (event.which) {
            case 86: {
              const pasteData = clipboard.readText().split('\n');
              for (const i in pasteData) {
                if (editorText[currentLineNum + i] === undefined) {
                  editorText[currentLineNum + i] = '';
                }
                editorText[currentLineNum + i] += pasteData[i];
              }
              break;
            }
            default:
              if (event.shiftKey) {
                editorText[currentLineNum] += event.key.toUpperCase();
              } else {
                editorText[currentLineNum] += event.key;
              }
          }
        }
        break;
    }
    renderEditor(editorText);
  });
});
