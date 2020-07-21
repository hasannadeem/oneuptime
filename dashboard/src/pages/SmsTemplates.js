import React, { Component } from 'react';
import Dashboard from '../components/Dashboard';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Fade from 'react-reveal/Fade';
import { bindActionCreators } from 'redux';
import SmsTemplatesBox from '../components/smsTemplates/SmsTemplatesBox';
import SmsSmtpBox from '../components/smsTemplates/SmsSmtpBox';
import { getSmsTemplates, getSmtpConfig } from '../actions/smsTemplates';
import { logEvent } from '../analytics';
import { SHOULD_LOG_ANALYTICS } from '../config';
import BreadCrumbItem from '../components/breadCrumb/BreadCrumbItem';
import getParentRoute from '../utils/getParentRoute';

class SmsTemplates extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    ready = () => {
        this.props.getSmsTemplates(this.props.currentProject._id);
        this.props.getSmtpConfig(this.props.currentProject._id);
    };

    componentDidMount() {
        if (SHOULD_LOG_ANALYTICS) {
            logEvent(
                'PAGE VIEW: DASHBOARD > PROJECT > SETTINGS > SMS TEMPLATES'
            );
        }
    }

    render() {
        const {
            location: { pathname },
        } = this.props;

        return (
            <Dashboard ready={this.ready}>
                <Fade>
                    <BreadCrumbItem
                        route={getParentRoute(pathname)}
                        name="Project Settings"
                    />
                    <BreadCrumbItem route={pathname} name="SMS" />
                    <SmsTemplatesBox />
                    <SmsSmtpBox />
                </Fade>
            </Dashboard>
        );
    }
}

SmsTemplates.propTypes = {
    getSmsTemplates: PropTypes.func.isRequired,
    currentProject: PropTypes.object.isRequired,
    getSmtpConfig: PropTypes.func.isRequired,
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }),
};

const mapDispatchToProps = dispatch =>
    bindActionCreators({ getSmsTemplates, getSmtpConfig }, dispatch);

const mapStateToProps = state => {
    return {
        currentProject: state.project.currentProject,
    };
};

SmsTemplates.displayName = 'SmsTemplates';

export default connect(mapStateToProps, mapDispatchToProps)(SmsTemplates);
