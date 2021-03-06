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
singleEventConfigCount = 2;
executionPlanDetailsMap = {};
totalSourceNum = 1;
var feedConfigFormValidator;
var propertyBasedGenerationOptions = ['TIME_12H', 'TIME_24H',
    'SECOND', 'MINUTE', 'MONTH',
    'MONTH_NUM', 'YEAR', 'DAY',
    'DAY_OF_WEEK', 'DATE', 'FULL_NAME',
    'FIRST_NAME', 'LAST_NAME', 'WORDS',
    'BSN', 'ADDRESS', 'EMAIL',
    'PHONE_NUM', 'POST_CODE', 'STATE',
    'CITY', 'COMPANY', 'COUNTRY',
    'STREET_NAME', 'HOUSE_NO', 'HEIGHT_CM',
    'HEIGHT_M', 'WEIGHT', 'OCCUPATION',
    'IBAN', 'BIC', 'VISA_CARD', 'PIN_CODE',
    'URL',
    'IP',
    'IP_V6',
    'MAC_ADDRESS',
    'UUID',
    'USERNAME',
    'COLOUR',
    'ALTITUDE',
    'DEPTH',
    'COORDINATES',
    'LATITUDE',
    'LONGITUDE',
    'GEO_HASH',
    'SENTENCE',
    'PARAGRAPH'
];

$(function () {
    // add methods to validate int/long and double/float
    $.validator.addMethod("validateIntOrLong", function (value, element) {
        return this.optional(element) || /^[-+]?[0-9]+$/.test(value);
    }, "Please provide a valid numerical value.");

    $.validator.addMethod("validateFloatOrDouble", function (value, element) {
        return this.optional(element) || /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(value);
    }, "Please provide a valid numerical value.");


    //load execution plan names, a validator and a dateTImePicker to the default single event form 'S1'
    loadExecutionPlanNames('single_executionPlanName_1');
    addSingleEventFormValidator('1');
    addDateTimePicker('single_timestamp_1');

    // add a single event form
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
        $('#' + elementId + '_mode').html('mode : ' + executionPlanDetailsMap[executionPlanName]);
        $('#' + attributesId).empty();
        removeRulesOfAttributes(dynamicId);
        $('#single_runDebugButtons_' + dynamicId).empty();
        if (executionPlanDetailsMap[executionPlanName] === 'FAULTY') {
            $('#' + streamId).prop('disabled', true);
            $('#single_timestamp_' + dynamicId).prop('disabled', true);
            $('#single_sendEvent_' + dynamicId).prop('disabled', true);
        } else {
            $('#' + streamId).prop('disabled', false);
            $('#single_timestamp_' + dynamicId).prop('disabled', false);
            $('#single_sendEvent_' + dynamicId).prop('disabled', false);
            Simulator.retrieveStreamNames(
                $('#' + elementId).val(),
                function (data) {
                    refreshStreamList(streamId, data);
                    $('#' + streamId).prop("selectedIndex", -1);
                },
                function (data) {
                    console.log(data);
                });
            if (executionPlanDetailsMap[executionPlanName] === 'STOP') {
                $('#single_runDebugButtons_' + dynamicId).html(generateRunDebugButtons('single', dynamicId));
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
            executionPlanDetailsMap[$('#single_executionPlanName_' + dynamicId).val()] === 'RUN';
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
            executionPlanDetailsMap[$('#single_executionPlanName_' + dynamicId).val()] === 'DEBUG';
        }
        disableRunDebugButtonSection('single', dynamicId);
        $('#single_sendEvent_' + dynamicId).prop('disabled', false);
    });

    // remove a single event config tab and make the tab before it active
    $('#singleEventConfigTab').on('click', 'button[id^="delete_singleEventConfig_"]', function () {
        removeSingleEventForm(this);
        renameSingleEventConfigTabs();
    });

    // is isNull checkbox is checked disable txt input, else enable text input
    $('#singleEventConfigs').on('click', 'input[id^="single_attributes_"][id$="_null"]', function () {
        var elementId = this.id;
        var inputId = elementId.substring(0, (elementId.length - 5));
        if ($(this).is(':checked')) {
            if ($('#' + inputId).is(':text')) {
                $('#' + inputId).val('');
                $('#' + inputId).prop('disabled', true);
            } else {
                $('#' + inputId).prop('selectedIndex', -1);
                $('#' + inputId).prop('disabled', true);
            }
            removeRulesOfAttribute($('#' + inputId));
        } else {
            if ($('#' + inputId).is(':text')) {
                $('#' + inputId).prop('disabled', false);
            } else {
                $('#' + inputId).prop('disabled', false);
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

    /*
     * feed simulation
     * */

    $('#createFeedConfig').on('click', function () {
        feedConfigFormValidator = generateFormValidatorForFeedConfig();

    });

    $('#cancelFeedConfig').on('click', function () {
        feedConfigFormValidator.destroy();
    });

    /*todo remove once moved into editor*/
    $('#aa').on('click', function () {
        feedConfigFormValidator.destroy();
    });


    $('#addNewSource').on('click', function () {
        // var t= totalSourceNum++;
        $('.collapse').collapse();
        var sourceType = $('#sources').val();
        var numItems = $('div.feed-config').length + 1;
        var sourcePanel = generateConfigPanel(totalSourceNum, numItems, sourceType);
        $('#sourceConfigs').append(sourcePanel);
        var sourceForm = generateSourceForm(sourceType, totalSourceNum);
        $('#panelBody_source_' + totalSourceNum).html(sourceForm);
        loadExecutionPlanNames('executionPlanName_' + totalSourceNum);
        if (sourceType === 'CSV file') {
            loadCSVFileNames(totalSourceNum);
        }
        addSourceConfigValidation(sourceType, totalSourceNum);
        totalSourceNum++;
        return false;
    });

    $("#sourceConfigs").on('click', 'button[id^="delete_sourceConfig_"]', function () {
        var buttonId = this.id;
        var panelId = buttonId.substring(7, buttonId.length);
        var sourceType = $(this).closest('div.panel').data('type');
        var dynamicId = $(this).closest('div.panel').data('id');
        $('#' + panelId).remove();
        removeSourceConfigValidation(sourceType, dynamicId);
        refreshConfigPanelHeadings();
    });

    // change stream names on change function of execution plan  - feed
    $("#sourceConfigs").on('change', 'select[id^="executionPlanName_"]', function () {
        var elementId = this.id;
        var dynamicId = elementId.substring(18, elementId.length);
        var streamId = 'streamName_' + dynamicId;
        var executionPlanName = $(this).val();
        var sourceType = $(this).closest('div.sourceConfigForm').data('type');
        $('#' + elementId + '_mode').html('mode : ' + executionPlanDetailsMap[executionPlanName]);
        removeAttributeConfigurationRules(sourceType, dynamicId);
        $('#attributesDiv_' + dynamicId).empty();
        if (executionPlanDetailsMap[executionPlanName] === 'FAULTY') {
            disableSourceConfigInputFields(sourceType, dynamicId);
            $('#submitFeedConfig').prop('disabled', true);
        } else {
            reenableSourceConfigInputFields(sourceType, dynamicId);
            $('#submitFeedConfig').prop('disabled', false);
            Simulator.retrieveStreamNames(
                $('#' + elementId).val(),
                function (data) {
                    refreshStreamList(streamId, data);
                    $('#' + streamId).prop("selectedIndex", -1);
                },
                function (data) {
                    console.log(data);
                });
        }
    });

    // change stream names on change function of stream name - feed
    $("#sourceConfigs").on('change', 'select[id^="streamName_"]', function () {
        var sourceType = $(this).closest('div.sourceConfigForm').data('type');
        var dynamicId = $(this).closest('div.sourceConfigForm').data('id');
        removeAttributeConfigurationRules(sourceType, dynamicId);
        Simulator.retrieveStreamAttributes(
            $('#executionPlanName_' + dynamicId).val(),
            $('#streamName_' + dynamicId).val(),
            function (data) {
                refreshAttributesListOfSource(sourceType, dynamicId, data);
                /*
                 if the source iss db and if the database connection was already tested and then if the stream
                 name is changed afterwards, load the column list to the new stream attributes
                 */
                if (sourceType === 'db') {
                    if (verifyConnectionDetails(dynamicId) && $('#tableName_' + dynamicId).val() !== null) {
                        refreshColumnNamesLists(dynamicId);
                    }
                } else if (sourceType === 'random') {
                    $('.feed-attribute-random-' + dynamicId).each(function () {
                        $(this).prop('selectedIndex', -1);
                    })
                }
                addAttributeConfigurationRules(sourceType, dynamicId);
            },
            function (data) {
                console.error(data);
            });
    });

//    allow only one of timestamp options for csv source config
    $("#sourceConfigs").on('click', 'input[id^="timestamp-option_"]', function () {
        var elementId = this.id;
        var dynamicId = $(this).closest('div.sourceConfigForm').data('id');
        if (elementId.endsWith('_timestampAttribute')) {
            $('#timestampInterval_' + dynamicId).prop('disabled', true).val('');
            $('#timestampAttribute_' + dynamicId).prop('disabled', false);
        } else if (elementId.endsWith('_timestampInterval')) {
            $('#timestampInterval_' + dynamicId).prop('disabled', false).val('1000');
            $('#timestampAttribute_' + dynamicId).prop('disabled', true).val('');
        }
    });

//    initially select timestamp option by clicking on text input area
    $("#sourceConfigs").on('click', '[id^="timestampAttribute_"]', function () {
        var dynamicId = $(this).closest('div.sourceConfigForm').data('id');
        $('#timestamp-option_' + dynamicId + '_timestampAttribute').prop('checked', true).trigger('click');
    });

    $("#sourceConfigs").on('click', 'input[id^="timestampInterval_"]', function () {
        var dynamicId = $(this).closest('div.sourceConfigForm').data('id');
        $('#timestamp-option_' + dynamicId + '_timestampInterval').prop('checked', true).trigger('click');
    });

    // upload a new csv file
    $("#sourceConfigs").on('change', 'select[id^="fileName_"]', function () {
        if ($(this).val() === 'Upload CSV file') {

        }
    });

    // enable the 'test connection; button only when all the fields required for database connection is provided
    $("#sourceConfigs").on('keyup', '.required-for-db-connection', function () {
        var dynamicId = $(this).closest('div.sourceConfigForm').data('id');
        if (verifyConnectionDetails(dynamicId)) {
            $('#loadDbConnection_' + dynamicId).prop('disabled', false);
        }
    });

    // establish a database connection and retrieve the names of tables in the database
    $("#sourceConfigs").on('click', 'button[id^="loadDbConnection_"]', function () {
        var dynamicId = $(this).closest('div.sourceConfigForm').data('id');
        $('#connectionSuccessMsg_' + dynamicId).html(generateConnectionMessage(dynamicId, 'connecting'));
        var dataSourceLocation = $('#dataSourceLocation_' + dynamicId).val();
        if (dataSourceLocation === null || dataSourceLocation.length === 0) {
            console.error("Datasource location is required to test database connection")
        }
        var driverName = $('#driver_' + dynamicId).val();
        if (driverName === null || driverName.length === 0) {
            console.error("Driver is required to test database connection")
        }
        var username = $('#username_' + dynamicId).val();
        if (username === null || username.length === 0) {
            console.error("Driver is required to test database connection")
        }
        var password = $('#password_' + dynamicId).val();
        if (password === null || password.length === 0) {
            console.error("Password is required to test database connection")
        }

        if (dataSourceLocation !== null && dataSourceLocation.length > 0
            && driverName !== null && driverName.length > 0
            && username !== null && username.length > 0
            && password !== null && password.length > 0) {
            var connectionDetails = {};
            connectionDetails['driver'] = driverName;
            connectionDetails['dataSourceLocation'] = dataSourceLocation;
            connectionDetails['username'] = username;
            connectionDetails['password'] = password;
            $(this).prop('disabled', true);
            Simulator.testDatabaseConnectivity(
                JSON.stringify(connectionDetails),
                function (data) {
                    refreshTableNamesFromDataSource(connectionDetails, dynamicId);
                    $('#connectionSuccessMsg_' + dynamicId).html(generateConnectionMessage(dynamicId, 'success'));
                    $('#loadDbConnection_' + dynamicId).prop('disabled', false);
                },
                function (msg) {
                    console.error(msg['responseText']);
                    $('#connectionSuccessMsg_' + dynamicId).html(generateConnectionMessage(dynamicId, 'failure'));
                    $('#loadDbConnection_' + dynamicId).prop('disabled', false);
                }
            );
        }
    });

    // upload a new csv file
    $("#sourceConfigs").on('change', 'select[id^="tableName_"]', function () {
        var dynamicId = $(this).closest('div.sourceConfigForm').data('id');
        refreshColumnNamesLists(dynamicId);
    });


    // configure attribute configurations of random source
    $("#sourceConfigs").on('change', 'select[class^="feed-attribute-random-"]', function () {
        var randomType = $(this).val();
        var dynamicId = $(this).closest('div.sourceConfigForm').data('id');
        var attributeType = $(this).data('type');
        var id = this.id;
        $('#' + id + '_config').html(generateRandomAttributeConfiguration(randomType, attributeType, dynamicId, id));
        // set the selected option of property based attribute configuration type (if any) to -1
        $('[class^="feed-attribute-random-' + dynamicId + '-property"]').each(function () {
            $(this).prop('selectedIndex',-1);
        });
        addRandomConfigTypeValidation(id);
    });
});

// add a datetimepicker to an element
addDateTimePicker = function (elementId) {
    $('#' + elementId).datetimepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'HH:mm:ss:l',
        showOn: 'button',
        buttonImage: 'images/timestamp.png',
        buttonImageOnly: true,
        buttonText: 'Select timestamp',
        todayBtn: false,
        onSelect: convertDateToUnix,
        onClose: closeTimestampPicker

    });
}

// convert the date string in to unix timestamp onSelect
convertDateToUnix = function () {
    $(this).val(Date.parse($(this).val()));
}


// check whether the timestamp value is a unix timestamp onClose, if not convert date string into unix timestamp
closeTimestampPicker = function () {
    if ($(this).val().includes('-')) {
        $(this).val(Date.parse($(this).val()));
    }
}

// create a single event config form
createSingleEventConfigForm = function (event, ctx) {
    var nextTab = $('ul#singleEventConfigTab li').size();

    $(ctx).siblings().removeClass("active");

    // create the tab
    $(createListItem(nextTab, singleEventConfigCount)).insertBefore($(ctx));

    $("#singleEventConfigTabContent").find(".tab-pane").removeClass("active");

    var singleEvent = singleTemplate.replaceAll('{{dynamicId}}', singleEventConfigCount);

    // create the tab content
    $(createDivForSingleEventTabContent(singleEventConfigCount)).appendTo('#singleEventConfigTabContent');
    $('#singleEventContent_' + singleEventConfigCount).html(singleEvent);

    addDateTimePicker('single_timestamp_' + singleEventConfigCount);
}

// create a list item for the single event form tabs
createListItem = function (nextTab, singleEventConfigCount) {
    var listItem =
        '<li class="active" role="presentation" id = "single_ListItem_{{dynamicId}}" >' +
        '   <a href="#singleEventContent_parent_{{dynamicId}}" data-toggle="tab" ' +
        '   id = "singleEventConfig_{{dynamicId}}" aria-controls="singleEventConfigs"' +
        '    role = "tab">' +
        '       S {{nextTab}}' +
        '       <button type="button" class="close" id="delete_singleEventConfig_{{dynamicId}}" ' +
        '       aria-label="Close">' +
        '           <span aria-hidden="true">×</span>' +
        '       </button>' +
        '   </a>' +
        '</li>'
    var temp = listItem.replaceAll('{{dynamicId}}', singleEventConfigCount);
    return temp.replaceAll('{{nextTab}}', nextTab);
};

// create a div for the tab content of single
createDivForSingleEventTabContent = function (singleEventConfigCount) {
    var div =
        '<div role="tabpanel" class="tab-pane active" id="singleEventContent_parent_{{dynamicId}}">' +
        '   <div class = "content" id="singleEventContent_{{dynamicId}}">' +
        '   </div>' +
        '</div>';
    return div.replaceAll('{{dynamicId}}', singleEventConfigCount);
};

// create jquery validators for single event forms
addSingleEventFormValidator = function (formId) {
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
        messages: {
            digits: "Timestamp value must be a positive integer."
        }
    });
};

// if the execution plan is not on run or debug mode, append buttons to start execution plan in either of the modes
generateRunDebugButtons = function (simulationType, dynamicId) {
    var runDebugButtons =
        '<div class="col-xs-6 col-md-6 btn-group " data-toggle="buttons">' +
        '   <label class="btn btn-primary active"> ' +
        '       <input type="radio" id="{{simulationType}}_run_{{dynamicId}}"' +
        '       name="{{simulationType}}_runDebug_{{dynamicId}}"' +
        '       value="run" autocomplete="off" checked> Run ' +
        '   </label> ' +
        '   <label class="btn btn-primary"> ' +
        '       <input type="radio" id="{{simulationType}}_debug_{{dynamicId}}"' +
        '        name="{{simulationType}}_runDebug_{{dynamicId}}"' +
        '       value="debug" autocomplete="off"> Debug ' +
        '   </label> ' +
        '</div>' +
        '<div class="col-xs-6 col-md-6">' +
        '   <button type="button" class="btn btn-default pull-right" id="{{simulationType}}_start_{{dynamicId}}"' +
        '    name="{{simulationType}}_start_{{dynamicId}}">Start</button>' +
        '</div>' +
        '<label id="{{simulationType}}_executionPlanStartMsg_{{dynamicId}}">' +
        '</label>';
    var temp = runDebugButtons.replaceAll('{{dynamicId}}', dynamicId);
    return temp.replaceAll('{{simulationType}}', simulationType);
}

// disable the run, debug and start buttons
disableRunDebugButtonSection = function (simulationType, dynamicId) {
    $('#' + simulationType + '_run_' + dynamicId).prop('disabled', true);
    $('#' + simulationType + '_debug_' + dynamicId).prop('disabled', true);
    $('#' + simulationType + '_start_' + dynamicId).prop('disabled', true);
}

// remove the tab from the single event tabs list and remove its tab content
removeSingleEventForm = function (ctx) {
    var x = $(ctx).parents("a").attr("href");
    $(ctx).parents('li').prev().addClass('active');
    $('#singleEventConfigTabContent ' + x).prev().addClass('active');
    $('#singleEventConfigTabContent ' + x).remove();
    $(ctx).parents("li").remove();
}

// rename the single event config tabs once a tab is deleted
renameSingleEventConfigTabs = function () {
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
createSingleListItemText = function (nextNum, dynamicId) {
    var listItemText =
        'S {{nextNum}}' +
        '<button type="button" class="close" id="delete_singleEventConfig_{{dynamicId}}" aria-label="Close">' +
        '   <span aria-hidden="true">×</span>' +
        '</button>';
    var temp = listItemText.replaceAll('{{dynamicId}}', dynamicId);
    return temp.replaceAll('{{nextNum}}', nextNum);
}

// load execution plan names to form
loadExecutionPlanNames = function (elementId) {
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
createExecutionPlanMap = function (data) {
    for (var i = 0; i < data.length; i++) {
        executionPlanDetailsMap[data[i]['executionPlaName']] = data[i]['mode'];
    }
}

// create the execution plan name drop down
refreshExecutionPlanList = function (elementId, executionPlanNames) {
    var newExecutionPlans = generateOptions(executionPlanNames);
    $('#' + elementId).html(newExecutionPlans);
}


// create the stream name drop down
refreshStreamList = function (elementId, streamNames) {
    var newStreamOptions = generateOptions(streamNames);
    $('#' + elementId).html(newStreamOptions);
}

//    used to create options for available execution plans and streams
generateOptions = function (dataArray) {
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
refreshAttributesList = function (dynamicId, streamAttributes) {
    var newAttributesOption =
        '<table class="table table-responsive"> ' +
        '   <thead>' +
        '    <tr>' +
        '       <th width="90%">' +
        '           <label for="single_attributes_{{dynamicId}}">' +
        '               Attributes<span class="requiredAstrix"> *</span>' +
        '           </label> ' +
        '       </th>' +
        '       <th width="10%">' +
        '           <label for="single_attributes_{{dynamicId}}">' +
        '            isNull' +
        '           </label>' +
        '       </th>' +
        '    </tr>' +
        '   </thead>' +
        '   <tbody id="single_attributesTableBody_{{dynamicId}}">' +
        '   </tbody>' +
        '</table>';
    $('#single_attributes_' + dynamicId).html(newAttributesOption.replaceAll('{{dynamicId}}', dynamicId));
    $('#single_attributesTableBody_' + dynamicId).html(generateAttributes(dynamicId, streamAttributes));
    $('select[class^="single-event-attribute-"]').each(function () {
        $(this).prop('selectedIndex', -1);
    })
}

// create input fields for attributes
generateAttributes = function (dynamicId, attributes) {
    var result = "";

    var booleanInput =
        '<tr>' +
        '   <td width="85%">' +
        '       <label for="single_attributes_{{dynamicId}}_{{attributeName}}_true">' +
        '           {{attributeName}}({{attributeType}})' +
        '            <select class="single-event-attribute-{{dynamicId}} form-control"' +
        '            name="single_attributes_{{dynamicId}}_{{attributeName}}"' +
        '            id="single_attributes_{{dynamicId}}_{{attributeName}}" data-id="{{dynamicId}}"' +
        '            data-type ="{{attributeType}}">' +
        '               <option value="true">True</option> ' +
        '               <option value="false">False</option> ' +
        '           </select>' +
        '      </label>' +
        '   </td>' +
        '   <td width="15%" class="align-middle">' +
        '       <input type="checkbox" name="single_attributes_{{dynamicId}}_{{attributeName}}_null"' +
        '       id="single_attributes_{{dynamicId}}_{{attributeName}}_null">' +
        '   </td>' +
        '</tr>';

    var textInput =
        '<tr>' +
        '   <td width="85%">' +
        '       <label for ="single_attributes_{{dynamicId}}_{{attributeName}}">' +
        '           {{attributeName}}({{attributeType}})' +
        '           <input type="text" class="form-control single-event-attribute-{{dynamicId}}"' +
        '           name="single_attributes_{{dynamicId}}_{{attributeName}}" ' +
        '           id="single_attributes_{{dynamicId}}_{{attributeName}}" data-id="{{dynamicId}}"' +
        '           data-type ="{{attributeType}}">' +
        '       </label>' +
        '   </td>' +
        '   <td width="15%" class="align-middle">' +
        '       <input align="center" type="checkbox" ' +
        '       name="single_attributes_{{dynamicId}}_{{attributeName}}_null"' +
        '       id="single_attributes_{{dynamicId}}_{{attributeName}}_null">' +
        '   </td>' +
        '</tr>';

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
    return result.replaceAll('{{dynamicId}}', dynamicId);
}

// add rules for attribute
addRulesForAttributes = function (elementId) {
    $('.single-event-attribute-' + elementId).each(
        function () {
            addRuleForAttribute(this);
        }
    );
}

// add a validation rule for an attribute based on the attribute type
addRuleForAttribute = function (ctx) {
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
                    validateIntOrLong: "Please specify a valid " + type.toLowerCase() + " value."
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
                    validateFloatOrDouble: "Please specify a valid " + type.toLowerCase() + " value."
                }
            });
            break;
    }
}

// remove rules used for previous attributes
removeRulesOfAttributes = function (elementId) {
    $('.single-event-attribute-' + elementId).each(
        function () {
            removeRulesOfAttribute(this);
        }
    );
}

// remove validation rule of an attribute
removeRulesOfAttribute = function (ctx) {
    $(ctx).rules('remove');
};


/*
 feed simulation functions
 */

generateConfigPanel = function (totalSourceNum, currentSourceNum, sourceType) {
    var panel =
        '<div class="panel panel-default" id = "sourceConfig_{{dynamicId}}" data-type="{{sourceType}}"' +
        ' data-id="{{dynamicId}}"> ' +
        '    <div class="panel-heading feed-config" role="tab" id="source_{{dynamicId}}" data-toggle="collapse"' +
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

generateSourceForm = function (sourceType, totalSourceNum) {
    switch (sourceType) {
        case 'CSV file':
            return csvTemplate.replaceAll('{{dynamicId}}', totalSourceNum);
        case 'Database':
            return dbTemplate.replaceAll('{{dynamicId}}', totalSourceNum);
        case 'Random':
            return randomTemplate.replaceAll('{{dynamicId}}', totalSourceNum);
    }
};

loadCSVFileNames = function (dynamicId) {
    Simulator.retrieveCSVFileNames(
        function (data) {
            refreshCSVFileList(dynamicId, data);
            $('#fileName_' + dynamicId).prop("selectedIndex", -1);
        },
        function (data) {
            console.log(data);
        });
};

refreshCSVFileList = function (dynamicId, csvFileNames) {
    var fileNames = generateOptions(csvFileNames);
    fileNames +=
        '<option value = "Upload CSV file" id="uploadCSVFile_' + dynamicId + '">' +
        '   Upload CSV file' +
        '</option>';
    $('#fileName_' + dynamicId).html(fileNames);
};

disableSourceConfigInputFields = function (sourceType, dynamicId) {
    $('#streamName_' + dynamicId).prop("selectedIndex", -1).prop('disabled', true);
    switch (sourceType) {
        case 'csv':
            disableCSVSourceConfigInputFields(dynamicId);
            break;
        case 'db':
            disableDbSourceConfigInputFields(dynamicId);
            break;
        case 'random':
            disableRandomSourceConfigInputFields(dynamicId);
            break;
    }
};

disableCSVSourceConfigInputFields = function (dynamicId) {
    $('#fileName_' + dynamicId).prop("selectedIndex", -1).prop('disabled', true);

    $('#timestampAttribute_' + dynamicId).val('').prop('disabled', true);
    if ($('#timestamp-option_' + dynamicId + '_timestampAttribute').is(':checked')) {
        $('#timestamp-option_' + dynamicId + '_timestampAttribute').prop('checked', false);
    }
    $('#timestamp-option_' + dynamicId + '_timestampAttribute').prop('disabled', true);

    $('#timestampInterval_' + dynamicId).val('').prop('disabled', true);
    if ($('#timestamp-option_' + dynamicId + '_timestampInterval').is(':checked')) {
        $('#timestamp-option_' + dynamicId + '_timestampInterval').prop('checked', false);
    }
    $('#timestamp-option_' + dynamicId + '_timestampInterval').prop('disabled', true);

    $('#delimiter_' + dynamicId).val('').prop('disabled', true);
};

disableDbSourceConfigInputFields = function (dynamicId) {
    $('#dataSourceLocation_' + dynamicId).val('').prop('disabled', true);
    $('#driver_' + dynamicId).val('').prop('disabled', true);
    $('#username_' + dynamicId).val('').prop('disabled', true);
    $('#password_' + dynamicId).val('').prop('disabled', true);
    $('#loadDbConnection_' + dynamicId).val('').prop('disabled', true);
    $('#connectionSuccessMsg_' + dynamicId).empty();
    $('#tableName_' + dynamicId).val('').prop('disabled', true);

    $('#timestampAttribute_' + dynamicId).val('').prop('disabled', true);
    if ($('#timestamp-option_' + dynamicId + '_timestampAttribute').is(':checked')) {
        $('#timestamp-option_' + dynamicId + '_timestampAttribute').prop('checked', false);
    }
    $('#timestamp-option_' + dynamicId + '_timestampAttribute').prop('disabled', true);

    $('#timestampInterval_' + dynamicId).val('').prop('disabled', true);
    if ($('#timestamp-option_' + dynamicId + '_timestampInterval').is(':checked')) {
        $('#timestamp-option_' + dynamicId + '_timestampInterval').prop('checked', false);
    }
    $('#timestamp-option_' + dynamicId + '_timestampInterval').prop('disabled', true);
};


disableRandomSourceConfigInputFields = function (dynamicId) {
    $('#timestamp_' + dynamicId).val('').prop('disabled', true);
};

reenableSourceConfigInputFields = function (sourceType, dynamicId) {
    $('#streamName_' + dynamicId).prop('disabled', false);
    switch (sourceType) {
        case 'csv':
            reenableCSVSourceConfigInputFields(dynamicId);
            break;
        case 'db':
            reenableDbSourceConfigInputFields(dynamicId);
            break;
        case 'random':
            reenableRandomSourceConfigInputFields(dynamicId);
            break;
    }
    // $('#attributesDiv_' + dynamicId).remove();
};

reenableCSVSourceConfigInputFields = function (dynamicId) {
    $('#fileName_' + dynamicId).prop('disabled', false);
    $('#timestamp-option_' + dynamicId + '_timestampAttribute').prop('disabled', false);
    $('#timestampAttribute_' + dynamicId).prop('disabled', false);
    $('#timestamp-option_' + dynamicId + '_timestampInterval').prop('disabled', false);
    $('#timestampInterval_' + dynamicId).prop('disabled', false);
    $('#isOrdered_true_' + dynamicId).prop('disabled', false);
    $('#isOrdered_false_' + dynamicId).prop('disabled', false);
    $('#delimiter_' + dynamicId).prop('disabled', false);
};


reenableDbSourceConfigInputFields = function (dynamicId) {
    $('#dataSourceLocation_' + dynamicId).prop('disabled', false);
    $('#driver_' + dynamicId).prop('disabled', false);
    $('#username_' + dynamicId).prop('disabled', false);
    $('#password_' + dynamicId).prop('disabled', false);
    $('#tableName_' + dynamicId).prop('disabled', false);
    $('#timestamp-option_' + dynamicId + '_timestampAttribute').prop('disabled', false);
    $('#timestampAttribute_' + dynamicId).prop('disabled', false);
    $('#timestamp-option_' + dynamicId + '_timestampInterval').prop('disabled', false);
    $('#timestampInterval_' + dynamicId).prop('disabled', false);
};


reenableRandomSourceConfigInputFields = function (dynamicId) {
    $('#timestamp_' + dynamicId).prop('disabled', false);
};


// create jquery validators for feed config form
generateFormValidatorForFeedConfig = function () {
    return $('#feedSimulationConfig').validate({
        rules: {
            simulationName: "required",
            startTimestamp: "digits",
            endTimestamp: "digits",
            noOfEvents: "digits"
        },
        messages: {
            simulationName: "Please specify a simulation name.",
            startTimestamp: "Start timestamp value must be a positive integer.",
            endTimestamp: "End timestamp value must be a positive integer.",
            noOfEvents: "No. of events must be a positive integer."
        }
    });
};


// create jquery validators for feed config form
addSourceConfigValidation = function (sourceType, dynamicId) {
    $('#executionPlanName_' + dynamicId).rules('add', {
        required: true,
        messages: {
            required: "Please select an execution plan name."
        }
    });
    $('#streamName_' + dynamicId).rules('add', {
        required: true,
        messages: {
            required: "Please select a stream name."
        }
    });
    $('#timestampInterval_' + dynamicId).rules('add', {
        digits: true,
        messages: {
            digits: "Timestamp interval must be a positive integer."
        }
    });
    switch (sourceType) {
        case 'CSV file':
            addCSVSourceConfigValidation(dynamicId);
            break;
        case 'Database':
            addDBSourceConfigValidation(dynamicId);
            break;
        case 'Random':
            // no specific validations required
            break;
    }
};

// create jquery validators for csv source config
addCSVSourceConfigValidation = function (dynamicId) {
    $('#fileName_' + dynamicId).rules('add', {
        required: true,
        messages: {
            required: "Please select a CSV file."
        }
    });
    $('#timestampAttribute_' + dynamicId).rules('add', {
        digits: true,
        messages: {
            digits: "Timestamp attribute must be a positive integer."
        }
    });
    $('#delimiter_' + dynamicId).rules('add', {
        required: true,
        messages: {
            required: "Please specify a delimiter."
        }
    });
};

// create jquery validators for db source config
addDBSourceConfigValidation = function (dynamicId) {
    $('#dataSourceLocation_' + dynamicId).rules('add', {
        required: true,
        messages: {
            required: "Please specify a datasource location."
        }
    });
    $('#driver_' + dynamicId).rules('add', {
        required: true,
        messages: {
            required: "Please specify a driver."
        }
    });
    $('#username_' + dynamicId).rules('add', {
        required: true,
        messages: {
            required: "Please specify a username."
        }
    });
    $('#password_' + dynamicId).rules('add', {
        required: true,
        messages: {
            required: "Please specify a password."
        }
    });
    $('#tableName_' + dynamicId).rules('add', {
        required: true,
        messages: {
            required: "Please select a table name."
        }
    });
};


// add jquery validations for attribute configurations
addAttributeConfigurationRules = function (sourceType, dynamicId) {
    switch (sourceType) {
        case 'csv':
            addCSVSourceAttributeValidation(dynamicId);
            break;
        case 'random' :
            addRandomSourceAttributeValidation(dynamicId);
            break;
        case 'db' :
            //do nothing since no specific rules for columns list
            break;
    }
};

// create jquery validators for CSV indices
addCSVSourceAttributeValidation = function (dynamicId) {
    $('.feed-attribute-csv-' + dynamicId).each(function () {
        $(this).rules('add', {
            required: true,
            digits: true,
            messages: {
                required: "Please specify a column index.",
                digits: "Index must be a positive integer."
            }
        });
    })
};

// create jquery validators for random source attribute config
addRandomSourceAttributeValidation = function (dynamicId) {
    $('.feed-attribute-random-' + dynamicId).each(function () {
        $(this).rules('add', {
            required: true,
            messages: {
                required: "Please specify a random attribute generation type."
            }
        });
    })
};

// create jquery validators for custom, primitive, property and regex based random generation configurations
addRandomConfigTypeValidation = function (parentId) {
    $('input[id^="' + parentId + '_"], select[id^="' + parentId + '_"]').each(function () {
        var id = this.id;
        var inputType = $(this).data('type');
        $(this).rules('add', {
            required: true,
            messages: {
                required: "Please specify a value."
            }
        });
        switch (inputType) {
            case 'int':
            case 'long':
                $(this).rules('add', {
                    validateIntOrLong: true,
                    messages: {
                        validateIntOrLong: "Please specify a valid " + inputType + " value."
                    }
                });
                break;
            case 'float':
            case 'double' :
                $(this).rules('add', {
                    validateFloatOrDouble: true,
                    messages: {
                        validateFloatOrDouble: "Please specify a valid " + inputType + " value."
                    }
                });
                break;
            case 'numeric':
                $(this).rules('add', {
                    digits: true,
                    messages: {
                        digits: "Please specify a positive integer value."
                    }
                });
                break;
        }
    })
};


// remove jquery validators for deleted feed config form
removeSourceConfigValidation = function (sourceType, dynamicId) {
    switch (sourceType) {
        case 'CSV file':
            removeCSVSourceConfigValidation(dynamicId);
            break;
        case 'Database':
            removeDBSourceConfigValidation(dynamicId);
            break;
        case 'Random':
            removeRandomConfigTypeValidation(dynamicId);
            break;
    }
};

// remove jquery validators for deleted csv source config
removeCSVSourceConfigValidation = function (dynamicId) {
    $('#executionPlanName_' + dynamicId).rules('remove');
    $('#streamName_' + dynamicId).rules('remove');
    $('#fileName_' + dynamicId).rules('remove');
    $('#timestampAttribute_' + dynamicId).rules('remove');
    $('#timestampInterval_' + dynamicId).rules('remove');
    $('#delimiter_' + dynamicId).rules('remove');
    removeCSVSourceAttributeConfigValidation(dynamicId);
};

// remove jquery validators for deleted db source config
removeDBSourceConfigValidation = function (dynamicId) {
    $('#dataSourceLocation_' + dynamicId).rules('remove');
    $('#driver_' + dynamicId).rules('remove');
    $('#username_' + dynamicId).rules('remove');
    $('#password_' + dynamicId).rules('remove');
    $('#tableName_' + dynamicId).rules('remove');
};

// remove jquery validators for deleted random source config
removeRandomSourceConfigValidation = function (dynamicId) {
    $('#timestampInterval_' + dynamicId).rules('remove');
    removeRandomConfigTypeValidation(dynamicId);
};

//remove attribute validation rules
removeAttributeConfigurationRules = function (sourceType, dynamicId) {
    switch (sourceType) {
        case 'csv':
            removeCSVSourceConfigValidation(dynamicId);
            break;
        case 'random' :
            removeRandomConfigTypeValidation(dynamicId);
            break;
        case 'db' :
            //do nothing since no specific rules for columns list
            break;
    }
};
// remove jquery validators of csv source indices
removeCSVSourceAttributeConfigValidation = function (dynamicId) {
    $('.feed-attribute-csv-' + dynamicId).each(function () {
        removeRulesOfAttribute(this);
    })
};
// remove jquery validators of random source attribute config
removeRandomConfigTypeValidation = function (dynamicId) {
    $('.feed-attribute-random-' + dynamicId).each(function () {
        var id = this.id;
        removeRulesOfAttribute(this);
        $('input[id^="' + id + '_"], select[id^="' + id + '_"]').each(function () {
            removeRulesOfAttribute(this);
        });
    })
};

// refresh the remaining source config panel headings once a source is deleted
refreshConfigPanelHeadings = function () {
    $('h4.source-title').each(function (i) {
        var type = $(this).data('type');
        $(this).text('Source ' + (i + 1) + ' ' + type);
    });
};

// create input fields for attributes
refreshAttributesListOfSource = function (dataType, dynamicId, streamAttributes) {
    $('#attributesDiv_' + dynamicId).html(generateAttributesDivForSource(dataType, dynamicId));
    var attributes = generateAttributesListForSource(dataType, dynamicId, streamAttributes);
    $('#attributes_' + dynamicId).html(attributes);
};

//generate attribute div for inputs
generateAttributesDivForSource = function (dataType, dynamicId) {
    var csv =
        '<div class="form-group">' +
        '   <label>Indices</label>' +
        '   <div id="attributes_{{dynamicId}}">' +
        '   </div> ' +
        '</div>';
    var db =
        '<div class="form-group">' +
        '   <label>Columns List</label>' +
        '   <div id="attributes_{{dynamicId}}">' +
        '   </div> ' +
        '</div>';
    var random =
        '<div class="form-group">' +
        '   <label>Attribute Configuration</label>' +
        '   <div id="attributes_{{dynamicId}}">' +
        '   </div>' +
        '</div>';

    switch (dataType) {
        case 'csv':
            return csv.replaceAll('{{dynamicId}}', dynamicId);
        case 'db':
            return db.replaceAll('{{dynamicId}}', dynamicId);
        case 'random':
            return random.replaceAll('{{dynamicId}}', dynamicId);
    }

};


//generate input fields for attributes
generateAttributesListForSource = function (dataType, dynamicId, attributes) {
    var csvAttribute =
        '<div>' +
        '   <label for ="attributes_{{dynamicId}}_{{attributeName}}">' +
        '        {{attributeName}}({{attributeType}})' +
        '       <input type="text" class="feed-attribute-csv-{{dynamicId}} form-control"' +
        '       name="attributes_{{dynamicId}}_{{attributeName}}" ' +
        '       id="attributes_{{dynamicId}}_{{attributeName}}" data-id="{{dynamicId}}"' +
        '       data-type ="{{attributeType}}">' +
        '   </label>' +
        '</div>';
    var dbAttribute =
        '<div>' +
        '   <label for ="attributes_{{dynamicId}}_{{attributeName}}" class="labelSize300Px">' +
        '       {{attributeName}}({{attributeType}})' +
        '       <select id="attributes_{{dynamicId}}_{{attributeName}}"' +
        '       name="attributes_{{dynamicId}}_{{attributeName}}" ' +
        '       class="feed-attribute-db-{{dynamicId}} form-control" ' +
        '       data-id="{{dynamicId}}" ' +
        '       data-type="{{attributeType}}"> ' +
        '       </select>' +
        '   </label>' +
        '</div>';
    var randomAttribute =
        '<div>' +
        '   <label for ="attributes_{{dynamicId}}_{{attributeName}}" class="labelSize300Px">' +
        '       {{attributeName}}({{attributeType}})' +
        '       <label class="labelSize300Px">' +
        '           Configuration Type' +
        '           <select id="attributes_{{dynamicId}}_{{attributeName}}"' +
        '           name="attributes_{{dynamicId}}_{{attributeName}}" ' +
        '           class="feed-attribute-random-{{dynamicId}} form-control" data-id="{{dynamicId}}" ' +
        '           data-type ="{{attributeType}}"> ' +
        '              <option value="custom">Custom data based</option>' +
        '              <option value="primitive">Primitive based</option>' +
        '              <option value="property">Property based </option>' +
        '              <option value="regex">Regex based</option>' +
        '           </select>' +
        '       </label>' +
        '   </label>' +
        '   <div id ="attributes_{{dynamicId}}_{{attributeName}}_config">' +
        '   </div> ' +
        '</div>';

    var result = "";

    for (var i = 0; i < attributes.length; i++) {
        var temp;
        switch (dataType) {
            case 'csv':
                temp = csvAttribute.replaceAll('{{attributeName}}', attributes[i]['name']);
                result += temp.replaceAll('{{attributeType}}', attributes[i]['type']);
                break;
            case 'db':
                temp = dbAttribute.replaceAll('{{attributeName}}', attributes[i]['name']);
                result += temp.replaceAll('{{attributeType}}', attributes[i]['type']);
                break;
            case 'random':
                temp = randomAttribute.replaceAll('{{attributeName}}', attributes[i]['name']);
                result += temp.replaceAll('{{attributeType}}', attributes[i]['type']);
                break;
        }
    }
    return result.replaceAll('{{dynamicId}}', dynamicId);
};


//generate success message fro database connection
generateConnectionMessage = function (dynamicId, status) {
    var connectingMsg =
        '<div id="connectionSuccessMsg_{{dynamicId}}" class="color-grey">' +
        '<label>Attempting to connect to datasource...</label>' +
        '</div>';

    var successMsg =
        '<div id="connectionSuccessMsg_{{dynamicId}}" class="color-green">' +
        '<label>Successfully connected</label>' +
        '</div>';

    var failureMsg =
        '<div id="connectionSuccessMsg_{{dynamicId}}" class="color-red">' +
        '<label>Connection failed</label>' +
        '</div>';
    switch (status) {
        case 'connecting':
            return connectingMsg.replaceAll('{{dynamicId}}', dynamicId);
        case 'success':
            return successMsg.replaceAll('{{dynamicId}}', dynamicId);
        case 'failure':
            return failureMsg.replaceAll('{{dynamicId}}', dynamicId);
    }
};

//generate input fields for attributes
refreshTableNamesFromDataSource = function (connectionDetails, dynamicId) {
    Simulator.retrieveTableNames(
        JSON.stringify(connectionDetails),
        function (data) {
            $('#tableName_' + dynamicId).html(generateOptions(data));
            $('#tableName_' + dynamicId).prop("selectedIndex", -1);
        },
        function (msg) {
            console.error(msg['responseText']);
        }
    )
};

// check whether the connection details and table name is available
verifyConnectionDetails = function (dynamicId) {
    return $('#dataSourceLocation_' + dynamicId).val() !== ''
        && $('#driver_' + dynamicId).val() !== ''
        && $('#username_' + dynamicId).val() !== ''
        && $('#password_' + dynamicId).val() !== '';
};

// retrieve column names of the selected table
refreshColumnNamesLists = function (dynamicId) {
    var dataSourceLocation = $('#dataSourceLocation_' + dynamicId).val();
    if (dataSourceLocation === null || dataSourceLocation.length === 0) {
        console.error("Datasource location is required to retrieve columns list.")
    }
    var driverName = $('#driver_' + dynamicId).val();
    if (driverName === null || driverName.length === 0) {
        console.error("Driver is required to retrieve columns list.")
    }
    var username = $('#username_' + dynamicId).val();
    if (username === null || username.length === 0) {
        console.error("Driver is required to retrieve columns list.")
    }
    var password = $('#password_' + dynamicId).val();
    if (password === null || password.length === 0) {
        console.error("Password is required to retrieve columns list.")
    }
    var tableName = $('#tableName_' + dynamicId).val();
    if (tableName === null || tableName.length === 0) {
        console.error("Table name is required to retrieve columns list.")
    }

    if (dataSourceLocation !== null && dataSourceLocation.length > 0
        && driverName !== null && driverName.length > 0
        && username !== null && username.length > 0
        && password !== null && password.length > 0
        && tableName !== null && tableName.length > 0) {
        var connectionDetails = {};
        connectionDetails['driver'] = driverName;
        connectionDetails['dataSourceLocation'] = dataSourceLocation;
        connectionDetails['username'] = username;
        connectionDetails['password'] = password;
        Simulator.retrieveColumnNames(
            JSON.stringify(connectionDetails),
            tableName,
            function (data) {
                loadColumnNamesList(data, dynamicId);
            },
            function (msg) {
                console.error(msg['responseText']);
            }
        );
    }
};


//generate input fields for attributes
loadColumnNamesList = function (columnNames, dynamicId) {
    var columnsList = generateOptions(columnNames);
    $('.feed-attribute-db-' + dynamicId).each(function () {
        $(this).html(columnsList);
        $(this).prop("selectedIndex", -1);
    });
    $('#timestampAttribute_' + dynamicId).html(columnsList);
    $('#timestampAttribute_' + dynamicId).prop("selectedIndex", -1);
};

// generate input fields to provide configuration for random generation type (factory method)
generateRandomAttributeConfiguration = function (randomType, attributeType, dynamicId, parentId) {

    switch (randomType) {
        case 'custom' :
            return generateCustomBasedAttributeConfiguration(dynamicId, parentId);
        case 'primitive':
            return generatePrimitiveBasedAttributeConfiguration(attributeType, dynamicId, parentId);
        case 'property':
            return generatePropertyBasedAttributeConfiguration(attributeType, dynamicId, parentId);
        case 'regex' :
            return generateRegexBasedAttributeConfiguration(dynamicId, parentId);
    }
};

// generate input fields to provide configuration for 'custom based' random generation type
generateCustomBasedAttributeConfiguration = function (dynamicId, parentId) {
    var custom =
        '<div>' +
        '   <label class="labelSize300Px">' +
        '      Data' +
        '      <input type="text" class="form-control" name="{{parentId}}_custom" id="{{parentId}}_custom"' +
        '      data-id="{{dynamicId}}" data-type ="custom">' +
        '   </label>' +
        '</div>';
    var temp = custom.replaceAll('{{dynamicId}}', dynamicId);
    return temp.replaceAll('{{parentId}}', parentId);
};


// generate input fields to provide configuration for 'primitive based' random generation type
generatePrimitiveBasedAttributeConfiguration = function (attrType, dynamicId, parentId) {

    var bool =
        '<div>' +
        '   <span class="helper color-grey" id="{{parentId}}_primitive_bool" data-id="{{dynamicId}}">' +
        '   No primitive based configuration required for attribute type \'BOOL\'.' +
        '   </span>' +
        '</div>';

    var length =
        '<div>' +
        '   <label class="labelSize300Px">' +
        '       Length' +
        '       <input type="text" class="form-control" name="{{parentId}}_primitive_length"' +
        '       id="{{parentId}}_primitive_length" data-id="{{dynamicId}}"' +
        '       data-type="numeric">' +
        '   </label>' +
        '</div>';

    var min =
        '<div>' +
        '   <label class="labelSize300Px">' +
        '      Min' +
        '      <input type="text" class="form-control" name="{{parentId}}_primitive_min"' +
        '      id="{{parentId}}_primitive_min" data-id="{{dynamicId}}" data-type="{{attributeType}}">' +
        '   </label>' +
        '</div>';

    var max =
        '<div>' +
        '   <label class="labelSize300Px">' +
        '      Max' +
        '      <input type="text" class="form-control" name="{{parentId}}_primitive_max"' +
        '      id="{{parentId}}_primitive_max" data-id="{{dynamicId}}" data-type="{{attributeType}}">' +
        '   </label>' +
        '</div>';

    var precision =
        '<div>' +
        '   <label class="labelSize300Px">' +
        '      Precision' +
        '      <input type="text" class="form-control" name="{{parentId}}_primitive_precision"' +
        '      id="{{parentId}}_primitive_precision" data-id="{{dynamicId}}" data-type="numeric">' +
        '   </label>' +
        '</div>';

    var temp = '';

    switch (attrType) {
        case 'BOOL':
            temp = bool;
            break;
        case 'STRING':
            temp = length;
            break;
        case 'INT':
        case 'LONG':
            temp = min;
            temp += max;
            break;
        case 'FLOAT':
        case 'DOUBLE':
            temp = min;
            temp += max;
            temp += precision;
            break;
    }
    var temp1 = temp.replaceAll('{{dynamicId}}', dynamicId);
    temp = temp1.replaceAll('{{attributeType}}', attrType.toLowerCase());
    return temp.replaceAll('{{parentId}}', parentId);
};

// generate input fields to provide configuration for 'property based' random generation type
generatePropertyBasedAttributeConfiguration = function (attrType, dynamicId, parentId) {
    var propertyStartingTag =
        '<div>' +
        '   <label class="labelSize300Px">' +
        '       Type' +
        '       <select id="{{parentId}}_property" name="{{parentId}}_property" ' +
        '       class="feed-attribute-random-{{dynamicId}}-property form-control" data-id="{{dynamicId}}"' +
        '       data-type="property"> ';

    var propertyEndingTag =
        '      </select>' +
        '   </label>' +
        '</div>';

    var temp = propertyStartingTag;
    temp += refreshPropertyBasedOptionsList(attrType);
    temp += propertyEndingTag;
    var temp1 = temp.replaceAll('{{dynamicId}}', dynamicId);
    return temp1.replaceAll('{{parentId}}', parentId);
};

//refresh the list of property based random generation options
refreshPropertyBasedOptionsList = function (attrType) {
    return generateOptions(propertyBasedGenerationOptions);
};

// generate input fields to provide configuration for 'regex based' random generation type
generateRegexBasedAttributeConfiguration = function (dynamicId, parentId) {
    var regex =
        '<div>' +
        '   <label class="labelSize300Px">' +
        '      Pattern' +
        '      <input type="text" class="form-control" name="{{parentId}}_regex" id="{{parentId}}_regex"' +
        ' data-id="{{dynamicId}}" data-type="regex">' +
        '   </label>' +
        '</div>';

    var temp = regex.replaceAll('{{dynamicId}}', dynamicId);
    return temp.replaceAll('{{parentId}}', parentId);
};




