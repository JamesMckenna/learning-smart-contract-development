//If we are able to use Moralis Cloud Server db, this would update the bd when an Item is sold or canceled.
//Commands needed:
//  moralis-admin-cli watch-cloud-folder --moralisApiKey ***key-should get from env, if so no need to have here*** --moralisApiSecret ***secret-should get from env, if so no need to have here*** --moralisSubdomain wciosc5v5doe.usemoralis.com --autoSave 1 --moralisCloudfolder /path/to/cloud/folder
//the above is in package.json and can be run in a new terminal using yarn moralis:cloud. do this to update the moralis db server then shut down/stop it as it can use a lot of resources to keep up
//this will automatically upload any functions to admin.moralis.io/servers (if they were still there and I could still use)

import Moralis from "moralis";

Moralis.Cloud.afterSave("ItemListed", async (request) => {
    //every event gets triggered twice, once on unconfirmed, and on confirmed
    const confirmed = request.Object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info("Looking for confirmed Tx");
    if(confirmed){
        logger.info("Found Item");
        const ActiveItem = Moralis.Object.extend("ActiveItem");//if moralis db has table ActiveItem, get it, else create it
        
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("seller", request.object.get("seller"));
        const alreadyListed = await query.first();
        if(alreadyListed){
            logger.info(`Deleting already listed ${request.object.get("objectId")}`);
            await alreadyListed.destroy();
            logger.info(`Deleted item with address ${request.object.get("address")} with Token Id ${request.object.get("tokenId")} since it's already been listed`);
        }

        const activeItem = new ActiveItem();
        activeItem.set("marketplaceAddress", request.object.get("address"));
        activeItem.set("nftAddress", request.object.get("nftAddress"));
        activeItem.set("price", request.object.get("price"));
        activeItem.set("tokenId", request.object.get("tokenId"));
        activeItem.set("seller", request.object.get("seller"));
        logger.info(`Adding address: ${request.object.get("address")}, TokenId: ${request.object.get("tokenId")}}`);
        logger.info("Saving");
        await activeItem.save();
    }
});

Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
    const confirmed = request.Object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info(`Marketplace | Object: ${request.object}`);

    if(confirmed){
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        logger.info(`Marketplace | Query: ${query}`);
        const canceledItem = await query.first();
        logger.info(`MarketPlace | CanceledItem: ${canceledItem}`);
        if(canceledItem) {
            logger.info(`Deleting ${request.object.get("tokenId")} at address ${request.object.get("address")} since it was canceled.`);
            await canceledItem.destroy();
        }else{
            logger.info(`No item found with address ${ request.object.get("address")} with tokenId ${request.object.get("tokenId")}`); 
        }
    }
});

Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
    const confirmed = request.Object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    logger.info(`Marketplace | Object: ${request.object}`);
    
    if(confirmed){
        const ActiveItem = Moralis.Object.extend("ActiveItem");
        const query = new Moralis.Query(ActiveItem);
        query.equalTo("marketplaceAddress", request.object.get("address"));
        query.equalTo("nftAddress", request.object.get("nftAddress"));
        query.equalTo("tokenId", request.object.get("tokenId"));
        logger.info(`Marketplace | Query: ${query}`);
        const boughtItem = await query.first();
        if(boughtItem){
            logger.info(`Deleting ${request.object.get("objectId")}`);
            await boughtItem.destroy();
            logger.info(`Deleted item with Tkoken Id ${request.object.get("tokenId")} at address ${request.object.get("address")}`);
        }else {
            logger.info(`No item found with address ${request.object.get("address")} and Token Id ${request.object.get("tokenId")}`);
        }
    }
});