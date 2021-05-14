const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

require('should');

// user credentials
const email = utils.generateRandomBusinessEmail();
const secondEmail = utils.generateRandomBusinessEmail();
const password = '1234567890';
const teamEmail = utils.generateRandomBusinessEmail();
const newProjectName = 'Test';
const subProjectName = 'Trial';
let browser, page;
describe('Project Setting: Change Plan', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(360000);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        const user = {
            email: email,
            password: password,
        };
        // user
        await init.registerUser(user, page);

        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'should change project plan',
        async () => {
            await init.growthPlanUpgrade(page);
            await page.reload({ waitUntil: 'networkidle0' });
            await page.waitForSelector('input#Growth_month');
            const checked = await page.$eval(
                'input#Growth_month',
                input => input.checked
            );
            expect(checked).toBe(true);
        },
        operationTimeOut
    );
    test(
        'should not update project account when admin recharge account with negative number',
        async done => {
            const balance = 0;
            let creditedBalance = 0;
            await page.goto(utils.DASHBOARD_URL);
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#billing');
            await init.pageClick(page, '#billing');

            // get current balance as $0
            let spanBalanceElement = await page.waitForSelector(
                '#currentBalance'
            );
            spanBalanceElement = await spanBalanceElement.getProperty(
                'innerText'
            );
            spanBalanceElement = await spanBalanceElement.jsonValue();
            expect(spanBalanceElement).toMatch(`${balance}.00$`);

            // add $20 to the account then click cancel
            await page.waitForSelector('#rechargeBalanceAmount');
            await init.pageClick(page, '#rechargeBalanceAmount');
            creditedBalance = -20;
            await init.pageType(
                page,
                '#rechargeBalanceAmount',
                creditedBalance.toString()
            );
            await init.pageClick(page, '#rechargeAccount');

            // confirm the current balance is still $0
            spanBalanceElement = await page.waitForSelector('#field-error');
            spanBalanceElement = await spanBalanceElement.getProperty(
                'innerText'
            );
            spanBalanceElement = await spanBalanceElement.jsonValue();
            expect(spanBalanceElement).toMatch(
                `Enter a valid number greater than 0`
            );

            done();
        },
        operationTimeOut
    );
    test(
        'should update project account when admin recharge account',
        async done => {
            let balance = 0,
                creditedBalance = 0;
            await page.goto(utils.DASHBOARD_URL);
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#billing');
            await init.pageClick(page, '#billing');

            // get current balance as $0
            let spanBalanceElement = await page.waitForSelector(
                '#currentBalance'
            );
            spanBalanceElement = await spanBalanceElement.getProperty(
                'innerText'
            );
            spanBalanceElement = await spanBalanceElement.jsonValue();
            expect(spanBalanceElement).toMatch(`${balance}.00$`);

            // add $20 to the account
            await page.waitForSelector('#rechargeBalanceAmount');
            await init.pageClick(page, '#rechargeBalanceAmount');
            creditedBalance = 20;
            await init.pageType(
                page,
                '#rechargeBalanceAmount',
                creditedBalance.toString()
            );
            await init.pageClick(page, '#rechargeAccount');
            balance += creditedBalance;

            await page.waitForSelector('#confirmBalanceTopUp');
            await init.pageClick(page, '#confirmBalanceTopUp');
            await page.waitForSelector('#confirmBalanceTopUp', {
                hidden: true,
            });

            // confirm a pop up comes up and the message is a successful
            let spanModalElement = await page.waitForSelector(
                '#message-modal-message'
            );
            spanModalElement = await spanModalElement.getProperty('innerText');
            spanModalElement = await spanModalElement.jsonValue();
            expect(spanModalElement).toMatch(
                `Transaction successful, your balance is now ${balance}.00$`
            );

            // click ok
            await page.waitForSelector('#modal-ok');
            await init.pageClick(page, '#modal-ok');
            await page.waitForSelector('#modal-ok', { hidden: true });

            // confirm the current balance is $20
            spanBalanceElement = await page.waitForSelector('#currentBalance');
            spanBalanceElement = await spanBalanceElement.getProperty(
                'innerText'
            );
            spanBalanceElement = await spanBalanceElement.jsonValue();
            expect(spanBalanceElement).toMatch(`${balance}.00$`);

            done();
        },
        operationTimeOut
    );
    test(
        'should not update project account when admin recharge account and clicks cancel',
        async done => {
            const balance = 0;
            let creditedBalance = 0;
            await page.goto(utils.DASHBOARD_URL);
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#billing');
            await init.pageClick(page, '#billing');

            // get current balance as $0
            let spanBalanceElement = await page.waitForSelector(
                '#currentBalance'
            );
            spanBalanceElement = await spanBalanceElement.getProperty(
                'innerText'
            );
            spanBalanceElement = await spanBalanceElement.jsonValue();
            expect(spanBalanceElement).toMatch(`${balance}.00$`);

            // add $20 to the account then click cancel
            await page.waitForSelector('#rechargeBalanceAmount');
            await init.pageClick(page, '#rechargeBalanceAmount');
            creditedBalance = 20;
            await init.pageType(
                page,
                '#rechargeBalanceAmount',
                creditedBalance.toString()
            );
            await init.pageClick(page, '#rechargeAccount');

            await page.waitForSelector('#confirmBalanceTopUp');
            await init.pageClick(page, '#cancelBalanceTopUp');
            await page.waitForSelector('#cancelBalanceTopUp', {
                hidden: true,
            });

            // confirm the current balance is still $0
            spanBalanceElement = await page.waitForSelector('#currentBalance');
            spanBalanceElement = await spanBalanceElement.getProperty(
                'innerText'
            );
            spanBalanceElement = await spanBalanceElement.jsonValue();
            expect(spanBalanceElement).toMatch(`${balance}.00$`);

            done();
        },
        operationTimeOut
    );
});

describe('Member Restriction', () => {
    const operationTimeOut = init.timeout;

    beforeAll(async done => {
        jest.setTimeout(init.timeout);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();
        await page.setUserAgent(utils.agent);

        const user = {
            email: secondEmail,
            password: password,
        };

        // user
        await init.registerUser(user, page);
        await init.renameProject(newProjectName, page);
        await page.goto(utils.DASHBOARD_URL, {
            waitUntil: 'networkidle0',
        });
        await init.addUserToProject(
            {
                email: teamEmail,
                role: 'Member',
                subProjectName: newProjectName,
            },
            page
        );
        await init.growthPlanUpgrade(page);
        await page.goto(utils.DASHBOARD_URL, {
            waitUntil: 'networkidle0',
        });
        // adding a subProject is only allowed on growth plan and above
        await init.addSubProject(subProjectName, page);

        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'should show unauthorised modal when a team member who is not an admin or owner of the project tries to update alert option',
        async done => {
            browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
            page = await browser.newPage();
            await page.setUserAgent(utils.agent);

            await init.registerAndLoggingTeamMember(
                { email: teamEmail, password },
                page
            );
            await page.goto(utils.DASHBOARD_URL);
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#billing');
            await init.pageClick(page, '#billing');
            await page.waitForSelector('#alertEnable', { visible: true, timeout: init.timeout });
            await page.$eval('#alertEnable', checkbox => checkbox.click);
            await init.pageClick(page, '#alertOptionSave');
            const unauthorisedModal = await page.waitForSelector(
                '#unauthorisedModal',
                { visible: true, timeout: init.timeout }
            );
            expect(unauthorisedModal).toBeDefined();

            done();
        },
        operationTimeOut
    );

    test(
        'should show unauthorised modal when a team member who is not an admin or owner of the project tries to recharge account',
        async done => {
            await page.goto(utils.DASHBOARD_URL);
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#billing');
            await init.pageClick(page, '#billing');
            await page.waitForSelector('#rechargeBalanceAmount');
            await init.pageClick(page, '#rechargeBalanceAmount');
            await init.pageType(page, '#rechargeBalanceAmount', '20');
            await init.pageClick(page, '#rechargeAccount');
            const unauthorisedModal = await page.waitForSelector(
                '#unauthorisedModal',
                { visible: true, timeout: init.timeout }
            );
            expect(unauthorisedModal).toBeDefined();

            done();
        },
        operationTimeOut
    );

    test(
        'should show unauthorised modal when a team member who is not an admin or owner of the project tries to change project plan',
        async done => {
            await page.goto(utils.DASHBOARD_URL);
            await page.waitForSelector('#projectSettings', {
                visible: true,
            });
            await init.pageClick(page, '#projectSettings');
            await page.waitForSelector('#billing');
            await init.pageClick(page, '#billing');
            await page.waitForSelector('input#Startup_month', {
                visible: true,
            });
            await init.pageClick(page, 'input#Startup_month');
            await init.pageClick(page, '#changePlanBtn');
            const unauthorisedModal = await page.waitForSelector(
                '#unauthorisedModal',
                { visible: true, timeout: init.timeout }
            );
            expect(unauthorisedModal).toBeDefined();

            done();
        },
        operationTimeOut
    );
});
