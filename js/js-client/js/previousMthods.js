/**
 * Created by ruwini on 5/15/17.
 */

var j = 1;
$('#addNewSource').on('click', function () {
    console.log("");
    $('.collapse').collapse();
    createSourceConfigPanel();
    return false;
});

function createSourceConfigPanel() {
    var selectedSource = document.getElementById("sources").value;
    createCollapsableTab(selectedSource);
    var panelBodyId = 'panelBody_sourceConfig_' + j;
    if (selectedSource === "CSV file") {

        var csv = csvTemplate.replaceAll('{{dynamicId}}', 'source_' + j);
        $('#' + panelBodyId).html(csv);


        // document.getElementById(panelBodyId).innerHTML = '<object type="text/html" data="csvSimulation.html" >' +
        //     '</object>';
    } else if (selectedSource === "Database") {
        document.getElementById(panelBodyId).innerHTML = '<object type="text/html" data="dbSimulation.html" >' +
            '</object>';
    } else {
        document.getElementById(panelBodyId).innerHTML = '<object type="text/html" data="randomSimulation.html" >' +
            '</object>';
    }
    j++;
}

function removeConfig(configNo) {
    document.getElementById('sourceConfig_' + configNo).remove();
    for (var a = configNo; a < j; a++) {
        var divId = 'sourceConfig_' + a;
        var childNodes = $('#divId').children;
//            todo change the names of the other simulation configs .. i.e. is 2 is removed 3 should be renamed to 2
//            console.log(childNodes);
//            $('#divId').children.each(function () {
//                console.log(this.value); // "this" is the current element in the loop
//            });
    }
    j--;
}

function createCollapsableTab(selectedSource) {
/*
* <div class = "panel panel-default" >
*     <div class = "panel-heading" role = "tab" id = "{{dynamicId}}" data-toggle = "collapse" href =
 *      aria-controls = "#{{dynamicId}}_config">
 *     </div>
*     </div>
*
*
*
*      <div class="panel panel-default" id = "sourceConfig_{{dynamicId}}">
 <div class="panel-heading" role="tab" id="source_{{dynamicId}}" data-toggle="collapse" href="#sourceDes_{{dynamicId}}"
  aria-controls="sourceDes_{{dynamicId}}">
 <h4 class="panel-title">Source {{dynamicId}} - {{sourceType}}</h4>
 <button type = "button" class = "btn btn-primary">Delete</button>
 </div>
 <div id="sourceDes_{{dynamicId}}" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="source_{{dynamicId}}">
 <div class="panel-body" id ="panelBody_source_' + j">
 Panel content
 </div>
 </div>
 </div>
*     */
    var div_1 = document.createElement('div');
    div_1.setAttribute('class', 'panel panel-default');
    div_1.setAttribute('id', 'sourceConfig_' + j);

    var div_2 = document.createElement('div');
    div_2.setAttribute('class', 'panel-heading');
    div_2.setAttribute('role', 'tab');
    div_2.setAttribute('id', 'source_' + j);
    div_2.setAttribute('data-toggle', 'collapse');
    div_2.setAttribute('href', '#source_' + j + '_Des');
//        div_2.setAttribute('aria-expanded', 'true');
    div_2.setAttribute('aria-controls', 'source_' + j + '_Des');

    var header = document.createElement('h4');
    header.setAttribute('class', 'panel-title');
    header.append(document.createTextNode('Source ' + j + " - " + selectedSource));

    var delete_button = document.createElement('button');
    delete_button.setAttribute('type', 'button');
    delete_button.setAttribute('class', 'btn btn-primary');
    delete_button.setAttribute('onclick', 'removeConfig(' + j + ')');

    delete_button.append(document.createTextNode('Delete'));

    var div_inline = document.createElement('div');
    div_inline.setAttribute('class', 'form-inline');
//
    div_inline.appendChild(header);

    div_inline.appendChild(delete_button);
    div_2.appendChild(div_inline);

    var div_3 = document.createElement('div');
    div_3.setAttribute('class', 'panel-collapse collapse in');
    div_3.setAttribute('id', 'source_' + j + '_Des');
    div_3.setAttribute('role', 'tabpanel');
    div_3.setAttribute('aria-labelledby', 'source_' + j);


    var div_4 = document.createElement('div');
    div_4.setAttribute('class', 'panel-body');
    div_4.setAttribute('id', 'panelBody_sourceConfig_' + j);

    div_4.append(document.createTextNode('Source config....... ' + j));
    div_3.appendChild(div_4);

    div_1.appendChild(div_2);
    div_2.after(div_3);

    $('#sourceConfigs').append(div_1);
}
/* scripts of simulation source configs begins here*/
/*
 * scripts common for all 3 simulations
 * */

//    allow only one of timestamp options
$('input[name="timestamp-option"]').on('click', function () {
    if ($(this).val() === 'timestampAttribute') {
        $('#timestampAttribute').prop('disabled', false);
        $('#timestampInterval').prop('disabled', true).val('');
    } else {
        $('#timestampAttribute').prop('disabled', true).val('');
        $('#timestampInterval').prop('disabled', false).val('1000');
    }
});

//  variables to hold execution plan names, stream names and stream attributes


var executionPlanNameArray = ['TestExecutionPlan', 'test1'];
var executionPlanStreamsArray = {'TestExecutionPlan': ['FooStream', 'stream1'], 'test1': ['stream2', 'stream3']};
var streamAttributes = {
    "FooStream": [{"name": "symbol", "type": "string"}, {"name": "price", "type": "float"},
        {"name": "volume", "type": "long"}],
    "stream1": [{"name": "symbol", "type": "string"}, {"name": "occupied", "type": "BOOL"}],
    "stream2": [{"name": "price", "type": "float"}, {"name": "volume", "type": "long"}],
    "stream3": [{"name": "symbol", "type": "string"}, {"name": "volume", "type": "long"},
        {"name": "price", "type": "float"}]
};
function a() {

//    create drop down menu of available execution plans
    for (var j = 0; j < executionPlanNameArray.length; j++) {
        var executionPlanOption = document.createElement('option');
        executionPlanOption.setAttribute('value', executionPlanNameArray[j]);
        executionPlanOption.append(document.createTextNode(executionPlanNameArray[j]));
        $('#executionPlanName_source1').append(executionPlanOption);
    }

    /* display the streams of the execution plan initially selected*/
    var streamNames = executionPlanStreamsArray[$('#executionPlanName_source1').val()];
    createStreamNamesList(streamNames);
    streamNames = [];
}

//    createStreamNamesList() is used to alter the drop down list of stream names
function createStreamNamesList(streamNames) {
    for (var i = 0; i < streamNames.length; i++) {
        var streamOption = document.createElement('option');
        streamOption.setAttribute('value', streamNames[i]);
        streamOption.append(document.createTextNode(streamNames[i]));
        $('#streamName_source1').append(streamOption);
    }
}

//    displayStreamNames() is used to display the stream names of the execution plan selected
function displayStreamNames(executionPlanName) {
    $('#streamName_source1').empty();
    streamNames = executionPlanStreamsArray[executionPlanName];
    createStreamNamesList(streamNames);
    streamNames = [];
}

/*
 * database simulation scripts
 * */
var tableNamesArray;
var columnNamesArray;
function s() {


//    initially show the attributes belonging to first stream of the selected execution plan
    var attributes = streamAttributes[executionPlanStreamsArray[$('#executionPlanName').val()][0]];
    createAttributesList(attributes);
    attributes = [];
}

function createAttributesList(attributes) {
    var streamAttrLabel;
    var streamAttrLabelTextNode;
    var streamAttrInput;
    var div = document.createElement('div');
    div.setAttribute('class', 'col-sm-5');

    for (var i = 0; i < attributes.length; i++) {
        //create label elements
        streamAttrLabel = document.createElement('label');
        streamAttrLabel.setAttribute('class', 'col-sm-2 control-label');

        //add text to label elements
        streamAttrLabelTextNode = document.createTextNode(attributes[i]['name'] + '(' + attributes[i]['type'] +
            ')');
        streamAttrLabel.appendChild(streamAttrLabelTextNode);

        streamAttrInput = document.createElement('select');
        streamAttrInput.setAttribute('class', 'form-control');
        streamAttrInput.setAttribute('id', 'Attribute_' + attributes[i]['name']);
        streamAttrInput.setAttribute('name', 'Attribute_' + attributes[i]['name']);
        div.appendChild(streamAttrLabel);
        $(streamAttrLabel).after(streamAttrInput);

        //append to parent div
        $('#attributes').append(div);
    }
}

//    displayStreamNames() is used to display the stream names of the execution plan selected
function displayStreamNames(executionPlanName) {
    $('#streamName').empty();
    streamNames = executionPlanStreamsArray[executionPlanName];
    createStreamNamesList(streamNames);
    displayAttributes(streamNames[0]);
    streamNames = [];
}

//    displayAttributes() is used to display input fields for the attributes selected
function displayAttributes(streamName) {
    $('#attributes').empty();
    attributes = streamAttributes[streamName];
    createAttributesList(attributes);
    attributes = [];
    if ($('#tableName').val() !== null) {
        displayColumnNames($('#tableName').val());
    }
}

//    get names of tables in databas
function loadDBData() {
    tableNamesArray = ['foostream', 'foostream3', 'foostream4'];
    columnNamesArray = {
        'foostream': ['timestamp', 'name', 'price', 'volume'],
        'foostream3': ['timestamp', 'symbol', 'volume', 'price'],
        'foostream4': ['timestamp', 'symbol', 'volume', 'price']
    };
    displayTableNames(tableNamesArray);
    displayColumnNames($('#tableName').val());
}

//    displayTableNames() used to show the tables available in the selected database
function displayTableNames(tableNamesArray) {
    $('#tableName').empty();
    for (var i = 0; i < tableNamesArray.length; i++) {
        var tableOption = document.createElement('option');
        tableOption.setAttribute('value', tableNamesArray[i]);
        tableOption.append(document.createTextNode(tableNamesArray[i]));
        $('#tableName').append(tableOption);
    }
}
//    displayColumnNames() used to show the columns in the selected table
function displayColumnNames(tableName) {
    $('#timestampAttribute').empty();
    $("select[id^='Attribute_']").empty();
    var columnNames = columnNamesArray[tableName];
    for (var i = 0; i < columnNames.length; i++) {
        var columnOption = document.createElement('option');
        columnOption.setAttribute('value', columnNames[i]);
        columnOption.append(document.createTextNode(columnNames[i]));
        $('#timestampAttribute').append(columnOption);
        $("select[id^='Attribute_']").append(columnOption.cloneNode(true));
    }
}

/*
 * random simulation scripts
 * */
function b() {


//    initially show the attributes belonging to first stream of the selected execution plan
    var attributes = streamAttributes[executionPlanStreamsArray[$('#executionPlanName').val()][0]];
    createAttributesList(attributes);
    attributes = [];

}
//    displayStreamNames() is used to display the stream names of the execution plan selected
function displayStreamNames(executionPlanName) {
    $('#streamName').empty();
    streamNames = executionPlanStreamsArray[executionPlanName];
    createStreamNamesList(streamNames);
    displayAttributes(streamNames[0]);
    streamNames = [];
}

//    displayAttributes() is used to display input fields for the attributes selected
function displayAttributes(streamName) {
    $('#attributes').empty();
    attributes = streamAttributes[streamName];
    createAttributesList(attributes);
    attributes = [];
}

function createAttributesList(attributes) {
    var streamAttrLabel;
    var streamAttrLabelTextNode;
    var streamAttrInput;
    var div = document.createElement('div');
    div.setAttribute('class', 'col-sm-5');

    for (var i = 0; i < attributes.length; i++) {
        //create label elements
        streamAttrLabel = document.createElement('label');
        streamAttrLabel.setAttribute('class', 'col-sm-2 control-label');

        //add text to label elements
        streamAttrLabelTextNode = document.createTextNode(attributes[i]['name'] + '(' + attributes[i]['type'] +
            ')');
        streamAttrLabel.appendChild(streamAttrLabelTextNode);

        streamAttrInput = document.createElement('select');
        streamAttrInput.setAttribute('class', 'form-control');
        streamAttrInput.setAttribute('id', 'Attribute_' + attributes[i]['name']);
        streamAttrInput.setAttribute('name', 'Attribute_' + attributes[i]['name']);
        div.appendChild(streamAttrLabel);
        $(streamAttrLabel).after(streamAttrInput);

        //append to parent div
        $('#attributes').append(div);
    }
}







// start inactive execution plans in run or debug mode
$("#sourceConfigs").on('click', 'button[id^="feed_start_"]', function () {
    var dynamicId = $(this).closest('div.sourceConfigForm').data('id');
    var executionPlanName = $('#executionPlanName_' + dynamicId).val();
    var mode = $('input[name=feed_runDebug_' + dynamicId + ']:checked').val();
    if (mode === 'run') {
        $.ajax({
            async: true,
            url: "http://localhost:9090/editor/" + executionPlanName + "/start",
            type: "GET",
            success: function (data) {
                console.log(data)
            },
            error: function (msg) {
                console.error(msg)
            }
        });
        executionPlanDetailsMap[executionPlanName] = 'RUN';
    } else if (mode === 'debug') {
        $.ajax({
            async: true,
            url: "http://localhost:9090/editor/" + executionPlanName + "/debug",
            type: "GET",
            success: function (data) {
                if (typeof callback === 'function')
                    console.log(data)
            },
            error: function (msg) {
                if (typeof error === 'function')
                    console.error(msg)
            }
        });
        executionPlanDetailsMap[executionPlanName] = 'DEBUG';
    }
    disableRunDebugButtonSection('feed', dynamicId);
    $('#executionPlanName_' + dynamicId + '_mode').html('mode : ' + executionPlanDetailsMap[executionPlanName]);
    $('#single_executionPlanStartMsg_' + dynamicId).html('Execution plan \'' +
        executionPlanName + '\' started in \'' + mode + '\' mode.');
    $('#submitFeedConfig').prop('disabled', false);
});