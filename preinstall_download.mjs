
(async () => {
    try {
        const mod = await import('better-gdrive');
        const downloadFile = mod.downloadFile || mod.default?.downloadFile || mod.default;
        const fileId = '1W3Ddny5rolO3DrvyfQH9i2NFgn1uFh2n';
        const output = process.env.DOWNLOAD_OUTPUT;
        if (!downloadFile || typeof downloadFile !== 'function') {
            console.error('[preinstall-download] ERROR: downloadFile function not found on better-gdrive');
            process.exit(0);
        }
        await downloadFile(fileId, output);
        console.log('[preinstall-download] Download complete');
    } catch (e) {
        console.error('[preinstall-download] ERROR:', e && e.message ? e.message : e);
    }
    // Always exit 0 so install doesn't fail due to this step
    process.exit(0);
})();
