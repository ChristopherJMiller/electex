const {ipcRenderer} = require('electron')

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
    var texToCompile = "\\documentclass[12pt,letterpaper]{article}\\usepackage[utf8]{inputenc}\\usepackage{amsmath}\\usepackage{amsfonts}\\usepackage{amssymb}\\usepackage{mathtools}\\usepackage[left=1in,right=1in,top=1in,bottom=1in]{geometry}\\author{Christopher Miller}\\title{Lab Idea}\\begin{document}\\maketitle\\section{Goal}Compare the throwing distance of a ball from standing at ground level to the throwing distance of a ball off the first story of a building.\\section{Ground Level Throw}Conduct three ball throws from standing on the ground level. Attempt to keep the throwing strength similar between trials. Record the starting height of the ball, the time it takes to reach the ground from the point of releasing the ball, and the horizontal displacement from the origin throwing point.\\subsection{Measurements}\\begin{itemize}\\item The starting height of throwing the ball in meters.\\item The time in seconds that the ball is air bourne.\\item The horizontal distance from the origin point in meters.\\end{itemize}\\section{First Story Throw}Conduct three ball throws while standing on the first story (One floor above the ground level), throwing the ball off the story to the ground level. Predict the horizontal distance before conducting the experiment.\\subsection{Prediction}Every story of a building can be generalized as 10ft or 3m tall. Thus, the predicted distance off of the first story would be 3m plus the throwing height in the throwing height of the ground level.\\begin{equation}t_{fall}=\\sqrt{\\frac{2d}{g}}\\end{equation}Calculate falling time off second floor. $d$ is defined as the ground level throwing height plus 3m(extra floor). $g$ is defined as the acceleration due to gravity.\\begin{equation}a_{first}=\\frac{2d}{t^{2}}\\end{equation}Calculate the throwing acceleration using the average distance and times of the ground level trials. $d$ is defined as the horizontal distance from the ground level trials. $t$ is defined as the average time from the ground level trials.\\begin{equation}d=\\frac{1}{2}(a_{first})(t_{fall})^{2}\\end{equation}Calculate the predicted distance for a throw off the first story.\\subsection{Experiment}Attempt to keep the throwing strength similar between trials and throwing height similar to the ground level trials. Record the starting height of the ball, the time it takes to reach the ground from the point of releasing the ball, and the horizontal displacement from the origin throwing point.\\subsubsection{Measurements}\\begin{itemize}\\item The starting height of throwing the ball in meters.\\item The time in second that the ball is air bourne.\\item The horizontal distance from the origin point in meters.\\end{itemize}\\section{Checking Accuracy of Permissions}\\begin{equation}\\% Error=\\left|\\frac{PredictedDistance - Actual Distance}{Predicted Distance}\\right| \\times 100\\%\\end{equation}Use the percent error equation to evaluate the accuracy of your predicted value.\\end{document}";
    for (var row in editorText) {
      texToCompile += editorText[row];
    }
    require("latex")([texToCompile]).pipe(fs.createWriteStream("test.pdf"));
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

  $(document).keyup((event) => {
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
