var Simulator = (function () {
    var self = {};
    self.__simulatorRestClient = new simulatorRestClient();

    self.retrieveExecutionPlanNames = function (successCallback, errorCallback) {
        self.__simulatorRestClient.getDeployedExecutionPlanNames(
            function (data) {
                successCallback(data);
            },
            function (error) {
                errorCallback(error);
            }
        );
    };

    self.retrieveStreamNames = function (executionPlanName, successCallback, errorCallback) {
        self.__simulatorRestClient.getStreamNames(
            executionPlanName,
            function (data) {
                successCallback(data);
            },
            function (error) {
                errorCallback(error);
            }
        );
    };

    self.retrieveStreamAttributes = function (executionPlanName, streamName, successCallback, errorCallback) {
        self.__simulatorRestClient.getStreamAttributes(
            executionPlanName,
            streamName,
            function (data) {
                successCallback(data);
            },
            function (error) {
                errorCallback(error);
            }
        );
    };

    self.singleEvent = function (singleEventConfig, successCallback, errorCallback) {
        if (singleEventConfig === null || singleEventConfig.length === 0) {
            console.error("Single event configuration is required.");
        }
        if (singleEventConfig !== null && singleEventConfig.length > 0) {
            self.__simulatorRestClient.singleEventSimulation(
                singleEventConfig,
                function (data) {
                    successCallback(data);
                },
                function (error) {
                    errorCallback(error);
                    // var response = JSON.parse(error['responseText'])
                    // console.log(response['status']);
                    // console.log(response['message']);
                }
            );
        }
    };

    self.uploadSimulation = function (simulationConfig, successCallback, errorCallback) {
        if (simulationConfig === null || simulationConfig.length === 0) {
            console.error("Simulation configuration is required.");
        }
        if (simulationConfig !== null && simulationConfig.length > 0) {
            self.__simulatorRestClient.uploadSimulationConfig(
                simulationConfig,
                function (data) {
                    if (typeof successCallback === 'function')
                        successCallback(data)
                },
                function (error) {
                    if (typeof errorCallback === 'function')
                        errorCallback(error)
                }
            );
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
            self.__simulatorRestClient.updateSimulationConfig(
                simulationName,
                newSimulationConfig,
                function (data) {
                    if (typeof successCallback === 'function')
                        successCallback(data)
                },
                function (error) {
                    if (typeof errorCallback === 'function')
                        errorCallback(error)
                }
            );
        }
    };

    self.getSimulation = function (simulationName, successCallback, errorCallback) {
        if (simulationName === null || simulationName.length === 0) {
            console.error("The simulation name is not specified.");
        }
        if (simulationName !== null && simulationName.length > 0) {
            self.__simulatorRestClient.getSimulationConfig(
                simulationName,
                function (data) {
                    if (typeof successCallback === 'function')
                        successCallback(data)
                },
                function (error) {
                    if (typeof errorCallback === 'function')
                        errorCallback(error)
                }
            );
        }
    };

    self.deleteSimulation = function (simulationName, successCallback, errorCallback) {
        if (simulationName === null || simulationName.length === 0) {
            console.error("The simulation name is not specified.");
        }
        if (simulationName !== null && simulationName.length > 0) {
            self.__simulatorRestClient.deleteSimulationConfig(
                simulationName,
                function (data) {
                    if (typeof successCallback === 'function')
                        successCallback(data)
                },
                function (error) {
                    if (typeof errorCallback === 'function')
                        errorCallback(error)
                }
            );
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
                self.__simulatorRestClient.changeSimulationStatus(
                    simulationName,
                    actionLowerCase,
                    function (data) {
                        if (typeof successCallback === 'function')
                            successCallback(data)
                    },
                    function (error) {
                        if (typeof errorCallback === 'function')
                            errorCallback(error)
                    }
                );
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
            self.__simulatorRestClient.uploadCSVFile(
                filePath,
                function (data) {
                    if (typeof successCallback === 'function')
                        successCallback(data)
                },
                function (error) {
                    if (typeof errorCallback === 'function')
                        errorCallback(error)
                }
            );
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
            self.__simulatorRestClient.updateCSVFile(
                fileName,
                filePath,
                function (data) {
                    if (typeof successCallback === 'function')
                        successCallback(data)
                },
                function (error) {
                    if (typeof errorCallback === 'function')
                        errorCallback(error)
                }
            );
        }
    };

    self.deleteCSV = function (fileName, successCallback, errorCallback) {
        if (fileName === null || fileName.length === 0) {
            console.error("The name of file to be deleted is not specified.");
        }
        if (fileName !== null && fileName.length > 0) {
            self.__simulatorRestClient.deleteCSVFile(
                fileName,
                function (data) {
                    if (typeof successCallback === 'function')
                        successCallback(data)
                },
                function (error) {
                    if (typeof errorCallback === 'function')
                        errorCallback(error)
                }
            );
        }
    };

    return self;

})();
