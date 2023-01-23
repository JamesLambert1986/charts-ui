const puppeteer = require('puppeteer')
const { toMatchImageSnapshot } = require('jest-image-snapshot');
expect.extend({ toMatchImageSnapshot });

const pkg = require('../package.json');

module.exports = {
  testPages: function (page,url) {

    if(url.includes('?'))
      url += '&';
    else 
      url += '?';

    describe(page, () => {

      it(`should render correctly.`, async() => {

        const browser = await puppeteer.launch()
        const page = await browser.newPage()

        await page.goto(pkg.localURL+url+'cache='+Date.now()+'#visualtest')
        await page.waitForTimeout(100)

        await page.setViewport({ width: 375, height: 800 })
        const mobileImage = await page.screenshot({ fullPage: true });
        expect(mobileImage).toMatchImageSnapshot({ allowSizeMismatch: true, customDiffConfig: { threshold: 0.5 } });

        await page.setViewport({ width: 768, height: 800 })
        const tabletImage = await page.screenshot({ fullPage: true });
        expect(tabletImage).toMatchImageSnapshot({ allowSizeMismatch: true, customDiffConfig: { threshold: 0.5 } });

        await page.setViewport({ width: 1440, height: 800 })
        const desktopImage = await page.screenshot({ fullPage: true });
        expect(desktopImage).toMatchImageSnapshot({ allowSizeMismatch: true, customDiffConfig: { threshold: 0.5 } });

        await page.close();
        await browser.close();
      });


    });
  },
};