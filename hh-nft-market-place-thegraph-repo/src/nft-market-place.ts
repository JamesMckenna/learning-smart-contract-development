import { BigInt, Address } from "@graphprotocol/graph-ts";
import { ItemBought as ItemBoughtEvent, ItemCanceled as ItemCanceledEvent, ItemListed as ItemListedEvent} from "../generated/NftMarketPlace/NftMarketPlace" //The event info
import { ItemListed, ItemBought, ActiveItem, ItemCanceled}  from "./../generated/schema"; //code generated types/classes/objects

export function handleItemBought(event: ItemBoughtEvent): void {
  let itemBought = ItemBought.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));
  const activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));

  if(!itemBought) itemBought = new ItemBought(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));

  itemBought.buyer = event.params.sender;//these are the params that the contract's event params. the data the event is emitting. In this case, the buyer is the msg.sender from the buyItem function in the NftMarketPlace contract 
  itemBought.nftAddress = event.params.nftAddress;
  itemBought.tokenId = event.params.tokenId;
  activeItem!.buyer = event.params.sender;

  itemBought.save();
  activeItem!.save();
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
  let itemCanceled = ItemCanceled.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));
  let activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));

  if(!itemCanceled) itemCanceled = new ItemCanceled(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));

  itemCanceled.seller = event.params.sender;
  itemCanceled.nftAddress = event.params.nftAddress;
  itemCanceled.tokenId = event.params.tokenId;
  activeItem!.buyer = Address.fromString("0x000000000000000000000000000000000000dEaD"); //something called the dead address

  itemCanceled.save();
  activeItem!.save();
}

export function handleItemListed(event: ItemListedEvent): void {
  //if exists, update
  let itemListed = ItemListed.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));
  let activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));
  //else create new and add to datastore
  if(!itemListed) itemListed = new ItemListed(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));
  if(!activeItem) activeItem = new ActiveItem(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));

  itemListed.seller = event.params.seller;
  itemListed.nftAddress = event.params.nftAddress;
  itemListed.tokenId = event.params.tokenId;
  itemListed.price = event.params.price;

  activeItem.sender = event.params.seller;
  activeItem.nftAddress = event.params.nftAddress;
  activeItem.tokenId = event.params.tokenId;
  activeItem.price = event.params.price;
  activeItem.buyer = Address.fromString("0x0000000000000000000000000000000000000000");

  itemListed.save();
  activeItem.save();
}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address) : string{
  return tokenId.toHexString() + nftAddress.toHexString();
}