const { notarize } = require('electron-notarize');

module.exports = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;

    if (electronPlatformName !== 'darwin') {
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    const ascProvider = 'CTHX7X38C3';
    const appleId = process.env.APPLEID;
    const appleIdPassword = process.env.APPLEIDPASS;

    await notarize({
        appBundleId: 'com.snapmaker.snapmakerjs',
        appPath: `${appOutDir}/${appName}.app`,
        ascProvider,
        appleId,
        appleIdPassword
    });
};
