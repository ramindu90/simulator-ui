var singleEventConfigCount = 1;

$(function () {

    jQuery.validator.addMethod("validateIntOrLong", function (value, element) {
        return this.optional(element) || /^[-+]?[0-9]+$/.test(value);
    }, "Please provide a valid numerical value.");

    jQuery.validator.addMethod("validateFloatOrDouble", function (value, element) {
        return this.optional(element) || /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(value);
    }, "Please provide a valid numerical value.");


    addSingleEventConfig();

    /*
     add new tabs
     todo remove when migrated to the new panel
     * */
    $('#btnAdd').on('click', addSingleEventConfig);


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

// $("#feedSimulation").validate({
//     rules: {
//         lastname: "required",
//         password: {
//             required: true,
//             minlength: 5
//         },
//         confirm_password: {
//             required: true,
//             minlength: 5,
//             equalTo: "#password"
//         },
//         email: {
//             required: true,
//             email: true
//         }
//     },
//     messages: {
//         firstname: "Please enter your firstname",
//         username: {
//             required: "Please enter a username",
//             minlength: "Your username must consist of at least 2 characters"
//         },
//         password: {
//             required: "Please provide a password",
//             minlength: "Your password must be at least 5 characters long"
//         }
//     }
// });

    // submit function of single event
    $(document).on('submit', 'form.singleEventForm', function (e) {
        // Get all the forms elements and their values in one step
        e.preventDefault();
        var formValues = $(this).serializeArray();
        console.log(formValues);
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
        console.log(formDataMap)
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
        // e.preventDefault();
    });

    /*
     * functions used for feed simulation
     * */

    $('#createFeedSimulation').on('click', function () {
        //    todo load div of feed configuration
    })


    var newSource = $('#addNewSource');
    var totalSourceNum = 1;
    var currentSourceNum = 1;


// add new source for feed simulation
    newSource.on('click', function () {
        $('.collapse').collapse();
        var sourceType = $('#sources').val();
        var sourcePanel = createConfigPanel(totalSourceNum, currentSourceNum, sourceType);
        $('#sourceConfigs').append(sourcePanel);
        var sourceForm = createSourceForm(sourceType, totalSourceNum);
        $('#panelBody_source_' + totalSourceNum).html(sourceForm);
        // console.log(document.getElementById('panelBody_source_' + totalSourceNum))
        totalSourceNum++;
        currentSourceNum++;
        return false;
    });

    $("#sourceConfigs").on('click', 'button[id^="delete_sourceConfig_"]', function () {
        var buttonId = this.id;
        var panelId = buttonId.substring(7, buttonId.length);
        $('#' + panelId).remove();
        currentSourceNum--;
        $('h4.source-title').each(function (i) {
            var type = $(this).data('type');
            $(this).text('Source ' + (i + 1) + ' ' + type);
        });
    });
});

function addSingleEventConfig() {
    createSingleEventConfigForm();
    loadExecutionPlanNames('single_executionPlanName_' + singleEventConfigCount);
    addSingleEventFormValidator(singleEventConfigCount);
    singleEventConfigCount++;
}

function createSingleEventConfigForm() {
    var nextTab = $('#singleEventConfigTab li').size() + 1;

    // create the tab
    $('<li><a href="#singleEventContent_' + singleEventConfigCount + '" data-toggle="tab" ' +
        'id = "singleEventConfig_' + singleEventConfigCount + '">' +
        'S ' + nextTab + '</a></li>').appendTo('#singleEventConfigTab');

    var singleEvent = singleTemplate.replaceAll('{{dynamicId}}', singleEventConfigCount);
    // create the tab content
    $('<div class="tab-pane" id="singleEventContent_' + singleEventConfigCount + '"></div>').appendTo('#singleEventConfigTabContent');
    $('#singleEventContent_' + singleEventConfigCount).html(singleEvent);

    // make the new tab active
    $('#singleEventConfigTab a:last').tab('show');
}

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
function removeRulesForAttributes(elementId) {
    $('.single-event-attribute-' + elementId).each(
        function () {
            $(this).rules('remove');
        }
    );
}

function addRulesForAttributes(elementId) {
    $('.single-event-attribute-' + elementId).each(
        function () {
            var type = $(this).data("type");
            switch (type) {
                case 'BOOL' :
                    $(this).rules('add', {
                        required: true,
                        messages: {
                            required: "Please specify attribute value."
                        }
                    });
                    break;
                case 'INT' :
                case 'LONG' :
                    $(this).rules('add', {
                        required: true,
                        validateIntOrLong: true,
                        messages: {
                            required: "Please specify a value for attribute.",
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
                            required: "Please specify a value for attribute.",
                            validateFloatOrDouble: "Please specify a valid numeric value."
                        }
                    });
                    break;
            }
        }
    );
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

/*
 * feed simulation functions
 * */

function createConfigPanel(totalSourceNum, currentSourceNum, sourceType) {
    var panel =
        '<div class="panel panel-default" id = "sourceConfig_{{dynamicId}}"> ' +
        '    <div class="panel-heading" role="tab" id="source_{{dynamicId}}" data-toggle="collapse"' +
        '     href="#sourceDes_{{dynamicId}}" aria-controls="sourceDes_{{dynamicId}}"> ' +
        '           <h4 class="source-title panel-title" data-type="{{sourceType}}">' +
        '               Source {{currentSourceNum}} - {{sourceType}}' +
        '           </h4> ' +
        '           <button type = "button" class = "btn btn-primary" id =' +
        '            "delete_sourceConfig_{{dynamicId}}">Delete</button> ' +
        '    </div> ' +
        '    <div id="sourceDes_{{dynamicId}}" class="panel-collapse collapse in" role="tabpanel" ' +
        '    aria-labelledby="source_{{dynamicId}}"> ' +
        '            <div class="panel-body" id ="panelBody_source_{{dynamicId}}">' +
        '           </div> ' +
        '   </div>' +
        '</div>';
    var temp = panel.replaceAll('{{dynamicId}}', totalSourceNum);
    var temp2 = temp.replaceAll('{{currentSourceNum}}', currentSourceNum);
    return temp2.replaceAll('{{sourceType}}', sourceType);

}

function createSourceForm(sourceType, totalSourceNum) {
    switch (sourceType) {
        case 'CSV file':
            return csvTemplate.replaceAll('{{dynamicId}}', totalSourceNum);
        case 'Database':
            return dbTemplate.replaceAll('{{dynamicId}}', totalSourceNum);
        case 'Random':
            return randomTemplate.replaceAll('{{dynamicId}}', totalSourceNum);
    }
}

$(function () {
    $('#feedSimulation').submit(function (e) {
        // Get all the forms elements and their values in one step
        console.log("submit feed");
        var formValues = $(this).serializeArray();
        console.log(formValues);
        e.preventDefault();
    });

});

