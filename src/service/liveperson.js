const axios = require('axios');
const { get } = require('lodash');
const oAuthHeader = require('../utils/oAuthHeader');

const parseParameters = (params) => Object.keys(params).map((element) => {
  if (typeof params[element] === 'string') return `${element}=${params[element]}`;
  if (typeof params[element] === 'object' && params[element].length > 0) {
    return params[element].map((param) => `${element}=${param}`).join('&');
  }
  return '';
}).join('&');


async function lpLoginDomain() {
  try {
    const requestData = await axios({
      method: 'GET',
      url: `http://api.liveperson.net/api/account/${process.env.LP_ACCOUNT}/service/agentVep/baseURI.json?version=1.0`,
    });
    return get(requestData, 'data.baseURI', '');
  } catch (e) {
    return '';
  }
}

async function lpToken(domain) {
  try {
    const requestData = await axios({
      method: 'POST',
      url: `https://${domain}/api/account/${process.env.LP_ACCOUNT}/login`,
      params: {
        v: '1.3',
      },
      data: {
        username: process.env.LP_USER,
        password: process.env.LP_PASSWORD,
      },
    });
    return get(requestData, 'data', {});
  } catch (e) {
    return {};
  }
}

async function lpCampaigns(domain) {
  console.log("TCL: lpCampaigns -> domain", domain)
  try {
    const params = {
      v: '3.4',
      fields: [
        'id',
        'name',
        'description',
        'startDate',
        'expirationDate',
        'goalId',
        'lobId',
        'status',
        'isDeleted',
        'priority',
        'engagementIds',
        'weight',
        'timeZone',
        'startDateTimeZoneOffset',
        'expirationDateTimeZoneOffset',
        'startTimeInMinutes',
        'expirationTimeInMinutes',
        'type',
      ],
    };
    const url = `https://${domain}/api/account/${process.env.LP_ACCOUNT}/configuration/le-campaigns/campaigns?${parseParameters(params)}`;
    const method = 'get';

    const requestData = await axios({
      method,
      url,
      headers: {
        ...oAuthHeader({ url, method }, true),
      },
    });
    return get(requestData, 'data', {});
  } catch (e) {
    return {};
  }
}

async function lpCampaignConfig(domain, campaign) {
  try {
    const params = {
      v: '3.4',
    };
    const url = `https://${domain}/api/account/${process.env.LP_ACCOUNT}/configuration/le-campaigns/campaigns/${campaign}?${parseParameters(params)}`;
    const method = 'get';

    const requestData = await axios({
      method,
      url,
      headers: {
        ...oAuthHeader({ url, method }, true),
      },
    });
    return {
      campaignConfig: get(requestData, 'data', []),
      revision: get(requestData, 'headers.ac-revision', {}),
    };
  } catch (e) {
    return [];
  }
}

async function lpSectionConfig(domain, sectionId) {
  try {
    const params = {
      v: '3.0',
    };
    const url = `https://${domain}/api/account/${process.env.LP_ACCOUNT}/configuration/le-targeting/onsite-locations/${sectionId}?${parseParameters(params)}`;
    const method = 'get';

    const requestData = await axios({
      method,
      url,
      headers: {
        ...oAuthHeader({ url, method }, true),
      },
    });
    return get(requestData, 'data', {});
  } catch (e) {
    return {};
  }
}

async function setLpCampaignConfig(domain, token, campaign, config, revision) {
  try {
    const requestData = await axios({
      method: 'POST',
      url: `https://${domain}/api/account/${process.env.LP_ACCOUNT}/configuration/le-campaigns/campaigns/${campaign}`,
      headers: {
        authorization: `Bearer ${token}`,
        'x-http-method-override': 'PUT',
        'if-match': revision.toString(),
      },
      params: {
        v: '3.4',
      },
      data: {
        ...config,
      },
    });
    return get(requestData, 'data', {});
  } catch (e) {
    return {};
  }
}

/*
async function setLpCampaignConfig(domain, campaign, config, revision) {
  try {
    const params = {
      v: '3.4',
    };
    const url = `https://${domain}/api/account/${process.env.LP_ACCOUNT}/configuration/le-campaigns/campaigns/${campaign}?${parseParameters(params)}`;
    console.log("TCL: setLpCampaignConfig -> url", url)
    const method = 'post';
    const requestData = await axios({
      method,
      url,
      headers: {
        ...oAuthHeader({ url, method }, true),
        'x-http-method-override': 'PUT',
        'if-match': revision.toString(),
      },
      data: {
        ...config,
      },
    });
    return get(requestData, 'data', {});
  } catch (e) {
    return {
      error: true,
      msg: e.response.data,
    };
  }
}
*/

async function lpSkills(domain) {
  try {
    const url = `https://${domain}/api/account/${process.env.LP_ACCOUNT}/configuration/le-users/skills`;
    const method = 'get';

    const requestData = await axios({
      headers: {
        ...oAuthHeader({ url, method }),
      },
      method,
      url,
    });
    return get(requestData, 'data', {});
  } catch (e) {
    return {
      error: true,
      msg: e.response.data,
    };
  }
}

async function getLpDomains() {
  try {
    const url = `http://api.liveperson.net/api/account/${process.env.LP_ACCOUNT}/service/baseURI.json`;
    const method = 'get';

    const requestData = await axios({
      method,
      url,
      params: {
        version: '1.0',
      },
    });
    return get(requestData, 'data.baseURIs', []);
  } catch (e) {
    return [];
  }
}

async function getLpQueue(domain) {
  try {
    const url = `https://${domain}/operations/api/account/${process.env.LP_ACCOUNT}/msgqueuehealth/current?v=1`;
    const method = 'get';

    const requestData = await axios({
      headers: {
        ...oAuthHeader({ url, method }),
      },
      method,
      url,
    });


    /*
        const requestData = await axios({
          headers: {
          },
          url: 'http://localhost:3005/tmo/queue',
        });
        */


    const currentQueue = get(requestData, 'data', []);
    /* testing TODO: REMOVE TESTING
    currentQueue.skillsMetrics['1017559932'] = {
      avgWaitTimeForAgentAssignment_AfterTransferFromAgent: -1,
      actionableConversations: 3,
      unassignedConversationsAndFirstTimeConsumer: 1,
      avgWaitTimeForAgentAssignment_NewConversation: -1,
      notActionableDuringTransfer: 0,
      actionableAndConsumerLastMessage: 0,
      actionableAndDuringTransfer: 3,
      maxWaitTimeForAgentAssignment_AfterTransferFromAgent: -1,
      waitTimeForAgentAssignment_50thPercentile: 1664520,
      notActionableConversations: 0,
      unassignedConversations: 3,
      waitTimeForAgentAssignment_90thPercentile: 1000000,
      actionableAndManualSla: 0,
      time: 1579987319322,
      maxWaitTimeForAgentAssignment: 2027119,
      notActionableAndManualSla: 0,
      avgWaitTimeForAgentAssignment_AfterTransfer: 1626572,
      avgWaitTimeForAgentAssignment_AfterTransferFromBot: 1626572,
    };

    currentQueue.skillsMetrics['1018894132'] = {
      avgWaitTimeForAgentAssignment_AfterTransferFromAgent: -1,
      actionableConversations: 3,
      unassignedConversationsAndFirstTimeConsumer: 1,
      avgWaitTimeForAgentAssignment_NewConversation: -1,
      notActionableDuringTransfer: 0,
      actionableAndConsumerLastMessage: 0,
      actionableAndDuringTransfer: 3,
      maxWaitTimeForAgentAssignment_AfterTransferFromAgent: -1,
      waitTimeForAgentAssignment_50thPercentile: 1664520,
      notActionableConversations: 0,
      unassignedConversations: 3,
      waitTimeForAgentAssignment_90thPercentile: 300000,
      actionableAndManualSla: 0,
      time: 1579987319322,
      maxWaitTimeForAgentAssignment: 2027119,
      notActionableAndManualSla: 0,
      avgWaitTimeForAgentAssignment_AfterTransfer: 1626572,
      avgWaitTimeForAgentAssignment_AfterTransferFromBot: 1626572,
    }; */
    return currentQueue;
  } catch (e) {
    console.log(e);
    return [];
  }
}

module.exports = {
  lpLoginDomain,
  lpToken,
  lpCampaigns,
  lpCampaignConfig,
  setLpCampaignConfig,
  lpSkills,
  getLpDomains,
  getLpQueue,
  lpSectionConfig,
};
