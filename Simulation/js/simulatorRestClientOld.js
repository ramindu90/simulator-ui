/*
 * Copyright (c)  2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * This Javascript module exposes Simulator API as Javascript methods.
 */
function simulatorRestClientOld() {

    "use strict";

    var self = {};
    self.HTTP_GET = "GET";
    self.HTTP_POST = "POST";
    self.HTTP_PUT = "PUT";
    self.HTTP_DELETE = "DELETE";
    self.simulatorUrl = "http://localhost:9090/simulation";
    self.editorUrl = "http://localhost:9090/editor";

    self.getDeployedExecutionPlanNames = function (successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.editorUrl + "/artifact/listExecutionPlans",
            type: self.HTTP_GET,
            success: function (data) {
                if (typeof successCallback === 'function')
                    successCallback(data)
            },
            error: function (msg) {
                if (typeof errorCallback === 'function')
                    errorCallback(msg)
            }
        });
    };

     self.getStreamNames = function (executionPlanName, successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.editorUrl + "/artifact/listStreams/" + executionPlanName,
            type: self.HTTP_GET,
            success: function (data) {
                if (typeof successCallback === 'function')
                    successCallback(data)
            },
            error: function (msg) {
                if (typeof errorCallback === 'function')
                    errorCallback(msg)
            }
        });
    };

     self.getStreamAttributes = function (executionPlanName, streamName, successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.editorUrl + "/artifact/listAttributes/" + executionPlanName + "/" + streamName,
            type: self.HTTP_GET,
            success: function (data) {
                if (typeof successCallback === 'function')
                    successCallback(data)
            },
            error: function (msg) {
                if (typeof errorCallback === 'function')
                    errorCallback(msg)
            }
        });
    };

    self.singleEventSimulation = function (singleEventConfig, successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.simulatorUrl + "/single",
            type: self.HTTP_POST,
            data: singleEventConfig,
            success: function (data) {
                if (typeof successCallback === 'function')
                    successCallback(data)
            },
            error: function (msg) {
                if (typeof errorCallback === 'function')
                    errorCallback(msg)
            }
        });
    };

    self.uploadSimulationConfig = function (simulationConfig, successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.simulatorUrl + "/feed",
            type: self.HTTP_POST,
            data: simulationConfig,
            success: function (data) {
                if (typeof successCallback === 'function')
                    successCallback(data)
            },
            error: function (msg) {
                if (typeof errorCallback === 'function')
                    errorCallback(msg)
            }
        });
    };

    self.getSimulationConfig = function (simulationName, successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.simulatorUrl + "/feed/" + simulationName,
            type: self.HTTP_GET,
            success: function (data) {
                if (typeof successCallback === 'function')
                    successCallback(data)
            },
            error: function (msg) {
                if (typeof errorCallback === 'function')
                    errorCallback(msg)
            }
        });
    };

    self.updateSimulationConfig = function (simulationName, simulationConfig, successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.simulatorUrl + "/feed/" + simulationName,
            type: self.HTTP_PUT,
            data: simulationConfig,
            success: function (data) {
                if (typeof successCallback === 'function')
                    successCallback(data)
            },
            error: function (msg) {
                if (typeof errorCallback === 'function')
                    errorCallback(msg)
            }
        });
    };


    self.deleteSimulationConfig = function (simulationName, successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.simulatorUrl + "/feed/" + simulationName,
            type: self.HTTP_DELETE,
            success: function (data) {
                if (typeof successCallback === 'function')
                    successCallback(data)
            },
            error: function (msg) {
                if (typeof errorCallback === 'function')
                    errorCallback(msg)
            }
        });
    };

    self.changeSimulationStatus = function (simulationName, action, successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.simulatorUrl + "/feed/" + simulationName + "?" +jQuery.param({action: action}),
            type: self.HTTP_POST,
            success: function (data) {
                if (typeof successCallback === 'function')
                    successCallback(data)
            },
            error: function (msg) {
                errorCallback(msg)
            }
        })
    };

    self.uploadCSVFile = function (filePath, successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.simulatorUrl + "/files",
            type: self.HTTP_POST,
            data: filePath,
            success: function (data) {
                if (typeof successCallback === 'function')
                    successCallback(data)
            },
            error: function (msg) {
                if (typeof errorCallback === 'function')
                    errorCallback(msg)

            }
        })
    };

    self.updateCSVFile = function (existingFileName, newFilePath, successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.simulatorUrl + "/files/" + existingFileName,
            type: self.HTTP_PUT,
            data: newFilePath,
            success: function (data) {
                if (typeof successCallback === 'function')
                    successCallback(data)
            },
            error: function (msg) {
                if (typeof  errorCallback === 'function')
                    errorCallback(msg)
            }
        })
    };

    self.deleteCSVFile = function (fileName, successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.simulatorUrl + "/files/" + fileName,
            type: self.HTTP_DELETE,
            success: function (data) {
                if (typeof successCallback === 'function')
                    successCallback(data)
            },
            error: function (msg) {
                if (typeof errorCallback === 'function')
                    errorCallback(msg)
            }
        })
    };

    return self;
}
