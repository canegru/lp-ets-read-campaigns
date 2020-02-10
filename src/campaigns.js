const { get } = require('lodash');
const ObjectsToCsv = require('objects-to-csv');
const moment = require('moment');
const {
  getLpDomains,
  lpCampaigns,
  lpCampaignConfig,
  lpSectionConfig,
} = require('./service/liveperson');

const getCampaigns = async () => {
  // Get service map
  const domains = await getLpDomains();
  const accountConfigReadWriteUrl = get(domains.find(({ service }) => service === 'accountConfigReadWrite'), 'baseURI', '');

  // Retrieve all campaigns
  const campaigns = await lpCampaigns(accountConfigReadWriteUrl);

  // Array used to output to csv
  let data = [];

  for await (const { id } of campaigns) {
    const { campaignConfig } = await lpCampaignConfig(accountConfigReadWriteUrl, id);
    const engagements = get(campaignConfig, 'engagements', []);

    const accountId = get(campaignConfig, 'accountId', '');

    // Push Campaign data to output
    data.push({
      accountId,
      type: 'campaign',
      id: campaignConfig.id,
      name: campaignConfig.name,
      description: campaignConfig.description,
      enabled: campaignConfig.status === 1 ? 'Enabled' : 'Disabled',
      'section name': '',
    });

    const engagementsInformation = await Promise.all(
      engagements.map(async (engagement) => {
        const sectionId = get(engagement, 'onsiteLocations[0]', 0);
        const sectionConfig = await lpSectionConfig(accountConfigReadWriteUrl, sectionId);
        // Push Engagement
        return {
          type: 'engagement',
          id: engagement.id,
          name: engagement.name,
          description: engagement.description,
          enabled: engagement.enabled ? 'Enabled' : 'Disabled',
          'section name': sectionConfig.name,
        };
      }),
    );

    data = [...data, ...engagementsInformation];

    data.push({}, {}, {});
  }

  const csv = new ObjectsToCsv(data);

  // Save to file:
  await csv.toDisk(`./output/Campaign Data ${moment().format('MM-DD-YYYY')}.csv`);
};

module.exports = getCampaigns;