var fonts = app.fonts.allFonts;
var actualFonts = [];
for(var f = 0; f < fonts.length; f++) {
    actualFonts.push(fonts[f][0]);
    }
//$.writeln(fonts[0]);

var window = new Window("palette", "Timer 2026", undefined);
window.orientation = "column";

var groupOne = window.add("panel", undefined, ""); // time group
groupOne.orientation = "column";
var groupOneSubGroupOne = groupOne.add("group", undefined, "");
groupOneSubGroupOne.orientation = "row";
var totalTimeText = groupOneSubGroupOne.add("statictext", undefined, "Total Time");1
totalTimeText.size = [160, 20];
var totalTimeEditText = groupOneSubGroupOne.add("edittext", undefined, "MM:SS.MS");
totalTimeEditText.size = [120, 20];
var groupOneSubGroupTwo = groupOne.add("group", undefined, "");
groupOneSubGroupTwo .orientation = "row";
var splitsCheckbox = groupOneSubGroupTwo.add("checkbox", undefined, "Splits");

var groupTwo = window.add("panel", undefined, ""); // position group
groupTwo.orientation = "column";
var groupTwoSubGroupOne = groupTwo.add("group", undefined, "");
groupTwoSubGroupOne.orientation = "row";
var currentTimeIndicatorText = groupTwoSubGroupOne.add("statictext", undefined, "Current Time Indicator At");
currentTimeIndicatorText.size = [160, 20];
var currentTimeIndicatorDD = groupTwoSubGroupOne.add("dropdownlist", undefined, ["Start", "End"]);
currentTimeIndicatorDD.size = [120, 20];
currentTimeIndicatorDD.selection = 0;
var groupTwoSubGroupTwo = groupTwo.add("group", undefined, "");
groupTwoSubGroupTwo.orientation = "row";
var textPositionText = groupTwoSubGroupTwo.add("statictext", undefined, "Text Position");
textPositionText.size = [160, 20];
var textPositionDD = groupTwoSubGroupTwo.add("dropdownlist", undefined, ["Top Left", "Top Center", "Top Right", "Middle Left", "Center", "Middle Right", "Bottom Left", "Bottom Center", "Bottom Right"]);
textPositionDD.size = [120, 20];
textPositionDD.selection = 6;

var groupThree = window.add("panel", undefined, ""); // font group
groupThree.orientation = "column";
var groupThreeSubGroupOne = groupThree.add("group", undefined, "");
groupThreeSubGroupOne.orientation = "row";
var fontText = groupThreeSubGroupOne.add("statictext", undefined, "Font");
fontText.size = [160, 20];
var fontDD = groupThreeSubGroupOne.add("dropdownlist", undefined, actualFonts);
fontDD.size = [120, 20];
fontDD.selection = 0;

var generateButton = window.add("button", undefined, "Generate");

var maxSplits = 10;
var splitsWindow = new Window("palette", "Splits", undefined);
splitsWindow.orientation = "column";
var sGroupOne = splitsWindow.add("group", undefined, "");
sGroupOne.orientation = "row";
var numberOfSplitsText = sGroupOne.add("statictext", undefined, "# of Splits");
var numberOfSplitsSlider = sGroupOne.add("slider", undefined, "5");
numberOfSplitsSlider.minvalue = 2;
numberOfSplitsSlider.maxvalue = maxSplits;
numberOfSplitsSlider.value = 5;
var numberOfSplitsSliderText = sGroupOne.add("statictext", undefined, "5");
numberOfSplitsSliderText.characters = 3;

var groupArray = [];
var groupEditTextArray = [];
for(var s = 0; s < maxSplits; s++) {
    var g = splitsWindow.add("group", undefined, "");
    g.orientation = "row";
    var splitText = g.add("statictext", undefined, "Split " + (s+1).toString());
    var splitEditText = g.add("edittext", undefined, "MM:SS.MS");
    groupEditTextArray.push(splitEditText);
    if(s > 4) g.visible = false;
    groupArray.push(g);
    }

var saveButton = splitsWindow.add("button", undefined, "Save");

saveButton.onClick = function() {
    splitsWindow.hide();
    }

numberOfSplitsSlider.onChanging = function() {
    numberOfSplitsSliderText.text = Math.floor(numberOfSplitsSlider.value);
    
    for(var gg = 0; gg < groupArray.length; gg++) {
         if(gg < Math.floor(numberOfSplitsSlider.value)) {
             groupArray[gg].visible = true;
             } else {
             groupArray[gg].visible = false;
                 }
        }
    }

splitsWindow.center();

splitsCheckbox.onClick = function() {
     if(splitsCheckbox.value) {
         splitsWindow.show();
         } else {
         splitsWindow.hide();
         }
    }

generateButton.onClick = function() {
    if(!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
        alert("Please select a composition first!");
        return false;
        }
    
    app.beginUndoGroup("Timer Creation");
    generateTimer(totalTimeEditText.text, splitsCheckbox.value, getSplitsArray(), currentTimeIndicatorDD.selection.index, textPositionDD.selection.index, fontDD.selection);
    app.endUndoGroup();
    }

function getSplitsArray() {
    var stringArray = [];

    var numSplits = Math.floor(numberOfSplitsSlider.value);
    for(var s = 0; s < numSplits; s++) {
        stringArray.push(groupEditTextArray[s].text);
        }
    
    return stringArray;
    }

var minutesCode = "frames = Math.floor((time - Math.floor(time)) * Math.floor(1/thisComp.frameDuration));\n       sek = Math.floor(time%60);\n       min = Math.floor(time/60);\n       if(sek<10) {\n        if(frames<10)\n         min +\":0\" + sek + \".0\" + frames;\n        else\n         min +\":0\" + sek + \".\" + frames;\n       }\n       else\n       {\n        if(frames<10)\n         min +\":\" + sek + \".0\" + frames;\n        else\n         min +\":\" + sek + \".\" + frames; }";
var secondsCode = "frames = Math.floor((time - Math.floor(time)) * Math.floor(1/thisComp.frameDuration));\n   sek = Math.floor(time%60);\n   if(sek<10) {\n    if(frames<10)\n    sek + \".0\" + frames;\n    else\n    sek + \".\" + frames;\n   }\n   else\n   {\n    if(frames<10)\n    sek + \".0\" + frames;\n    else\n    sek + \".\" + frames; }";

function convertToSeconds(totalTimeString, framerate) {
    var parts = totalTimeString.split(':');
    var minutes = parseFloat(parts[0]);
    var secParts = parts[1].split('.');
    var seconds = parseInt(secParts[0], 10);
    var frames = parseInt(secParts[1], 10);
    return (minutes * 60) + seconds + (frames / framerate);
}

function generateTimer(totalTimeString, splitsB, splitsArray, ctiIndex, textPositionIndex, font) {
    var comp = app.project.activeItem;
    var totalTimeSeconds = convertToSeconds(totalTimeString, Math.floor(1/comp.frameDuration));
    var currentTime = (ctiIndex == 0) ? comp.time : comp.time - totalTimeSeconds;
    var outTime = (ctiIndex == 0) ? comp.time + totalTimeSeconds : comp.time;
    
    var timerTextLayer = comp.layers.addText();
    if(totalTimeSeconds < 60) {
        timerTextLayer.property("Text").property("Source Text").expression = secondsCode;
    } else {
        timerTextLayer.property("Text").property("Source Text").expression = minutesCode;
    }

    var textProp = timerTextLayer.property("Source Text");
    var textDocument = textProp.value;
    textDocument.resetCharStyle();
    textDocument.fontSize = 60;
    textDocument.fillColor = [1, 1, 1];
    textDocument.font = font;
    textDocument.applyFill = true;
    textDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
    textProp.setValue(textDocument);

    var timerLayerComp = comp.layers.precompose([1], "Timer Comp", true);
    var timerPrecompLayer = comp.layer(1);
    timerPrecompLayer.startTime = currentTime;
    //timerPrecompLayer.outPoint = outTime;
    timerPrecompLayer.timeRemapEnabled = true;
    timerPrecompLayer.property("ADBE Time Remapping").setValueAtTime(outTime, outTime-timerPrecompLayer.inPoint);
    timerPrecompLayer.property("ADBE Time Remapping").setValueAtTime(comp.duration, outTime-timerPrecompLayer.inPoint);
    timerPrecompLayer.Effects.addProperty("ADBE Drop Shadow");
    timerPrecompLayer.effect(1).property(2).setValue(100);
    
    var ogPosition = timerPrecompLayer.property("ADBE Transform Group").property("ADBE Position").value;
    switch(textPositionIndex) {
        case 0: // TL
            timerPrecompLayer.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width * .222, comp.height * .026]);
        break;
        case 1: // TC
            timerPrecompLayer.property("ADBE Transform Group").property("ADBE Position").setValue([ogPosition[0], comp.height * .026]);
        break;
        case 2: // TR
            timerPrecompLayer.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width * .888, comp.height * .026]);
        break;
        case 3: // ML
            timerPrecompLayer.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width * .222, ogPosition[1]]);
        break;
        case 4: // C
         // do nothing
        break;
        case 5: // MR
            timerPrecompLayer.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width * .888, ogPosition[1]]);
        break;
        case 6: // BL
            timerPrecompLayer.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width * .222, comp.height * .97]);
        break;
        case 7: // BC
            timerPrecompLayer.property("ADBE Transform Group").property("ADBE Position").setValue([ogPosition[0], comp.height * .97]);
        break;
        case 8: // BR
            timerPrecompLayer.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width * .888, comp.height * .97]);
        break;
        }
    
    if(splitsB) {
        var startTimeSeconds = timerPrecompLayer.inPoint;
        for(var s = 0; s < splitsArray.length; s++) {
            // each splitsArray index is a MM:SS.MS
            var thisSplitInSeconds = convertToSeconds(splitsArray[s], Math.floor(1/comp.frameDuration));
            startTimeSeconds+=thisSplitInSeconds;
            var splitTextLayer = comp.layers.addText(splitsArray[s]);
            var textPropSplit = splitTextLayer.property("Source Text");
            var textDocumentSplit = textPropSplit.value;
            textDocumentSplit.resetCharStyle();
            textDocumentSplit.fontSize = 60;
            textDocumentSplit.fillColor = [1, 1, 1];
            textDocumentSplit.font = font;
            textDocumentSplit.applyFill = true;
            textDocumentSplit.justification = ParagraphJustification.CENTER_JUSTIFY;
            textPropSplit.setValue(textDocumentSplit);
            
            splitTextLayer.inPoint = startTimeSeconds - .5;
            splitTextLayer.outPoint = startTimeSeconds+5;
            
            splitTextLayer.Effects.addProperty("ADBE Drop Shadow");
            splitTextLayer.effect(1).property(2).setValue(100);
            
            }
        }
    
    }

window.center();
window.show();