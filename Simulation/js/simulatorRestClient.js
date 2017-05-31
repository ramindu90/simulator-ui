var Simulator = (function () {

    "use strict";   // JS strict mode

    var self = {};

    self.HTTP_GET = "GET";
    self.HTTP_POST = "POST";
    self.HTTP_PUT = "PUT";
    self.HTTP_DELETE = "DELETE";
    self.simulatorUrl = "http://localhost:9090/simulation";
    self.editorUrl = "http://localhost:9090/editor";


    self.retrieveExecutionPlanNames = function (successCallback, errorCallback) {
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

    self.retrieveStreamNames = function (executionPlanName, successCallback, errorCallback) {
        if (executionPlanName === null || executionPlanName.length === 0) {
            console.error("Execution plan name is required to retrieve stream names.")
        }
        if (executionPlanName !== null && executionPlanName.length > 0) {
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
        }
    };

    self.retrieveStreamAttributes = function (executionPlanName, streamName, successCallback, errorCallback) {
        if (executionPlanName === null || executionPlanName.length === 0) {
            console.error("Execution plan name is required to retrieve stream attributes.")
        }
        if (streamName === null || streamName.length === 0) {
            console.error("Stream name is required to retrieve stream attributes.")
        }
        if (executionPlanName !== null && executionPlanName.length > 0
            && streamName !== null && streamName.length > 0) {
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
        }
    };

    self.singleEvent = function (singleEventConfig, successCallback, errorCallback) {
        if (singleEventConfig === null || singleEventConfig.length === 0) {
            console.error("Single event configuration is required.");
        }
        if (singleEventConfig !== null && singleEventConfig.length > 0) {
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
        }
    };

    self.uploadSimulation = function (simulationConfig, successCallback, errorCallback) {
        if (simulationConfig === null || simulationConfig.length === 0) {
            console.error("Simulation configuration is required.");
        }
        if (simulationConfig !== null && simulationConfig.length > 0) {
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
        }
    };

    self.updateSimulation = function (simulationName, newSimulationConfig, successCallback, errorCallback) {
        if (simulationName === null || simulationName.length === 0) {
            console.error("The name of the simulation to be updated has not been specified.");
        }
        if (newSimulationConfig === null || newSimulationConfig.length === 0) {
            console.error("New simulation configuration is required.");
        }
        if (simulationName !== null && simulationName.length > 0
            && newSimulationConfig !== null && newSimulationConfig.length > 0) {
            jQuery.ajax({
                async: true,
                url: self.simulatorUrl + "/feed/" + simulationName,
                type: self.HTTP_PUT,
                data: newSimulationConfig,
                success: function (data) {
                    if (typeof successCallback === 'function')
                        successCallback(data)
                },
                error: function (msg) {
                    if (typeof errorCallback === 'function')
                        errorCallback(msg)
                }
            });
        }
    };

    self.getSimulation = function (simulationName, successCallback, errorCallback) {
        if (simulationName === null || simulationName.length === 0) {
            console.error("The simulation name is not specified.");
        }
        if (simulationName !== null && simulationName.length > 0) {
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
        }
    };

    self.deleteSimulation = function (simulationName, successCallback, errorCallback) {
        if (simulationName === null || simulationName.length === 0) {
            console.error("The simulation name is not specified.");
        }
        if (simulationName !== null && simulationName.length > 0) {
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
        }
    };

    self.changeSimulationStatus = function (simulationName, action, successCallback, errorCallback) {
        if (simulationName === null || simulationName.length === 0) {
            console.error("The simulation name is not specified.");
        }
        var actionLowerCase = action.toLowerCase();
        if (actionLowerCase.toLowerCase() === 'run' || actionLowerCase === 'pause'
            || actionLowerCase === 'resume' || actionLowerCase === 'stop') {
            if (simulationName !== null && simulationName.length > 0) {
                jQuery.ajax({
                    async: true,
                    url: self.simulatorUrl + "/feed/" + simulationName + "?" + jQuery.param({action: action}),
                    type: self.HTTP_POST,
                    success: function (data) {
                        if (typeof successCallback === 'function')
                            successCallback(data)
                    },
                    error: function (msg) {
                        errorCallback(msg)
                    }
                })
            }
        } else {
            console.error("Invalid action specified. Supported actions are 'run', 'pause', 'resume' and 'stop'.")
        }
    };

    self.uploadCSV = function (filePath, successCallback, errorCallback) {
        if (filePath === null || filePath.length === 0) {
            console.error("The file path is not specified.");
        }
        if (filePath !== null && filePath.length > 0) {
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
        }
    };

    self.updateCSV = function (fileName, filePath, successCallback, errorCallback) {
        if (fileName === null || fileName.length === 0) {
            console.error("The name of file to be replaced is not specified.");
        }
        if (filePath === null || filePath.length === 0) {
            console.error("The replacement file path is not specified.");
        }
        if (fileName !== null && fileName.length !== 0
            && filePath !== null && filePath.length > 0) {
            jQuery.ajax({
                async: true,
                url: self.simulatorUrl + "/files/" + fileName,
                type: self.HTTP_PUT,
                data: filePath,
                success: function (data) {
                    if (typeof successCallback === 'function')
                        successCallback(data)
                },
                error: function (msg) {
                    if (typeof  errorCallback === 'function')
                        errorCallback(msg)
                }
            })
        }
    };

    self.retrieveCSVFileNames = function (successCallback, errorCallback) {
        jQuery.ajax({
            async: true,
            url: self.simulatorUrl + "/files",
            type: self.HTTP_GET,
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

    self.deleteCSV = function (fileName, successCallback, errorCallback) {
        if (fileName === null || fileName.length === 0) {
            console.error("The name of file to be deleted is not specified.");
        }
        if (fileName !== null && fileName.length > 0) {
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
        }
    };


    self.testDatabaseConnectivity = function (connectionDetails, successCallback, errorCallback) {
        if (connectionDetails === null || connectionDetails.length === 0) {
            console.error("Connection details are required to test database connection")
        }
        if (connectionDetails !== null && connectionDetails.length > 0) {
            jQuery.ajax({
                async: true,
                url: self.simulatorUrl + "/connectToDatabase",
                type: self.HTTP_POST,
                contentType: 'application/json; charset=UTF-8',
                data: connectionDetails,
                success: function (data) {
                    if (typeof successCallback === 'function')
                        successCallback(data)
                },
                error: function (msg) {
                    if (typeof errorCallback === 'function')
                        errorCallback(msg)
                }
            })
        }
    };

    self.retrieveTableNames = function (connectionDetails, successCallback, errorCallback) {
        if (connectionDetails === null || connectionDetails.length === 0) {
            console.error("Connection details are required to retrieve table names")
        }
        if (connectionDetails !== null && connectionDetails.length > 0) {
            jQuery.ajax({
                async: true,
                url: self.simulatorUrl + "/connectToDatabase/retrieveTableNames",
                type: self.HTTP_POST,
                contentType: 'application/json; charset=UTF-8',
                data: connectionDetails,
                success: function (data) {
                    if (typeof successCallback === 'function')
                        successCallback(data)
                },
                error: function (msg) {
                    if (typeof errorCallback === 'function')
                        errorCallback(msg)
                }
            })
        }
    };

    self.retrieveColumnNames = function (connectionDetails, tableName, successCallback, errorCallback) {
        if (connectionDetails === null || connectionDetails.length === 0) {
            console.error("Connection details are required to retrieve column names")
        }
        if (tableName === null || tableName.length === 0) {
            console.error("Table name is required to retrieve column names")
        }
        if (connectionDetails !== null && connectionDetails.length > 0
            && tableName !== null && tableName.length > 0) {
            jQuery.ajax({
                async: true,
                url: self.simulatorUrl + "/connectToDatabase/" + tableName + "/retrieveColumnNames",
                type: self.HTTP_POST,
                contentType: 'application/json; charset=UTF-8',
                data: connectionDetails,
                success: function (data) {
                    if (typeof successCallback === 'function')
                        successCallback(data)
                },
                error: function (msg) {
                    if (typeof errorCallback === 'function')
                        errorCallback(msg)
                }
            })
        }
    };

    return self;

})();
