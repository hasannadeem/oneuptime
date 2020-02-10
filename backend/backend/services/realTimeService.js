
module.exports = {
    sendCreatedIncident: async (incident) => {
        try {
            
            if(!global || !global.io){
                return;
            }

            var project = await ProjectService.findOneBy({ _id: incident.projectId });
            var projectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : incident.projectId;
            
            global.io.emit(`incidentCreated-${projectId}`, incident);
        } catch (error) {
            ErrorService.log('realTimeService.sendCreatedIncident', error);
            throw error;
        }
    },

    sendMonitorCreated: async (monitor) => {
        try {

            if(!global || !global.io){
                return;
            }


            var project = await ProjectService.findOneBy({ _id: monitor.projectId._id });
            var projectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : monitor.projectId._id;

            global.io.emit(`createMonitor-${projectId}`, monitor);
        } catch (error) {
            ErrorService.log('realTimeService.sendMonitorCreated', error);
            throw error;
        }
    },

    sendMonitorDelete: async (monitor) => {
        try {

            if(!global || !global.io){
                return;
            }

            var project = await ProjectService.findOneBy({ _id: monitor.projectId });
            var projectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : monitor.projectId;

            global.io.emit(`deleteMonitor-${projectId}`, monitor);
        } catch (error) {
            ErrorService.log('realTimeService.sendMonitorDelete', error);
            throw error;
        }
    },

    incidentResolved: async (incident) => {
        try {

            if(!global || !global.io){
                return;
            }

            var project = await ProjectService.findOneBy({ _id: incident.projectId });
            var projectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : incident.projectId;

            global.io.emit(`incidentResolved-${projectId}`, incident);
        } catch (error) {
            ErrorService.log('realTimeService.incidentResolved', error);
            throw error;
        }
    },

    incidentAcknowledged: async (incident) => {
        try {

            if(!global || !global.io){
                return;
            }

            var project = await ProjectService.findOneBy({ _id: incident.projectId });
            var projectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : incident.projectId;

            global.io.emit(`incidentAcknowledged-${projectId}`, incident);
        } catch (error) {
            ErrorService.log('realTimeService.incidentAcknowledged', error);
            throw error;
        }
    },

    monitorEdit: async (monitor) => {
        try {

            if(!global || !global.io){
                return;
            }

            var project = await ProjectService.findOneBy({ _id: monitor.projectId });
            var projectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : monitor.projectId;

            global.io.emit(`updateMonitor-${projectId}`, monitor);
        } catch (error) {
            ErrorService.log('realTimeService.monitorEdit', error);
            throw error;
        }
    },

    updateMonitorLog: async (data, projectId) => {
        try {

            if(!global || !global.io){
                return;
            }

            var project = await ProjectService.findOneBy({ _id: projectId });
            var parentProjectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : projectId;

            global.io.emit(`updateMonitorLog-${parentProjectId}`, { projectId, monitorId: data.monitorId, data });
        } catch (error) {
            ErrorService.log('realTimeService.updateMonitorLog', error);
            throw error;
        }
    },

    updateMonitorStatus: async (data, projectId) => {
        try {

            if(!global || !global.io){
                return;
            }

            var project = await ProjectService.findOneBy({ _id: projectId });
            var parentProjectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : projectId;

            global.io.emit(`updateMonitorStatus-${parentProjectId}`, { projectId, monitorId: data.monitorId, data });
        } catch (error) {
            ErrorService.log('realTimeService.updateMonitorStatus', error);
            throw error;
        }
    },

    updateProbe: async (data, monitorId) => {
        try {

            if(!global || !global.io){
                return;
            }

            var monitor = await MonitorService.findOneBy({ _id: monitorId });
            var project = await ProjectService.findOneBy({ _id: monitor.projectId });
            var projectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : projectId;

            global.io.emit(`updateProbe-${projectId}`, data);
        } catch (error) {
            ErrorService.log('realTimeService.updateProbe', error);
            throw error;
        }
    },

    sendNotification: async (data) => {
        try {
            if(!global || !global.io){
                return;
            }

            var project = await ProjectService.findOneBy({ _id: data.projectId });
            var projectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : data.projectId;

            global.io.emit(`NewNotification-${projectId}`, data);
        } catch (error) {
            ErrorService.log('realTimeService.sendNotification', error);
            throw error;
        }
    },

    updateTeamMemberRole: async (projectId, data) => {
        try {
            if(!global || !global.io){
                return;
            }

            var project = await ProjectService.findOneBy({ _id: projectId });

            projectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : projectId;
            global.io.emit(`TeamMemberRoleUpdate-${projectId}`, data);
        } catch (error) {
            ErrorService.log('realTimeService.updateTeamMemberRole', error);
            throw error;
        }
    },

    createTeamMember: async (projectId, data) => {
        try {
            if(!global || !global.io){
                return;
            }

            var project = await ProjectService.findOneBy({ _id: projectId });

            projectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : projectId;
            global.io.emit(`TeamMemberCreate-${projectId}`, data);
        } catch (error) {
            ErrorService.log('realTimeService.createTeamMember', error);
            throw error;
        }
    },

    deleteTeamMember: async (projectId, data) => {
        try {
            if(!global || !global.io){
                return;
            }

            var project = await ProjectService.findOneBy({ _id: projectId });

            projectId = project ? project.parentProjectId ? project.parentProjectId._id : project._id : projectId;
            global.io.emit(`TeamMemberDelete-${projectId}`, data);
        } catch (error) {
            ErrorService.log('realTimeService.deleteTeamMember', error);
            throw error;
        }
    },
};

var ErrorService = require('./errorService');
var ProjectService = require('./projectService');
var MonitorService = require('./monitorService');
