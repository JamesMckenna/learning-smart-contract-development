const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = pinataSDK(pinataApiKey, pinataApiSecret);

async function storeImages(imageFilePath){
    const fullImagePath = path.resolve(imageFilePath);
    const files = fs.readdirSync(fullImagePath);
    let responses = [];
    console.log("Uploading to IPFS");
    for (fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagePath}/${files[fileIndex]}`);
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile);//SEE: https://www.npmjs.com/package/@pinata/sdk - the pinata website docs are different then the npm website docs.
            //the pinata docs on the website show how to use as traditional RestFulAPI. The SDK makes it simple, but isn't really shown on the pinata docs, just npm for the SDK package. 
            //so instead of https://www.website/route/endpointMethod of traditional RestFulAPI, Patrick shows using the SDK and the Pinata object. EG: pinata.endpointMethod(args)
            //the npm website docs seem to show the response object from the endpoints, but not able to find response objects on the pinata website docs...... 
            responses.push(response);
        }
        catch(error) {
            console.log(error);
        }
    }
    return { responses, files };
}

async function storeTokenURIMetadata(metadata, options){
    try{
        const response = await pinata.pinJSONToIPFS(metadata, options);
        return response;
    }
    catch(error){
        console.log(error);
    }
    return null;
}


module.exports = { storeImages, storeTokenURIMetadata }