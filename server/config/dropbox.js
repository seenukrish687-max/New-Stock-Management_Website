const { Dropbox } = require('dropbox');
const fetch = require('isomorphic-fetch');

const dbx = new Dropbox({
    accessToken: process.env.DROPBOX_ACCESS_TOKEN,
    fetch: fetch
});

const uploadToDropbox = async (fileBuffer, fileName) => {
    try {
        // 1. Upload the file
        const uploadResponse = await dbx.filesUpload({
            path: '/StockImages/' + fileName,
            contents: fileBuffer,
            mode: 'overwrite' // Overwrite if exists
        });

        // 2. Create a shared link
        // Note: filesGetTemporaryLink is for short-term, sharingCreateSharedLinkWithSettings is for long-term
        // We'll try to create a shared link. If it exists, we'll get the existing one.
        let sharedLink;
        try {
            const linkResponse = await dbx.sharingCreateSharedLinkWithSettings({
                path: uploadResponse.result.path_lower
            });
            sharedLink = linkResponse.result.url;
        } catch (error) {
            if (error.error && error.error['.tag'] === 'shared_link_already_exists') {
                // If link exists, we need to fetch it (or just construct it if we knew how, but fetching is safer)
                // Actually, the error usually contains the existing link, but let's use listSharedLinks to be sure
                const linksResponse = await dbx.sharingListSharedLinks({
                    path: uploadResponse.result.path_lower,
                    direct_only: true
                });
                if (linksResponse.result.links.length > 0) {
                    sharedLink = linksResponse.result.links[0].url;
                }
            } else {
                throw error;
            }
        }

        if (!sharedLink) {
            throw new Error('Failed to retrieve shared link');
        }

        // 3. Convert to direct download link (raw=1)
        // Dropbox links default to dl=0 (preview page). Change to raw=1 for direct image source.
        const directLink = sharedLink.replace('dl=0', 'raw=1');

        return directLink;

    } catch (error) {
        console.error('Dropbox upload error:', error);
        throw error;
    }
};

module.exports = { uploadToDropbox };
