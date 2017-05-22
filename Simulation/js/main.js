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

$(function () {

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

    // on change function of execution plan name used to change stream names
    $("#singleEventConfigs").on('change', 'select[id^="single_executionPlanName_"]', function () {
        var elementId = this.id;
        var dynamicId = elementId.substring(25, elementId.length);
        var streamId = 'single_streamName_' + dynamicId;
        var attributesId = 'single_attributes_' + dynamicId;
        Simulator.retrieveStreamNames(
            $('#' + elementId).val(),
            function (data) {
                refreshStreamList(streamId, data);
                $('#' + streamId).prop("selectedIndex", -1);
                $('#' + attributesId).empty();
                removeRulesForAttributes(dynamicId);
            },
            function (data) {
                console.log(data);
            });
    });

    // on change function of stream name used to change attribute input fields
    $("#singleEventConfigs").on('change', 'select[id^="single_streamName_"]', function () {
        var elementId = this.id;
        var dynamicId = elementId.substring(18, elementId.length);
        Simulator.retrieveStreamAttributes(
            $('#single_executionPlanName_' + dynamicId).val(),
            $('#single_streamName_' + dynamicId).val(),
            function (data) {
                removeRulesForAttributes(dynamicId);
                refreshAttributesList(dynamicId, data);
                addRulesForAttributes(dynamicId);
            },
            function (data) {
                console.log(data);
            });
    });


    // submit function of single event
    $(document).on('submit', 'form.singleEventForm', function (e) {
        // Get all the forms elements and their values in one step
        e.preventDefault();
        var formValues = $(this).serializeArray();
        var formDataMap = {};
        var attributes = [];
        var j = 0;
        for (var i = 0; i < formValues.length; i++) {
            if (formValues[i]['name'].substring(0, 18) === 'single_attributes_') {
                attributes[j++] = formValues[i]['value']
            } else if (formValues[i]['name'].substring(0, 25) === 'single_executionPlanName_') {
                formDataMap['executionPlanName'] = formValues[i]['value']
            } else if (formValues[i]['name'].substring(0, 18) === 'single_streamName_') {
                formDataMap['streamName'] = formValues[i]['value']
            } else if (formValues[i]['name'].substring(0, 17) === 'single_timestamp_') {
                formDataMap['timestamp'] = formValues[i]['value']
            }

        }
        if (!('executionPlanName' in formDataMap) || formDataMap['executionPlanName'].length === 0) {
            console.error("Execution plan name is required for single event simulation.");
        }
        if (!('streamName' in formDataMap) || formDataMap['streamName'].length === 0) {
            console.error("Stream name is required for single event simulation.");
        }
        if (('timestamp' in formDataMap) && formDataMap['timestamp'] < 0) {
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

            //check why the single event doesnt get sent
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

    $('#singleEventConfigTab').on('click', 'button[id^="delete_singleEventConfig_"]', function () {
        console.log('llllll')
        var x = $(this).parents("a").attr("href");

        $(this).parents('li').prev().addClass('active');
        $('#subTab ' + x).prev().addClass('active');

        $('#subTab ' + x).remove();
        $(this).parents("li").remove();

    })
});

function createSingleEventConfigForm(event, ctx) {
    var nextTab = $('ul#singleEventConfigTab li').size();

    $(ctx).siblings().removeClass("active");

    // create the tab
    $('<li class="active" role="presentation">' +
        '   <a href="#singleEventContent_parent_' + singleEventConfigCount + '" data-toggle="tab" ' +
        '   id = "singleEventConfig_' + singleEventConfigCount + '" aria-controls="singleEventConfigs" role = "tab">' +
        '       S ' + nextTab + '' +
        '       <button type="button" class="close" id="delete_singleEventConfig_' + singleEventConfigCount + '" ' +
        '       aria-label="Close">' +
        '           <span aria-hidden="true">×</span></button>' +
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

// load execution plan names to form
function loadExecutionPlanNames(elementId) {
    Simulator.retrieveExecutionPlanNames(
        function (data) {
            refreshExecutionPlanList(elementId, data);
            $('#' + elementId).prop("selectedIndex", -1);
        },
        function (data) {
            console.log(data);
        }
    );

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
    var newAttributesOption = ' ' +
        '<label for="single_attributes_{{dynamicId}}">Attributes<span class="requiredAstrix"> *</span></label> ';
    newAttributesOption += generateAttributes(streamAttributes);
    $('#single_attributes_' + dynamicId).html(newAttributesOption.replaceAll('{{dynamicId}}', dynamicId));
}

// create input fields for attributes
function generateAttributes(attributes) {
    var result = "";

    var booleanInput =
        '<div>' +
        '   <label for ="single_attributes_{{dynamicId}}_{{attributeName}}_true">{{attributeName}}({{attributeType}})' +
        '      <div>' +
        '        <label class="custom-radio">' +
        '             <input type="radio" name="single_attributes_{{dynamicId}}_{{attributeName}}" ' +
        '               id="single_attributes_{{dynamicId}}_{{attributeName}}_true"' +
        '               class = "single-event-attribute-{{dynamicId}}" value = "true" required = "true"' +
        '               data-id="{{dynamicId}}">' +
        '             <span class="helper">True</span>' +
        '        </label>' +
        '        <label class="custom-radio" for ="single_attributes_{{dynamicId}}_{{attributeName}}_false">' +
        '            <input type="radio" id="single_attributes_{{dynamicId}}_{{attributeName}}_false"' +
        '            name="single_attributes_{{dynamicId}}_{{attributeName}}" ' +
        '            class = "single-event-attribute-{{dynamicId}}" value = "false" required = "true"' +
        '            data-id="{{dynamicId}}">' +
        '            <span class="helper">False</span>' +
        '        </label>' +
        '       </div>' +
        '   </label>' +
        '</div> ';

    var textInput =
        '<div>' +
        '   <label for ="single_attributes_{{dynamicId}}_{{attributeName}}">' +
        '      {{attributeName}}({{attributeType}})' +
        '      <input type="text" class="form-control single-event-attribute-{{dynamicId}}"' +
        '      name="single_attributes_{{dynamicId}}_{{attributeName}}" ' +
        '      id="single_attributes_{{dynamicId}}_{{attributeName}}" data-id="{{dynamicId}}"' +
        '      data-type ="{{attributeType}}">' +
        '   </label>' +
        '</div> ';

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
            var type = $(this).data("type");
            switch (type) {
                case 'BOOL' :
                    $(this).rules('add', {
                        required: true,
                        messages: {
                            required: "Please specify an attribute value."
                        }
                    });
                    break;
                case 'INT' :
                case 'LONG' :
                    $(this).rules('add', {
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
                    $(this).rules('add', {
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
    );
}

// remove rules used for previous attributes
function removeRulesForAttributes(elementId) {
    $('.single-event-attribute-' + elementId).each(
        function () {
            $(this).rules('remove');
        }
    );
}
