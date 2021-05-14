const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

require('should');
let browser, page;
// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const user = {
    email,
    password,
};
const incidentFieldText = {
        fieldName: 'textField',
        fieldType: 'text',
    },
    incidentFieldNumber = {
        fieldName: 'numField',
        fieldType: 'number',
    };

describe('Incident Custom Field', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);
        // user
        await init.registerUser(user, page);

        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'should configure incident custom field in a project',
        async done => {
            await init.addCustomField(page, incidentFieldText, 'incident');

            const firstCustomField = await page.waitForSelector(
                `#customfield_${incidentFieldText.fieldName}`,
                { visible: true, timeout: init.timeout }
            );
            expect(firstCustomField).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should update a incident custom field in a project',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#more');
            await init.pageClick(page, '#more');
            await page.waitForSelector('#incidentSettings', {
                visible: true,
            });
            await init.pageClick(page, '#incidentSettings');
            await page.reload({
                waitUntil: 'networkidle2',
            });
            await init.gotoTab(6, page);

            await page.waitForSelector('#editCustomField_0', {
                visible: true,
            });
            await init.pageClick(page, '#editCustomField_0');
            await page.waitForSelector('#customFieldForm', {
                visible: true,
            });
            await init.pageClick(page, '#fieldName', { clickCount: 3 });
            await init.pageType(
                page,
                '#fieldName',
                incidentFieldNumber.fieldName
            );
            await init.selectByText(
                '#fieldType',
                incidentFieldNumber.fieldType,
                page
            );
            await page.waitForSelector('#updateCustomField', {
                visible: true,
            });
            await init.pageClick(page, '#updateCustomField');
            await page.waitForSelector('#updateCustomField', {
                hidden: true,
            });

            const updatedField = await page.waitForSelector(
                `#customfield_${incidentFieldNumber.fieldName}`,
                { visible: true, timeout: init.timeout }
            );
            expect(updatedField).toBeDefined();
            done();
        },
        operationTimeOut
    );

    test(
        'should delete a incident custom field in a project',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#more');
            await init.pageClick(page, '#more');
            await page.waitForSelector('#incidentSettings', {
                visible: true,
            });
            await init.pageClick(page, '#incidentSettings');
            await page.reload({
                waitUntil: 'networkidle2',
            });
            await init.gotoTab(6, page);

            await page.waitForSelector('#deleteCustomField_0', {
                visible: true,
            });
            await init.pageClick(page, '#deleteCustomField_0');
            await page.waitForSelector('#deleteCustomFieldModalBtn', {
                visible: true,
            });
            await init.pageClick(page, '#deleteCustomFieldModalBtn');
            await page.waitForSelector('#deleteCustomFieldModalBtn', {
                hidden: true,
            });

            const noCustomFields = await page.waitForSelector(
                '#noCustomFields',
                { visible: true, timeout: init.timeout }
            );
            expect(noCustomFields).toBeDefined();

            done();
        },
        operationTimeOut
    );
});
