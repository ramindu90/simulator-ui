/*
 ~   Copyright (c) WSO2 Inc. (http://wso2.com) All Rights Reserved.
 ~
 ~   Licensed under the Apache License, Version 2.0 (the "License");
 ~   you may not use this file except in compliance with the License.
 ~   You may obtain a copy of the License at
 ~
 ~        http://www.apache.org/licenses/LICENSE-2.0
 ~
 ~   Unless required by applicable law or agreed to in writing, software
 ~   distributed under the License is distributed on an "AS IS" BASIS,
 ~   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ~   See the License for the specific language governing permissions and
 ~   limitations under the License.
 */

var singleEventConfigCount = 2;
var executionPlanDetailsMap = {};

$(function () {
    // add a date picker to the form
    addDateTimePicker('single_timestamp_1');

    // add methods to validate int/long and double/float
    jQuery.validator.addMethod("validateIntOrLong", function (value, element) {
        return this.optional(element) || /^[-+]?[0-9]+$/.test(value);
    }, "Please provide a valid numerical value.");

    jQuery.validator.addMethod("validateFloatOrDouble", function (value, element) {
        return this.optional(element) || /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(value);
    }, "Please provide a valid numerical value.");

    //    load execution plan names and add a validator the the single event form 'S1' provided by default
    loadExecutionPlanNames('single_executionPlanName_1');
    addSingleEventFormValidator('1');

    $('#addSingleEventForm').on('click', function (e) {
        createSingleEventConfigForm(e, this);
        loadExecutionPlanNames('single_executionPlanName_' + singleEventConfigCount);
        addSingleEventFormValidator(singleEventConfigCount);
        singleEventConfigCount++;
    });

    // change stream names on change function of execution plan name
    $("#singleEventConfigs").on('change', 'select[id^="single_executionPlanName_"]', function () {
        var elementId = this.id;
        var dynamicId = elementId.substring(25, elementId.length);
        var streamId = 'single_streamName_' + dynamicId;
        var attributesId = 'single_attributes_' + dynamicId;
        var executionPlanName = $(this).val();
        $('#' + elementId + '_mode').html('mode : ' + self.executionPlanDetailsMap[executionPlanName])
        $('#' + attributesId).empty();
        self.removeRulesOfAttributes(dynamicId);
        $('#single_runDebugButtons_' + dynamicId).empty();
        $('#single_executionPlanStartMsg_' + dynamicId).empty();
        if (self.executionPlanDetailsMap[executionPlanName] === 'FAULTY') {
            $('#'+streamId).prop('disabled', true);
            $('#single_timestamp_'+dynamicId).prop('disabled', true);
            $('#single_sendEvent_'+dynamicId).prop('disabled', true);
        } else {
            $('#'+streamId).prop('disabled', false);
            $('#single_timestamp_'+dynamicId).prop('disabled', false);
            $('#single_sendEvent_' + dynamicId).prop('disabled', false);
            Simulator.retrieveStreamNames(
                $('#' + elementId).val(),
                function (data) {
                    self.refreshStreamList(streamId, data);
                    $('#' + streamId).prop("selectedIndex", -1);
                },
                function (data) {
                    console.log(data);
                });
            if (self.executionPlanDetailsMap[executionPlanName] === 'STOP') {
                self.appendRunDebugButtons(dynamicId);
                $('#single_executionPlanStartMsg_' + dynamicId).html('Start execution plan \'' +
                    executionPlanName + '\' in either \'run\' or \'debug\' mode.')
                $('#single_sendEvent_' + dynamicId).prop('disabled', true);
            }
        }
    });
    // change stream names on change function of execution plan name
    $("#singleEventConfigs").on('change', 'select[id^="single_streamName_"]', function () {
        var elementId = this.id;
        var dynamicId = elementId.substring(18, elementId.length);
        Simulator.retrieveStreamAttributes(
            $('#single_executionPlanName_' + dynamicId).val(),
            $('#single_streamName_' + dynamicId).val(),
            function (data) {
                removeRulesOfAttributes(dynamicId);
                refreshAttributesList(dynamicId, data);
                addRulesForAttributes(dynamicId);
            },
            function (data) {
                console.log(data);
            });
    });

    // start inactive execution plans in run or debug mode
    $("#singleEventConfigs").on('click', 'button[id^="single_start_"]', function () {
        var elementId = this.id;
        var dynamicId = elementId.substring(13, elementId.length);
        var buttonName = 'single_runDebug_' + dynamicId;
        // todo use the editors rest client to start and stop
        if ($('input[name=' + buttonName + ']:checked').val() === 'run') {
            $.ajax({
                async: true,
                url: "http://localhost:9090/editor/" + $('#single_executionPlanName_' + dynamicId).val() + "/start",
                type: "GET",
                success: function (data) {
                    console.log(data)
                },
                error: function (msg) {
                    console.error(msg)
                }
            });
        } else {
            $.ajax({
                async: true,
                url: "http://localhost:9090/editor/" + $('#single_executionPlanName_' + dynamicId).val() + "/debug",
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
        }
        executionPlanDetailsMap[$('#single_executionPlanName_' + dynamicId).val()] === 'ACTIVE';
        disableRunDebugButtonSection(dynamicId);
        $('#send_singleEvent_' + dynamicId).prop('disabled', false);
    });

    // remove a single event config tab and make the tab before it active
    $('#singleEventConfigTab').on('click', 'button[id^="delete_singleEventConfig_"]', function () {
        removeSingleEventForm(this);
        renameSingleEventConfigTabs();
    })

    // is isNull checkbox is checked disable txt input, else enable text input
    $('#singleEventConfigs').on('click', 'input[id^="single_attributes_"][id$="_null"]', function () {
        var elementId = this.id;
        var inputId = elementId.substring(0, (elementId.length - 5));
        if ($(this).is(':checked')) {
            if ($('#' + inputId).is(':text')) {
                $('#' + inputId).val('');
                $('#' + inputId).prop('disabled', true);
            } else {
                $('#' + inputId + '_true').prop('checked', false);
                $('#' + inputId + '_true').prop('disabled', true);
                $('#' + inputId + '_false').prop('checked', false);
                $('#' + inputId + '_false').prop('disabled', true);
            }
            removeRuleOfAttribute($('#' + inputId));
        } else {
            if ($('#' + inputId).is(':text')) {
                $('#' + inputId).prop('disabled', false);
            } else {
                $('#' + inputId + '_true').prop('disabled', false);
                $('#' + inputId + '_false').prop('disabled', false);
            }
            addRuleForAttribute($('#' + inputId));
        }

    });


    // submit function of single event
    $(document).on('submit', 'form.singleEventForm', function (e) {
        e.preventDefault();
        // serialize all the forms elements and their values
        var formValues = $(this).serializeArray();
        var formDataMap = {};
        var attributes = [];
        var j = 0;
        for (var i = 0; i < formValues.length; i++) {
            if (formValues[i]['name'].startsWith('single_attributes_')) {
                //create attribute data array
                if (formValues[i]['name'].endsWith('_null')) {
                    attributes[j++] = null;
                } else {
                    attributes[j++] = formValues[i]['value']
                }
            } else if (formValues[i]['name'].startsWith('single_executionPlanName_')) {
                formDataMap['executionPlanName'] = formValues[i]['value']
            } else if (formValues[i]['name'].startsWith('single_streamName_')) {
                formDataMap['streamName'] = formValues[i]['value']
            } else if (formValues[i]['name'].startsWith('single_timestamp_')) {
                formDataMap['timestamp'] = formValues[i]['value']
            }
        }
        if (!('executionPlanName' in formDataMap) || formDataMap['executionPlanName'].length === 0) {
            console.error("Execution plan name is required for single event simulation.");
        }
        if (!('streamName' in formDataMap) || formDataMap['streamName'].length === 0) {
            console.error("Stream name is required for single event simulation.");
        }
        if (('timestamp' in formDataMap) && parseInt(formDataMap['timestamp']) < 0) {
            console.error("Timestamp value must be a positive value for single event simulation.");
        }
        if (attributes.length === 0) {
            console.error("Attribute values are required for single event simulation.");
        }

        if ('executionPlanName' in formDataMap && formDataMap['executionPlanName'].length > 0
            && 'streamName' in formDataMap && formDataMap['streamName'].length > 0
            && !(('timestamp' in formDataMap) && formDataMap['timestamp'] < 0)
            && attributes.length > 0) {
            formDataMap['data'] = attributes;

            Simulator.singleEvent(
                JSON.stringify(formDataMap),
                function (data) {
                    console.log(data);
                },
                function (data) {
                    console.log(data);
                })
        }
    });
});

// add a datetimepicker to an element
function addDateTimePicker(elementId) {
    $('#' + elementId).datetimepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'HH:mm:ss:l',
        showOn: 'button',
        buttonImage: 'images/timestamp.png',
        buttonImageOnly: true,
        buttonText: 'Select timestamp',
        onSelect: convertDateToUnix,
        onClose: closeTimestampPicker

    });
}
// convert the date string in to unix timestamp onSelect
function convertDateToUnix() {
    $(this).val(Date.parse($(this).val()));
}


// check whether the timestamp value is a unix timestamp onClose, if not convert date string into unix timestamp
function closeTimestampPicker() {
    if ($(this).val().includes('-')) {
        $(this).val(Date.parse($(this).val()));
    }
}

// create a single event config form
function createSingleEventConfigForm(event, ctx) {
    var nextTab = $('ul#singleEventConfigTab li').size();

    $(ctx).siblings().removeClass("active");

    // create the tab
    $('<li class="active" role="presentation" id = "single_ListItem_' + singleEventConfigCount + '" >' +
        '   <a href="#singleEventContent_parent_' + singleEventConfigCount + '" data-toggle="tab" ' +
        '   id = "singleEventConfig_' + singleEventConfigCount + '" aria-controls="singleEventConfigs" role = "tab">' +
        '       S ' + nextTab + '' +
        '       <button type="button" class="close" id="delete_singleEventConfig_' + singleEventConfigCount + '" ' +
        '       aria-label="Close">' +
        '           <span aria-hidden="true">×</span>' +
        '       </button>' +
        '   </a>' +
        '</li>').insertBefore($(ctx));

    $("#singleEventConfigTabContent").find(".tab-pane").removeClass("active");

    var singleEvent = singleTemplate.replaceAll('{{dynamicId}}', singleEventConfigCount);

    // create the tab content
    $('<div role="tabpanel" class="tab-pane active" id="singleEventContent_parent_' + singleEventConfigCount + '">' +
        '   <div class = "content" id="singleEventContent_' + singleEventConfigCount + '">' +
        '   </div>' +
        '</div>').appendTo('#singleEventConfigTabContent');
    $('#singleEventContent_' + singleEventConfigCount).html(singleEvent);

    addDateTimePicker('single_timestamp_' + singleEventConfigCount);
}

// create jquery validators for single event forms
function addSingleEventFormValidator(formId) {
    $('#singleEventForm_' + formId).validate();
    $('#single_executionPlanName_' + formId).rules('add', {
        required: true,
        messages: {
            required: "Please select an execution plan name."
        }
    });
    $('#single_streamName_' + formId).rules('add', {
        required: true,
        messages: {
            required: "Please select a stream name."
        }
    });
    $('#single_timestamp_' + formId).rules('add', {
        digits: true,
        min: 0,
        messages: {
            digits: "Timestamp value must be a positive numeric value without a decimal point."
        }
    });
}

// if the execution plan is not on run r debug mode, append buttons to start execution plan in either of the modes
function appendRunDebugButtons(dynamicId) {
    var runDebugButtons =
        '<div class="col-xs-6 col-md-6 btn-group " data-toggle="buttons">' +
        '   <label class="btn btn-primary active"> ' +
        '       <input type="radio" id="single_run_{{dynamicId}}" name="single_runDebug_{{dynamicId}}"' +
        '       value="run" autocomplete="off" checked> Run ' +
        '   </label> ' +
        '   <label class="btn btn-primary"> ' +
        '       <input type="radio" id="single_debug_{{dynamicId}}" name="single_runDebug_{{dynamicId}}"' +
        '       value="debug" autocomplete="off"> Debug ' +
        '   </label> ' +
        '</div>' +
        '<div class="col-xs-6 col-md-6">' +
        '   <button type="button" class="btn btn-default pull-right" id="single_start_{{dynamicId}}"' +
        '    name="single_start_{{dynamicId}}">Start</button>' +
        '</div>' +
        '<div id="single_executionPlanStartMsg_{{dynamicId}}">' +
        '</div>';
    var section = runDebugButtons.replaceAll('{{dynamicId}}', dynamicId);
    $('#single_runDebugButtons_' + dynamicId).html(section);

}

// disable the run, debug and start buttons
function disableRunDebugButtonSection(dynamicId) {
    $('#single_run_' + dynamicId).prop('disabled', true);
    $('#single_debug_' + dynamicId).prop('disabled', true);
    $('#single_start_' + dynamicId).prop('disabled', true);
}

// remove the tab from the single event tabs list and remove its tab content
function removeSingleEventForm(ctx) {
    var x = $(ctx).parents("a").attr("href");
    $(ctx).parents('li').prev().addClass('active');
    $('#singleEventConfigTabContent ' + x).prev().addClass('active');
    $('#singleEventConfigTabContent ' + x).remove();
    $(ctx).parents("li").remove();
}

// rename the single event config tabs once a tab is deleted
function renameSingleEventConfigTabs() {
    var nextNum = 2;
    $('li[id^="single_ListItem_"]').each(function () {
        var elementId = this.id;
        if (elementId !== 'single_ListItem_1') {
            var dynamicId = elementId.substring(16, elementId.length);
            $('a[id=singleEventConfig_' + dynamicId + ']').html(createSingleListItemText(nextNum, dynamicId));
            nextNum++;
        }
    })
}

// create text element of the single event tab list element
function createSingleListItemText(nextNum, dynamicId) {
    var listItemText =
        'S {{nextNum}}' +
        '<button type="button" class="close" id="delete_singleEventConfig_{{dynamicId}}" aria-label="Close">' +
        '   <span aria-hidden="true">×</span>' +
        '</button>';
    var temp = listItemText.replaceAll('{{dynamicId}}', dynamicId);
    return temp.replaceAll('{{nextNum}}', nextNum);
}

// load execution plan names to form
function loadExecutionPlanNames(elementId) {
    Simulator.retrieveExecutionPlanNames(
        function (data) {
            createExecutionPlanMap(data);
            refreshExecutionPlanList(elementId, Object.keys(executionPlanDetailsMap));
            $('#' + elementId).prop("selectedIndex", -1);
        },
        function (data) {
            console.log(data);
        }
    );

}

// create a map containing execution plan name
function createExecutionPlanMap(data) {
    for (var i = 0; i < data.length; i++) {
        executionPlanDetailsMap[data[i]['executionPlaName']] = data[i]['mode'];
    }
}
// create the execution plan name drop down
function refreshExecutionPlanList(elementId, executionPlanNames) {
    var newExecutionPlans = generateOptions(executionPlanNames);
    $('#' + elementId).html(newExecutionPlans);
}


// create the stream name drop down
function refreshStreamList(elementId, streamNames) {
    var newStreamOptions = generateOptions(streamNames);
    $('#' + elementId).html(newStreamOptions);
}

//    used to create options for available execution plans and streams
function generateOptions(dataArray) {
    var dataOption =
        '<option value = "{{dataName}}">' +
        '   {{dataName}}' +
        '</option>';
    var result = ''; // '<option disabled selected value> -- select an option -- </option>';
    for (var i = 0; i < dataArray.length; i++) {
        result += dataOption.replaceAll('{{dataName}}', dataArray[i]);
    }
    return result;
}


// create input fields for attributes
function refreshAttributesList(dynamicId, streamAttributes) {
    var newAttributesOption =
        '<tr>' +
        '<td width="90%">' +
        '<label for="single_attributes_{{dynamicId}}">' +
        'Attributes<span    class="requiredAstrix"> *</span>' +
        '</label> ' +
        '</td>' +
        '<td width="10%">' +
        '<label for="single_attributes_{{dynamicId}}">' +
        'isNull' +
        '</label>' +
        '</td>' +
        '</tr>';
    newAttributesOption += generateAttributes(streamAttributes);
    $('#single_attributes_' + dynamicId).html(newAttributesOption.replaceAll('{{dynamicId}}', dynamicId));
}

// create input fields for attributes
function generateAttributes(attributes) {
    var result = "";

    var booleanInput =
        '<tr>' +
        '   <td width="85%">' +
        '       <label for="single_attributes_{{dynamicId}}_{{attributeName}}_true">' +
        '           {{attributeName}}({{attributeType}})' +
        '           <div class = "form-group">' +
        '               <label class="custom-radio">' +
        '                   <input type="radio" name="single_attributes_{{dynamicId}}_{{attributeName}}" ' +
        '                   id="single_attributes_{{dynamicId}}_{{attributeName}}_true"' +
        '                   class = "single-event-attribute-{{dynamicId}}" value = "true" required = "true"' +
        '                   data-id="{{dynamicId}}">' +
        '                   <span class="helper">True</span>' +
        '                </label>' +
        '                <label class="custom-radio" for ="single_attributes_{{dynamicId}}_{{attributeName}}_false">' +
        '                    <input type="radio" id="single_attributes_{{dynamicId}}_{{attributeName}}_false"' +
        '                    name="single_attributes_{{dynamicId}}_{{attributeName}}" ' +
        '                    class = "single-event-attribute-{{dynamicId}}" value = "false" required = "true"' +
        '                    data-id="{{dynamicId}}">' +
        '                    <span class="helper">False</span>' +
        '               </label>' +
        '           </div>' +
        '      </label>' +
        '   </td>' +
        '   <td width="15%">' +
        '      <div align="center">' +
        '         <input type="checkbox" name="single_attributes_{{dynamicId}}_{{attributeName}}_null"' +
        '         id="single_attributes_{{dynamicId}}_{{attributeName}}_null">' +
        '      </div> ' +
        '   </td>' +
        '</tr>';
    // '<div>' +
    // '   <label for="single_attributes_{{dynamicId}}_{{attributeName}}_true">{{attributeName}}({{attributeType}})' +
    // '      <div class="col-xs-10 col-md-10">' +
    // '          <label class="custom-radio">' +
    // '              <input type="radio" name="single_attributes_{{dynamicId}}_{{attributeName}}" ' +
    // '              id="single_attributes_{{dynamicId}}_{{attributeName}}_true"' +
    // '              class = "single-event-attribute-{{dynamicId}}" value = "true" required = "true"' +
    // '              data-id="{{dynamicId}}">' +
    // '                  <span class="helper">True</span>' +
    // '           </label>' +
    // '           <label class="custom-radio" for ="single_attributes_{{dynamicId}}_{{attributeName}}_false">' +
    // '               <input type="radio" id="single_attributes_{{dynamicId}}_{{attributeName}}_false"' +
    // '               name="single_attributes_{{dynamicId}}_{{attributeName}}" ' +
    // '               class = "single-event-attribute-{{dynamicId}}" value = "false" required = "true"' +
    // '               data-id="{{dynamicId}}">' +
    // '               <span class="helper">False</span>' +
    // '           </label>' +
    // '      </div>' +
    // '      <div class="col-xs-2 col-md-2">' +
    // '          <input type="checkbox" name="single_attributes_{{dynamicId}}_{{attributeName}}"' +
    // '          id="single_attributes_{{dynamicId}}_{{attributeName}}_null" value="null">' +
    // '      </div>' +
    // '   </label>' +
    // '</div>';

    var textInput =
        '<tr>' +
        '   <td width="85%">' +
        '       <label for ="single_attributes_{{dynamicId}}_{{attributeName}}">' +
        '           {{attributeName}}({{attributeType}})' +
        '           <input type="text" class="form-control single-event-attribute-{{dynamicId}} attribute-input"' +
        '           name="single_attributes_{{dynamicId}}_{{attributeName}}" ' +
        '           id="single_attributes_{{dynamicId}}_{{attributeName}}" data-id="{{dynamicId}}"' +
        '           data-type ="{{attributeType}}">' +
        '       </label>' +
        '   </td>' +
        '   <td width="15%">' +
        '       <div align="center">' +
        '           <input align="center" type="checkbox" ' +
        '           name="single_attributes_{{dynamicId}}_{{attributeName}}_null"' +
        '           id="single_attributes_{{dynamicId}}_{{attributeName}}_null">' +
        '       </div>' +
        '   </td>' +
        '</tr>';
    // '<div>' +
    // '   <label for ="single_attributes_{{dynamicId}}_{{attributeName}}">' +
    // '     {{attributeName}}({{attributeType}})' +
    // '       <div class="col-xs-10 col-md-10">' +
    // '           <input type="text" class="form-control single-event-attribute-{{dynamicId}}"' +
    // '           name="single_attributes_{{dynamicId}}_{{attributeName}}" ' +
    // '           id="single_attributes_{{dynamicId}}_{{attributeName}}" data-id="{{dynamicId}}"' +
    // '           data-type ="{{attributeType}}">' +
    // '       </div>' +
    // '       <div class="col-xs-2 col-md-2">' +
    // '          <input type="checkbox" name="single_attributes_{{dynamicId}}_{{attributeName}}_null"' +
    // '          id="single_attributes_{{dynamicId}}_{{attributeName}}_null" value="null">' +
    // '       </div>' +
    // '   </label>' +
    // '</div>';

    for (var i = 0; i < attributes.length; i++) {
        var temp;
        if (attributes[i]['type'] === 'BOOL') {
            temp = booleanInput.replaceAll('{{attributeName}}', attributes[i]['name']);
            result += temp.replaceAll('{{attributeType}}', attributes[i]['type'])
        } else {
            temp = textInput.replaceAll('{{attributeName}}', attributes[i]['name']);
            result += temp.replaceAll('{{attributeType}}', attributes[i]['type'])
        }

    }
    return result;
}

// add rules for attribute
function addRulesForAttributes(elementId) {
    $('.single-event-attribute-' + elementId).each(
        function () {
            addRuleForAttribute(this);
        }
    );
}

// add a validation rule for an attribute based on the attribute type
function addRuleForAttribute(ctx) {
    var type = $(ctx).data("type");
    switch (type) {
        case 'BOOL' :
            $(ctx).rules('add', {
                required: true,
                messages: {
                    required: "Please specify an attribute value."
                }
            });
            break;
        case 'INT' :
        case 'LONG' :
            $(ctx).rules('add', {
                required: true,
                validateIntOrLong: true,
                messages: {
                    required: "Please specify an attribute value.",
                    validateIntOrLong: "Please specify a valid numeric value."
                }
            });
            break;
        case 'DOUBLE' :
        case 'FLOAT' :
            $(ctx).rules('add', {
                required: true,
                validateFloatOrDouble: true,
                messages: {
                    required: "Please specify an attribute value.",
                    validateFloatOrDouble: "Please specify a valid numeric value."
                }
            });
            break;
    }
}
// remove rules used for previous attributes
function removeRulesOfAttributes(elementId) {
    $('.single-event-attribute-' + elementId).each(
        function () {
            removeRuleOfAttribute(this);
        }
    );
}

// remove validation rule of an attribute
function removeRuleOfAttribute(ctx) {
    $(ctx).rules('remove');
}