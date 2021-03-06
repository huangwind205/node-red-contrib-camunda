const status = require('../util/nodeStatus');
const camundaHelper = require('../util/camundaHelper');
const { Variables } = require("camunda-external-task-client-js");

module.exports = function(RED) {
    function WorkflowInstance(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function(msg) {
            const camunda = RED.nodes.getNode(config.camunda);

            let processVariables = msg.payload.processVariables || null;
            const processDefinitionKey = msg.payload.processDefinitionKey || null;
            const processBusinessKey = msg.payload.processBusinessKey || null;

            if (processVariables instanceof Variables) {
                processVariables = processVariables.getDirtyVariables();
            }

            try {
                const results = await camundaHelper.startProcessInstance(camunda, processDefinitionKey, processBusinessKey, processVariables)
                msg.payload = { ...msg.payload, results: results };

                node.send(msg);
                status.success(node, msg.payload.results.id);

            } catch (err) {
                node.error(err.message, msg);
                status.error(node, err.message);
            }
        });
    }

    RED.nodes.registerType('camunda-workflow-instance', WorkflowInstance);
};
